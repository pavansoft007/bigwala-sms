import express from "express";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import AdminAuth from "../middleware/AdminAuth.js";
import verifyToken from "../middleware/VerifyToken.js";


const GettingData=express.Router();


GettingData.get('/mobileAPI/students/:id', AdminAuth,async (req, res) => {
    try {
        const student = await Student.findOne({
            where:{
                student_id:req.params.id,
                school_id:req.sessionData.school_id
            }
        })
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            message: 'An error occurred while fetching student',
            error: error.message
        });
    }
});

GettingData.get('/mobileAPI/teachers/:id', AdminAuth,   async (req, res) => {
    try {
        const teacher = await Teacher.findOne({
            where:{
                teacher_id:req.params.id,
                school_id:req.sessionData.school_id
            }
        });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(teacher);
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({
            message: 'An error occurred while fetching teacher',
            error: error.message
        });
    }
});

GettingData.get('/mobileAPI/getStudent',verifyToken,async (req,res)=>{
       const assignedClass=req['sessionData']['assignedClass'];
       const completeDetails=await Student.findAll({
           where:{
               assginedClassroom:assignedClass
           }
       });
       console.log(completeDetails);
       res.status(200).json();
});

GettingData.get('/mobileAPI/schools/:school_id/students', async (req, res) => {
    const { school_id } = req.params;

    try {
        const students = await Student.findAll({
            where: { school_id }
        });

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for this school' });
        }

        res.status(200).json(students);
    } catch (error) {
        console.error('Error fetching students by school_id:', error);
        res.status(500).json({
            message: 'An error occurred while fetching students',
            error: error.message
        });
    }
});

GettingData.get('/mobileAPI/schools/:school_id/teachers', async (req, res) => {
    const { school_id } = req.params;

    try {
        const teachers = await Teacher.findAll({
            where: { school_id }
        });

        if (teachers.length === 0) {
            return res.status(404).json({ message: 'No teachers found for this school' });
        }

        res.status(200).json(teachers);
    } catch (error) {
        console.error('Error fetching teachers by school_id:', error);
        res.status(500).json({
            message: 'An error occurred while fetching teachers',
            error: error.message
        });
    }
});

export default GettingData;