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
            standard,
            section,
            feeDetails,
            classroom_id: clientClassroomId
        } = req.body;

        if (!req['sessionData']?.school_id) {
            return res.status(400).json({ message: "School ID not found in session data." });
        }

        if (!first_name) {
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

        const studentFee=[];

        for (let i=0;i<feeDetails.length;i++){
           const newStudentFee = await StudentFee.create({
                fee_amount:feeDetails[i]['total_fee'],
                total_fee_paid: 0,
                fee_remaining: feeDetails[i]['total_fee'],
                school_id: req['sessionData']['school_id'],
                category_id:feeDetails[i]['category_id'],
                student_id: newStudent.student_id,
                classroom_id: classroom_id,
                created_by: req['sessionData']['role'],
                ...createdData
            }, { transaction });

           studentFee.push(newStudentFee);
        }


        await transaction.commit();

        res.status(201).json({
            message: 'Student and user created successfully',
            student: newStudent,
            user: newUser,
            studentFee
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
ManagingStudent.get('/mobileAPI/students/:id', AdminAuth('student management'),async (req, res) => {
    try {
        const [student] = await sequelize.query('SELECT * FROM `students` LEFT JOIN classrooms ON classrooms.classroom_id=students.assginedClassroom WHERE student_id='+req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        //student[0]['']=student[0]['assginedClassroom'];
        res.status(200).json(student[0]);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            message: 'An error occurred while fetching student'
        });
    }
});

ManagingStudent.get('/api/search/student', AdminAuth('student management'), async (req, res) => {
    const where = [];
    const body = req.body;


    if (body.email) {
        where.push(`students.email = '${body.email}'`);
    }
    if (body.phone_number) {
        where.push(`students.phone_number = '${body.phone_number}'`);
    }
    if (body.student_id) {
        where.push(`students.student_id = '${body.student_id}'`);
    }
    if (body.admission_ID) {
        where.push(`students.admission_ID = '${body.admission_ID}'`);
    }
    if (body.status) {
        where.push(`students.status = '${body.status}'`);
    }
    if(body.assginedClassroom){
        where.push(`students.assginedClassroom = '${body.assginedClassroom}'`);
    }else if (body.standard) {
        where.push(`classrooms.standard = '${body.standard}'`);
        if (body.section) {
            where.push(`classrooms.section = '${body.section}'`);
        }
    }
    if (body.name) {
        where.push(`(students.first_name LIKE '${body.name}%' OR students.last_name LIKE '${body.name}%')`);
    }


    where.push(`students.school_id = '${req.sessionData.school_id}'`);

    try {
        let query = `SELECT * FROM students LEFT JOIN classrooms ON classrooms.classroom_id = students.assginedClassroom`;


        if (where.length > 0) {
            query += ` WHERE ${where.join(' AND ')}`;
        }


        const [students] = await sequelize.query(query);


        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            message: 'An error occurred while fetching student'
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
