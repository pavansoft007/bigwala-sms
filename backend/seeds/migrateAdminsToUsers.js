/**
 * One-time migration: backfills User records for all existing admins and
 * hashes any plaintext passwords still stored in the admins table.
 *
 * Run with:  node seeds/migrateAdminsToUsers.js
 *
 * Safe to re-run — skips admins that already have a User record.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

async function migrate() {
    const admins = await prisma.admin.findMany({ include: { School: true } });
    console.log(`Found ${admins.length} admin(s) to process.`);

    let created = 0;
    let skipped = 0;

    for (const admin of admins) {
        const existing = await prisma.user.findFirst({
            where: { original_id: admin.admin_id.toString(), role: 'admin' }
        });

        if (existing) {
            console.log(`  SKIP  ${admin.admin_email} — User record already exists`);
            skipped++;
            continue;
        }

        // Hash password if it's still plaintext (bcrypt hashes start with $2b$ or $2a$)
        const isAlreadyHashed = /^\$2[ab]\$/.test(admin.admin_password);
        const hashed = isAlreadyHashed
            ? admin.admin_password
            : await bcrypt.hash(admin.admin_password, 10);

        // Update the admins table with the hashed password
        if (!isAlreadyHashed) {
            await prisma.admin.update({
                where: { admin_id: admin.admin_id },
                data: { admin_password: hashed }
            });
        }

        await prisma.user.create({
            data: {
                name: admin.admin_name,
                email: admin.admin_email,
                phone_number: admin.admin_phone_number,
                password: hashed,
                role: 'admin',
                original_id: admin.admin_id.toString(),
                school_id: admin.school_id,
                is_active: true
            }
        });

        console.log(`  CREATE  ${admin.admin_email} (school: ${admin.School?.name})`);
        created++;
    }

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
    await prisma.$disconnect();
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
