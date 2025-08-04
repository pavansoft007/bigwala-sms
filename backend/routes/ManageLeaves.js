import express from "express";
import TeacherAuth from "../middleware/teacherAuth.js";
import AdminAuth from "../middleware/AdminAuth.js"; // Assuming you have admin auth middleware
import TeacherLeave from "../models/TeacherLeave.js";
import Teacher from "../models/Teacher.js";
import academicYear from "../models/AcademicYear.js";
import AcademicYear from "../models/AcademicYear.js"; // Assuming you have a Teacher model

const ManageLeaves = express.Router();

// TEACHER ENDPOINTS

// Get all leaves for the authenticated teacher
ManageLeaves.get("/api/teacher/leaves", TeacherAuth, async (req, res) => {
    try {
        const teacherId = req.sessionData.id; // Assuming TeacherAuth sets req.teacher
        const { status, page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = { teacher_id: teacherId };

        if (status) {
            whereClause.status = status;
        }

        const leaves = await TeacherLeave.findAndCountAll({
            where: whereClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: leaves.rows,
            pagination: {
                total: leaves.count,
                page: parseInt(page),
                pages: Math.ceil(leaves.count / limit)
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Create a new leave request
ManageLeaves.post("/api/teacher/leaves", TeacherAuth, async (req, res) => {
    try {
        const teacherId = req.sessionData.id;
        const {
            leave_type,
            start_date,
            end_date,
            reason,
            is_half_day = false,
            half_day_period,
            emergency_contact,
            attachment_url
        } = req.body;

        // Validation
        if (!leave_type || !start_date || !end_date || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const year=await AcademicYear.find({
            where: {
                is_current:true,
                school_id:req.sessionData.school_id,
            }
        });

        const leaveRequest = await TeacherLeave.create({
            teacher_id: teacherId,
            year:year.id,
            leave_type,
            start_date,
            end_date,
            reason,
            is_half_day,
            half_day_period,
            emergency_contact,
            attachment_url
        });

        res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            data: leaveRequest
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Update a leave request (only if pending)
ManageLeaves.put("/api/teacher/leaves/:id", TeacherAuth, async (req, res) => {
    try {
        const teacherId = req.sessionData.id;
        const leaveId = req.params.id;

        const leave = await TeacherLeave.findOne({
            where: { id: leaveId, teacher_id: teacherId }
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Cannot update leave request that is not pending"
            });
        }

        const updatedLeave = await leave.update(req.body);

        res.status(200).json({
            success: true,
            message: "Leave request updated successfully",
            data: updatedLeave
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Cancel a leave request
ManageLeaves.patch("/api/teacher/leaves/:id/cancel", TeacherAuth, async (req, res) => {
    try {
        const teacherId = req.sessionData.id;
        const leaveId = req.params.id;

        const leave = await TeacherLeave.findOne({
            where: { id: leaveId, teacher_id: teacherId }
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Leave request is already cancelled"
            });
        }

        const updatedLeave = await leave.update({ status: 'cancelled' });

        res.status(200).json({
            success: true,
            message: "Leave request cancelled successfully",
            data: updatedLeave
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// ADMIN ENDPOINTS

// Get all leave requests for admin review
ManageLeaves.get("/api/admin/leaves", AdminAuth, async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 10, school_id } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status !== 'all') {
            whereClause.status = status;
        }

        const includeClause = [{
            model: Teacher,
            as: 'teacher',
            attributes: ['id', 'first_name', 'last_name', 'employee_id', 'department'],
            where: school_id ? { school_id } : {}
        }];

        const leaves = await TeacherLeave.findAndCountAll({
            where: whereClause,
            include: includeClause,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            success: true,
            data: leaves.rows,
            pagination: {
                total: leaves.count,
                page: parseInt(page),
                pages: Math.ceil(leaves.count / limit)
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Get specific leave request details
ManageLeaves.get("/api/admin/leaves/:id", AdminAuth, async (req, res) => {
    try {
        const leaveId = req.params.id;

        const leave = await TeacherLeave.findByPk(leaveId, {
            include: [{
                model: Teacher,
                as: 'teacher',
                attributes: ['id', 'first_name', 'last_name', 'employee_id', 'department', 'phone', 'email']
            }]
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        res.status(200).json({
            success: true,
            data: leave
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Approve a leave request
ManageLeaves.patch("/api/admin/leaves/:id/approve", AdminAuth, async (req, res) => {
    try {
        const leaveId = req.params.id;
        const adminId = req.admin.id; // Assuming AdminAuth sets req.admin
        const { substitute_teacher_id } = req.body;

        const leave = await TeacherLeave.findByPk(leaveId);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending leave requests can be approved"
            });
        }

        const updateData = {
            status: 'approved',
            approved_by: adminId,
            approved_at: new Date()
        };

        if (substitute_teacher_id) {
            updateData.substitute_teacher_id = substitute_teacher_id;
        }

        const updatedLeave = await leave.update(updateData);

        res.status(200).json({
            success: true,
            message: "Leave request approved successfully",
            data: updatedLeave
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Reject a leave request
ManageLeaves.patch("/api/admin/leaves/:id/reject", AdminAuth, async (req, res) => {
    try {
        const leaveId = req.params.id;
        const adminId = req.admin.id;
        const { rejection_reason } = req.body;

        if (!rejection_reason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const leave = await TeacherLeave.findByPk(leaveId);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found"
            });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Only pending leave requests can be rejected"
            });
        }

        const updatedLeave = await leave.update({
            status: 'rejected',
            approved_by: adminId,
            approved_at: new Date(),
            rejection_reason
        });

        res.status(200).json({
            success: true,
            message: "Leave request rejected successfully",
            data: updatedLeave
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Get leave statistics/dashboard data
ManageLeaves.get("/api/admin/leaves/stats", AdminAuth, async (req, res) => {
    try {
        const { school_id } = req.query;

        // Get counts by status
        const statusCounts = await TeacherLeave.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            include: school_id ? [{
                model: Teacher,
                as: 'teacher',
                attributes: [],
                where: { school_id }
            }] : [],
            group: ['status'],
            raw: true
        });

        // Get current month's leave requests
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthlyCount = await TeacherLeave.count({
            where: {
                created_at: {
                    [sequelize.Sequelize.Op.gte]: currentMonth,
                    [sequelize.Sequelize.Op.lt]: nextMonth
                }
            },
            include: school_id ? [{
                model: Teacher,
                as: 'teacher',
                attributes: [],
                where: { school_id }
            }] : []
        });

        res.status(200).json({
            success: true,
            data: {
                statusCounts: statusCounts.reduce((acc, item) => {
                    acc[item.status] = parseInt(item.count);
                    return acc;
                }, {}),
                monthlyCount
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

export default ManageLeaves;