import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import generateAdmissionID from "../services/generateAdmissionID.js";
import AdminAuth from "../middleware/AdminAuth.js";
import School from "../models/School.js";
import { Op } from 'sequelize';

const ManagingStudent = express.Router();

// Route to create a new student (already provided)
ManagingStudent.post('/api/student', AdminAuth, async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            date_of_birth,
            gender,
            email,
            phone_number,
            address,
            enrollment_date,
            assignedClassroom,
        } = req.body;

        if (!req['sessionData']?.school_id) {
            return res.status(400).json({ message: "School ID not found in session data." });
        }

        const schoolDetails = await School.findOne({
            where: {
                school_id: req['sessionData']['school_id']
            }
        });

        const admission_ID = await generateAdmissionID(schoolDetails.school_code);

        const existingStudent = await Student.findOne({
            where: {
                school_id: req['sessionData']['school_id'],
                [Op.or]: [
                    { email },
                    { phone_number }
                ]
            }
        });

        if (existingStudent) {
            return res.status(409).json({ message: "This student already exists" });
        }

        const newStudent = await Student.create({
            admission_ID,
            first_name,
            last_name,
            date_of_birth,
            gender,
            email,
            phone_number,
            address,
            enrollment_date,
            assignedClassroom,
            school_code: schoolDetails.school_code,
            status: 'Active',
            school_id: req['sessionData']['school_id']
        });

        const newUser = await User.create({
            phone_number,
            role: 'student',
            original_id: newStudent.student_id
        });

        res.status(201).json({
            message: 'Student and user created successfully',
            student: newStudent,
            user: newUser
        });
    } catch (error) {
        console.error('Error creating student and user:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Student with similar data already exists',
            });
        }

        res.status(500).json({
            message: 'An error occurred while creating student and user',
            error: error.message
        });
    }
});

ManagingStudent.put('/api/student/:id', AdminAuth, async (req, res) => {
    try {
        const studentId = req.params.id;
        const {
            first_name,
            last_name,
            date_of_birth,
            gender,
            email,
            phone_number,
            address,
            enrollment_date,
            assignedClassroom,
            status
        } = req.body;

        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await student.update({
            first_name,
            last_name,
            date_of_birth,
            gender,
            email,
            phone_number,
            address,
            enrollment_date,
            assignedClassroom,
            status: status || 'Active'
        });

        res.status(200).json({
            message: 'Student updated successfully',
            student
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            message: 'An error occurred while updating the student',
            error: error.message
        });
    }
});

ManagingStudent.delete('/api/student/:id', AdminAuth, async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await User.destroy({ where: { original_id: studentId,role:'student' } });


        await student.destroy();

        res.status(200).json({ message: 'Student and associated user deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            message: 'An error occurred while deleting the student',
            error: error.message
        });
    }
});

export default ManagingStudent;
