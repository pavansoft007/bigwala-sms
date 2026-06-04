import express from 'express';
import AdminAuth from '../middleware/AdminAuth.js';
import prisma from '../lib/prisma.js';

const ManagingAcademicYear = express.Router();

// List all academic years for the school
ManagingAcademicYear.get('/api/academic-year', AdminAuth('all'), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        const years = await prisma.academicYear.findMany({
            where: { school_id },
            orderBy: { id: 'desc' },
        });
        res.status(200).json(years);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new academic year (does NOT make it current automatically)
ManagingAcademicYear.post('/api/academic-year', AdminAuth('all'), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        const { year } = req.body;

        if (!year) {
            return res.status(400).json({ message: 'year is required' });
        }

        const existing = await prisma.academicYear.findFirst({ where: { school_id, year } });
        if (existing) {
            return res.status(409).json({ message: 'This academic year already exists' });
        }

        const newYear = await prisma.$transaction(async (tx) => {
            const created = await tx.academicYear.create({
                data: { year, school_id, is_current: false },
            });
            await tx.schoolFinancials.create({
                data: { year_id: created.id, school_id, current_balance: 0 },
            });
            return created;
        });

        res.status(201).json(newYear);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Switch the current academic year (atomically unmarks old, marks new)
ManagingAcademicYear.put('/api/academic-year/:id/set-current', AdminAuth('all'), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        const yearId = parseInt(req.params.id);

        const targetYear = await prisma.academicYear.findFirst({
            where: { id: yearId, school_id },
        });

        if (!targetYear) {
            return res.status(404).json({ message: 'Academic year not found' });
        }

        if (targetYear.is_current) {
            return res.status(400).json({ message: 'This year is already current' });
        }

        await prisma.$transaction(async (tx) => {
            // Ensure SchoolFinancials exists for the target year
            const existing = await tx.schoolFinancials.findFirst({
                where: { year_id: yearId, school_id },
            });
            if (!existing) {
                await tx.schoolFinancials.create({
                    data: { year_id: yearId, school_id, current_balance: 0 },
                });
            }

            // Unmark the previous current year
            await tx.academicYear.updateMany({
                where: { school_id, is_current: true },
                data: { is_current: false },
            });

            // Mark the new year as current
            await tx.academicYear.update({
                where: { id: yearId },
                data: { is_current: true },
            });
        });

        res.status(200).json({ message: 'Academic year switched successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default ManagingAcademicYear;
