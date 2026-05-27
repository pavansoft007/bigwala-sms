import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import upload from "../services/multerService.js";
import completeLogin from "../middleware/completeLogin.js";
import Encrypt from "../services/Encrypt.js";
import FormatDate from "../services/FormatDate.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
            const school_id = req.sessionData.school_id;
            const {exam_name, class_id, start_date, end_date, status} = req.body;
            if (!exam_name || !class_id || !school_id || !start_date || !end_date) {
                return res.status(400).json({error: "Missing required fields"});
            }

            const timetablePhotoFile = req.files?.timetable_photo?.[0];
            if (!timetablePhotoFile) {
                return res.status(400).json({error: "Timetable photo is required"});
            }

            const examSearch = await prisma.exams.findFirst({
                where: {
                    class_id: parseInt(class_id),
                    school_id: parseInt(school_id),
                    AND: [
                        { start_date: { lte: new Date(end_date) } },
                        { end_date: { gte: new Date(start_date) } }
                    ]
                }
            });
            if (examSearch) {
                return res.status(400).json({error: "A exam is already scheduled on that date " + start_date});
            }

            const timetable_photo = timetablePhotoFile.path;
            const exam = await prisma.exams.create({
                data: {
                    exam_name,
                    class_id: parseInt(class_id),
                    school_id: parseInt(school_id),
                    start_date: new Date(start_date),
                    end_date: new Date(end_date),
                    status,
                    timetable_photo,
                }
            });

            return res.status(201).json({message: "Exam created successfully", exam});
        } catch (err) {
            console.error("Error creating exam:", err);
            return res.status(500).json({error: "Internal server error"});
        }
    }
);

ManagingExam.get("/api/exam", completeLogin, async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;

        let exams = await prisma.$queryRaw`
            select e.exam_id,
                   e.exam_name,
                   c.classroom_id,
                   c.standard,
                   c.section,
                   e.timetable_photo,
                   e.status,
                   e.start_date,
                   e.end_date
            from exams e
                     inner join classrooms c on e.class_id = c.classroom_id
            where e.school_id = ${school_id};
        `;

        exams = exams.map((exam) => {
            exam['start_date'] = FormatDate(exam['start_date']);
            exam['end_date'] = FormatDate(exam['end_date']);
            exam['timetable_photo'] = Encrypt(exam['timetable_photo'] + ':' + req.realIp);
            return exam;
        });

        return res.status(200).json(exams);

    } catch (err) {
        console.error("Error fetching exams:", err);
        return res.status(500).json({error: "Internal server error"});
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
            const exam_id = parseInt(req.params.exam_id);
            const school_id = req.sessionData.school_id;
            const {exam_name, classroom_id, start_date, end_date, status} = req.body;

            const examInfo = await prisma.exams.findFirst({
                where: {
                    exam_id,
                    school_id: parseInt(school_id)
                }
            });

            if (!examInfo) {
                return res.status(404).json({
                    error: "Exam not found"
                });
            }

            if (!exam_name || !classroom_id || !school_id || !start_date || !end_date) {
                return res.status(400).json({error: "Missing required fields"});
            }

            const timetablePhotoFile = req.files?.timetable_photo?.[0];
            let timetable_photo = examInfo.timetable_photo;

            if (timetablePhotoFile) {
                timetable_photo = timetablePhotoFile.filename;
            }

            const updatedExam = await prisma.exams.update({
                where: { exam_id },
                data: {
                    exam_name,
                    class_id: parseInt(classroom_id),
                    school_id: parseInt(school_id),
                    start_date: new Date(start_date),
                    end_date: new Date(end_date),
                    status,
                    timetable_photo
                }
            });

            return res.status(200).json({message: "Exam updated successfully", exam: updatedExam});
        } catch (err) {
            console.error("Error updating exam:", err);
            return res.status(500).json({error: "Internal server error"});
        }
    }
);


