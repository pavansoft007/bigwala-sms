import express from "express";
import adminAuth from "../middleware/AdminAuth.js";
import multerService from "../services/multerService.js";
import studentAuth from "../middleware/StudentAuth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ManagingFeePayment = express.Router();

ManagingFeePayment.post('/api/fee/fee-collect', adminAuth('fee'), async (req, res) => {
    try {
        const {amount, student_id, category_id, remarks,payment_mode} = req.body;


        if (!amount || amount <= 0 || !student_id || !category_id) {
            return res.status(400).json({message: "Invalid input data"});
        }

        const {school_id, id: collected_by} = req.sessionData;

        try {
            const newPayment = await prisma.$transaction(async (tx) => {
                const studentFeeDetails = await tx.studentFees.findFirst({
                    where: {
                        student_id: parseInt(student_id),
                        category_id: parseInt(category_id),
                        school_id: parseInt(school_id)
                    }
                });

                if (!studentFeeDetails) {
                    throw new Error("Student fee details not found");
                }

                const remaining_fee = studentFeeDetails.fee_remaining - amount;
                if(remaining_fee < 0){
                    throw new Error("This is more than required fee");
                }

                const createdPayment = await tx.studentsPayments.create({
                    data: {
                        amount: parseInt(amount),
                        student_id: parseInt(student_id),
                        category_id: parseInt(category_id),
                        remarks: remarks || null,
                        payment_mode,
                        school_id: parseInt(school_id),
                        collected_by: parseInt(collected_by)
                    }
                });

                await tx.studentFees.update({
                    where: { fee_id: studentFeeDetails.fee_id },
                    data: {
                        total_fee_paid: { increment: parseInt(amount) },
                        fee_remaining: { decrement: parseInt(amount) }
                    }
                });

                const school_financials = await tx.schoolFinancials.findFirst({
                    where: {
                        school_id: parseInt(school_id)
                    }
                });

                if (school_financials) {
                    await tx.schoolFinancials.update({
                        where: { school_financial_id: school_financials.school_financial_id },
                        data: { current_balance: { increment: parseInt(amount) } }
                    });
                }

                return createdPayment;
            });

            return res.status(200).json({message: "Fee collected successfully", newPayment});
        } catch (error) {
            console.error("Database error in fee collection:", error);
            if (error.message === "Student fee details not found") return res.status(404).json({message: error.message});
            if (error.message === "This is more than required fee") return res.status(400).json({message: error.message});
            return res.status(500).json({message: "Internal server error"});
        }
    } catch (error) {
        console.error("Unexpected error in fee collection:", error);
        return res.status(500).json({message: "Unexpected error occurred"});
    }
});

ManagingFeePayment.post("/api/fee/online-fee-payment", studentAuth, multerService.single('payment_photo'), async (req, res) => {
    const {student_id, school_id} = req.sessionData;
    const {amount,category_id} = req.body;
    try {
        const newOnlinePayment = await prisma.studentPaymentPending.create({
            data: {
                student_id: parseInt(student_id),
                school_id: parseInt(school_id),
                amount: parseInt(amount),
                category_id: parseInt(category_id),
                payment_photo: req.file.path,
                status: 'pending',
                created_at: new Date()
            }
        });

        if (newOnlinePayment) {
            res.status(200).json({
                message: 'your payment was done'
            })
        } else {
            res.status(400).json({
                message: 'please try again'
            })
        }

    } catch (error) {
        console.error("Unexpected error in online fee payment:", error);
        return res.status(500).json({message: "Unexpected error occurred"});
    }
});


ManagingFeePayment.get("/api/fee/pending-online-fee", adminAuth('fee'), async (req, res) => {
    try {
        const pendingPaymentDetails = await prisma.$queryRaw`
            SELECT s.admission_ID, s.first_name, s.last_name, Student_payment_pending.* 
            FROM Student_payment_pending 
            INNER JOIN students s ON s.student_id = Student_payment_pending.student_id 
            WHERE Student_payment_pending.school_id = ${req.sessionData.school_id} 
              AND Student_payment_pending.status = 'pending';
        `;
        res.status(200).json(pendingPaymentDetails);
    } catch (error) {
        console.error("Unexpected error in fetching online fee payment:", error);
        return res.status(500).json({message: "Unexpected error occurred"});
    }
});

