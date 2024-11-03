import express from "express";
import Homework from "../models/Homework.js";
import Classroom from "../models/Classroom.js";
import verifyToken from "../middleware/teacherAuth.js";

const ManagingHomework = express.Router();

ManagingHomework.post('/mobileAPI/add-new-homework', verifyToken,async (req, res) => {
    try {
        const { subject, context, standard, section } = req.body;
        const classroom = await Classroom.findOne({
            where: {
                standard,
                section
            }
        });

        if (classroom) {
            const classroomID = classroom.classroom_id;
            const today = new Date().toISOString().split('T')[0];
            const existingHomework = await Homework.findOne({
                where: {
                    classroom_id: classroomID,
                    school_id: 1,
                    subject,
                    addedDate: today
                }
            });

            if (existingHomework) {
                return res.status(409).json({ message: "Homework for this subject and date already exists." });
            }


            const newHomework = await Homework.create({
                school_id: 1,
                classroom_id: classroomID,
                subject,
                context,
                addedDate: today
            });
            res.status(201).json(newHomework);
        } else {
            res.status(404).json({ message: "Classroom not found" });
        }

    } catch (e) {
        console.log("Error while saving the homework: ", e);
        res.status(500).json({
            message: "Error while saving the homework"
        });
    }
});

ManagingHomework.get('/mobileAPI/get-homework', async (req, res) => {
    try {
        const classroom_id = 1;
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
