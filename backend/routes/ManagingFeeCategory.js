import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ManagingFeeCategory = express.Router();

ManagingFeeCategory.post('/api/fee_category', AdminAuth('fee'), async (req, res) => {
    const {category_name} = req.body;
    const school_id = parseInt(req['sessionData']['school_id']);
    try {
        const newCategory = await prisma.feeCategories.create({
            data: {
                school_id,
                category_name
            }
        });
        res.status(201).json(newCategory);
    } catch (e) {
        console.error('Error saving fee category:', e);
        res.status(500).json({message: 'An error occurred while saving the fee category.'});
    }
});

// Get all fee categories for a school
ManagingFeeCategory.get('/api/fee_category', AdminAuth('fee'), async (req, res) => {
    const school_id = parseInt(req['sessionData']['school_id']);
    try {
        const categories = await prisma.feeCategories.findMany({
            where: {school_id},
            select: { category_id: true, category_name: true, description: true }
        });
        res.status(200).json(categories);
    } catch (e) {
        console.error('Error fetching fee categories:', e);
        res.status(500).json({message: 'An error occurred while fetching the fee categories.'});
    }
});

// Update a fee category by ID
ManagingFeeCategory.put('/api/fee_category/:id', AdminAuth('fee'), async (req, res) => {
    const id = parseInt(req.params.id);
    const {category_name} = req.body;
    const school_id = parseInt(req['sessionData']['school_id']);

    try {
        const category = await prisma.feeCategories.findFirst({
            where: {category_id: id, school_id},
        });

        if (!category) {
            return res.status(404).json({message: 'Fee category not found.'});
        }

        const updatedCategory = await prisma.feeCategories.update({
            where: { category_id: category.category_id },
            data: { category_name }
        });

        res.status(200).json({message: 'Fee category updated successfully.', category: updatedCategory});
    } catch (e) {
        console.error('Error updating fee category:', e);
        res.status(500).json({message: 'An error occurred while updating the fee category.'});
    }
});

// Delete a fee category by ID
ManagingFeeCategory.delete('/api/fee_category/:category_id', AdminAuth('fee'), async (req, res) => {
    const category_id = parseInt(req.params.category_id);
    const school_id = parseInt(req['sessionData']['school_id']);

    try {
        const category = await prisma.feeCategories.findFirst({
            where: {category_id, school_id},
        });

        if (!category) {
            return res.status(404).json({message: 'Fee category not found.'});
        }

        await prisma.feeCategories.delete({
            where: { category_id: category.category_id }
        });
        res.status(200).json({message: 'Fee category deleted successfully.'});
    } catch (e) {
        console.error('Error deleting fee category:', e);
        res.status(500).json({message: 'An error occurred while deleting the fee category.'});
    }
});

ManagingFeeCategory.get('/api/fee/dashboard_data', AdminAuth('fee'), async (req, res) => {
    try {
        const school_id = parseInt(req.sessionData.school_id);
        const [
            totalCollectionRaw,
            pendingPaymentRaw,
            fullyPaidStudentsRaw,
            totalStudentsRaw,
            categoryCountRaw,
            monthly_fee_data,
            recent_transactions
        ] = await Promise.all([
            prisma.$queryRaw`SELECT COALESCE(SUM(amount), 0) AS total_collection FROM students_payments WHERE school_id = ${school_id}`,

            prisma.$queryRaw`SELECT COALESCE(SUM(sf.fee_remaining), 0) AS pending_payment
                 FROM student_fees sf
                          JOIN fee_categories fc ON fc.category_id = sf.category_id
                 WHERE sf.school_id = ${school_id}
                   AND fc.category_name = 'tuition fee'`,

            prisma.$queryRaw`SELECT COUNT(*) AS fully_paid_students FROM student_fees WHERE school_id = ${school_id} AND fee_remaining = 0`,

            prisma.$queryRaw`SELECT COUNT(DISTINCT sf.student_id) AS total_students
                 FROM student_fees sf
                          JOIN fee_categories fc ON fc.category_id = sf.category_id
                 WHERE sf.school_id = ${school_id}
                   AND fc.category_name = 'tuition fee'`,

            prisma.$queryRaw`SELECT COUNT(DISTINCT category_id) AS category_count FROM fee_categories WHERE school_id = ${school_id}`,

            prisma.$queryRaw`
                SELECT DATE_FORMAT(payment_date, '%M %Y') AS name,
                       SUM(amount)                        AS amount
                FROM students_payments
                WHERE school_id = ${school_id}
                GROUP BY name
                ORDER BY MIN(payment_date)
            `,
            
            prisma.$queryRaw`SELECT payment_id,
                                    amount,
                                    fc.category_name,
                                    s.first_name,
                                    s.last_name,
                                    payment_mode,
                                    c.standard   as class,
                                    a.admin_name as collected_by,
                                    DATE_FORMAT(payment_date, '%Y-%m-%d %h:%i %p') AS payment_date
                             FROM students_payments
                                      inner join admins a on students_payments.collected_by = a.admin_id
                                      inner join fee_categories fc on students_payments.category_id = fc.category_id
                                      inner join students s on students_payments.student_id = s.student_id
                                      inner join classrooms c on s.assignedClassroom = c.classroom_id
                             where students_payments.school_id = ${school_id}
                             ORDER BY payment_date DESC
                             LIMIT 5`
        ]);

        const totalCollection = totalCollectionRaw[0];
        const pendingPayment = pendingPaymentRaw[0];
        const fullyPaidStudents = fullyPaidStudentsRaw[0];
        const totalStudents = totalStudentsRaw[0];
        const categoryCount = categoryCountRaw[0];

        res.json({
            tab_data: {
                total_collection: totalCollection.total_collection,
                pending_payment: pendingPayment.pending_payment,
                fully_paid_students: fullyPaidStudents.fully_paid_students,
                total_students: totalStudents.total_students,
                category_count: categoryCount.category_count,
            },
            monthly_fee_data,
            recent_transactions
        });

    } catch (e) {
        console.error('Error fetching dashboard data:', e);
        res.status(500).json({message: 'An error occurred while fetching the dashboard data.'});
    }
});

export default ManagingFeeCategory;