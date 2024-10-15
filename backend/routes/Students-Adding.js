import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';

const StudentsAdding = express.Router();


async function generateAdmissionID() {
    const lastStudent = await Student.findOne({
        order: [['admission_ID', 'DESC']]
    });

    let nextAdmissionNumber = 1;

    if (lastStudent && lastStudent.admission_ID) {
        const lastAdmissionNumber = parseInt(lastStudent.admission_ID.substring(3), 10);
        nextAdmissionNumber = lastAdmissionNumber + 1;
    }

    return `ADM${nextAdmissionNumber.toString().padStart(7, '0')}`;
}

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
        res.status(500).json({
            message: 'An error occurred while creating student and user',
            error: error.message
        });
    }
});

export default StudentsAdding;
