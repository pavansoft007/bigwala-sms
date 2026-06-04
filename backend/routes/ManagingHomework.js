import express from "express";
import teacherAuth from "../middleware/teacherAuth.js";
import completeLogin from "../middleware/completeLogin.js";
import prisma from '../lib/prisma.js';
const ManagingHomework = express.Router();

ManagingHomework.post('/mobileAPI/homework', teacherAuth('homework'), async (req, res) => {
    try {
        const { subject_id: reqSubjectId, context, standard, section } = req.body;
        let classroomID = null;

        const { role, teacher_id, school_id } = req['sessionData'];

        if (!school_id) {
            return res.status(400).json({ message: "School ID is missing in session data." });
        }

        let subject_id = reqSubjectId;


        if (role === 'teacher' || role === 'admin-teacher') {
            const teacherDetails = await prisma.teachers.findFirst({
                where: { teacher_id: parseInt(teacher_id) },
                select: { assignedClass: true, subject_id: true }
            });

            if (!teacherDetails) {
                return res.status(404).json({ message: "Teacher details not found." });
            }


            if (!subject_id) {
                subject_id = teacherDetails.subject_id;
            }

            if (standard && section) {
                const classroom = await prisma.classrooms.findFirst({
                    where: { standard, section, school_id: parseInt(school_id) }
                });

                if (!classroom) {
                    return res.status(404).json({ message: "Classroom not found." });
                }

                classroomID = classroom.classroom_id;
            } else {
                classroomID = teacherDetails.assignedClass;

                if (!classroomID) {
                    return res.status(400).json({ message: "No assigned classroom found for this teacher." });
                }
            }
        }


        const subjectDetails = await prisma.subjects.findFirst({
            where: { school_id: parseInt(school_id), subject_id: parseInt(subject_id) }
        });

        if (!subjectDetails) {
            return res.status(404).json({ message: "Subject not found." });
        }


        if (!classroomID) {
            return res.status(400).json({ message: "Classroom ID could not be determined." });
        }

        const today = new Date(new Date().toLocaleDateString('en-CA'));

        const existingHomework = await prisma.homeworks.findFirst({
            where: {
                classroom_id: parseInt(classroomID),
                school_id: parseInt(school_id),
                subject_id: subjectDetails.subject_id,
                addedDate: today
            }
        });

        if (existingHomework) {
            return res.status(409).json({ message: "Homework for this subject and date already exists." });
        }

        const newHomework = await prisma.homeworks.create({
            data: {
                school_id: parseInt(school_id),
                classroom_id: parseInt(classroomID),
                subject_id: subjectDetails.subject_id,
                context,
                addedDate: today
            }
        });

        return res.status(201).json(newHomework);
    } catch (error) {
        console.error("Error while saving the homework:", error);
        return res.status(500).json({
            message: "An unexpected error occurred while saving the homework.",
            error: error.message
        });
    }
});