ManagingExam.post('/api/studentMarks', AdminAuth('exam'), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        const marksObj = req.body.marks;
        const student_id = parseInt(req.body.student_id);
        const exam_id = parseInt(req.body.exam_id);
        const class_id = parseInt(req.body.classroom_id);

        const examCheck = await prisma.exams.findFirst({
            where: {
                school_id: parseInt(school_id),
                exam_id: exam_id,
                class_id: class_id,
                status: "completed"
            }
        });

        if (!examCheck) {
            return res.status(400).json({error: "invalid exam or ID not found"});
        }

        const checkExamMarks = await prisma.examMarks.findMany({
            where: {
                school_id: parseInt(school_id),
                exam_id: exam_id,
                student_id: student_id,
            }
        });

        if(checkExamMarks.length > 0) {
            return res.status(400).json({
                error: "Exam marks already exists for this student",
            });
        }

        const subjects = await prisma.subjects.findMany({
            where:{
                school_id: parseInt(school_id)
            }
        });

        const marksArray=[];

        for (let subject of subjects) {
            const newMark={};
            newMark['exam_id'] = exam_id;
            newMark['subject_id'] = subject.subject_id;
            newMark['marks'] = parseInt(marksObj[subject.subject_id]?.marks ?? 0);
            newMark['student_id'] = student_id;
            newMark['class_id'] = class_id;
            newMark['school_id'] = parseInt(school_id);
            marksArray.push(newMark);
        }
        await prisma.examMarks.createMany({ data: marksArray });
        return res.status(200).json({ success: "marks added successfully" });

    } catch (e) {
        console.error("Error adding student exam:", e);
        return res.status(500).json({error: "Internal server error"});
    }
});


ManagingExam.post('/api/exam-marks', AdminAuth('exam'), async (req, res) => {
    try {
        const {subject_id, class_id, student_id, exam_id, marks} = req.body;

        if (!subject_id || !class_id || !student_id || !exam_id || marks === undefined) {
            return res.status(400).json({error: 'All fields are required'});
        }

        const newMark = await prisma.examMarks.create({
            data: {
                subject_id: parseInt(subject_id),
                class_id: parseInt(class_id),
                student_id: parseInt(student_id),
                exam_id: parseInt(exam_id),
                marks: parseInt(marks),
                school_id: parseInt(req.sessionData.school_id)
            }
        });

        return res.status(201).json({message: 'Exam mark added successfully', data: newMark});
    } catch (error) {
        console.error('Error creating exam mark:', error);
        return res.status(500).json({error: 'Internal server error'});
    }
});

ManagingExam.get('/api/exam-marks', AdminAuth('exam'), async (req, res) => {
    try {
        const {exam_id, class_id, student_id} = req.query;

        const where = {};
        if (exam_id) where.exam_id = parseInt(exam_id);
        if (class_id) where.class_id = parseInt(class_id);
        if (student_id) where.student_id = parseInt(student_id);

        const marks = await prisma.examMarks.findMany({where});

        return res.status(200).json({data: marks});
    } catch (error) {
        console.error('Error fetching exam marks:', error);
        return res.status(500).json({error: 'Internal server error'});
    }
});


ManagingExam.get('/api/exam-marks/:student_id/:exam_id', AdminAuth('exam'), async (req, res) => {
    try {
        const {student_id, exam_id} = req.params;

        const studentMarks = await prisma.examMarks.findMany({
            where: {
                student_id: parseInt(student_id),
                exam_id: parseInt(exam_id),
            }
        });

        if (!studentMarks.length) {
            return res.status(404).json({error: 'Marks not found for this student in the given exam'});
        }

        return res.status(200).json({data: studentMarks});
    } catch (error) {
        console.error('Error fetching student marks:', error);
        return res.status(500).json({error: 'Internal server error'});
    }
});


ManagingExam.put('/api/exam-marks/:id', AdminAuth('exam'), async (req, res) => {
    try {
        const {id} = req.params;
        const {marks} = req.body;

        if (marks === undefined) {
            return res.status(400).json({error: 'Marks are required to update'});
        }

        const mark = await prisma.examMarks.findUnique({ where: { id: parseInt(id) } });

        if (!mark) {
            return res.status(404).json({error: 'Mark not found'});
        }

        const updatedMark = await prisma.examMarks.update({
            where: { id: parseInt(id) },
            data: { marks: parseInt(marks) }
        });

        return res.status(200).json({message: 'Marks updated successfully', data: updatedMark});
    } catch (error) {
        console.error('Error updating exam mark:', error);
        return res.status(500).json({error: 'Internal server error'});
    }
});

export default ManagingExam;