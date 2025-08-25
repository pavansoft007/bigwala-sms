import express from 'express';
import { PrismaClient } from '@prisma/client';
import TeacherAuth from "../middleware/teacherAuth.js";
import AdminAuth from "../middleware/AdminAuth.js";
import StudentAuth from "../middleware/StudentAuth.js";

const prisma = new PrismaClient();
const ManageAttendance = express.Router();


ManageAttendance.post('/mobileAPI/student/attendance', TeacherAuth('attendance'), async (req, res) => {
    try {
        const { studentsIDs } = req.body;
        if (!Array.isArray(studentsIDs) || studentsIDs.length === 0) {
            return res.status(400).json({ message: 'Invalid or missing student IDs' });
        }

        const school_id = req.sessionData.school_id;
        const today = new Date(new Date().toISOString().split('T')[0]); // Get date with time part zeroed out

        // Find students whose attendance has already been recorded today
        const existingAttendance = await prisma.studentAttendance.findMany({
            where: {
                student_id: { in: studentsIDs },
                school_id: school_id,
                attendDate: today
            },
            select: { student_id: true }
        });

        const existingStudentIDs = existingAttendance.map(record => record.student_id);

        // Filter out existing records to prevent duplicates
        const newAttendanceRecords = studentsIDs
            .filter(student_id => !existingStudentIDs.includes(student_id))
            .map(student_id => ({
                student_id,
                school_id,
                attendDate: today
            }));

        if (newAttendanceRecords.length > 0) {
            await prisma.studentAttendance.createMany({
                data: newAttendanceRecords,
            });
        }

        res.json({
            message: 'Attendance recorded successfully',
            newAttendance: newAttendanceRecords.map(record => record.student_id),
            skipped: existingStudentIDs
        });
    } catch (error) {
        console.error('Error adding attendance:', error);
        res.status(500).json({ message: 'Error adding attendance', error: error.message });
    }
});


ManageAttendance.get('/api/attendance/admin/attended-today', AdminAuth('attendance'), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        const { date } = req.query;

        const attendDate = date ? new Date(date) : new Date(new Date().toISOString().split('T')[0]);

        const attendedToday = await prisma.teacherAttendance.findMany({
            where: {
                school_id: school_id,
                attendDate: attendDate,
                status: 'approved'
            },
            include: {
                Teachers: {
                    select: { teacher_id: true, first_name: true, last_name: true, email: true, phone_number: true },
                },
            },
            orderBy: { attendTime: 'asc' }
        });

        if (attendedToday.length === 0) {
            return res.status(404).json({ message: 'No teachers attended on the specified date' });
        }

        res.status(200).json(attendedToday);
    } catch (error) {
        console.error('Error fetching attended teachers:', error);
        res.status(500).json({ message: 'Error fetching attended teachers', error: error.message });
    }
});


ManageAttendance.post('/mobileAPI/teacher/attendance/request', TeacherAuth('attendance'), async (req, res) => {
    try {
        const teacher_id = req.sessionData.teacher_id;
        const school_id = req.sessionData.school_id;

        if (!teacher_id) {
            return res.status(401).json({ message: "Unauthorized: Teacher ID not found in session." });
        }

        const newRequest = await prisma.teacherAttendance.create({
            data: {
                teacher_id,
                school_id,
                attendDate: new Date(new Date().toISOString().split('T')[0]),
                attendTime: new Date(),
                submitted_at: new Date(),
                status: 'pending'
            }
        });

        res.status(201).json({ message: 'Attendance request was sent successfully', request: newRequest });
    } catch (error) {
        console.error('Error creating attendance request:', error);
        res.status(500).json({ message: 'Error creating attendance request', error: error.message });
    }
});


ManageAttendance.put('/api/attendance/admin/reject/:id', AdminAuth('attendance'), async (req, res) => {
    try {
        const attendance_id = parseInt(req.params.id); // FIX: Get ID from params, not body

        const updatedRequest = await prisma.teacherAttendance.update({
            where: { attendance_id },
            data: { status: 'rejected' },
        });

        res.status(200).json({ message: 'Attendance request rejected', attendanceRequest: updatedRequest });
    } catch (error) {
        if (error.code === 'P2025') { // Prisma's code for record not found
            return res.status(404).json({ message: 'Attendance request not found' });
        }
        console.error('Error rejecting request:', error);
        res.status(500).json({ message: 'Error rejecting request', error: error.message });
    }
});


ManageAttendance.put('/api/attendance/admin/approve/:id', AdminAuth('attendance'), async (req, res) => {
    try {
        const attendance_id = parseInt(req.params.id);

        const updatedRequest = await prisma.teacherAttendance.update({
            where: { attendance_id },
            data: { status: 'approved' },
        });

        res.status(200).json({ message: 'Attendance request approved', attendanceRequest: updatedRequest });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Attendance request not found' });
        }
        console.error('Error approving request:', error);
        res.status(500).json({ message: 'Error approving request', error: error.message });
    }
});


ManageAttendance.get('/api/attendance/admin/pending', AdminAuth('attendance'), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        const pendingRequests = await prisma.teacherAttendance.findMany({
            where: {
                school_id: school_id,
                status: 'pending'
            },
            include: {
                Teachers: {
                    select: { teacher_id: true, first_name: true, last_name: true, email: true, phone_number: true },
                }
            }
        });

        if (pendingRequests.length === 0) {
            return res.status(404).json({ message: 'No pending attendance requests found' });
        }

        res.status(200).json(pendingRequests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'Error fetching pending requests', error: error.message });
    }
});


ManageAttendance.get('/api/get-attendance-data', AdminAuth("attendance"), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        const today = new Date(new Date().toISOString().split('T')[0]);

        // Run aggregation queries in a transaction for efficiency
        const [all_students, attended_students, all_teachers, attended_teachers] = await prisma.$transaction([
            prisma.students.count({ where: { school_id } }),
            prisma.studentAttendance.count({ where: { school_id, attendDate: today } }),
            prisma.teachers.count({ where: { school_id } }),
            prisma.teacherAttendance.count({ where: { school_id, attendDate: today, status: 'approved' } })
        ]);

        res.status(200).json({
            details: { all_students, attended_students, all_teachers, attended_teachers }
        });
    } catch (err) {
        console.error('Error fetching attendance data:', err);
        res.status(500).json({ message: 'Error fetching attendance data', error: err.message });
    }
});


ManageAttendance.get('/mobileAPI/attendance/student', StudentAuth, async (req, res) => {
    try {
        const student_id = req.sessionData.student_id;
        const attendanceHistory = await prisma.studentAttendance.findMany({
            where: { student_id },
            orderBy: { attendDate: 'desc' }
        });
        res.json(attendanceHistory);
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ message: 'Error fetching attendance history', error: error.message });
    }
});


ManageAttendance.get('/mobileAPI/attendance/teachers', TeacherAuth('attendance'), async (req, res) => {
    try {
        const teacher_id = req.sessionData.teacher_id;
        const attendanceHistory = await prisma.teacherAttendance.findMany({
            where: { teacher_id },
            orderBy: { attendDate: 'desc' }
        });
        res.json(attendanceHistory);
    } catch (error) {
        console.error('Error fetching teacher attendance:', error);
        res.status(500).json({ message: 'Error fetching attendance history', error: error.message });
    }
});


export default ManageAttendance;