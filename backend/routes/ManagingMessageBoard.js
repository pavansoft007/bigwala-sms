import express from "express";
import MessageBoard from "../models/MessageBoard.js";
import multer from 'multer';
import path from 'path';
import StudentAuth from "../middleware/StudentAuth.js";
import Teacher from "../models/Teacher.js";

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


ManagingMessageBoard.post('/mobileAPI/add-new-message', upload.single('voice'), async (req, res) => {
      const teacher_id = 4;
      const school_id = 1;
      const { section, standard, admission_id, messageType, message,type } = req.body;

      try {
            if (messageType === 'message') {
                  const newMessageBoard = await MessageBoard.create({
                        teacher_id,
                        standard,
                        section,
                        messageType,
                        message,
                        admission_id,
                        school_id,
                        type
                  });
                  return res.status(200).json(newMessageBoard);

            } else if (messageType === 'voice') {
                  if (!req.file) {
                        return res.status(400).json({ error: 'Voice file is required for voice messages.' });
                  }

                  const newMessageBoard = await MessageBoard.create({
                        teacher_id,
                        standard,
                        section,
                        messageType,
                        voice_location: req.file.path,
                        admission_id,
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

ManagingMessageBoard.get('/mobileAPI/getMessages',StudentAuth,async (req,res)=>{
      try{
       MessageBoard.belongsTo(Teacher, { foreignKey: 'teacher_id' });
       const allMessages=await MessageBoard.findAll({
             where:{
                   school_id:req['sessionData']['school_id'],
                   admission_id:req['sessionData']['admission_id']
             },
             include:[
                   {
                         model:Teacher,
                         attributes: ['first_name', 'last_name','subject_specialization']
                   }
             ]
       });
       const formattedMessages = allMessages.map(message => {
                  const formattedDate = new Date(message.addedOn).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                  });
                  return { ...message.toJSON(), addedOn: formattedDate };
       });
       res.send(formattedMessages);
      }catch (error) {
            console.error('Error saving message:', error);
            return res.status(500).json({ error: 'An error occurred while getting the message.' });
      }
});

export default ManagingMessageBoard;