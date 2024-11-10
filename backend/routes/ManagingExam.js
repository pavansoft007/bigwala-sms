import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import Exam from "../models/Exam.js";
import Classroom from "../models/Classroom.js";
import ExamSubject from "../models/ExamSubject.js";

const ManagingExam = express.Router();

ManagingExam.post('/api/new-exam', AdminAuth, async (req, res) => {
    const { exam_name, start_date, end_date, standard, section } = req.body;
    try {
        const classDetails = await Classroom.findOne({
            where: {
                standard,
                section
            }
        });

        if (!classDetails) {
            return res.status(404).json({ message: 'Invalid classroom' });
        }

        const newExam = await Exam.create({
            exam_name,
            start_date,
            end_date,
            classroom_id: classDetails['classroom_id'],
            school_id: req['sessionData']['school_id']
        });
        res.status(200).json(newExam);
    } catch (error) {
        console.error('Error saving new exam:', error);
        return res.status(500).json({ error: 'An error occurred while saving the new exam' });
    }
});

ManagingExam.post('/api/add-exam-subject/:id', AdminAuth, async (req, res) => {
    const { exam_details } = req.body;
    const exam_id = req.params.id;
    try {
        const exam = await Exam.findOne({ where: { exam_id } });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const completeDetails = [];
        let latestExamDate = new Date(exam.end_date);

        for (let i = 0; i < exam_details.length; i++) {
            const { subject_id, exam_date } = exam_details[i];
            const examDate = new Date(exam_date);

            if (examDate > latestExamDate) {
                latestExamDate = examDate;
            }

            const newExamSubject = await ExamSubject.create({
                exam_id,
                subject_id,
                exam_date: examDate
            });
            completeDetails.push(newExamSubject);
        }

        if (latestExamDate > new Date(exam.end_date)) {
            exam.end_date = latestExamDate;
            await exam.save();
        }

        res.json({
            message: 'Subjects added successfully',
            examSubjects: completeDetails,
            updatedExamEndDate: latestExamDate > new Date(exam.end_date) ? latestExamDate : null
        });
    } catch (error) {
        console.error('Error saving new subject exam:', error);
        return res.status(500).json({ error: 'An error occurred while saving the new subject exam' });
    }
});

export default ManagingExam;
