import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import Subject from "../models/Subject.js";
import completeLogin from "../middleware/completeLogin.js";

const ManagingSubjects=express.Router();

ManagingSubjects.post('/api/subject',AdminAuth('subject'),async (req,res)=>{
    try{
        const {subject_name,subject_code}=req.body;
        const school_id=req['sessionData']['school_id'];
        const newSubject=await Subject.create({
            subject_code,
            subject_name,
            school_id
        });
        res.status(200).json(newSubject)
    }catch (e) {
        console.error(' got error in saving the subject :',e );
        res.status(500).json({ message:"error in saving the subject" });
    }
});
ManagingSubjects.get("/api/subject",completeLogin,async (req,res)=>{
   try{
       const subjects = await Subject.findAll({
           where: {
               school_id: req['sessionData']['school_id']
           },
           attributes: ['subject_id', 'subject_name', 'subject_code'],
       });

       res.json(subjects);
   } catch (e) {
       console.error(' got error in getting the subject :',e );
       res.status(500).json({ message:"error in getting the subject" });
   }
});
ManagingSubjects.put('/api/subject/:id', AdminAuth('subject'), async (req, res) => {
    try {
        const subject_id = req.params.id;
        const { subject_name, subject_code } = req.body;
        const school_id = req['sessionData']['school_id'];


        const existingSubject = await Subject.findOne({
            where: { subject_id: subject_id, school_id }
        });

        if (!existingSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }


        existingSubject.subject_name = subject_name;
        existingSubject.subject_code = subject_code;


        await existingSubject.save();

        res.json(existingSubject);
    } catch (e) {
        console.error('Error in updating the subject:', e);
        res.status(500).json({ message: 'Error while updating the subject' });
    }
});
ManagingSubjects.delete('/api/subject/:id', AdminAuth('subject'), async (req, res) => {
    try {
        const subject_id = req.params.id;
        const school_id = req['sessionData']['school_id'];

        const existingSubject = await Subject.findOne({
            where: { subject_id: subject_id, school_id }
        });

        if (!existingSubject) {
            return res.status(404).json({ message: 'Subject not found' });
        }


        await existingSubject.destroy();

        res.json({ message: 'Subject deleted successfully' });
    } catch (e) {
        console.error('Error in deleting the subject:', e);
        res.status(500).json({ message: 'Error while deleting the subject' });
    }
});



export default ManagingSubjects;