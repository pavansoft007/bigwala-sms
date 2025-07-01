import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import upload from "../services/multerService.js";
import Exam from "../models/Exam.js";
import completeLogin from "../middleware/completeLogin.js";
import ExamMarks from "../models/ExamMarks.js";

const ManagingExam = express.Router();

ManagingExam.post(
    '/api/exam',
    AdminAuth('exam'),
    upload.fields([
        {
            name: "timetable_photo",
            maxCount: 1,
        }
    ]),
    async (req, res) => {
        try {
            const { exam_name, class_id, school_id, start_date, end_date , status } = req.body;
            if (!exam_name || !class_id || !school_id || !start_date || !end_date) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const timetablePhotoFile = req.files?.timetable_photo?.[0];
            if (!timetablePhotoFile) {
                return res.status(400).json({ error: "Timetable photo is required" });
            }

            const examSearch = await Exam.findOne({
                where: {
                    class_id,
                    school_id,
                    [Op.and]: [
                        {
                            start_date: {
                                [Op.lte]: end_date
                            }
                        },
                        {
                            end_date: {
                                [Op.gte]: start_date
                            }
                        }
                    ]
                }
            });
            if(!examSearch) {
                return res.status(400).json({ error: "A exam is already scheduled on that date "+start_date });
            }

            const timetable_photo = timetablePhotoFile.filename;
            const exam = await Exam.create({
                exam_name,
                class_id,
                school_id,
                start_date,
                end_date,
                status,
                timetable_photo,
            });

            return res.status(201).json({ message: "Exam created successfully", exam });
        } catch (err) {
            console.error("Error creating exam:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);

ManagingExam.get("/api/exam", completeLogin , async (req, res) => {
    try{
        const school_id = req.sessionData.student_id;
        const exam = await Exam.findOne({
            where: {
                school_id: school_id
            }
        })
        return res.status(200).json(exam);

    } catch (err) {
        console.error("Error creating exam:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

ManagingExam.put(
    '/api/exam/:exam_id',
    AdminAuth('exam'),
    upload.fields([
        {
            name: "timetable_photo",
            maxCount: 1,
        }
    ]),
    async (req, res) => {
        try {
            const exam_id = req.params.exam_id;
            const { exam_name, class_id, school_id, start_date, end_date, status } = req.body;

            const examInfo = await Exam.findOne({
                where: {
                    exam_id,
                    school_id
                }
            });

            if (!examInfo) {
                return res.status(404).json({
                    error: "Exam not found"
                });
            }

            if (!exam_name || !class_id || !school_id || !start_date || !end_date) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const timetablePhotoFile = req.files?.timetable_photo?.[0];
            let timetable_photo = examInfo.timetable_photo;

            if (timetablePhotoFile) {
                timetable_photo = timetablePhotoFile.filename;
            }

            await examInfo.update({
                exam_name,
                class_id,
                school_id,
                start_date,
                end_date,
                status,
                timetable_photo
            });

            return res.status(200).json({ message: "Exam updated successfully", exam: examInfo });
        } catch (err) {
            console.error("Error updating exam:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
);


ManagingExam.post('/api/studentMarks',AdminAuth('exam'),async (req, res) => {
    try{

    }catch (e) {
        console.error("Error adding student exam:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


ManagingExam.post('/api/exam-marks', AdminAuth('exam'), async (req, res) => {
    try {
        const { subject_id, class_id, student_id, exam_id, marks } = req.body;

        if (!subject_id || !class_id || !student_id || !exam_id || marks === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newMark = await ExamMarks.create({
            subject_id,
            class_id,
            student_id,
            exam_id,
            marks,
        });

        return res.status(201).json({ message: 'Exam mark added successfully', data: newMark });
    } catch (error) {
        console.error('Error creating exam mark:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

ManagingExam.get('/api/exam-marks', AdminAuth('exam'), async (req, res) => {
    try {
        const { exam_id, class_id, student_id } = req.query;

        const where = {};
        if (exam_id) where.exam_id = exam_id;
        if (class_id) where.class_id = class_id;
        if (student_id) where.student_id = student_id;

        const marks = await ExamMarks.findAll({ where });

        return res.status(200).json({ data: marks });
    } catch (error) {
        console.error('Error fetching exam marks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


ManagingExam.get('/api/exam-marks/:student_id/:exam_id', AdminAuth('exam'), async (req, res) => {
    try {
        const { student_id, exam_id } = req.params;

        const studentMarks = await ExamMarks.findAll({
            where: {
                student_id,
                exam_id,
            }
        });

        if (!studentMarks.length) {
            return res.status(404).json({ error: 'Marks not found for this student in the given exam' });
        }

        return res.status(200).json({ data: studentMarks });
    } catch (error) {
        console.error('Error fetching student marks:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


ManagingExam.put('/api/exam-marks/:id', AdminAuth('exam'), async (req, res) => {
    try {
        const { id } = req.params;
        const { marks } = req.body;

        if (marks === undefined) {
            return res.status(400).json({ error: 'Marks are required to update' });
        }

        const mark = await ExamMarks.findByPk(id);

        if (!mark) {
            return res.status(404).json({ error: 'Mark not found' });
        }

        await mark.update({ marks });

        return res.status(200).json({ message: 'Marks updated successfully', data: mark });
    } catch (error) {
        console.error('Error updating exam mark:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

ManagingExam.delete('/api/exam-marks/:id', AdminAuth('exam'), async (req, res) => {
    try {
        const { id } = req.params;

        const mark = await ExamMarks.findByPk(id);

        if (!mark) {
            return res.status(404).json({ error: 'Mark not found' });
        }

        await mark.destroy();

        return res.status(200).json({ message: 'Mark deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam mark:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default ManagingExam;
