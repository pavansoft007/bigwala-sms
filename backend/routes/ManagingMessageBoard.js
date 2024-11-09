import express from "express";
import MessageBoard from "../models/MessageBoard.js";
import multer from 'multer';
import path from 'path';
import StudentAuth from "../middleware/StudentAuth.js";
import Teacher from "../models/Teacher.js";
import Encrypt from "../services/Encrypt.js";
import Decrypt from "../services/Decrypt.js";
import {Op} from "sequelize";
import {fileURLToPath} from "url";
import dotenv from "dotenv";
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
             where: {
                   [Op.or]: [
                         { type: 'completeSchool' },
                         {
                               [Op.and]: [
                                     { section: 'A' },
                                     { standard: '6' }
                               ]
                         },
                         { admission_id: 'ADM0000002' }
                   ]
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
                  const encText = Encrypt(message.messageBoard_id+':'+req['ip']);
                  return { ...message.toJSON(), addedOn: formattedDate , accessID:encText};
       });
       res.send(formattedMessages);
      }catch (error) {
            console.error('Error saving message:', error);
            return res.status(500).json({ error: 'An error occurred while getting the message.' });
      }
});

ManagingMessageBoard.get('/staticFiles/voiceMessage/:id',async (req,res)=>{
      const id=req.params.id;
      const decText = Decrypt(id).split(':');
      const ip=decText[decText.length-1];
      const realIp=req['ip'].split(':');
      if(ip === realIp[realIp.length-1]){
            const fileDetails=await MessageBoard.findOne({
                  where:{
                        messageBoard_id:decText[0]
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