import express from "express";
import { PrismaClient } from "@prisma/client";
import generateAdmissionID from "../services/generateAdmissionID.js";
import AdminAuth from "../middleware/AdminAuth.js";
import upload from "../services/multerService.js";
import Encrypt from "../services/Encrypt.js";

// Initialize Prisma Client
const prisma = new PrismaClient();
const ManagingStudent = express.Router();

// Route to create a new student
ManagingStudent.post(
    "/api/student",
    AdminAuth("student management"),
    upload.fields([
        { name: "student_photo", maxCount: 1 },
        { name: "father_photo", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const {
                first_name,
                last_name,
                date_of_birth,
                email,
                phone_number,
                address,
                enrollment_date,
                standard,
                section,
                feeDetails, // Assumed to be an array of objects like [{ total_fee, category_id }]
                caste,
                mother_name,
                father_name,
                mother_phone_number,
                classroom_id: clientClassroomId,
            } = req.body;

            // FIX: Capitalize gender to match the Prisma Enum
            let { gender } = req.body;
            if (gender && typeof gender === 'string') {
                gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
            }

            const school_id = req.sessionData?.school_id;

            if (!school_id) {
                return res.status(400).json({ message: "School ID not found in session data." });
            }
            if (!first_name || !feeDetails) {
                return res.status(400).json({ message: "Missing required fields." });
            }

            // Check if student with the same email or phone number already exists in the school
            const existingStudent = await prisma.students.findFirst({
                where: {
                    school_id: school_id,
                    OR: [{ email }, { phone_number }],
                },
            });

            if (existingStudent) {
                return res.status(409).json({ message: "This student already exists." });
            }

            const schoolDetails = await prisma.school.findUnique({
                where: { school_id: school_id },
            });

            if (!schoolDetails) {
                return res.status(404).json({ message: "School not found." });
            }

            // Determine Classroom ID
            let classroom_id = clientClassroomId ? parseInt(clientClassroomId) : null;
            if (!classroom_id) {
                const classroomDetails = await prisma.classrooms.findFirst({
                    where: { standard, section, school_id: school_id },
                });
                if (!classroomDetails) {
                    return res.status(404).json({ message: "Classroom not found." });
                }
                classroom_id = classroomDetails.classroom_id;
            }

            // Determine who created the record
            const createdData = {};
            const role = req.sessionData?.role;
            if (role === "admin") {
                createdData.admin_id = req.sessionData.id;
            } else if (role === "teacher" || role === "admin-teacher") {
                createdData.teacher_id = req.sessionData.teacher_id;
            } else {
                return res.status(403).json({ message: "Unauthorized role." });
            }

            // Perform all database writes in a single transaction
            const result = await prisma.$transaction(async (tx) => {
                const admission_ID = await generateAdmissionID(schoolDetails.school_code);

                const newStudent = await tx.students.create({
                    data: {
                        admission_ID,
                        first_name,
                        last_name,
                        date_of_birth: new Date(date_of_birth),
                        gender, // Use the corrected gender variable
                        email,
                        phone_number,
                        address,
                        enrollment_date: new Date(enrollment_date),
                        assignedClassroom: classroom_id,
                        school_code: schoolDetails.school_code,
                        father_photo: req.files?.father_photo?.[0]?.path ?? "",
                        student_photo: req.files?.student_photo?.[0]?.path ?? "",
                        status: "Active",
                        caste,
                        sub_caste: "", // Assuming empty as per original code
                        mother_name,
                        father_name,
                        mother_phone_number,
                        school_id: school_id,
                    },
                });

                const newUser = await tx.user.create({
                    data: {
                        phone_number,
                        role: "student",
                        original_id: newStudent.student_id.toString(),
                    },
                });

                // Inside the /api/student route...

                const studentFeePromises = feeDetails.map((fee) =>
                    tx.studentFees.create({
                        data: {
                            fee_amount: parseInt(fee.total_fee),
                            total_fee_paid: 0,
                            fee_remaining: parseInt(fee.total_fee),
                            school_id: school_id,
                            category_id: parseInt(fee.category_id),
                            student_id: newStudent.student_id,
                            classroom_id: classroom_id,
                            created_by: role,
                            ...createdData,
                        },
                    })
                );

                const studentFee = await Promise.all(studentFeePromises);

                return { newStudent, newUser, studentFee };
            });

            res.status(201).json({
                message: "Student and user created successfully",
                student: result.newStudent,
                user: result.newUser,
                studentFee: result.studentFee,
            });

        } catch (error) {
            console.error("Error creating student and user:", error);
            if (error.code === 'P2002') { // Prisma's unique constraint violation code
                return res.status(409).json({ message: "Student with similar data already exists" });
            }
            res.status(500).json({
                message: "An error occurred while creating student and user",
                error: error.message,
            });
        }
    }
);

// ---

// Route to get a single student's complete details
ManagingStudent.get("/mobileAPI/students/:id", AdminAuth("all"), async (req, res) => {
    try {
        const student_id = parseInt(req.params.id);
        const school_id = req.sessionData.school_id;

        const student = await prisma.students.findUnique({
            where: { student_id },
            include: {
                Classrooms: true, // Includes standard and section
            },
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Encrypt photo paths
        if (student.student_photo) {
            student.student_photo = Encrypt(student.student_photo + ':' + req.realIp);
        }
        if (student.father_photo) {
            student.father_photo = Encrypt(student.father_photo + ':' + req.realIp);
        }

        // Fetch fee details
        const studentFeeDetails = await prisma.studentFees.findMany({
            where: { student_id },
            select: {
                category_id: true,
                total_fee_paid: true,
                fee_remaining: true,
                fee_amount: true,
                FeeCategories: {
                    select: { category_name: true },
                },
            },
        });

        // Fetch payment history and format date
        const paymentHistoryRaw = await prisma.studentsPayments.findMany({
            where: { student_id },
            include: { FeeCategories: { select: { category_name: true } } },
        });
        const studentPaymentHistory = paymentHistoryRaw.map(p => ({
            category_name: p.FeeCategories.category_name,
            amount: p.amount,
            payment_date: new Date(p.payment_date).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
            }),
        }));

        // Fetch exam and marks information
        const exams = await prisma.exams.findMany({
            where: {
                school_id,
                status: 'completed',
                ExamMarks: { some: { student_id } },
            },
            include: {
                ExamMarks: {
                    where: { student_id },
                    include: { Subjects: { select: { subject_name: true } } },
                },
            },
        });

        // Process exam data
        const studentExamInfo = exams.map(exam => {
            let total = 0;
            const subject_wise_marks = exam.ExamMarks.map(mark => {
                total += mark.marks;
                return {
                    subject_name: mark.Subjects.subject_name,
                    marks: mark.marks,
                };
            });
            return {
                exam_name: exam.exam_name,
                total,
                subject_wise_marks,
            };
        });

        const response = {
            ...student,
            studentFee: studentFeeDetails.map(f => ({
                category_id: f.category_id,
                category_name: f.FeeCategories.category_name,
                total_fee_paid: f.total_fee_paid,
                fee_remaining: f.fee_remaining,
                fee_amount: f.fee_amount,
            })),
            studentFeeHistory: studentPaymentHistory,
            examInfo: studentExamInfo,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ message: "An error occurred while fetching student" });
    }
});

