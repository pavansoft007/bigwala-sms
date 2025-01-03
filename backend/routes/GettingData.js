import express from "express";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import AdminAuth from "../middleware/AdminAuth.js";
import verifyToken from "../middleware/teacherAuth.js";
import completeLogin from "../middleware/completeLogin.js";


const GettingData=express.Router();


// GettingData.get('/mobileAPI/students/:id', AdminAuth('student management'),async (req, res) => {
//     try {
//         const [student] = await sequelize.query('SELECT * FROM `students` INNER JOIN classrooms ON classrooms.classroom_id=students.student_id WHERE student_id='+req.params.id);
//         if (!student) {
//             return res.status(404).json({ message: 'Student not found' });
//         }
//         res.status(200).json(student[0]);
//     } catch (error) {
//         console.error('Error fetching student:', error);
//         res.status(500).json({
//             message: 'An error occurred while fetching student',
//             error: error.message
//         });
//     }
// });

GettingData.get('/mobileAPI/teachers/:id', AdminAuth('student management'),   async (req, res) => {
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

GettingData.get('/api/userDetails',completeLogin,async (req,res)=>{
    res.status(200).json(req['sessionData']);
});

export default GettingData;