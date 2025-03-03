import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import StudentPayment from "../models/StudentPayment.js";
import StudentFee from "../models/StudentFee.js";
import sequelize from "../config/database.js";
import SchoolFinancials from "../models/SchoolFinancials.js";
import adminAuth from "../middleware/AdminAuth.js";
import multerService from "../services/multerService.js";
import StudentPaymentPending from "../models/StudentPaymentPending.js";
import studentAuth from "../middleware/StudentAuth.js";

const ManagingFeePayment = express.Router();
ManagingFeePayment.post('/api/fee/fee-collect', AdminAuth('fee'), async (req, res) => {
    try {
        const {amount, student_id, category_id, remarks} = req.body;


        if (!req.sessionData || !req.sessionData.school_id) {
            return res.status(403).json({message: "Unauthorized access"});
        }
        if (!amount || amount <= 0 || !student_id || !category_id) {
            return res.status(400).json({message: "Invalid input data"});
        }

        const {school_id, id: collected_by} = req.sessionData;


        const transaction = await sequelize.transaction();

        try {

            const newPayment = await StudentPayment.create({
                amount,
                student_id,
                category_id,
                remarks,
                school_id,
                collected_by
            }, {transaction});


            const studentFeeDetails = await StudentFee.findOne({
                where: {student_id, category_id, school_id},
                transaction
            });

            if (!studentFeeDetails) {
                await transaction.rollback();
                return res.status(404).json({message: "Student fee details not found"});
            }


            await studentFeeDetails.increment(
                {total_fee_paid: amount, fee_remaining: -amount},
                {transaction}
            );

            const school_fincanicals = await SchoolFinancials.findOne({
                where: {
                    school_id
                }
            });

            await school_fincanicals.increment(
                {current_balance: amount}
                , {transaction});


            await transaction.commit();

            return res.status(200).json({message: "Fee collected successfully", newPayment});
        } catch (error) {
            await transaction.rollback();
            console.error("Database error in fee collection:", error);
            return res.status(500).json({message: "Internal server error"});
        }
    } catch (error) {
        console.error("Unexpected error in fee collection:", error);
        return res.status(500).json({message: "Unexpected error occurred"});
    }
});

ManagingFeePayment.post("/api/fee/online-fee-payment", studentAuth, multerService.single('payment_photo'), async (req, res) => {
    const {student_id, school_id} = req.sessionData;
    const {amount} = req.body;
    try {
        console.log(req.file);
        const newOnlinePayment = await StudentPaymentPending.create({
            student_id,
            school_id,
            amount,
            payment_photo: req.file.path,
            status: 'pending',
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
        const [pendingPaymentDetails] = await sequelize.query(
            "SELECT s.admission_ID,s.first_name,s.last_name,Student_payment_pending.* from Student_payment_pending inner JOIN students s on s.student_id=Student_payment_pending.student_id WHERE Student_payment_pending.school_id=:school_id && Student_payment_pending.status='pending'; ",
            {
                replacements: {
                    school_id: req.sessionData.school_id
                }
            });
        res.status(200).json(pendingPaymentDetails);
    } catch (error) {
        console.error("Unexpected error in fetching  online fee payment:", error);
        return res.status(500).json({message: "Unexpected error occurred"});
    }
});

ManagingFeePayment.put('/api/fee/update-online-fee/:id', adminAuth('fee'), async (req, res) => {
    const {remarks} = req.body;
    const payment_id = req.params.id;
    const transaction = await sequelize.transaction();
    try {
        const pendingOnlinePaymentDetails = await StudentPaymentPending.findByPk(payment_id);
        if (!pendingOnlinePaymentDetails) {
            res.status(404).json({message: "online payment details not found"});
        }

        await pendingOnlinePaymentDetails.update({
            status: 'approved'
        }, {transaction});

        await StudentPayment.create({
            amount: pendingOnlinePaymentDetails.amount,
            student_id: pendingOnlinePaymentDetails.student_id,
            category_id: pendingOnlinePaymentDetails.category_id,
            school_id: req.sessionData.school_id,
            collected_by: req.sessionData.id,
            payment_mode: 'upi',
            remarks: "online UPI payments : " + (remarks ?? ''),
            payment_date: pendingOnlinePaymentDetails.created_at,
            created_at: pendingOnlinePaymentDetails.created_at
        }, {transaction});


        const school_fincanicals = await SchoolFinancials.findOne({
            where: {
                school_id: req.sessionData['school_id']
            }
        });

        await school_fincanicals.increment(
            {current_balance: pendingOnlinePaymentDetails.amount}
            , {transaction});


        await transaction.commit();

        res.status(200).json({
            message:"payment was done"
        })

    } catch (error) {
        await transaction.rollback();
        console.error("Unexpected updating in fetching  online fee payment:", error);
        return res.status(500).json({message: "Unexpected error occurred"});
    }
});

ManagingFeePayment.put("/api/fee/reject-online-fee/:id",adminAuth('fee'),async (req,res)=>{
   const payment_id=req.params.id;
    try{
       const pendingOnlinePaymentDetails = await StudentPaymentPending.findByPk(payment_id);
       if (!pendingOnlinePaymentDetails) {
           res.status(404).json({message: "online payment details not found"});
       }

       await pendingOnlinePaymentDetails.update({
           status: 'rejected'
       });

       res.status(200);

   } catch (error) {
       console.error("Unexpected updating in fetching  online fee payment:", error);
       return res.status(500).json({message: "Unexpected error occurred"});
   }
});


export default ManagingFeePayment;