// ---

// Route to search for students with pagination
ManagingStudent.post("/api/search/student", AdminAuth("student management"), async (req, res) => {
    try {
        const { limit = 10, page = 1, ...body } = req.body;
        const offset = (page - 1) * limit;

        const where = { school_id: req.sessionData.school_id };

        if (body.email) where.email = body.email;
        if (body.phone_number) where.phone_number = body.phone_number;
        if (body.student_id) where.student_id = parseInt(body.student_id);
        if (body.admission_ID) where.admission_ID = body.admission_ID;
        if (body.status) where.status = body.status;
        if (body.assignedClassroom) where.assignedClassroom = parseInt(body.assignedClassroom);

        if (body.name) {
            where.OR = [
                { first_name: { startsWith: body.name } },
                { last_name: { startsWith: body.name } },
            ];
        }

        if (!body.assignedClassroom && body.standard) {
            where.Classrooms = {
                standard: body.standard,
                ...(body.section && { section: body.section }),
            };
        }

        const [students, totalCount] = await prisma.$transaction([
            prisma.students.findMany({
                where,
                include: {
                    Classrooms: {
                        select: { standard: true, section: true },
                    },
                },
                take: limit,
                skip: offset,
            }),
            prisma.students.count({ where }),
        ]);

        res.json({
            students,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("Error executing query:", error);
        res.status(500).json({ error: "Failed to fetch students data." });
    }
});

// ---

// Route to update a student's details
ManagingStudent.put(
    "/api/student/:id",
    AdminAuth("student management"),
    upload.fields([
        { name: "student_photo", maxCount: 1 },
        { name: "father_photo", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const studentId = parseInt(req.params.id);
            const { email, phone_number, ...updateData } = req.body;

            const student = await prisma.students.findUnique({
                where: { student_id: studentId },
            });

            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }

            // Check if email or phone number is already in use by another student
            if (email || phone_number) {
                const orConditions = [];
                if (email) orConditions.push({ email });
                if (phone_number) orConditions.push({ phone_number });

                const duplicateStudent = await prisma.students.findFirst({
                    where: {
                        student_id: { not: studentId },
                        OR: orConditions,
                    },
                });

                if (duplicateStudent) {
                    return res.status(409).json({ message: "Email or phone number already in use" });
                }
            }

            // Prepare payload with updated data
            const payload = { ...updateData };
            if (email) payload.email = email;
            if (phone_number) payload.phone_number = phone_number;
            if (req.files?.student_photo?.[0]) {
                payload.student_photo = req.files.student_photo[0].path;
            }
            if (req.files?.father_photo?.[0]) {
                payload.father_photo = req.files.father_photo[0].path;
            }
            if (updateData.assignedClassroom) {
                payload.assignedClassroom = parseInt(updateData.assignedClassroom);
            }

            const updatedStudent = await prisma.students.update({
                where: { student_id: studentId },
                data: payload,
            });

            return res.status(200).json({
                message: "Student updated successfully",
                student: updatedStudent,
            });
        } catch (error) {
            console.error("Error updating student:", error);
            return res.status(500).json({
                message: "An error occurred while updating the student",
                error: error.message,
            });
        }
    }
);

// ---

// Route to delete a student and their associated data
ManagingStudent.delete("/api/student/:id", AdminAuth("student management"), async (req, res) => {
    try {
        const studentId = parseInt(req.params.id);
        const school_id = req.sessionData?.school_id;

        const student = await prisma.students.findUnique({
            where: { student_id: studentId },
        });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Use a transaction to ensure all related data is deleted atomically
        await prisma.$transaction(async (tx) => {
            // Delete payments, fees, user, and then the student
            await tx.studentsPayments.deleteMany({ where: { student_id: studentId, school_id } });
            await tx.studentFees.deleteMany({ where: { student_id: studentId, school_id } });
            await tx.user.deleteMany({ where: { original_id: studentId.toString(), role: "student" } });
            await tx.students.delete({ where: { student_id: studentId } });
        });

        res.status(200).json({ message: "Student and associated data deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({
            message: "An error occurred while deleting the student",
            error: error.message,
        });
    }
});

export default ManagingStudent;