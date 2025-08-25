import express from "express";
import {PrismaClient} from "@prisma/client";
import AdminAuth from "../middleware/AdminAuth.js";
import generateTeacherID from "../services/generateTeacherID.js";
import upload from "../services/multerService.js";
import Encrypt from "../services/Encrypt.js";

const prisma = new PrismaClient();
const ManagingTeacher = express.Router();


ManagingTeacher.post("/api/teacher", AdminAuth("teacher management"),
    upload.fields([
        {name: "teacher_photo", maxCount: 1},
        {name: "teacher_qualification_certificate", maxCount: 1},
    ]), async (req, res) => {
        try {
            const {
                first_name,
                last_name,
                email,
                phone_number,
                hire_date,
                status,
                salary,
                teachers_qualification,
            } = req.body;

            // Ensure numeric and boolean values are correctly typed
            const subject_id = req.body.subject_id ? parseInt(req.body.subject_id) : null;
            const assignedClass = req.body.assignedClass ? parseInt(req.body.assignedClass) : null;
            const role_id = req.body.role_id ? parseInt(req.body.role_id) : null;
            const adminAccess = req.body.adminAccess === 'true' || req.body.adminAccess === true;

            const newTeacherID = await generateTeacherID(req.sessionData.school_code);
            const teacher_photo = req.files?.teacher_photo?.[0]?.path;
            const teacher_qualification_certificate = req.files?.teacher_qualification_certificate?.[0]?.path;

            // Use a transaction to create teacher and user atomically
            const {newTeacher, newUser} = await prisma.$transaction(async (tx) => {
                const createdTeacher = await tx.teachers.create({
                    data: {
                        first_name,
                        last_name,
                        TeacherID: newTeacherID,
                        email,
                        phone_number,
                        subject_id,
                        salary: salary ? parseInt(salary) : 0,
                        hire_date: new Date(hire_date),
                        assignedClass,
                        school_id: req.sessionData.school_id,
                        school_code: req.sessionData.school_code,
                        adminAccess,
                        status: status || "Active",
                        teachers_qualification,
                        teacher_photo,
                        role_id,
                        teacher_qualification_certificate,
                    },
                });

                const createdUser = await tx.user.create({
                    data: {
                        phone_number,
                        role: adminAccess ? "admin_teacher" : "teacher",
                        original_id: createdTeacher.teacher_id.toString(),
                    },
                });

                return {newTeacher: createdTeacher, newUser: createdUser};
            });

            res.status(201).json({
                message: "Teacher and user created successfully",
                teacher: newTeacher,
                user: newUser,
            });
        } catch (error) {
            console.error("Error creating teacher:", error);
            if (error.code === 'P2002') { // Prisma unique constraint violation
                return res.status(409).json({message: "A teacher with this email, phone number, or TeacherID already exists."});
            }
            res.status(500).json({
                message: "An error occurred while creating teacher and user",
                error: error.message,
            });
        }
    }
);


ManagingTeacher.put("/api/teacher/:id", AdminAuth("teacher management"),
    upload.fields([
        {name: "teacher_photo", maxCount: 1},
        {name: "teacher_qualification_certificate", maxCount: 1},
    ]),
    async (req, res) => {
        try {
            const teacherId = parseInt(req.params.id);
            const {first_name, last_name, email, phone_number, hire_date, status, teachers_qualification} = req.body;

            // Ensure numeric and boolean values are correctly typed
            const subject_id = req.body.subject_id ? parseInt(req.body.subject_id) : undefined;
            const salary = req.body.salary ? parseInt(req.body.salary) : undefined;
            const adminAccess = req.body.adminAccess === 'true' || req.body.adminAccess === true;

            const teacher = await prisma.teachers.findUnique({where: {teacher_id: teacherId}});
            if (!teacher) {
                return res.status(404).json({message: "Teacher not found"});
            }

            const updatedData = await prisma.$transaction(async (tx) => {
                const updatedTeacher = await tx.teachers.update({
                    where: {teacher_id: teacherId},
                    data: {
                        first_name,
                        last_name,
                        email,
                        phone_number,
                        salary,
                        subject_id,
                        hire_date: hire_date ? new Date(hire_date) : undefined,
                        status: status || "Active",
                        adminAccess,
                        teachers_qualification,
                        teacher_photo: req.files?.teacher_photo?.[0]?.path || teacher.teacher_photo,
                        teacher_qualification_certificate: req.files?.teacher_qualification_certificate?.[0]?.path || teacher.teacher_qualification_certificate,
                    },
                });

                await tx.user.updateMany({
                    where: {original_id: teacherId.toString()},
                    data: {
                        role: adminAccess ? "admin_teacher" : "teacher",
                        phone_number: updatedTeacher.phone_number,
                    },
                });
                return updatedTeacher;
            });

            // Encrypt file paths for response
            if (updatedData.teacher_photo) {
                updatedData.teacher_photo = Encrypt(updatedData.teacher_photo + (req['ip'] || '0.0.0.0'));
            }
            if (updatedData.teacher_qualification_certificate) {
                updatedData.teacher_qualification_certificate = Encrypt(updatedData.teacher_qualification_certificate + (req['ip'] || '0.0.0.0'));
            }

            res.status(200).json({message: "Teacher updated successfully", teacher: updatedData});
        } catch (error) {
            console.error("Error updating teacher:", error);
            res.status(500).json({message: "An error occurred while updating the teacher", error: error.message});
        }
    }
);


