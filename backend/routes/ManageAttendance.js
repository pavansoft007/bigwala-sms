import express from 'express';
import studentAttendance from '../models/studentAttendance.js';
import teacherAttendance from "../models/teacherAttendance.js";
import VerifyToken from "../middleware/VerifyToken.js";
import AdminAuth from "../middleware/AdminAuth.js";

const ManageAttendance = express.Router();

ManageAttendance.post('/mobileAPI/addstudentattendance', VerifyToken, async (req, res) => {
    try {
        const { student_id } = req.body;
        const school_id = req['sessionData']['school_id'];
        const today = new Date().toISOString().split('T')[0];
        const existingAttendance = await studentAttendance.findOne({
            where: {
                student_id: student_id,
                school_id: school_id,
                attendDate: today
            }
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already recorded for today' });
        }
        const addStudentAttendance = await studentAttendance.create({
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

ManageAttendance.post('/mobileAPI/requestTeacherAttendance',VerifyToken,async (req, res)=>{
    try {
        const teacher_id=req['sessionData']['teacher_id'];
        const school_id=req['sessionData']['school_id'];
        const newRequest=await teacherAttendance.create({
            teacher_id:teacher_id,
            school_id:school_id,
            status:'pending'
        });
        if (newRequest){
            res.json({message:'request was sent'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding attendance' });
    }
});

ManageAttendance.post('/mobileAPI/attendance/admin-reject',AdminAuth,async (req, res)=>{
    try {
        const { attendance_id } = req.body;

        const attendanceRequest = await teacherAttendance.findByPk(attendance_id);
        if (!attendanceRequest) {
            return res.status(404).json({ message: 'Attendance request not found' });
        }

        attendanceRequest.status = 'rejected';
        await attendanceRequest.save();

        res.status(200).json({ message: 'Attendance request rejected', attendanceRequest });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting request', error });
    }
});

ManageAttendance.post('/mobileAPI/attendance/admin-approve',AdminAuth,async (req,res)=>{
    try {
        const { attendance_id } = req.body;

        const attendanceRequest = await teacherAttendance.findByPk(attendance_id);
        if (!attendanceRequest) {
            return res.status(404).json({ message: 'Attendance request not found' });
        }

        attendanceRequest.status = 'approved';
        await attendanceRequest.save();

        res.status(200).json({ message: 'Attendance approved', attendanceRequest });
    } catch (error) {
        res.status(500).json({ message: 'Error approving request', error });
    }
});



export default ManageAttendance;
