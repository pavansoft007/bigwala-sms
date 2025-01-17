import express from "express";
import multer from "multer";
import path from "path";
import AdminAuth from "../middleware/AdminAuth.js";
import BannerImages from "../models/BannerImages.js";
import completeLogin from "../middleware/completeLogin.js";
import Encrypt from "../services/Encrypt.js";
import ImageCors from "../middleware/ImageCors.js";
import Decrypt from "../services/Decrypt.js";
import {fileURLToPath} from "url";
import ManagingGallery from "./ManagingGallery.js";


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/bannerImages/');
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
        cb("Error: Only  images files are allowed (mp3,wav,jpeg,png,jpg).");
    }
});

const ManageBannerImages=express.Router();

ManageBannerImages.post('/api/bannerImage', AdminAuth('banner Images'), upload.array('photos', 10),async (req,res)=>{
    try {
        const school_id = req['sessionData']['school_id'];


        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded.' });
        }

        const galleryImages = await Promise.all(
            req.files.map(file =>
                BannerImages.create({
                    school_id,
                    filename: file.path,
                })
            )
        );

        res.status(200).json({ message: 'Banner uploaded successfully.', data: galleryImages });
    } catch (error) {
        console.error('Error saving photos:', error);
        return res.status(500).json({ error: 'An error occurred while saving the Banner.' });
    }
});
ManageBannerImages.get('/mobileAPI/bannerImages', completeLogin, async (req, res) => {
    try {
        const school_id = req['sessionData']?.school_id;
        if (!school_id) {
            return res.status(400).json({ error: 'Invalid school ID' });
        }

        const completeData = await BannerImages.findAll({
            where: {
                school_id,
            },
        });

        const StaticFileData = completeData.map((item) => {
            return Encrypt(`${item.banner_id}:${req['ip'] || '0.0.0.0'}`);
        });

        res.json(StaticFileData);
    } catch (error) {
        console.error('Error fetching banner images:', error);
        return res.status(500).json({ error: 'An error occurred while fetching banner images.' });
    }
});

ManageBannerImages.delete('/api/bannerImages/:id',AdminAuth('banner Images'),async (req,res)=>{
     const bannerID=req.params.id;
     try{
        const bannerDetails=await BannerImages.findByPk(bannerID);
        await bannerDetails.destroy();
        res.send(200).json({message:'deleted sussesfully'});

    }catch (error) {
        console.error('Error deleting the images:', error);
        return res.status(500).json({ error: 'An error occurred while deleting the image.' });
    }
});



ManageBannerImages.get('/staticFiles/bannerImages/:id',ImageCors,async (req,res)=>{
    const id=req.params.id;
    try {
        const decText = Decrypt(id).split(':');
        const ip=decText[decText.length-1];
        const realIp=req['ip'].split(':');
        if(ip === realIp[realIp.length-1]){
            const fileDetails=await BannerImages.findOne({
                where:{
                    banner_id:decText[0]
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

export default ManageBannerImages;