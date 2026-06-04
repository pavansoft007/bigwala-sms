import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import otpTokenVerification from '../middleware/otp-token-verification.js';
import prisma from '../lib/prisma.js';

const Auth = express.Router();
const JWT_SECRET = process.env.JWTKEY;

/* ─────────────────────────  OTP REQUEST  ───────────────────────── */
Auth.post('/mobileAPI/otp-request', async (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone.slice(3)) && phone.startsWith('+91'))
        return res.status(400).json({ message: 'Phone number must be 10 digits' });

    const user = await prisma.user.findFirst({ where: { phone_number: phone, is_active: true } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ phone, otp }, JWT_SECRET, { expiresIn: '10m' });
    res.status(200).json({ message: 'OTP sent successfully', token });
});

/* ─────────────────────────  OTP VERIFY  ───────────────────────── */
Auth.post('/mobileAPI/otp-verify', otpTokenVerification, async (req, res) => {
    const { otp } = req.body;
    const tokenDetails = req.tokenDetails;

    if (!otp || !tokenDetails)
        return res.status(400).json({ message: 'OTP and token are required' });

    const otpPattern = /^[0-9]{6}$/;
    if (!otpPattern.test(otp))
        return res.status(400).json({ message: 'Please enter a valid six-digit OTP' });

    try {
        if (tokenDetails.otp !== otp)
            return res.status(400).json({ message: 'Invalid OTP' });

        const users = await prisma.user.findMany({
            where: { phone_number: tokenDetails.phone, is_active: true }
        });
        if (!users.length) return res.status(404).json({ message: 'User not found' });

        const oneData = [];

        for (const currentUser of users) {
            if (currentUser.role === 'student') {
                const student = await prisma.students.findFirst({
                    where: { phone_number: currentUser.phone_number },
                    include: { Classrooms: true }
                });
                if (!student) return res.status(404).json({ message: 'Student not found' });

                const studentData = {
                    student_id: student.student_id,
                    first_name: student.first_name,
                    last_name: student.last_name,
                    date_of_birth: student.date_of_birth,
                    gender: student.gender,
                    email: student.email,
                    phone_number: student.phone_number,
                    address: student.address,
                    enrollment_date: student.enrollment_date,
                    school_id: student.school_id,
                    status: student.status,
                    admission_id: student.admission_ID,
                    standard: student.Classrooms?.standard,
                    section: student.Classrooms?.section,
                    role: 'student'
                };

                const studentToken = jwt.sign(studentData, JWT_SECRET, { expiresIn: '360m' });
                oneData.push({ role: 'student', token: studentToken, student: studentData });

            } else if (['teacher', 'admin_teacher'].includes(currentUser.role)) {
                const teacher = await prisma.teachers.findFirst({
                    where: { phone_number: currentUser.phone_number },
                    include: { Subjects: true }
                });
                if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

                const teacherDetails = {
                    teacher_id: teacher.teacher_id,
                    first_name: teacher.first_name,
                    last_name: teacher.last_name,
                    email: teacher.email,
                    phone_number: teacher.phone_number,
                    subject_name: teacher.Subjects?.subject_name,
                    hire_date: teacher.hire_date,
                    status: teacher.status,
                    school_id: teacher.school_id,
                    assignedClass: teacher.assignedClass,
                    role: teacher.adminAccess ? 'admin-teacher' : 'teacher'
                };

                const teacherToken = jwt.sign(teacherDetails, JWT_SECRET, { expiresIn: '360m' });
                oneData.push({
                    role: teacher.adminAccess ? 'admin-teacher' : 'teacher',
                    token: teacherToken,
                    teacher: teacherDetails
                });

            } else {
                return res.status(400).json({ message: 'Invalid role' });
            }
        }

        res.status(200).json({ message: 'OTP verified successfully', oneData });

    } catch (err) {
        console.error('Error in OTP verification:', err);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

/* ─────────────────────────  ADMIN LOGIN  ───────────────────────── */
Auth.post('/api/admin-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    try {
        // All admin auth goes through the master User table
        const user = await prisma.user.findFirst({
            where: { email, role: 'admin', is_active: true }
        });

        if (!user) return res.status(404).json({ message: 'Email not found' });
        if (!user.password) return res.status(403).json({ message: 'Account not configured for password login' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(403).json({ message: 'Wrong password' });

        const admin = await prisma.admin.findUnique({
            where: { admin_id: parseInt(user.original_id) },
            include: { School: true }
        });

        if (!admin) return res.status(404).json({ message: 'Admin profile not found' });

        const tokenData = {
            id: admin.admin_id,
            school_id: admin.school_id,
            school_code: admin.School.school_code,
            role: 'admin'
        };

        const token = jwt.sign(tokenData, JWT_SECRET, { expiresIn: '1000m' });
        res.status(200).json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default Auth;
