import express from "express";
import Homework from "../models/Homework.js";
import Classroom from "../models/Classroom.js";
import teacherAuth from "../middleware/teacherAuth.js";
import studentAuth from "../middleware/StudentAuth.js";
import Subject from "../models/Subject.js";

const ManagingHomework = express.Router();

ManagingHomework.post('/mobileAPI/homework', teacherAuth, async (req, res) => {
    try {
        const { subject_id, context, standard, section } = req.body;
        const school_id=req['sessionData']['school_id'];
        const subjectDetails=await Subject.findOne({
            where:{
                school_id,
                subject_id
            }
        });

        const classroom = await Classroom.findOne({
            where: {
                standard,
                section
            }
        });

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        const classroomID = classroom.classroom_id;
        const today = new Date().toISOString().split('T')[0];
        const validClassroom = await Classroom.findByPk(classroomID);
        if (!validClassroom) {
            return res.status(400).json({ message: "Invalid classroom ID" });
        }

        const existingHomework = await Homework.findOne({
            where: {
                classroom_id: classroomID,
                school_id: school_id,
                subject_id:subjectDetails.subject_id,
                addedDate: today
            }
        });

        if (existingHomework) {
            return res.status(409).json({ message: "Homework for this subject and date already exists." });
        }

        const newHomework = await Homework.create({
            school_id: school_id,
            classroom_id: classroomID,
            subject_id:subjectDetails.subject_id,
            context,
            addedDate: today
        });

        res.status(201).json(newHomework);

    } catch (e) {
        console.log("Error while saving the homework: ", e);
        res.status(500).json({
            message: "Error while saving the homework",
            error: e.message
        });
    }
});

ManagingHomework.get('/mobileAPI/homework', studentAuth,async (req, res) => {
    try {
        const studentDetails=req['sessionData'];
        const classroom = await Classroom.findOne({
            where: {
                standard:studentDetails.standard,
                section:studentDetails.section,
            }
        });
        if(!classroom){
            return res.status(403).json({message:"classroom not found"});
        }
        const classroom_id = classroom.classroom_id;
        const addedDate = new Date().toISOString().split('T')[0];

        const homeworkDetails = await Homework.findAll({
            where: {
                classroom_id: classroom_id,
                school_id: 1,
                addedDate: addedDate
            }
        });

        res.json(homeworkDetails);
    } catch (e) {
        console.log("Error in getting the data: ", e);
        res.status(500).json({
            message: "Error while getting the homework"
        });
    }
});

ManagingHomework.get('/mobileAPI/homework/:id',teacherAuth,async (req,res)=>{
    try{
        const homework_id = req.params.id;
        const school_id = req['sessionData']['school_id'];
        const homework = await Homework.findOne({
            where: {
                homework_id,
                school_id
            }
        });
        res.json(homework);
    }catch (e){
        console.log("Error while updating the homework: ", e);
        res.status(500).json({
            message: "Error while updating the homework",
            error: e.message
        });
    }
});

ManagingHomework.put('/mobileAPI/homework/:id', teacherAuth, async (req, res) => {
    try {
        const homework_id = req.params.id;
        const { context } = req.body;
        const school_id = req['sessionData']['school_id'];

        const homework = await Homework.findOne({
            where: {
                homework_id,
                school_id
            }
        });

        if (!homework) {
            return res.status(404).json({ message: "Homework not found" });
        }

        homework.context = context || homework.context;
        await homework.save();

        res.status(200).json({
            message: "Homework updated successfully",
            homework
        });
    } catch (e) {
        console.log("Error while updating the homework: ", e);
        res.status(500).json({
            message: "Error while updating the homework",
            error: e.message
        });
    }
});
ManagingHomework.delete('/mobileAPI/homework/:id', teacherAuth, async (req, res) => {
    try {
        const homework_id = req.params.id;
        const school_id = req['sessionData']['school_id'];

        const homework = await Homework.findOne({
            where: {
                homework_id,
                school_id
            }
        });

        if (!homework) {
            return res.status(404).json({ message: "Homework not found" });
        }

        await homework.destroy();

        res.status(200).json({
            message: "Homework deleted successfully"
        });
    } catch (e) {
        console.log("Error while deleting the homework: ", e);
        res.status(500).json({
            message: "Error while deleting the homework",
            error: e.message
        });
    }
});


export default ManagingHomework;