ManagingTeacher.post("/api/search/teacher", AdminAuth("teacher management"), async (req, res) => {
    try {
        const {limit = 10, page = 1, ...body} = req.body;
        const offset = (page - 1) * limit;

        const where = {school_id: req.sessionData.school_id};

        if (body.email) where.email = body.email;
        if (body.phone_number) where.phone_number = body.phone_number;
        if (body.TeacherID) where.TeacherID = body.TeacherID;
        if (body.status) where.status = body.status;
        if (body.assignedClass) where.assignedClass = parseInt(body.assignedClass);
        if (body.subject_id) where.subject_id = parseInt(body.subject_id);

        if (body.name) {
            where.OR = [
                {first_name: {startsWith: body.name}},
                {last_name: {startsWith: body.name}},
            ];
        }
        if (body.teachers_qualification) {
            where.teachers_qualification = {startsWith: body.teachers_qualification};
        }
        if (body.subject_name) {
            where.Subjects = {subject_name: {startsWith: body.subject_name}};
        }
        if (body.standard) {
            where.Classrooms = {
                standard: body.standard,
                ...(body.section && {section: body.section}),
            };
        }

        const [teachers, totalCount] = await prisma.$transaction([
            prisma.teachers.findMany({
                where,
                include: {Subjects: true, Classrooms: true},
                take: limit,
                skip: offset,
            }),
            prisma.teachers.count({where}),
        ]);

        // Encrypt file paths for response
        teachers.forEach(teacher => {
            if (teacher.teacher_photo) {
                teacher.teacher_photo = Encrypt(teacher.teacher_photo + (req['ip'] || '0.0.0.0'));
            }
            if (teacher.teacher_qualification_certificate) {
                teacher.teacher_qualification_certificate = Encrypt(teacher.teacher_qualification_certificate + (req['ip'] || '0.0.0.0'));
            }
        });

        res.json({
            teachers,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (e) {
        console.error("Error searching teacher:", e);
        res.status(500).json({message: "An error occurred while searching for the teacher"});
    }
});

ManagingTeacher.get("/api/teacher/:id", AdminAuth("teacher management"), async (req, res) => {
    try {
        const teacherID = parseInt(req.params.id);
        const school_id = req.sessionData.school_id;

        const teacherDetails = await prisma.teachers.findFirst({
            where: {teacher_id: teacherID, school_id: school_id},
            include: {Subjects: true, Classrooms: true},
        });

        if (teacherDetails) {
            if (teacherDetails.teacher_photo) {
                teacherDetails.teacher_photo = Encrypt(teacherDetails.teacher_photo + (req['ip'] || '0.0.0.0'));
            }
            if (teacherDetails.teacher_qualification_certificate) {
                teacherDetails.teacher_qualification_certificate = Encrypt(teacherDetails.teacher_qualification_certificate + (req['ip'] || '0.0.0.0'));
            }
            res.json(teacherDetails);
        } else {
            res.status(404).json({message: "Teacher not found"});
        }
    } catch (e) {
        console.error("Error getting teacher:", e);
        res.status(500).json({message: "An error occurred while getting the teacher"});
    }
});

ManagingTeacher.get("/api/teacher", AdminAuth("teacher management"), async (req, res) => {
    try {
        const school_id = req.sessionData.school_id;
        const teacherDetails = await prisma.teachers.findMany({
            where: {school_id: school_id},
            include: {Subjects: true, Classrooms: true},
        });

        res.json(teacherDetails);
    } catch (e) {
        console.error("Error getting teachers:", e);
        res.status(500).json({message: "An error occurred while getting the teachers"});
    }
});

ManagingTeacher.delete("/api/teacher/:id", AdminAuth("teacher management"), async (req, res) => {
    try {
        const teacherId = parseInt(req.params.id);

        await prisma.$transaction(async (tx) => {
            const teacher = await tx.teachers.findUnique({
                where: {teacher_id: teacherId},
            });

            if (!teacher) {
                throw new Error("Teacher not found");
            }

            // Determine role from the fetched teacher data
            const role = teacher.adminAccess ? "admin_teacher" : "teacher";

            await tx.user.deleteMany({
                where: {
                    original_id: teacherId.toString(),
                    role: role,
                },
            });

            await tx.teachers.delete({
                where: {teacher_id: teacherId},
            });
        });

        res.status(200).json({message: "Teacher and associated user deleted successfully"});
    } catch (error) {
        console.error("Error deleting teacher:", error);
        if (error.message === "Teacher not found") {
            return res.status(404).json({message: "Teacher not found"});
        }
        res.status(500).json({
            message: "An error occurred while deleting the teacher",
            error: error.message,
        });
    }
});

export default ManagingTeacher;