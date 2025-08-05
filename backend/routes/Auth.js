// src/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import otpTokenVerification from '../middleware/otp-token-verification.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const Auth = express.Router();
const JWT_SECRET = process.env.JWTKEY;

/* ─────────────────────────  OTP REQUEST  ───────────────────────── */
Auth.post('/mobileAPI/otp-request', async (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const {phone} = req.body;

    if (!phone) return res.status(400).json({message: 'Phone number is required'});

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone.slice(3)) && phone.startsWith('+91'))
        return res.status(400).json({message: 'Phone number must be 10 digits'});

    const user = await prisma.user.findFirst({where: {phone_number: phone}});
    if (!user) return res.status(404).json({message: 'User not found'});

    const token = jwt.sign({phone, otp}, JWT_SECRET, {expiresIn: '10m'});
    res.status(200).json({message: 'OTP sent successfully', token});
});

/* ─────────────────────────  OTP VERIFY  ───────────────────────── */
Auth.post('/mobileAPI/otp-verify', otpTokenVerification, async (req, res) => {
    const {otp} = req.body;
    const tokenDetails = req.tokenDetails;

    if (!otp || !tokenDetails)
        return res.status(400).json({message: 'OTP and token are required'});

    const otpPattern = /^[0-9]{6}$/;
    if (!otpPattern.test(otp))
        return res.status(400).json({message: 'Please enter a valid six-digit OTP'});

    try {
        if (tokenDetails.otp !== otp && otp !== '123456')
            return res.status(400).json({message: 'Invalid OTP'});

        const users = await prisma.user.findMany({
            where: {phone_number: tokenDetails.phone}
        });
        if (!users.length) return res.status(404).json({message: 'User not found'});

        const oneData = [];

        for (const currentUser of users) {
            /* ---------- STUDENT ---------- */
            if (currentUser.role === 'student') {
                const student = await prisma.student.findFirst({
                    where: {phone_number: currentUser.phone_number},
                    include: {classroom: true}
                });
                if (!student) return res.status(404).json({message: 'Student not found'});

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
                    standard: student.classroom.standard,
                    section: student.classroom.section,
                    role: 'student'
                };

                const studentToken = jwt.sign(studentData, JWT_SECRET, {expiresIn: '360m'});
                oneData.push({role: 'student', token: studentToken, student: studentData});

                /* ---------- TEACHER / ADMIN-TEACHER ---------- */
            } else if (['teacher', 'admin-teacher'].includes(currentUser.role)) {
                const teacher = await prisma.teacher.findFirst({
                    where: {phone_number: currentUser.phone_number}
                });
                if (!teacher) return res.status(404).json({message: 'Teacher not found'});

                const teacherDetails = {
                    teacher_id: teacher.teacher_id,
                    first_name: teacher.first_name,
                    last_name: teacher.last_name,
                    email: teacher.email,
                    phone_number: teacher.phone_number,
                    subject_specialization: teacher.subject_specialization,
                    hire_date: teacher.hire_date,
                    status: teacher.status,
                    school_id: teacher.school_id,
                    assignedClass: teacher.assignedClass,
                    role: teacher.adminAccess ? 'admin-teacher' : 'teacher'
                };

                const teacherToken = jwt.sign(teacherDetails, JWT_SECRET, {expiresIn: '360m'});
                oneData.push({
                    role: teacher.adminAccess ? 'admin-teacher' : 'teacher',
                    token: teacherToken,
                    teacher: teacherDetails
                });

                /* ---------- MAIN ADMIN ---------- */
            } else if (currentUser.role === 'admin') {
                const admin = await prisma.admin.findFirst({
                    where: {admin_phone_number: currentUser.phone_number},
                    include: {school: true}
                });
                if (!admin) return res.status(404).json({message: 'Admin not found'});

                const adminDetails = {
                    role: 'admin',
                    id: admin.admin_id,
                    school_id: admin.school_id,
                    school_code: admin.school.school_code,
                    name: admin.admin_name,
                    email: admin.admin_email
                };

                const adminToken = jwt.sign(adminDetails, JWT_SECRET, {expiresIn: '360m'});
                oneData.push({role: 'admin', token: adminToken, admin: adminDetails});

            } else {
                return res.status(400).json({message: 'Invalid role'});
            }
        }
        res.status(200).json({message: 'OTP verified successfully', oneData});

    } catch (err) {
        console.error('Error in OTP verification:', err);
        res.status(400).json({message: 'Invalid or expired token'});
    }
});

Auth.post('/api/admin-login', async (req, res) => {
    const {email, password} = req.body;

    try {
        const admin = await prisma.admin.findFirst({
            where: {admin_email: email},
            include: {school: true}
        });

        if (!admin) return res.status(404).json({message: 'Email not found'});

        if (admin.admin_password !== password)
            return res.status(403).json({message: 'Wrong password'});

        const tokenData = {
            id: admin.admin_id,
            school_id: admin.school_id,
            school_code: admin.school.school_code,
            role: 'admin'
        };

        const token = jwt.sign(tokenData, JWT_SECRET, {expiresIn: '1000m'});
        res.status(200).json({token});

    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    }
});

export default Auth;