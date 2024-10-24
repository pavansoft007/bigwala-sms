import express from 'express';
import Attendance from '../models/Attendance.js';
import VerifyToken from "../middleware/VerifyToken.js";

const ManageAttendance = express.Router();

ManageAttendance.post('/mobileAPI/addstudentattendance', VerifyToken, async (req, res) => {
    try {
        const { student_id } = req.body;
        const school_id = req['sessionData']['school_id'];
        const today = new Date().toISOString().split('T')[0];
        const existingAttendance = await Attendance.findOne({
            where: {
                student_id: student_id,
                school_id: school_id,
                attendDate: today
            }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already recorded for today' });
        }
        const addStudentAttendance = await Attendance.create({
            student_id: student_id,
            school_id: school_id,
            attendDate: today
        });

        res.json(addStudentAttendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding attendance' });
    }
});


export default ManageAttendance;