ManagingHomework.post('/mobileAPI/get-homework', completeLogin, async (req, res) => {
    try {
        const sessionDetails = req['sessionData'];
        const homeworkData = {}; 
        
        const now = new Date();
        const todayStr = now.toLocaleDateString('en-CA');
        const today = new Date(todayStr);
        
        const sevenDaysAgoStr = new Date(now.setDate(now.getDate() - 7)).toLocaleDateString('en-CA');
        const startDate = new Date(sevenDaysAgoStr);

        if (sessionDetails['role'] === 'student') {
            const homeworkDetails = await prisma.$queryRaw`
                SELECT homework_id, context, s.subject_name, s.subject_code, homeworks.addedDate
                FROM homeworks 
                INNER JOIN classrooms c ON c.classroom_id = homeworks.classroom_id 
                INNER JOIN subjects s ON s.subject_id = homeworks.subject_id 
                WHERE c.standard = ${sessionDetails['standard']} 
                    AND c.section = ${sessionDetails['section']}
                    AND homeworks.addedDate BETWEEN ${startDate} AND ${today};
            `;

            homeworkDetails.forEach((item) => {
                const date = new Date(item.addedDate).toLocaleDateString('en-CA'); 
                if (!homeworkData[date]) {
                    homeworkData[date] = [];
                }
                homeworkData[date].push(item);
            });

            return res.json(homeworkData);
        } else {
            const standard = req.body.standard;
            const section = req.body.section;

            if (!standard || !section) {
                if (sessionDetails['role'] === 'teacher' || sessionDetails['role'] === 'admin-teacher') {
                    const teacherDetails = await prisma.teachers.findFirst({
                        where: {
                            school_id: parseInt(req['sessionData']['school_id']),
                            teacher_id: parseInt(req['sessionData']['teacher_id'])
                        },
                        select: { assignedClass: true }
                    });

                    const homeworkDetails = await prisma.$queryRaw`
                        SELECT homework_id, context, s.subject_name, s.subject_code, homeworks.addedDate 
                        FROM homeworks 
                        INNER JOIN classrooms c ON c.classroom_id = homeworks.classroom_id  
                        INNER JOIN subjects s ON s.subject_id = homeworks.subject_id 
                        WHERE homeworks.addedDate BETWEEN ${startDate} AND ${today} 
                            AND homeworks.classroom_id = ${teacherDetails['assignedClass']} ;
                    `;

                    homeworkDetails.forEach((item) => {
                        const date = new Date(item.addedDate).toLocaleDateString('en-CA');
                        if (!homeworkData[date]) {
                            homeworkData[date] = [];
                        }
                        homeworkData[date].push(item);
                    });

                    return res.status(200).json(homeworkData);
                } else {
                    return res.status(404).json({ message: "Please enter the section and standard details" });
                }
            }

            const homeworkDetails = await prisma.$queryRaw`
                SELECT homework_id, context, s.subject_name, s.subject_code, homeworks.addedDate 
                FROM homeworks 
                INNER JOIN classrooms c ON c.classroom_id = homeworks.classroom_id 
                INNER JOIN subjects s ON s.subject_id = homeworks.subject_id 
                WHERE c.standard = ${standard} 
                    AND c.section = ${section} 
                    AND homeworks.addedDate BETWEEN ${startDate} AND ${today};
            `;

            homeworkDetails.forEach((item) => {
                const date = new Date(item.addedDate).toLocaleDateString('en-CA');
                if (!homeworkData[date]) {
                    homeworkData[date] = [];
                }
                homeworkData[date].push(item);
            });

            return res.json(homeworkData);
        }
    } catch (e) {
        console.log("Error in getting the data: ", e);
        res.status(500).json({
            message: "Error while getting the homework"
        });
    }
});



ManagingHomework.get('/mobileAPI/homework/:id',teacherAuth('homework'),async (req,res)=>{
    try{
        const homework_id = parseInt(req.params.id);
        const school_id = parseInt(req['sessionData']['school_id']);
        const homework = await prisma.homeworks.findFirst({
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

ManagingHomework.put('/mobileAPI/homework/:id', teacherAuth('homework'), async (req, res) => {
    try {
        const homework_id = parseInt(req.params.id);
        const { context } = req.body;
        const school_id = parseInt(req['sessionData']['school_id']);

        const homework = await prisma.homeworks.findFirst({
            where: {
                homework_id,
                school_id
            }
        });

        if (!homework) {
            return res.status(404).json({ message: "Homework not found" });
        }

        const updatedHomework = await prisma.homeworks.update({
            where: { homework_id },
            data: { context: context || homework.context }
        });

        res.status(200).json({
            message: "Homework updated successfully",
            homework: updatedHomework
        });
    } catch (e) {
        console.log("Error while updating the homework: ", e);
        res.status(500).json({
            message: "Error while updating the homework",
            error: e.message
        });
    }
});
ManagingHomework.delete('/mobileAPI/homework/:id', teacherAuth('homework'), async (req, res) => {
    try {
        const homework_id = parseInt(req.params.id);
        const school_id = parseInt(req['sessionData']['school_id']);

        const homework = await prisma.homeworks.findFirst({
            where: {
                homework_id,
                school_id
            }
        });

        if (!homework) {
            return res.status(404).json({ message: "Homework not found" });
        }

        await prisma.homeworks.delete({
            where: { homework_id }
        });

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