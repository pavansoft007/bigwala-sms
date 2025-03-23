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
        const {amount, student_id, category_id, remarks,payment_mode} = req.body;


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
                payment_mode,
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
            message: "payment was done"
        })

    } catch (error) {
        await transaction.rollback();
        console.error("Unexpected updating in fetching  online fee payment:", error);
        return res.status(500).json({message: "Unexpected error occurred"});
    }
});

ManagingFeePayment.put("/api/fee/reject-online-fee/:id", adminAuth('fee'), async (req, res) => {
    const payment_id = req.params.id;
    try {
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

ManagingFeePayment.get("/api/fee/class", adminAuth('fee'), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        let [class_details] = await sequelize.query("select classrooms.standard from classrooms where school_id=:school_id group by standard",
            {
                replacements: {
                    school_id
                }
            }
        );
        class_details=class_details.map(item=>item.standard);
        res.status(200).json(class_details);
    } catch (error) {
        console.error("Error at getting the class details:", error);
        return res.status(500).json({message: "internal server error"});
    }
});


ManagingFeePayment.get("/api/fee/student_data/:standard",adminAuth('fee'),async (req,res)=>{
    const standard=req.params.standard;
    const school_id=req.sessionData.school_id;
    try{
        const [student_data]=await sequelize.query(`select students.admission_ID,
                                                           student_id,
                                                           first_name,
                                                           last_name,
                                                           c.standard,
                                                           c.section
                                                    from students
                                                             left join bigwaladev.classrooms c on c.classroom_id = students.assignedClassroom
                                                    where c.standard = :standard
                                                      and c.school_id = :school_id`,
            {
                replacements:{
                    standard,
                    school_id
                }
            });
        res.status(200).json(student_data);
    }catch (error) {
        console.error("Error at getting the student details:", error);
        return res.status(500).json({message: "internal server error"});
    }
});

ManagingFeePayment.get("/api/fee/recent-transactions",adminAuth('fee'),async (req,res)=>{
   try {
       let { page, limit} = req.query;
       const school_id=req.sessionData['school_id'];

       page = parseInt(page) || 1;
       limit = parseInt(limit) || 10;
       const offset = (page - 1) * limit;


       const [transactions] = await sequelize.query(
           `SELECT 
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
            where sp.school_id=:school_id
            ORDER BY sp.payment_date DESC
            LIMIT :limit OFFSET :offset;`,
           {
               replacements: { limit, offset ,school_id}
           }
       );


       const [[{ total_count }]] = await sequelize.query(
           `SELECT COUNT(*) AS total_count FROM students_payments;`
       );

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
})

export default ManagingFeePayment;