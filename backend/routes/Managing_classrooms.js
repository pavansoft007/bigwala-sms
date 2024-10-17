import express from "express";
import Classroom from "../models/Classroom.js";
import Student from "../models/Student.js";
import semiAdminAuth from "../middleware/semiAdminAuth.js";

const Managing_classrooms=express.Router();

Managing_classrooms.post('/mobileAPI/addingClassroom',async (req,res)=>{
    const body=req.body;
    try{
       const newClassroom=await Classroom.create(body);
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

Managing_classrooms.get('/mobileAPI/getClassroomDetails',async (req,res)=>{
     const school_id=req.query.school_id;
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

Managing_classrooms.get('/mobileAPI/getStudent/:classroomID',async (req,res)=>{
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

Managing_classrooms.post('/mobileAPI/student-assign-classroom',semiAdminAuth, async  (req,res)=>{
   const {standard,section,studentID}=req.body;
   const schoolID=req['sessionData']['school_id'];
   try{
       console.log(standard,section,studentID);
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

export default Managing_classrooms;