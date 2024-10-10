import express from "express";
import Student from "../models/Student.js";
import User from "../models/User.js";

const StudentsAdding=express.Router();

StudentsAdding.post('/mobileAPI/add-new-student', async (req, res) => {
    try {
        const {
            admission_ID,
            first_name,
            last_name,
            date_of_birth,
            gender,
            email,
            phone_number,
            address,
            enrollment_date
        } = req.body;


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
            status: 'Active'
        });

        const newUser = await User.create({
            phone_number: phone_number,
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
        res.status(500).json({
            message: 'An error occurred while creating student and user',
            error: error.message
        });
    }
});
export default StudentsAdding;