import express from "express";
import Classroom from "../models/Classroom.js";
import Student from "../models/Student.js";
import semiAdminAuth from "../middleware/semiAdminAuth.js";
import Teacher from "../models/Teacher.js";
import adminAuth from "../middleware/AdminAuth.js";
import teacherAuth from "../middleware/teacherAuth.js";

const ManagingClassrooms=express.Router();

ManagingClassrooms.post('/mobileAPI/addingClassroom',adminAuth,async (req, res)=>{
    const body=req.body;
    const existingClassroom=await Classroom.findOne({
        where:{
            standard:body.standard,
            section:body.section,
            school_id:req['sessionData']['school_id']
        }
    })

    if (existingClassroom){
        return res.status(409).json({message:"classroom already exists"});
    }

    try{
        const newClassroom=await Classroom.create({
            standard:body.standard,
            section:body.section,
            school_id:req['sessionData']['school_id']
        });
        res.status(201).json({
            message: 'Teacher and user created successfully',
            classroomInfo:newClassroom
        });
    }catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            message: 'An error occurred while fetching students',
            error: error.message
        });
    }
});

ManagingClassrooms.get('/mobileAPI/getClassroomDetails',teacherAuth,async (req, res)=>{
    const school_id=req.sessionData['school_id'];
    try{
        const classroomDetails=await Classroom.findAll({
            where:{
                school_id
            }
        })
        res.send(classroomDetails);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            message: 'An error occurred while fetching students',
            error: error.message
        });
    }
});

ManagingClassrooms.get('/mobileAPI/getStudent/:classroomID',teacherAuth,async (req, res)=>{
    const classroomID=req.params.classroomID;
    try{
        const studentINFO=await Student.findAll({
            where:{
                assginedClassroom:classroomID
            }
        });
        res.status(200).json(studentINFO)
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            message: 'An error occurred while fetching students',
            error: error.message
        });
    }
});

ManagingClassrooms.post('/mobileAPI/student-assign-classroom',semiAdminAuth, async  (req, res)=>{
    const {standard,section,studentID}=req.body;
    const schoolID=req['sessionData']['school_id'];
    try{
        const classDetails=await Classroom.findOne({
            where:{
                standard,section,school_id:schoolID
            }
        })
        if(classDetails){
            const updateStudent=await Student.update(
                {assginedClassroom:classDetails.classroom_id},
                {
                    where:{
                        student_id: studentID
                    }
                }
            )
            if (updateStudent[0] === 1) {
                res.status(200).json({ message: 'Student updated successfully' });
            } else {
                res.status(404).json({ message: 'Student not found or no changes made' });
            }
        }else{
            res.status(404).json({message:'section is not found in your school'});
        }
    }catch (e) {
        console.error('Error fetching students:', e);
        res.status(500).json({
            message: 'An error occurred while fetching students',
            error: e.message
        });
    }
});
ManagingClassrooms.post('/mobileAPI/teacher-assign-classroom',semiAdminAuth, async  (req, res)=>{
    const {standard,section,teacher_id}=req.body;
    const schoolID=req['sessionData']['school_id'];
    try{
        const classDetails=await Classroom.findOne({
            where:{
                standard,section,school_id:schoolID
            }
        })
        if(classDetails){
            const updateTeacher=await Teacher.update(
                {assignedClass:classDetails.classroom_id},
                {
                    where:{
                        teacher_id: teacher_id
                    }
                }
            )
            if (updateTeacher[0] === 1) {
                res.status(200).json({ message: 'teacher updated successfully' });
            } else {
                res.status(404).json({ message: 'teacher not found or no changes made' });
            }
        }else{
            res.status(404).json({message:'section is not found in your school'});
        }
    }catch (e) {
        console.error('Error fetching students:', e);
        if(e.original.errno === 1062 ){
            return res.status(409).json({ message:"already an teacher was assigned to that class " });
        }
        res.status(500).json({
            message: 'An error occurred while fetching students',
            error: e.message
        });
    }
});
export default ManagingClassrooms;