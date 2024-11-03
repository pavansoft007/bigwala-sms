import express from "express";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import AdminAuth from "../middleware/AdminAuth.js";
import verifyToken from "../middleware/teacherAuth.js";


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
       res.status(200).json(completeDetails);
});


export default GettingData;