import express from 'express';
import studentAttendance from '../models/studentAttendance.js';
import teacherAttendance from "../models/teacherAttendance.js";
import Teacher from "../models/Teacher.js";
import TeacherAuth from "../middleware/teacherAuth.js";
import AdminAuth from "../middleware/AdminAuth.js";
import StudentAuth from "../middleware/StudentAuth.js";
import StudentAttendance from "../models/studentAttendance.js";
import sequelize from "../config/database.js";

const ManageAttendance = express.Router();

ManageAttendance.post('/mobileAPI/student/attendance', TeacherAuth('attendance'), async (req, res) => {
    try {
        const {studentsIDs} = req.body;
        if (!Array.isArray(studentsIDs) || studentsIDs.length === 0) {
            return res.status(400).json({message: 'Invalid or missing student IDs'});
        }

        const school_id = req['sessionData']['school_id'];
        const today = new Date().toISOString().split('T')[0];


        const existingAttendance = await studentAttendance.findAll({
            where: {
                student_id: studentsIDs,
                school_id: school_id,
                attendDate: today
            },
            attributes: ['student_id']
        });


        const existingStudentIDs = existingAttendance.map(record => record.student_id);


        const newAttendanceRecords = studentsIDs
            .filter(student_id => !existingStudentIDs.includes(student_id))
            .map(student_id => ({
                student_id,
                school_id,
                attendDate: today
            }));


        if (newAttendanceRecords.length > 0) {
            await studentAttendance.bulkCreate(newAttendanceRecords);
        }

        res.json({
            message: 'Attendance recorded successfully',
            newAttendance: newAttendanceRecords.map(record => record.student_id),
            skipped: existingStudentIDs
        });
    } catch (error) {
        console.error('Error adding attendance:', error);
        res.status(500).json({message: 'Error adding attendance', error: error.message});
    }
});

ManageAttendance.get('/api/attendance/admin/attended-today', AdminAuth('attendance'), async (req, res) => {
    try {
        const school_id = req['sessionData']['school_id'];
        const {date} = req.query;

        const attendDate = date || new Date().toISOString().split('T')[0];

        teacherAttendance.belongsTo(Teacher, {foreignKey: 'teacher_id'});

        const attendedToday = await teacherAttendance.findAll({
            where: {
                school_id: school_id,
                attendDate: attendDate,
                status: 'approved'
            },
            include: [{
                model: Teacher,
                attributes: ['teacher_id', 'first_name', 'last_name', 'email', 'phone_number'],
            }],
            order: [['attendTime', 'ASC']]
        });

        if (attendedToday.length === 0) {
            return res.status(404).json({message: 'No teachers attended today'});
        }

        res.status(200).json(attendedToday);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error fetching attended teachers', error});
    }
});


ManageAttendance.post('/mobileAPI/teacher/attendance/request', TeacherAuth('attendance'), async (req, res) => {
    try {
        const teacher_id = req['sessionData']['teacher_id'];
        const school_id = req['sessionData']['school_id'];
        const newRequest = await teacherAttendance.create({
            teacher_id: teacher_id,
            school_id: school_id,
            status: 'pending'
        });
        if (newRequest) {
            res.json({message: 'request was sent'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error adding attendance'});
    }
});

ManageAttendance.put('/api/attendance/admin/reject/:id', AdminAuth('attendance'), async (req, res) => {
    try {
        const attendance_id = req.body;

        const attendanceRequest = await teacherAttendance.findByPk(attendance_id);
        if (!attendanceRequest) {
            return res.status(404).json({message: 'Attendance request not found'});
        }

        attendanceRequest.status = 'rejected';
        await attendanceRequest.save();

        res.status(200).json({message: 'Attendance request rejected', attendanceRequest});
    } catch (error) {
        res.status(500).json({message: 'Error rejecting request', error});
    }
});

ManageAttendance.put('/api/attendance/admin/approve/:id', AdminAuth('attendance'), async (req, res) => {
    try {
        const attendance_id = req.params.id;

        const attendanceRequest = await teacherAttendance.findByPk(attendance_id);
        if (!attendanceRequest) {
            return res.status(404).json({message: 'Attendance request not found'});
        }

        attendanceRequest.status = 'approved';
        await attendanceRequest.save();

        res.status(200).json({message: 'Attendance approved', attendanceRequest});
    } catch (error) {
        res.status(500).json({message: 'Error approving request', error});
    }
});

ManageAttendance.get('/api/attendance/admin/pending', AdminAuth('attendance'), async (req, res) => {
    try {
        const school_id = req['sessionData']['school_id'];
        teacherAttendance.belongsTo(Teacher, {foreignKey: 'teacher_id'});
        const pendingRequests = await teacherAttendance.findAll({
            where: {
                school_id: school_id,
                status: 'pending'
            }, include: [{
                model: Teacher,
                attributes: ['teacher_id', 'first_name', 'last_name', 'email', 'phone_number'],
            }]
        });

        if (pendingRequests.length === 0) {
            return res.status(404).json({message: 'No pending attendance requests found'});
        }

        res.status(200).json(pendingRequests);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error fetching pending requests', error});
    }
});
ManageAttendance.get('/api/get-attendance-data', AdminAuth("attendance"), async (req, res) => {
    try {
        const school_id = req['sessionData']['school_id'];
        const [details] = await sequelize.query(`SELECT (SELECT COUNT(student_id) FROM students WHERE school_id = ${school_id}) AS all_students,
                                                        (SELECT COUNT(student_id)
                                                         FROM studentAttendance
                                                         WHERE school_id = ${school_id}
                                                           AND attendDate = CURDATE())                                          AS attended_students,
                                                        (SELECT COUNT(teacher_id) FROM teachers WHERE school_id = ${school_id}) AS all_teachers,
                                                        (SELECT COUNT(teacher_id)
                                                         FROM teacherAttendance
                                                         WHERE school_id = ${school_id}
                                                           AND attendDate = CURDATE())                                          AS attended_teachers; `,
            {});

        res.status(200).json({details: details[0]});
    } catch (err) {
        console.log(error);
        res.status(500).json({message: 'Error fetching pending requests', error});
    }
})
ManageAttendance.get('/mobileAPI/attendance/student', StudentAuth, async (req, res) => {
    try {
        const student_id = req['sessionData']['student_id'];
        const studentDetails = await StudentAttendance.findAll({
            "where": {
                student_id: student_id
            }
        })
        res.json(studentDetails);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error fetching pending requests', error});
    }
});

ManageAttendance.get('/mobileAPI/attendance/teachers', TeacherAuth('attendance'), async (req, res) => {
    try {
        const teacher_id = req['sessionData']['teacher_id'];
        const studentDetails = await teacherAttendance.findAll({
            "where": {
                teacher_id: teacher_id
            }
        })
        res.json(studentDetails);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error fetching pending requests', error});
    }
});


export default ManageAttendance;