ManagingFeePayment.put('/api/fee/update-online-fee/:id', adminAuth('fee'), async (req, res) => {
    const { remarks } = req.body;
    const payment_id = parseInt(req.params.id);
    
    try {
        await prisma.$transaction(async (tx) => {
            const pendingOnlinePaymentDetails = await tx.studentPaymentPending.findUnique({
                where: { pending_payment_id: payment_id }
            });
            
            if (!pendingOnlinePaymentDetails) {
                throw new Error("Online payment details not found");
            }

            await tx.studentPaymentPending.update({
                where: { pending_payment_id: payment_id },
                data: { status: 'approved' }
            });

            await tx.studentsPayments.create({
                data: {
                    amount: pendingOnlinePaymentDetails.amount,
                    student_id: pendingOnlinePaymentDetails.student_id,
                    category_id: pendingOnlinePaymentDetails.category_id,
                    school_id: req.sessionData.school_id,
                    collected_by: req.sessionData.id,
                    payment_mode: 'upi',
                    remarks: "Online UPI payments: " + (remarks ?? ''),
                    payment_date: pendingOnlinePaymentDetails.created_at,
                    created_at: pendingOnlinePaymentDetails.created_at
                }
            });

            const school_financials = await tx.schoolFinancials.findFirst({
                where: { school_id: req.sessionData.school_id }
            });

            if (school_financials) {
                await tx.schoolFinancials.update({
                    where: { school_financial_id: school_financials.school_financial_id },
                    data: { current_balance: { increment: pendingOnlinePaymentDetails.amount } }
                });
            }

            const studentFee = await tx.studentFees.findFirst({
                where: {
                    student_id: pendingOnlinePaymentDetails.student_id,
                    category_id: pendingOnlinePaymentDetails.category_id,
                    school_id: req.sessionData.school_id
                }
            });

            if (studentFee) {
                await tx.studentFees.update({
                    where: { fee_id: studentFee.fee_id },
                    data: {
                        total_fee_paid: { increment: pendingOnlinePaymentDetails.amount },
                        fee_remaining: { decrement: pendingOnlinePaymentDetails.amount }
                    }
                });
            } else {
                throw new Error("Student fee details not found");
            }
        });

        res.status(200).json({ message: "Payment approved and fee updated successfully" });
    } catch (error) {
        console.error("Error updating online fee payment:", error);
        if (error.message === "Online payment details not found") return res.status(404).json({ message: error.message });
        if (error.message === "Student fee details not found") return res.status(404).json({ message: error.message });
        return res.status(500).json({ message: "Unexpected error occurred" });
    }
});


ManagingFeePayment.put("/api/fee/reject-online-fee/:id", adminAuth('fee'), async (req, res) => {
    const payment_id = parseInt(req.params.id);
    try {
        const pendingOnlinePaymentDetails = await prisma.studentPaymentPending.findUnique({
            where: { pending_payment_id: payment_id }
        });
        
        if (!pendingOnlinePaymentDetails) {
            return res.status(404).json({message: "online payment details not found"});
        }

        await prisma.studentPaymentPending.update({
            where: { pending_payment_id: payment_id },
            data: { status: 'rejected' }
        });

        res.status(200).json({message: "Payment rejected"});

    } catch (error) {
        console.error("Unexpected updating in fetching  online fee payment:", error);
        return res.status(500).json({message: "Unexpected error occurred"});
    }
});

ManagingFeePayment.get("/api/fee/class", adminAuth('fee'), async (req, res) => {
    try {
        const school_id = parseInt(req.sessionData.school_id);
        let class_details = await prisma.$queryRaw`select classrooms.standard from classrooms where school_id=${school_id} group by standard`;
        class_details = class_details.map(item => item.standard);
        res.status(200).json(class_details);
    } catch (error) {
        console.error("Error at getting the class details:", error);
        return res.status(500).json({message: "internal server error"});
    }
});


ManagingFeePayment.get("/api/fee/student_data/:standard",adminAuth('fee'),async (req,res)=>{
    const standard = req.params.standard;
    const school_id = parseInt(req.sessionData.school_id);
    try{
        const student_data = await prisma.$queryRaw`
            select students.admission_ID,
                   students.student_id,
                   students.first_name,
                   students.last_name,
                   c.standard,
                   c.section
            from students
            left join classrooms c on c.classroom_id = students.assignedClassroom
            where c.standard = ${standard}
              and c.school_id = ${school_id}`;
        res.status(200).json(student_data);
    }catch (error) {
        console.error("Error at getting the student details:", error);
        return res.status(500).json({message: "internal server error"});
    }
});

ManagingFeePayment.get("/api/fee/recent-transactions",adminAuth('fee'),async (req,res)=>{
   try {
       let { page, limit} = req.query;
       const school_id = parseInt(req.sessionData['school_id']);

       page = parseInt(page) || 1;
       limit = parseInt(limit) || 10;
       const offset = (page - 1) * limit;

       const transactions = await prisma.$queryRaw`
           SELECT 
                sp.payment_id, 
                sp.amount, 
                sp.payment_date, 
                sp.payment_mode, 
                s.first_name, 
                s.last_name, 
                c.standard AS class, 
                a.admin_name AS collected_by, 
                fc.category_name 
            FROM students_payments sp
            LEFT JOIN students s ON sp.student_id = s.student_id
            LEFT JOIN classrooms c ON c.classroom_id=s.assignedClassroom
            LEFT JOIN admins a ON sp.collected_by = a.admin_id
            LEFT JOIN fee_categories fc ON sp.category_id = fc.category_id
            where sp.school_id=${school_id}
            ORDER BY sp.payment_date DESC
            LIMIT ${limit} OFFSET ${offset};
       `;

       const total_count_res = await prisma.$queryRaw`SELECT COUNT(*) AS total_count FROM students_payments WHERE school_id=${school_id};`;
       const total_count = Number(total_count_res[0].total_count);

       res.json({
           success: true,
           page,
           limit,
           totalPages: Math.ceil(total_count / limit),
           totalRecords: total_count,
           transactions,
       });
   } catch (error) {
       console.error("Error at getting the recent transactions:", error);
       return res.status(500).json({message: "internal server error"});
   }
});

export default ManagingFeePayment;