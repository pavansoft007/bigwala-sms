import express from "express";
import SemiAdminAuth from "../middleware/semiAdminAuth.js";
import studentAuth from "../middleware/StudentAuth.js";
import prisma from '../lib/prisma.js';
const ManagingVideo=express.Router();

ManagingVideo.post('/mobileAPI/add-new-video',SemiAdminAuth('managing videos'),async (req,res)=>{
    try{
        const {event_name,youtude_link}=req.body;
        const school_id=req['sessionData']['school_id'];
        const newVideo=await prisma.youtubeVideo.create({
            data: {
                school_id,
                event_name,
                youtubeLink:youtude_link
            }
        });
        res.json(newVideo);
    }catch (e) {
        console.error('Error saving the new video :', e);
        res.status(500).json({message: 'An error occurred while saving the video',});
    }
});

ManagingVideo.get('/mobileAPI/get-videos',studentAuth,async (req,res)=>{
   const school_id=req['sessionData']['school_id'];
   try {
       const completeVideo=await prisma.youtubeVideo.findMany({
           where:{
               school_id:school_id
           }
       })
       res.send(completeVideo);
   }catch (e) {
       console.error('Error fetching the data:', e);
       res.status(500).json({message: 'error while fetching the video data',});
   }
});
ManagingVideo.put('/mobileAPI/update-video/:id', SemiAdminAuth('managing videos'), async (req, res) => {
    try {
        const youtude_id = Number(req.params.id);
        const { event_name, youtude_link } = req.body;
        const school_id = req['sessionData']['school_id'];

        const existingVideo = await prisma.youtubeVideo.findFirst({
            where: { youtube_id: youtude_id, school_id }
        });

        if (!existingVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }


        const updatedVideo = await prisma.youtubeVideo.update({
            where: { youtube_id: youtude_id },
            data: {
                event_name: event_name,
                youtubeLink: youtude_link
            }
        });

        res.json(updatedVideo);
    } catch (e) {
        console.error('Error in updating the videos:', e);
        res.status(500).json({ message: 'Error while updating the video data' });
    }
});

ManagingVideo.delete('/mobileAPI/delete-video/:id', SemiAdminAuth('managing videos'), async (req, res) => {
    try {
        const youtude_id = Number(req.params.id);
        const school_id = req['sessionData']['school_id'];

        const existingVideo = await prisma.youtubeVideo.findFirst({
            where: { youtube_id: youtude_id, school_id }
        });

        if (!existingVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }

        await prisma.youtubeVideo.delete({
            where: { youtube_id: youtude_id }
        });

        res.json({ message: 'Video deleted successfully' });
    } catch (e) {
        console.error('Error in deleting the video:', e);
        res.status(500).json({ message: 'Error while deleting the video' });
    }
});



export default ManagingVideo;