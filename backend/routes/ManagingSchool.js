// src/routes/managingSchool.js
import express from 'express';
import MasterAdminAuth from '../middleware/MasterAdminAuth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ManagingSchool = express.Router();

/* ─────────────────────────  ADD NEW SCHOOL  ───────────────────────── */
ManagingSchool.post('/super-admin/schools', MasterAdminAuth, async (req, res) => {
    const {
        school_name,
        address,
        phone_number,
        email,
        school_code,
        admin_name,
        admin_email,
        admin_phone_number,
        admin_password,
        year
    } = req.body;

    try {
        await prisma.$transaction(async (tx) => {
            /* ---------- SCHOOL ---------- */
            const school = await tx.school.create({
                data: {
                    name:         school_name,
                    address,
                    phone_number,
                    school_code,
                    email
                }
            });

            /* ---------- ACADEMIC YEAR ---------- */
            const academicYear = await tx.academicYear.create({
                data: {
                    year,
                    school_id: school.school_id,
                    is_current: true
                }
            });

            /* ---------- ROLE ---------- */
            const role = await tx.role.create({
                data: {
                    role_name: 'admin',
                    school_id: school.school_id
                }
            });

            /* ---------- ADMIN ---------- */
            await tx.admin.create({
                data: {
                    admin_name,
                    admin_email,
                    admin_phone_number,
                    admin_password,
                    role_id:  role.role_id,
                    school_id: school.school_id
                }
            });

            /* ---------- FEE CATEGORY ---------- */
            await tx.feeCategory.create({
                data: {
                    school_id:     school.school_id,
                    category_name: 'tuition fee',
                    description:   'Default tuition Fee for the school'
                }
            });

            /* ---------- SCHOOL FINANCIALS ---------- */
            await tx.schoolFinancials.create({
                data: {
                    year_id:         academicYear.id,
                    year:            new Date().getFullYear(),
                    school_id:       school.school_id,
                    current_balance: 0
                }
            });
        });

        res.status(200).json({ message: 'Successfully added the school' });

    } catch (err) {
        console.error('Error adding new school:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


export default ManagingSchool;
