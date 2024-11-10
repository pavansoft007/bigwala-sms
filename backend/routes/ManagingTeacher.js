import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import generateTeacherID from "../services/generateTeacherID.js";
import Teacher from "../models/Teacher.js";
import moment from "moment";
import User from "../models/User.js";

const ManagingTeacher=express.Router();

ManagingTeacher.post('/api/teacher', AdminAuth ,async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone_number,
            subject_specialization,
            hire_date,
            status,
            subject_id
        } = req.body;

        const adminAccess = req.body.adminAccess || false;


        const newTeacherID=await generateTeacherID(req['sessionData']['school_code']);

        const newTeacher = await Teacher.create({
            first_name,
            last_name,
            TeacherID:newTeacherID,
            email,
            phone_number,
            subject_specialization,
            subject_id,
            hire_date:moment(hire_date, "MM-DD-YYYY").toDate(),
            school_id:req['sessionData']['school_id'],
            school_code:req['sessionData']['school_code'],
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

ManagingTeacher.put('/api/teacher/:id', AdminAuth, async (req, res) => {
    try {
        const teacherId = req.params.id;
        const {
            first_name,
            last_name,
            email,
            phone_number,
            subject_specialization,
            hire_date,
            status,
            subject_id,
            adminAccess
        } = req.body;

        const teacher = await Teacher.findByPk(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }


        await teacher.update({
            first_name,
            last_name,
            email,
            phone_number,
            subject_specialization,
            subject_id,
            hire_date: moment(hire_date, "MM-DD-YYYY").toDate(),
            status: status || 'Active',
            adminAccess
        });

        await User.update(
            { role: adminAccess ? 'admin-teacher' : 'teacher' },
            { where: { original_id: teacherId } }
        );

        res.status(200).json({
            message: 'Teacher updated successfully',
            teacher
        });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({
            message: 'An error occurred while updating the teacher',
            error: error.message
        });
    }
});

ManagingTeacher.delete('/api/teacher/:id', AdminAuth, async (req, res) => {
    try {
        const teacherId = req.params.id;

        const teacher = await Teacher.findByPk(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        await User.destroy({ where: { original_id: teacherId ,
                role: adminAccess ? 'admin-teacher' : 'teacher'
        } });


        await teacher.destroy();

        res.status(200).json({ message: 'Teacher and associated user deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({
            message: 'An error occurred while deleting the teacher',
            error: error.message
        });
    }
});


export default ManagingTeacher;