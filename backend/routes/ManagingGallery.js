import express from "express";
import multer from "multer";
import path from "path";
import Gallery from "../models/Gallery.js";
import FormatDate from "../services/FormatDate.js";
import Encrypt from "../services/Encrypt.js";
import Decrypt from "../services/Decrypt.js";
import {fileURLToPath} from "url";
import gallery from "../models/Gallery.js";
import semiAdminAuth from "../middleware/semiAdminAuth.js";
import completeLogin from "../middleware/completeLogin.js";
import ImageCors from "../middleware/ImageCors.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/galleryImages/');
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
        const filetypes = /mp3|wav|jpeg|png|jpg/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: Only audio files are allowed (mp3, wav, ogg,mpeg).");
    }
});

const ManagingGallery=express.Router();

ManagingGallery.post('/mobileAPI/add-new-photos', semiAdminAuth('gallery'), upload.array('photos', 10), async (req, res) => {
    try {
        const { event_name } = req.body;
        const school_id = req['sessionData']['school_id'];

        // Ensure files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        // Save each uploaded file in the database
        const galleryImages = await Promise.all(
            req.files.map(file =>
                Gallery.create({
                    school_id,
                    event_name,
                    filename: file.path,
                })
            )
        );

        res.status(200).json({ message: 'Photos uploaded successfully.', data: galleryImages });
    } catch (error) {
        console.error('Error saving photos:', error);
        return res.status(500).json({ error: 'An error occurred while saving the photos.' });
    }
});


ManagingGallery.get('/mobileAPI/get-gallery-images',completeLogin,async (req,res)=>{
    try{
        const school_id=req['sessionData']['school_id'];
        const completeData=await Gallery.findAll({
            where:{
                school_id
            }
        });

        const formattedData = completeData.reduce((result, item) => {
            const date = FormatDate(item['uploadedOn']);
            if (!result[date]) {
                result[date] = {};
            }

            if (!result[date][item.event_name]) {
                result[date][item.event_name] = [];
            }
            console.log(item.gallery_id+':'+req['ip']);
            const encText = Encrypt(item.gallery_id+':'+req['ip']);
            result[date][item.event_name].push({ filename: encText });

            return result;
        }, {});
        res.json(formattedData);
    } catch (error) {
        console.error('Error saving message:', error);
        return res.status(500).json({ error: 'An error occurred while getting the message.' });
    }
});

ManagingGallery.get('/staticFiles/get-gallery-images/:id',ImageCors,async (req,res)=>{
    const id=req.params.id;
    try {
        const decText = Decrypt(id).split(':');
        const ip=decText[decText.length-1];
        const realIp=req['ip'].split(':');
        if(ip === realIp[realIp.length-1]){
            const fileDetails=await gallery.findOne({
                where:{
                    gallery_id:decText[0]
                }
            });
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const completePath=path.parse(__dirname)['dir'];
            console.log(fileDetails['filename']);
            if(fileDetails['filename']){
                res.sendFile(path.join(completePath,fileDetails['filename']));
            }else{
                res.send('file location not found');
            }
        }else{
            res.send('no access');
        }
    }catch (error) {
        console.error('Error saving message:', error);
        return res.status(500).json({ error: 'An error occurred while getting the image.' });
    }
});



export default ManagingGallery;