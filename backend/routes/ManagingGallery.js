import express from "express";
import Gallery from "../models/Gallery.js";
import FormatDate from "../services/FormatDate.js";
import Encrypt from "../services/Encrypt.js";
import semiAdminAuth from "../middleware/semiAdminAuth.js";
import completeLogin from "../middleware/completeLogin.js";
import MulterService from "../services/multerService.js";


const ManagingGallery=express.Router();

ManagingGallery.post('/mobileAPI/gallery', semiAdminAuth('gallery'), MulterService.array('photos', 10), async (req, res) => {
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


ManagingGallery.get('/mobileAPI/gallery',completeLogin,async (req,res)=>{
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
            const encText = Encrypt(item.filename+':'+req['ip']);
            result[date][item.event_name].push({ filename: encText });

            return result;
        }, {});
        res.json(formattedData);
    } catch (error) {
        console.error('Error saving message:', error);
        return res.status(500).json({ error: 'An error occurred while getting the message.' });
    }
});




export default ManagingGallery;