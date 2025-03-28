import express from "express";
import Classroom from "../models/Classroom.js";
import Student from "../models/Student.js";
import semiAdminAuth from "../middleware/semiAdminAuth.js";
import Teacher from "../models/Teacher.js";
import adminAuth from "../middleware/AdminAuth.js";
import teacherAuth from "../middleware/teacherAuth.js";
import completeLogin from "../middleware/completeLogin.js";

const ManagingClassrooms=express.Router();

ManagingClassrooms.post('/mobileAPI/classroom',adminAuth('classroom'),async (req, res)=>{
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

ManagingClassrooms.get('/mobileAPI/classroom',teacherAuth('classroom'),async (req, res)=>{
    const school_id=req.sessionData['school_id'];
    try{
        const classroomDetails=await Classroom.findAll({
            where:{
                school_id
            },
            attributes:['classroom_id','standard','section']
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

ManagingClassrooms.get('/mobileAPI/standard',completeLogin,async (req,res)=>{
    const school_id=req.sessionData['school_id'];
    try{
        const classroomDetails = await Classroom.findAll({
            where: {
                school_id
            },
            attributes: ['standard'],
            group: ['standard']
        });
        const classStandard=classroomDetails.map((item)=>{
            return item.standard
        });
        res.send(classStandard);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            message: 'An error occurred while fetching students',
            error: error.message
        });
    }
});

ManagingClassrooms.get('/mobileAPI/section',completeLogin,async (req,res)=>{
    const standard=req.query.standard;
    const school_id=req['sessionData']['school_id'];
   try{
       const classroomDetails = await Classroom.findAll({
           where: {
               school_id,standard
           },
           attributes: ['section'],
       });
       const classStandard=classroomDetails.map((item)=>{
           return item.section
       });
       res.json(classStandard);
   } catch (error) {
       console.error('Error fetching students:', error);
       res.status(500).json({
           message: 'An error occurred while fetching students',
           error: error.message
       });
   }
});

ManagingClassrooms.get('/mobileAPI/getStudent/:classroomID',teacherAuth('classroom'),async (req, res)=>{
    const classroomID=req.params.classroomID;
    try{
        const studentINFO=await Student.findAll({
            where:{
                assignedClassroom:classroomID
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

ManagingClassrooms.post('/mobileAPI/student-assign-classroom',semiAdminAuth('classroom'), async  (req, res)=>{
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
                {assignedClassroom:classDetails.classroom_id},
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
ManagingClassrooms.post('/mobileAPI/teacher-assign-classroom',semiAdminAuth('classroom'), async  (req, res)=>{
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

//@todo need to add the delete route
ManagingClassrooms.delete('/mobileAPI/classroom/:classroomID', adminAuth('classroom'), async (req, res) => {
    const classroomID = req.params.classroomID;
    const schoolID = req.sessionData['school_id'];

    try {
        const studentsInClassroom = await Student.findAll({
            where: { assignedClassroom: classroomID }
        });

        if (studentsInClassroom.length > 0) {
            return res.status(400).json({ message: 'Cannot delete classroom. There are students assigned to this classroom.' });
        }

        const teachersInClassroom = await Teacher.findAll({
            where: { assignedClass: classroomID }
        });

        if (teachersInClassroom.length > 0) {
            return res.status(400).json({ message: 'Cannot delete classroom. There are teachers assigned to this classroom.' });
        }

        const deletedClassroom = await Classroom.destroy({
            where: { classroom_id: classroomID, school_id: schoolID }
        });

        if (deletedClassroom === 1) {
            return res.status(200).json({ message: 'Classroom deleted successfully' });
        } else {
            return res.status(404).json({ message: 'Classroom not found or already deleted' });
        }
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({
            message: 'An error occurred while deleting the classroom',
            error: error.message
        });
    }
});


export default ManagingClassrooms;