import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import StudentPayment from "../models/StudentPayment.js";
import StudentFee from "../models/StudentFee.js";
import sequelize from "../config/database.js";
import SchoolFinancials from "../models/SchoolFinancials.js";

const ManagingFeePayment = express.Router();
ManagingFeePayment.post('/api/fee-collect', AdminAuth('fee'), async (req, res) => {
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

            const school_fincanicals=await SchoolFinancials.findOne({
                where:{
                    school_id
                }
            });

            await school_fincanicals.increment(
            {current_balance:amount}
            ,{transaction});


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


export default ManagingFeePayment;