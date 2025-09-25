import express from "express";
import { PrismaClient } from "@prisma/client";
import semiAdminAuth from "../middleware/semiAdminAuth.js";
import adminAuth from "../middleware/AdminAuth.js";
import teacherAuth from "../middleware/teacherAuth.js";
import completeLogin from "../middleware/completeLogin.js";

const ManagingClassrooms = express.Router();
const prisma = new PrismaClient();

// Create Classroom
ManagingClassrooms.post('/mobileAPI/classroom', adminAuth('classroom'), async (req, res) => {
    const { standard, section } = req.body;
    const school_id = req.sessionData.school_id;

    try {
        const existingClassroom = await prisma.classrooms.findFirst({
            where: { standard:standard.toString(), section : section.toString(), school_id }
        });

        if (existingClassroom) {
            return res.status(409).json({ message: "Classroom already exists" });
        }

        const newClassroom = await prisma.classrooms.create({
            data: { standard:standard.toString(), section : section.toString(), school_id }
        });

        res.status(201).json({
            message: 'Classroom created successfully',
            classroomInfo: newClassroom
        });
    } catch (error) {
        console.error('Error creating classroom:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

// Get All Classrooms
ManagingClassrooms.get('/mobileAPI/classroom', teacherAuth('classroom'), async (req, res) => {
    const school_id = req.sessionData.school_id;

    try {
        const classroomDetails = await prisma.classrooms.findMany({
            where: { school_id },
            select: { classroom_id: true, standard: true, section: true }
        });

        res.json(classroomDetails);
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

// Get All Standards
ManagingClassrooms.get('/mobileAPI/standard', completeLogin, async (req, res) => {
    const school_id = req.sessionData.school_id;

    try {
        const classroomDetails = await prisma.classrooms.findMany({
            where: { school_id },
            select: { standard: true },
            distinct: ['standard']
        });

        const classStandard = classroomDetails.map(item => item.standard);
        res.json(classStandard);
    } catch (error) {
        console.error('Error fetching standards:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

// Get Sections by Standard
ManagingClassrooms.get('/mobileAPI/section', completeLogin, async (req, res) => {
    const school_id = req.sessionData.school_id;
    const { standard } = req.query;

    try {
        const classroomDetails = await prisma.classrooms.findMany({
            where: { school_id, standard },
            select: { section: true }
        });

        const sections = classroomDetails.map(item => item.section);
        res.json(sections);
    } catch (error) {
        console.error('Error fetching sections:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

// Get Students by Classroom
ManagingClassrooms.get('/mobileAPI/getStudent/:classroomID', teacherAuth('classroom'), async (req, res) => {
    const classroomID = parseInt(req.params.classroomID);

    try {
        const studentINFO = await prisma.students.findMany({
            where: { assignedClassroom: classroomID }
        });

        res.status(200).json(studentINFO);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

// Assign Student to Classroom
ManagingClassrooms.post('/mobileAPI/student-assign-classroom', semiAdminAuth('classroom'), async (req, res) => {
    const { standard, section, studentID } = req.body;
    const school_id = req.sessionData.school_id;

    try {
        const classDetails = await prisma.classrooms.findFirst({
            where: { standard, section, school_id }
        });

        if (!classDetails) {
            return res.status(404).json({ message: 'Section not found in your school' });
        }

        const updateStudent = await prisma.students.updateMany({
            where: { student_id: studentID },
            data: { assignedClassroom: classDetails.classroom_id }
        });

        if (updateStudent.count === 1) {
            res.status(200).json({ message: 'Student updated successfully' });
        } else {
            res.status(404).json({ message: 'Student not found or no changes made' });
        }
    } catch (error) {
        console.error('Error assigning student:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

// Assign Teacher to Classroom
ManagingClassrooms.post('/mobileAPI/teacher-assign-classroom', semiAdminAuth('classroom'), async (req, res) => {
    const { standard, section, teacher_id } = req.body;
    const school_id = req.sessionData.school_id;

    try {
        const classDetails = await prisma.classrooms.findFirst({
            where: { standard, section, school_id }
        });

        if (!classDetails) {
            return res.status(404).json({ message: 'Section not found in your school' });
        }

        const updateTeacher = await prisma.teachers.updateMany({
            where: { teacher_id },
            data: { assignedClass: classDetails.classroom_id }
        });

        if (updateTeacher.count === 1) {
            res.status(200).json({ message: 'Teacher updated successfully' });
        } else {
            res.status(404).json({ message: 'Teacher not found or no changes made' });
        }
    } catch (error) {
        console.error('Error assigning teacher:', error);
        if (error.code === 'P2002') {
            return res.status(409).json({ message: "A teacher is already assigned to that class" });
        }
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

// Delete Classroom
ManagingClassrooms.delete('/mobileAPI/classroom/:classroomID', adminAuth('classroom'), async (req, res) => {
    const classroomID = parseInt(req.params.classroomID);
    const school_id = req.sessionData.school_id;

    try {
        const studentsInClassroom = await prisma.students.findMany({
            where: { assignedClassroom: classroomID }
        });

        if (studentsInClassroom.length > 0) {
            return res.status(400).json({ message: 'Cannot delete classroom. There are students assigned.' });
        }

        const teachersInClassroom = await prisma.teachers.findMany({
            where: { assignedClass: classroomID }
        });

        if (teachersInClassroom.length > 0) {
            return res.status(400).json({ message: 'Cannot delete classroom. There are teachers assigned.' });
        }

        const deletedClassroom = await prisma.classrooms.deleteMany({
            where: { classroom_id: classroomID, school_id }
        });

        if (deletedClassroom.count === 1) {
            return res.status(200).json({ message: 'Classroom deleted successfully' });
        } else {
            return res.status(404).json({ message: 'Classroom not found or already deleted' });
        }
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

export default ManagingClassrooms;