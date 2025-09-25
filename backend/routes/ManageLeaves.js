import express from "express";
import TeacherAuth from "../middleware/teacherAuth.js";
import AdminAuth from "../middleware/AdminAuth.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ManageLeaves = express.Router();

// ----------------- TEACHER ENDPOINTS -----------------

// Get leaves for teacher (paginated)
ManageLeaves.get("/api/teacher/leaves", TeacherAuth, async (req, res) => {
    try {
        const teacherId = req.sessionData.id;
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
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Create a leave request
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
            attachment_url,
        } = req.body;

        if (!leave_type || !start_date || !end_date || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const year = await prisma.academicYear.findFirst({
            where: {
                is_current: true,
                school_id: req.sessionData.school_id,
            },
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
                year: year.id,
                leave_type,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                reason,
                is_half_day,
                half_day_period,
                emergency_contact,
                attachment_url,
                status: "pending",
            },
        });

        res.status(201).json({
            success: true,
            message: "Leave request submitted successfully",
            data: leaveRequest,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Update a pending leave request
ManageLeaves.put("/api/teacher/leaves/:id", TeacherAuth, async (req, res) => {
    try {
        const teacherId = req.sessionData.id;
        const leaveId = parseInt(req.params.id);

        const leave = await prisma.teacherLeave.findFirst({
            where: { id: leaveId, teacher_id: teacherId },
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        if (leave.status !== "pending") {
            return res
                .status(400)
                .json({ success: false, message: "Cannot update non-pending leave" });
        }

        const updatedLeave = await prisma.teacherLeave.update({
            where: { id: leaveId },
            data: req.body,
        });

        res.status(200).json({
            success: true,
            message: "Leave request updated successfully",
            data: updatedLeave,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Cancel a leave request
ManageLeaves.patch(
    "/api/teacher/leaves/:id/cancel",
    TeacherAuth,
    async (req, res) => {
        try {
            const teacherId = req.sessionData.id;
            const leaveId = parseInt(req.params.id);

            const leave = await prisma.teacherLeave.findFirst({
                where: { id: leaveId, teacher_id: teacherId },
            });

            if (!leave) {
                return res.status(404).json({ success: false, message: "Leave not found" });
            }

            if (leave.status === "cancelled") {
                return res
                    .status(400)
                    .json({ success: false, message: "Leave is already cancelled" });
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
            console.log(err);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
);

// ----------------- ADMIN ENDPOINTS -----------------

// Get all leaves (paginated)
ManageLeaves.get("/api/admin/leaves", AdminAuth, async (req, res) => {
    try {
        const { status = "pending", page = 1, limit = 10, school_id } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (status !== "all") whereClause.status = status;

        if (school_id) whereClause.teacher = { school_id: parseInt(school_id) };

        const [total, leaves] = await Promise.all([
            prisma.teacherLeave.count({
                where: whereClause,
            }),
            prisma.teacherLeave.findMany({
                where: whereClause,
                orderBy: { created_at: "desc" },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            employee_id: true,
                            department: true,
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
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get leave details
ManageLeaves.get("/api/admin/leaves/:id", AdminAuth, async (req, res) => {
    try {
        const leaveId = parseInt(req.params.id);

        const leave = await prisma.teacherLeave.findUnique({
            where: { id: leaveId },
            include: {
                teacher: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        employee_id: true,
                        department: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });

        if (!leave) {
            return res.status(404).json({ success: false, message: "Leave not found" });
        }

        res.status(200).json({ success: true, data: leave });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Approve leave
ManageLeaves.patch("/api/admin/leaves/:id/approve", AdminAuth, async (req, res) => {
    try {
        const leaveId = parseInt(req.params.id);
        const adminId = req.admin.id;
        const { substitute_teacher_id } = req.body;

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
                substitute_teacher_id: substitute_teacher_id || null,
            },
        });

        res.status(200).json({
            success: true,
            message: "Leave approved successfully",
            data: updatedLeave,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Reject leave
ManageLeaves.patch("/api/admin/leaves/:id/reject", AdminAuth, async (req, res) => {
    try {
        const leaveId = parseInt(req.params.id);
        const adminId = req.admin.id;
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
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Leave stats
ManageLeaves.get("/api/admin/leaves/stats", AdminAuth, async (req, res) => {
    try {
        const { school_id } = req.query;

        // Count by status
        const statusCountsRaw = await prisma.teacherLeave.groupBy({
            by: ["status"],
            _count: { _all: true },
            where: school_id ? { teacher: { school_id: parseInt(school_id) } } : {},
        });

        const statusCounts = statusCountsRaw.reduce((acc, item) => {
            acc[item.status] = item._count._all;
            return acc;
        }, {});

        // Current month leaves
        const startMonth = new Date();
        startMonth.setDate(1);
        startMonth.setHours(0, 0, 0, 0);

        const endMonth = new Date(startMonth);
        endMonth.setMonth(endMonth.getMonth() + 1);

        const monthlyCount = await prisma.teacherLeave.count({
            where: {
                created_at: { gte: startMonth, lt: endMonth },
                ...(school_id ? { teacher: { school_id: parseInt(school_id) } } : {}),
            },
        });

        res.status(200).json({
            success: true,
            data: { statusCounts, monthlyCount },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

export default ManageLeaves;