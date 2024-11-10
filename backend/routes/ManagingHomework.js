import express from "express";
import Homework from "../models/Homework.js";
import Classroom from "../models/Classroom.js";
import teacherAuth from "../middleware/teacherAuth.js";
import studentAuth from "../middleware/StudentAuth.js";

const ManagingHomework = express.Router();

ManagingHomework.post('/mobileAPI/add-new-homework', teacherAuth, async (req, res) => {
    try {
        const { subject, context, standard, section } = req.body;
        const school_id=req['sessionData']['school_id'];
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
                subject,
                addedDate: today
            }
        });

        if (existingHomework) {
            return res.status(409).json({ message: "Homework for this subject and date already exists." });
        }

        const newHomework = await Homework.create({
            school_id: school_id,
            classroom_id: classroomID,
            subject,
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

ManagingHomework.get('/mobileAPI/get-homework', studentAuth,async (req, res) => {
    try {
        const studentDetails=req['sessionData'];
        const classroom = await Classroom.findOne({
            where: {
                standard:studentDetails.standard,
                section:studentDetails.section
            }
        });
        if(!classroom){
            return res.status(403).json({message:"classroom not found"});
        }
        const classroom_id = classroom.classroom_id;
        const today = new Date().toISOString().split('T')[0];

        const homeworkDetails = await Homework.findAll({
            where: {
                classroom_id: classroom_id,
                school_id: 1,
                addedDate: today
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

export default ManagingHomework;
