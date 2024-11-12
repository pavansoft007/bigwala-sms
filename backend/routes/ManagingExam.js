import express from "express";
import sequelize from "../config/database.js";
import AdminAuth from "../middleware/AdminAuth.js";
import Exam from "../models/Exam.js";
import Classroom from "../models/Classroom.js";
import ExamSubject from "../models/ExamSubject.js";
import completeLogin from "../middleware/completeLogin.js";

const ManagingExam = express.Router();

ManagingExam.post('/api/exam', AdminAuth, async (req, res) => {
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
            class_id: classDetails['classroom_id'],
            school_id: req['sessionData']['school_id']
        });
        res.status(200).json(newExam);
    } catch (error) {
        console.error('Error saving new exam:', error);
        return res.status(500).json({ error: 'An error occurred while saving the new exam' });
    }
});

ManagingExam.post('/api/exam-subject/:id', AdminAuth, async (req, res) => {
    const { exam_details } = req.body;
    const exam_id = req.params.id;
    try {
        const exam = await Exam.findOne({ where: { exam_id } });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const completeDetails = [];
        let latestExamDate = new Date(exam.end_date);
        let earliestExamDate = new Date(exam.start_date);

        for (let i = 0; i < exam_details.length; i++) {
            const { subject_id, exam_date } = exam_details[i];
            const examDate = new Date(exam_date);

            if (examDate > latestExamDate) {
                latestExamDate = examDate;
            }
            if (examDate < earliestExamDate) {
                earliestExamDate = examDate;
            }

            const newExamSubject = await ExamSubject.create({
                exam_id,
                subject_id,
                exam_date: examDate
            });
            completeDetails.push(newExamSubject);
        }

        let updatedFields = {};
        if (earliestExamDate < new Date(exam.start_date)) {
            updatedFields.start_date = earliestExamDate;
        }
        if (latestExamDate > new Date(exam.end_date)) {
            updatedFields.end_date = latestExamDate;
        }


        if (Object.keys(updatedFields).length > 0) {
            await exam.update(updatedFields);
        }

        res.json({
            message: 'Subjects added successfully',
            examSubjects: completeDetails,
            updatedExamDates: updatedFields
        });
    } catch (error) {
        console.error('Error saving new subject exam:', error);
        return res.status(500).json({ error: 'An error occurred while saving the new subject exam' });
    }
});

// ManagingExam.get('/mobileAPI/exam-time-table',async (req,res)=>{
//     try{
//         const [results, metadata] = await sequelize.query('select exam_date,s.subject_name,s.subject_name,e.exam_name from exam_subjects inner join bigwala.subjects s on exam_subjects.subject_id = s.subject_id inner join exams e on exam_subjects.exam_id = e.exam_id;');
//         res.send(results);
//     }catch (e) {
//         console.error('Error saving getting exam:', e);
//         return res.status(500).json({ error: 'An error occurred while getting the exam' });
//     }
// });

ManagingExam.get('/mobileAPI/exam-time-table',completeLogin, async (req, res) => {
    try {
        const role=req['sessionData']['role'];
        let class_id;
        if(role === 'student' ){
             const classDetails=await Classroom.findOne({
                 where:{
                     standard:req['sessionData']['standard'],
                     section:req['sessionData']['section']
                 }
             })
             class_id=classDetails.classroom_id;
        }else{
            const classDetails=await Classroom.findOne({
                where:{
                    standard:req['body']['standard'],
                    section:req['body']['section']
                }
            })
            class_id=classDetails.classroom_id;
        }


        const [examTimeTable]=await sequelize.query( `select exam_date,s.subject_name,s.subject_name,e.exam_name from exam_subjects inner join bigwala.subjects s on exam_subjects.subject_id = s.subject_id
    inner join exams e on exam_subjects.exam_id = e.exam_id where e.class_id=${class_id}`);

        const examData = {};
        console.log(examTimeTable);

        examTimeTable.forEach(item => {
            const examName = item.exam_name;

            if (!examData[examName]) {
                examData[examName] = [];
            }

            examData[examName].push({
                subject_name: item.subject_name,
                exam_date: item.exam_date
            });
        });

        res.json({ exams: examData });
    } catch (error) {
        console.error('Error fetching exam time table:', error);
        res.status(500).json({ error: 'An error occurred while fetching the exam time table' });
    }
});


ManagingExam.put('/api/exam/:id', AdminAuth, async (req, res) => {
    const exam_id = req.params.id;
    const { exam_name, start_date, end_date, standard, section } = req.body;

    try {
        const exam = await Exam.findOne({ where: { exam_id } });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (standard && section) {
            const classDetails = await Classroom.findOne({
                where: { standard, section }
            });

            if (!classDetails) {
                return res.status(404).json({ message: 'Invalid classroom' });
            }

            exam.class_id = classDetails['classroom_id'];
        }


        await exam.update({
            exam_name,
            start_date,
            end_date,
            school_id: req['sessionData']['school_id']
        });

        res.json({ message: 'Exam updated successfully', exam });
    } catch (error) {
        console.error('Error updating exam:', error);
        return res.status(500).json({ error: 'An error occurred while updating the exam' });
    }
});


ManagingExam.delete('/api/exam/:id', AdminAuth, async (req, res) => {
    const exam_id = req.params.id;

    try {
        const exam = await Exam.findOne({ where: { exam_id } });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }


        await ExamSubject.destroy({ where: { exam_id } });

        await exam.destroy();
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam:', error);
        return res.status(500).json({ error: 'An error occurred while deleting the exam' });
    }
});


ManagingExam.put('/api/exam-subject/:id', AdminAuth, async (req, res) => {
    const examSubject_id = req.params.id;
    const { exam_date } = req.body;

    try {
        const examSubject = await ExamSubject.findOne({ where: { exam_subject_id: examSubject_id } });
        if (!examSubject) {
            return res.status(404).json({ message: 'Exam subject not found' });
        }

        await examSubject.update({ exam_date });
        res.json({ message: 'Exam subject updated successfully', examSubject });
    } catch (error) {
        console.error('Error updating exam subject:', error);
        return res.status(500).json({ error: 'An error occurred while updating the exam subject' });
    }
});

ManagingExam.delete('/api/exam-subject/:id', AdminAuth, async (req, res) => {
    const examSubject_id = req.params.id;

    try {
        const examSubject = await ExamSubject.findOne({ where: { exam_subject_id: examSubject_id } });
        if (!examSubject) {
            return res.status(404).json({ message: 'Exam subject not found' });
        }

        await examSubject.destroy();
        res.json({ message: 'Exam subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam subject:', error);
        return res.status(500).json({ error: 'An error occurred while deleting the exam subject' });
    }
});

export default ManagingExam;
