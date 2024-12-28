import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import generateAdmissionID from "../services/generateAdmissionID.js";
import School from "../models/School.js";
import { Op } from 'sequelize';
import Classroom from "../models/Classroom.js";
import AdminAuth from "../middleware/AdminAuth.js";
import StudentFee from "../models/StudentFee.js";
import StudentPayment from "../models/StudentPayment.js";
import sequelize from "../config/database.js";

const ManagingStudent = express.Router();


ManagingStudent.post('/api/student', AdminAuth('student management'), async (req, res) => {
    const transaction = await sequelize.transaction();
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
            fee_amount,
            standard,
            section,
            category_id,
            classroom_id: clientClassroomId
        } = req.body;

        if (!req['sessionData']?.school_id) {
            return res.status(400).json({ message: "School ID not found in session data." });
        }

        if (!first_name || !last_name || !standard || !section || !category_id || !fee_amount) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const schoolDetails = await School.findOne({
            where: { school_id: req['sessionData']['school_id'] }
        });

        const admission_ID = await generateAdmissionID(schoolDetails.school_code);

        const existingStudent = await Student.findOne({
            where: {
                school_id: req['sessionData']['school_id'],
                [Op.or]: [{ email }, { phone_number }]
            }
        });

        if (existingStudent) {
            return res.status(409).json({ message: "This student already exists" });
        }

        let classroom_id = clientClassroomId || null;
        if (!classroom_id) {
            const classroomDetails = await Classroom.findOne({
                where: {
                    standard,
                    section,
                    school_id: req['sessionData']['school_id']
                }
            });

            if (!classroomDetails) {
                return res.status(404).json({ message: "Classroom not found." });
            }

            classroom_id = classroomDetails.classroom_id;
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
            assignedClassroom: classroom_id,
            school_code: schoolDetails.school_code,
            status: 'Active',
            school_id: req['sessionData']['school_id']
        }, { transaction });

        const newUser = await User.create({
            phone_number,
            role: 'student',
            original_id: newStudent.student_id
        }, { transaction });

        const createdData = {};
        if (req['sessionData']['role'] === 'admin') {
            createdData['admin_id'] = req['sessionData']['id'];
        } else if (req['sessionData']['role'] === 'teacher' || req['sessionData']['role'] === 'admin-teacher') {
            createdData['teacher_id'] = req['sessionData']['teacher_id'];
        } else {
            return res.status(403).json({ message: "Unauthorized role." });
        }

        const newStudentFee = await StudentFee.create({
            fee_amount,
            total_fee_paid: 0,
            fee_remaining: fee_amount,
            school_id: req['sessionData']['school_id'],
            category_id,
            student_id: newStudent.student_id,
            classroom_id: classroom_id,
            created_by: req['sessionData']['role'],
            ...createdData
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Student and user created successfully',
            student: newStudent,
            user: newUser,
            newStudentFee
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating student and user:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Student with similar data already exists' });
        }

        res.status(500).json({
            message: 'An error occurred while creating student and user',
            error: error.message
        });
    }
});


ManagingStudent.put('/api/student/:id', AdminAuth('student management'), async (req, res) => {
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
            assginedClassroom,
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
            assginedClassroom,
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

ManagingStudent.delete('/api/student/:id', AdminAuth('student management'), async (req, res) => {
    try {
        const studentId = req.params.id;

        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        await StudentPayment.destroy({where:{student_id:studentId,school_id:req['sessionData']['school_id']}});

        await StudentFee.destroy({where:{  student_id:studentId,school_id:req['sessionData']['school_id']  }})

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
