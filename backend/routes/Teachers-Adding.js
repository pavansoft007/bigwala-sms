import { Router } from 'express';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import AdminAuth from "../middleware/AdminAuth.js";

const TeacherAdding = Router();

TeacherAdding.post('/mobileAPI/add-new-teacher', AdminAuth ,async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone_number,
            subject_specialization,
            hire_date,
            status,
        } = req.body;

        const adminAccess = req.body.adminAccess || false;

        const newTeacher = await Teacher.create({
            first_name,
            last_name,
            email,
            phone_number,
            subject_specialization,
            hire_date,
            school_id:req['sessionData']['school_id'],
            adminAccess,
            status: status || 'Active'
        });
        const newUser = await User.create({
            phone_number,
            role: adminAccess ? 'admin-teacher' : 'teacher',
            original_id: newTeacher.teacher_id
        });


        res.status(201).json({
            message: 'Teacher and user created successfully',
            teacher: newTeacher,
            user: newUser
        });
    } catch (error) {
        console.error('Error creating teacher and user:', error);
        if(error.original.errno === 1062){
            res.status(403).json({
                message:error.errors[0].message
            })
        }else{
            res.status(500).json({
                message: 'An error occurred while creating teacher and user',
                error: error.message
            });
        }
    }
});

export default TeacherAdding;
