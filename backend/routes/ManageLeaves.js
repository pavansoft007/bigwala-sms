import express from "express";
import completeLogin from "../middleware/completeLogin.js";
import AdminAuth from "../middleware/AdminAuth.js";
import prisma from '../lib/prisma.js';

const ManageLeaves = express.Router();

// ----------------- TEACHER ENDPOINTS -----------------

ManageLeaves.get("/api/teacher/leaves", completeLogin, async (req, res) => {
    try {
        const teacherId = req.sessionData.teacher_id;
        const { status, page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = { teacher_id: teacherId };
        if (status) whereClause.status = status;

        const [total, leaves] = await Promise.all([
            prisma.teacherLeave.count({ where: whereClause }),
            prisma.teacherLeave.findMany({
                where: whereClause,
                orderBy: { created_at: "desc" },
                take: parseInt(limit),
                skip: parseInt(offset),
            }),
        ]);

        res.status(200).json({
            success: true,
            data: leaves,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

ManageLeaves.post("/api/teacher/leaves", completeLogin, async (req, res) => {
    try {
        const teacherId = req.sessionData.teacher_id;
        const schoolId = req.sessionData.school_id;
        const {
            leave_type,
            start_date,
            end_date,
            reason,
            is_half_day = false,
            half_day_period,
            emergency_contact,
            attachment_url,
        } = req.body;

        if (!leave_type || !start_date || !end_date || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const year = await prisma.academicYear.findFirst({
            where: { is_current: true, school_id: schoolId },
        });

        if (!year) {
            return res.status(400).json({
                success: false,
                message: "Current academic year not found",
            });
        }

        const leaveRequest = await prisma.teacherLeave.create({
            data: {
                teacher_id: teacherId,
                school_id: schoolId,
                year_id: year.id,
                leave_type,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                reason,
                is_half_day,
                half_day_period: half_day_period || null,
                emergency_contact: emergency_contact || null,
                attachment_url: attachment_url || null,
                status: "pending",
            },
        });

        res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            data: leaveRequest,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

ManageLeaves.put("/api/teacher/leaves/:id", completeLogin, async (req, res) => {
    try {
        const teacherId = req.sessionData.teacher_id;
        const leaveId = parseInt(req.params.id);

        const leave = await prisma.teacherLeave.findFirst({
            where: { id: leaveId, teacher_id: teacherId },
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        if (leave.status !== "pending") {
            return res.status(400).json({ success: false, message: "Cannot update non-pending leave" });
        }

        const { leave_type, start_date, end_date, reason, is_half_day, half_day_period, emergency_contact } = req.body;

        const updatedLeave = await prisma.teacherLeave.update({
            where: { id: leaveId },
            data: {
                ...(leave_type && { leave_type }),
                ...(start_date && { start_date: new Date(start_date) }),
                ...(end_date && { end_date: new Date(end_date) }),
                ...(reason && { reason }),
                ...(is_half_day !== undefined && { is_half_day }),
                ...(half_day_period !== undefined && { half_day_period }),
                ...(emergency_contact !== undefined && { emergency_contact }),
            },
        });

        res.status(200).json({
            success: true,
            message: "Leave request updated successfully",
            data: updatedLeave,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

ManageLeaves.patch("/api/teacher/leaves/:id/cancel", completeLogin, async (req, res) => {
    try {
        const teacherId = req.sessionData.teacher_id;
        const leaveId = parseInt(req.params.id);

        const leave = await prisma.teacherLeave.findFirst({
            where: { id: leaveId, teacher_id: teacherId },
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        if (leave.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Leave is already cancelled" });
        }

        const updatedLeave = await prisma.teacherLeave.update({
            where: { id: leaveId },
            data: { status: "cancelled" },
        });

        res.status(200).json({
            success: true,
            message: "Leave cancelled successfully",
            data: updatedLeave,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// ----------------- ADMIN ENDPOINTS -----------------

ManageLeaves.get("/api/admin/leaves", AdminAuth("all"), async (req, res) => {
    try {
        const schoolId = req.sessionData.school_id;
        const { status = "pending", page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { school_id: schoolId };
        if (status !== "all") whereClause.status = status;

        const [total, leaves] = await Promise.all([
            prisma.teacherLeave.count({ where: whereClause }),
            prisma.teacherLeave.findMany({
                where: whereClause,
                orderBy: { created_at: "desc" },
                include: {
                    Teacher: {
                        select: {
                            teacher_id: true,
                            TeacherID: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                        },
                    },
                },
                take: parseInt(limit),
                skip: parseInt(offset),
            }),
        ]);

        res.status(200).json({
            success: true,
            data: leaves,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

ManageLeaves.get("/api/admin/leaves/stats", AdminAuth("all"), async (req, res) => {
    try {
        const schoolId = req.sessionData.school_id;

        const statusCountsRaw = await prisma.teacherLeave.groupBy({
            by: ["status"],
            _count: { _all: true },
            where: { school_id: schoolId },
        });

        const statusCounts = statusCountsRaw.reduce((acc, item) => {
            acc[item.status] = item._count._all;
            return acc;
        }, {});

        const startMonth = new Date();
        startMonth.setDate(1);
        startMonth.setHours(0, 0, 0, 0);
        const endMonth = new Date(startMonth);
        endMonth.setMonth(endMonth.getMonth() + 1);

        const monthlyCount = await prisma.teacherLeave.count({
            where: {
                school_id: schoolId,
                created_at: { gte: startMonth, lt: endMonth },
            },
        });

        res.status(200).json({
            success: true,
            data: { statusCounts, monthlyCount },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

ManageLeaves.get("/api/admin/leaves/:id", AdminAuth("all"), async (req, res) => {
    try {
        const leaveId = parseInt(req.params.id);

        const leave = await prisma.teacherLeave.findUnique({
            where: { id: leaveId },
            include: {
                Teacher: {
                    select: {
                        teacher_id: true,
                        TeacherID: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        phone_number: true,
                    },
                },
            },
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

ManageLeaves.patch("/api/admin/leaves/:id/approve", AdminAuth("all"), async (req, res) => {
    try {
        const leaveId = parseInt(req.params.id);
        const adminId = req.sessionData.id;

        const leave = await prisma.teacherLeave.findUnique({ where: { id: leaveId } });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        if (leave.status !== "pending") {
            return res.status(400).json({ success: false, message: "Only pending leaves can be approved" });
        }

        const updatedLeave = await prisma.teacherLeave.update({
            where: { id: leaveId },
            data: {
                status: "approved",
                approved_by: adminId,
                approved_at: new Date(),
            },
        });

        res.status(200).json({
            success: true,
            message: "Leave approved successfully",
            data: updatedLeave,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

ManageLeaves.patch("/api/admin/leaves/:id/reject", AdminAuth("all"), async (req, res) => {
    try {
        const leaveId = parseInt(req.params.id);
        const adminId = req.sessionData.id;
        const { rejection_reason } = req.body;

        if (!rejection_reason) {
            return res.status(400).json({ success: false, message: "Rejection reason required" });
        }

        const leave = await prisma.teacherLeave.findUnique({ where: { id: leaveId } });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        if (leave.status !== "pending") {
            return res.status(400).json({ success: false, message: "Only pending leaves can be rejected" });
        }

        const updatedLeave = await prisma.teacherLeave.update({
            where: { id: leaveId },
            data: {
                status: "rejected",
                approved_by: adminId,
                approved_at: new Date(),
                rejection_reason,
            },
        });

        res.status(200).json({
            success: true,
            message: "Leave rejected successfully",
            data: updatedLeave,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default ManageLeaves;
