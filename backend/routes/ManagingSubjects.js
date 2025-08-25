import express from "express";
import { PrismaClient } from "@prisma/client";
import AdminAuth from "../middleware/AdminAuth.js";
import completeLogin from "../middleware/completeLogin.js";

const prisma = new PrismaClient();
const ManagingSubjects = express.Router();

ManagingSubjects.post('/api/subject', AdminAuth('subject'), async (req, res) => {
    try {
        const { subject_name, subject_code } = req.body;
        const school_id = req.sessionData.school_id;

        const newSubject = await prisma.subjects.create({
            data: {
                subject_code,
                subject_name,
                school_id
            }
        });

        res.status(200).json(newSubject);
    } catch (e) {
        console.error('Error in saving the subject:', e);
        // Handle potential unique constraint violation
        if (e.code === 'P2002') {
            return res.status(409).json({ message: "A subject with this code or name already exists." });
        }
        res.status(500).json({ message: "Error while saving the subject" });
    }
});

ManagingSubjects.get("/api/subject", completeLogin, async (req, res) => {
    try {
        const subjects = await prisma.subjects.findMany({
            where: {
                school_id: req.sessionData.school_id
            },
            select: {
                subject_id: true,
                subject_name: true,
                subject_code: true
            },
        });

        res.json(subjects);
    } catch (e) {
        console.error('Error in getting the subjects:', e);
        res.status(500).json({ message: "Error while getting the subjects" });
    }
});

ManagingSubjects.put('/api/subject/:id', AdminAuth('subject'), async (req, res) => {
    try {
        const subject_id = parseInt(req.params.id);
        const { subject_name, subject_code } = req.body;
        const school_id = req.sessionData.school_id;

        const updateResult = await prisma.subjects.updateMany({
            where: {
                subject_id: subject_id,
                school_id: school_id
            },
            data: {
                subject_name,
                subject_code,
            },
        });

        if (updateResult.count === 0) {
            return res.status(404).json({ message: 'Subject not found or you do not have permission to update it.' });
        }

        // Fetch the updated subject to return it
        const updatedSubject = await prisma.subjects.findUnique({
            where: { subject_id }
        });

        res.json(updatedSubject);
    } catch (e) {
        console.error('Error in updating the subject:', e);
        if (e.code === 'P2002') {
            return res.status(409).json({ message: "A subject with this code or name already exists." });
        }
        res.status(500).json({ message: 'Error while updating the subject' });
    }
});


ManagingSubjects.delete('/api/subject/:id', AdminAuth('subject'), async (req, res) => {
    try {
        const subject_id = parseInt(req.params.id);
        const school_id = req.sessionData.school_id;

        const deleteResult = await prisma.subjects.deleteMany({
            where: {
                subject_id: subject_id,
                school_id: school_id
            }
        });

        if (deleteResult.count === 0) {
            return res.status(404).json({ message: 'Subject not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (e) {
        console.error('Error in deleting the subject:', e);
        res.status(500).json({ message: 'Error while deleting the subject' });
    }
});

export default ManagingSubjects;