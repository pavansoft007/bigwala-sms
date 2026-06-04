import express from 'express';
import bcrypt from 'bcryptjs';
import MasterAdminAuth from '../middleware/MasterAdminAuth.js';
import prisma from '../lib/prisma.js';

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

    if (!school_name || !school_code || !admin_email || !admin_password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(admin_password, 10);

        await prisma.$transaction(async (tx) => {
            const school = await tx.school.create({
                data: { name: school_name, address, phone_number, school_code, email }
            });

            const academicYear = await tx.academicYear.create({
                data: { year, school_id: school.school_id, is_current: true }
            });

            const role = await tx.roles.create({
                data: { role_name: 'admin', school_id: school.school_id }
            });

            const admin = await tx.admin.create({
                data: {
                    admin_name,
                    admin_email,
                    admin_phone_number,
                    admin_password: hashedPassword,
                    role_id: role.role_id,
                    school_id: school.school_id
                }
            });

            // Create the master User record so the admin can log in via the unified auth system
            await tx.user.create({
                data: {
                    name: admin_name,
                    email: admin_email,
                    phone_number: admin_phone_number,
                    password: hashedPassword,
                    role: 'admin',
                    original_id: admin.admin_id.toString(),
                    school_id: school.school_id,
                    is_active: true
                }
            });

            await tx.feeCategories.create({
                data: {
                    school_id: school.school_id,
                    category_name: 'tuition fee',
                    description: 'Default tuition Fee for the school'
                }
            });

            await tx.schoolFinancials.create({
                data: {
                    year_id: academicYear.id,
                    school_id: school.school_id,
                    current_balance: 0
                }
            });
        });

        res.status(200).json({ message: 'Successfully added the school' });

    } catch (err) {
        console.error('Error adding new school:', err);
        if (err.code === 'P2002') {
            return res.status(409).json({ error: 'School code or admin email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default ManagingSchool;
