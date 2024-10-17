import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import generateAdmissionID from "../services/generateAdmissionID.js";

const StudentsAdding = express.Router();

StudentsAdding.post('/mobileAPI/add-new-student', async (req, res) => {
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
            assginedClassroom,
            school_id
        } = req.body;


        const admission_ID = await generateAdmissionID();


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
            assginedClassroom,
            status: 'Active',
            school_id
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
        if(error.original.errno === 1062){
           res.status(403).json({
               message:error.errors[0].message
           })
        }
        else{
            res.status(500).json({
                message: 'An error occurred while creating student and user',
                error: error.message
            });
        }
    }
});

export default StudentsAdding;
