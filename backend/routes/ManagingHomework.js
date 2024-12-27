import express from "express";
import Homework from "../models/Homework.js";
import Classroom from "../models/Classroom.js";
import teacherAuth from "../middleware/teacherAuth.js";
import Subject from "../models/Subject.js";
import sequelize from "../config/database.js";
import Teacher from "../models/Teacher.js";
import completeLogin from "../middleware/completeLogin.js";

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
            const teacherDetails = await Teacher.findOne({
                where: { teacher_id },
                attributes: ['assignedClass', 'subject_id']
            });

            if (!teacherDetails) {
                return res.status(404).json({ message: "Teacher details not found." });
            }


            if (!subject_id) {
                subject_id = teacherDetails.subject_id;
            }

            if (standard && section) {
                const classroom = await Classroom.findOne({
                    where: { standard, section, school_id }
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


        const subjectDetails = await Subject.findOne({
            where: { school_id, subject_id }
        });

        if (!subjectDetails) {
            return res.status(404).json({ message: "Subject not found." });
        }


        if (!classroomID) {
            return res.status(400).json({ message: "Classroom ID could not be determined." });
        }

        const today = new Date().toLocaleDateString('en-CA');


        const existingHomework = await Homework.findOne({
            where: {
                classroom_id: classroomID,
                school_id,
                subject_id: subjectDetails.subject_id,
                addedDate: today
            }
        });

        if (existingHomework) {
            return res.status(409).json({ message: "Homework for this subject and date already exists." });
        }


        const newHomework = await Homework.create({
            school_id,
            classroom_id: classroomID,
            subject_id: subjectDetails.subject_id,
            context,
            addedDate: today
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



ManagingHomework.get('/mobileAPI/homework', completeLogin,async (req, res) => {
    try {
        const sessionDetails=req['sessionData'];
        const homeworkData={
            today:[],
            yesterday:[]
        }
        const now = new Date();
        const today = now.toLocaleDateString('en-CA');
        now.setDate(now.getDate() - 1);
        const yesterday = now.toLocaleDateString('en-CA');
        if(sessionDetails['role']=== 'student'){
            const [homeworkDetails] = await
                sequelize.query(`SELECT homework_id,context,s.subject_name,s.subject_code ,homeworks.addedDate
                                              FROM homeworks 
                                                  INNER JOIN classrooms c ON c.classroom_id=homeworks.classroom_id 
                                                  INNER JOIN subjects s ON s.subject_id=homeworks.subject_id 
                                              WHERE c.standard=${sessionDetails['standard']} && c.section='${sessionDetails['section']}' 
                                                        && (homeworks.addedDate ='${today}' or homeworks.addedDate='${yesterday}') ;`);


            homeworkDetails.forEach((item)=>{
                if(item.addedDate === today){
                    homeworkData.today.push(item);
                }else if(item.addedDate === yesterday){
                    homeworkData.yesterday.push(item);
                }
            })
            return res.json(homeworkData);
        }else{
            const standard=req.body.standard;
            const section=req.body.section;
            if(!standard || !section){
                if(sessionDetails['role']==='teacher' || sessionDetails['role']==='admin-teacher'){
                    const teacherDetails=await Teacher.findOne({
                        where:{
                            school_id:req['sessionData']['school_id'],
                            teacher_id:req['sessionData']['teacher_id']
                        },attributes:['assignedClass']
                    });



                    const [homeworkDetails]=await sequelize.query(`SELECT homework_id,context,s.subject_name,s.subject_code,homeworks.addedDate 
                                                                                        FROM homeworks 
                                                                                            INNER JOIN classrooms c ON c.classroom_id=homeworks.classroom_id  
                                                                                            INNER JOIN subjects s ON s.subject_id=homeworks.subject_id 
                                                                                        WHERE homeworks.addedDate ="${today}" or homeworks.addedDate="${yesterday}" && homeworks.classroom_id=`+teacherDetails['assignedClass']);

                    homeworkDetails.forEach((item)=>{
                        if(item.addedDate === today){
                            homeworkData.today.push(item);
                        }else if(item.addedDate === yesterday){
                            homeworkData.yesterday.push(item);
                        }
                    })
                    return res.status(200).json(homeworkData);
                }else {
                    res.status(404).json({ message:"plz enter the section and standard details" });
                }
            }
            const [homeworkDetails] = await
                sequelize.query(`SELECT homework_id,context,s.subject_name,s.subject_code,homeworks.addedDate 
                                                          FROM homeworks 
                                                              INNER JOIN classrooms c ON c.classroom_id=homeworks.classroom_id 
                                                              INNER JOIN subjects s ON s.subject_id=homeworks.subject_id 
                                                          WHERE c.standard=${standard} && c.section='${section}' 
                                                                    && homeworks.addedDate ='${today}' && homeworks.addedDate='${yesterday}';`);

            homeworkDetails.forEach((item)=>{
                if(item.addedDate === today){
                    homeworkData.today.push(item);
                }else if(item.addedDate === yesterday){
                    homeworkData.yesterday.push(item);
                }
            })
            return  res.json(homeworkData);
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

ManagingHomework.put('/mobileAPI/homework/:id', teacherAuth('homework'), async (req, res) => {
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
ManagingHomework.delete('/mobileAPI/homework/:id', teacherAuth('homework'), async (req, res) => {
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
