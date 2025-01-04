import express from "express";
import MessageBoard from "../models/MessageBoard.js";
import multer from 'multer';
import path from 'path';
import Decrypt from "../services/Decrypt.js";
import {fileURLToPath} from "url";
import dotenv from "dotenv";
import TeacherAuth from "../middleware/teacherAuth.js";
import getAssignedClassroom from "../services/getAssignedClassroom.js";
import sequelize from "../config/database.js";
import completeLogin from "../middleware/completeLogin.js";
import Encrypt from "../services/Encrypt.js";
import ImageCors from "../middleware/ImageCors.js";
dotenv.config();


const storage = multer.diskStorage({
      destination: (req, file, cb) => {
            cb(null, 'uploads/voice_messages/');
      },
      filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
      }
});

const upload = multer({
      storage: storage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
            const filetypes = /mp3|wav|ogg|m4a|mpeg/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

            if (mimetype && extname) {
                  return cb(null, true);
            }
            cb("Error: Only audio files are allowed (mp3, wav, ogg,mpeg).");
      }
});


const ManagingMessageBoard=express.Router();


ManagingMessageBoard.post('/mobileAPI/add-new-message', TeacherAuth('message board'),upload.single('voice'), async (req, res) => {
      const added_member_id = req['sessionData']['role'] === 'admin' ? req['sessionData']['id'] : req['sessionData']['teacher_id'];
      const school_id = req['sessionData']['school_id'];
      const role=req['sessionData']['role'];
      const classroom_id= req['sessionData']['role'] === 'admin' ? req.body.classroom_id : await getAssignedClassroom(req['sessionData']['teacher_id'],'teacher');
      const { student_id, messageType, text_message,type } = req.body;
      console.log(role);

      if( ( role !== 'admin' ) && type === 'completeSchool'  ){
            return res.status(400).json({message:'invalid type'});
      }

      try {
            if (messageType === 'text') {
                  const newMessageBoard = await MessageBoard.create({
                        student_id: type === 'student' ? student_id : null ,
                        classroom_id,
                        message_type:messageType,
                        text_message,
                        added_by:req['sessionData']['role'],
                        added_member_id,
                        school_id,
                        type
                  });
                  return res.status(200).json(newMessageBoard);

            } else if (messageType === 'voice') {
                  if (!req.file) {
                        return res.status(400).json({ error: 'Voice file is required for voice messages.' });
                  }

                  const newMessageBoard = await MessageBoard.create({
                        student_id : type === 'student' ? student_id : null,
                        classroom_id,
                        message_type:messageType,
                        voice_location: req.file.path,
                        added_by:req['sessionData']['role'],
                        added_member_id,
                        school_id,
                        type
                  });
                  return res.status(200).json(newMessageBoard);
            }
      } catch (error) {
            console.error('Error saving message:', error);
            return res.status(500).json({ error: 'An error occurred while saving the message.' });
      }
});

ManagingMessageBoard.post('/mobileAPI/getMessages', completeLogin, async (req, res) => {
      try {
            const { role, school_id, student_id } = req['sessionData'];
            const { classroom_id, student_id: bodyStudentId, type } = req.body;

            const baseQuery = `
            SELECT 
                messageBoards.*, 
                c.standard, 
                c.section, 
                s.admission_ID, 
                s.first_name, 
                s.last_name,
                a.admin_name,
                t.first_name as teacher_frist_name,
                t.last_name as teacher_last_name,
                sub.subject_name
            FROM messageBoards
            LEFT JOIN classrooms c ON c.classroom_id = messageBoards.classroom_id
            LEFT JOIN students s ON s.student_id = messageBoards.student_id
            LEFT JOIN admins a ON a.admin_id=messageBoards.added_by
            LEFT JOIN teachers t ON t.teacher_id=messageBoards.added_by
            LEFT JOIN subjects sub ON sub.subject_id=t.subject_id
        `;

            let whereClause = '';
            let replacements = { schoolId: school_id, classroom_id, student_id: bodyStudentId };

            if (role === 'admin' || role === 'teacher-admin') {
                  if (classroom_id) {
                        whereClause = `WHERE messageBoards.school_id = :schoolId AND messageBoards.classroom_id = :classroom_id AND messageBoards.type = 'completeClass'`;
                  } else if (bodyStudentId) {
                        whereClause = `WHERE messageBoards.school_id = :schoolId AND messageBoards.student_id = :student_id AND messageBoards.type = 'student'`;
                  } else {
                        whereClause = `WHERE messageBoards.school_id = :schoolId AND messageBoards.type = 'completeSchool'`;
                  }

                  if (type === 'fetchAll') {
                        whereClause = `WHERE messageBoards.school_id = :schoolId`;
                  }

            } else if (role === 'teacher') {
                  replacements = {
                        studentId: bodyStudentId,
                        classroomId: await getAssignedClassroom(student_id, 'teacher'),
                        schoolId: school_id,
                  };
                  whereClause = `
                WHERE 
                    (messageBoards.student_id = :studentId)
                    OR (messageBoards.classroom_id = :classroomId AND messageBoards.type = 'completeClass')
                    OR (messageBoards.type = 'completeSchool' AND messageBoards.school_id = :schoolId)
            `;

            } else if (role === 'student') {
                  replacements = {
                        studentId: student_id,
                        classroomId: await getAssignedClassroom(student_id, 'student'),
                        schoolId: school_id,
                  };
                  whereClause = `
                WHERE 
                    (messageBoards.student_id = :studentId)
                    OR (messageBoards.classroom_id = :classroomId AND messageBoards.type = 'completeClass')
                    OR (messageBoards.type = 'completeSchool' AND messageBoards.school_id = :schoolId)
            `;
            } else {
                  return res.status(403).json({ error: 'Unauthorized access.' });
            }

            const query = `${baseQuery} ${whereClause}`;
            const [allMessages] = await sequelize.query(query, { replacements });

            const formattedMessages = allMessages.map(item => {
                  if(item.added_by === 'admin'){
                        delete item.teacher_frist_name;
                        delete item.teacher_last_name;
                        delete item.subject_name;
                  }else{
                        delete item.admin_name
                  }
                  if (item.message_type === 'voice') {
                        item.voice_location = Encrypt(`${item.message_id}:${req.ip}`);
                  }
                  return item;
            });

            return res.send(formattedMessages);

      } catch (error) {
            console.error('Error getting messages:', error);
            return res.status(500).json({ error: 'An error occurred while getting the messages.' });
      }
});

//@todo backend route for the get them via there assignedClass id



ManagingMessageBoard.get('/staticFiles/voiceMessage/:id',ImageCors,async (req,res)=>{
      const id=req.params.id;
      const decText = Decrypt(id).split(':');
      const ip=decText[decText.length-1];
      const realIp=req['ip'].split(':');
      if(ip === realIp[realIp.length-1]){
            const fileDetails=await MessageBoard.findOne({
                  where:{
                        message_id:decText[0]
                  }
            });
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const completePath=path.parse(__dirname)['dir'];
            if(fileDetails['voice_location']){
                  res.sendFile(path.join(completePath,fileDetails['voice_location']));
            }else{
                  res.send('file location not found');
            }
      }else{
            res.send('no access');
      }
});


export default ManagingMessageBoard;