import express from "express";
import multer from "multer";
import path from "path";
import Gallery from "../models/Gallery.js";
import FormatDate from "../services/FormatDate.js";

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

ManagingGallery.post('/mobileAPI/add-new-photos',upload.single('photo'),async (req,res)=>{
     try{
         const {event_name}=req.body;
         const school_id=1;
        const newGalleyImage=await Gallery.create({
            school_id,
            event_name,
            filename:req.file.path
        });
         res.status(200).json(newGalleyImage);
     } catch (error) {
         console.error('Error saving message:', error);
         return res.status(500).json({ error: 'An error occurred while saving the photo.' });
     }
});

ManagingGallery.get('/mobileAPI/get-gallery-images',async (req,res)=>{
    try{
        const school_id=1;
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
            result[date][item.event_name].push({ filename: item.filename });

            return result;
        }, {});
        res.json(formattedData);
    } catch (error) {
        console.error('Error saving message:', error);
        return res.status(500).json({ error: 'An error occurred while getting the message.' });
    }
});



export default ManagingGallery;