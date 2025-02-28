import express from "express";
import Student from "../models/Student.js";
import User from "../models/User.js";
import generateAdmissionID from "../services/generateAdmissionID.js";
import School from "../models/School.js";
import {Op, Sequelize} from "sequelize";
import Classroom from "../models/Classroom.js";
import AdminAuth from "../middleware/AdminAuth.js";
import StudentFee from "../models/StudentFee.js";
import StudentPayment from "../models/StudentPayment.js";
import sequelize from "../config/database.js";
import multer from "multer";
import path from "path";
import Encrypt from "../services/Encrypt.js";

const ManagingStudent = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 10 * 1024 * 1024},
    fileFilter: (req, file, cb) => {
        const filetypes = /mp3|wav|jpeg|png|jpg/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(
            path.extname(file.originalname).toLowerCase()
        );

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: Only phone files are allowed (mp3, wav, ogg,mpeg).");
    },
});

ManagingStudent.post(
    "/api/student",
    AdminAuth("student management"),
    upload.fields([
        {
            name: "student_photo",
            maxCount: 1,
        },
        {
            name: "father_photo",
            maxCount: 1,
        },
    ]),
    async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const {
                first_name,
                last_name,
                date_of_birth,
                gender,
                email,
                phone_number,
                address,
                enrollment_date,
                standard,
                section,
                feeDetails,
                caste,
                mother_name,
                father_name,
                mother_phone_number,
                classroom_id: clientClassroomId,
            } = req.body;

            if (!req["sessionData"]?.school_id) {
                return res
                    .status(400)
                    .json({message: "School ID not found in session data."});
            }

            if (!first_name) {
                return res.status(400).json({message: "Missing required fields."});
            }

            const schoolDetails = await School.findOne({
                where: {school_id: req["sessionData"]["school_id"]},
            });

            const admission_ID = await generateAdmissionID(schoolDetails.school_code);

            const existingStudent = await Student.findOne({
                where: {
                    school_id: req["sessionData"]["school_id"],
                    [Op.or]: [{email}, {phone_number}],
                },
            });

            if (existingStudent) {
                return res.status(409).json({message: "This student already exists"});
            }

            let classroom_id = clientClassroomId || null;
            if (!classroom_id) {
                const classroomDetails = await Classroom.findOne({
                    where: {
                        standard,
                        section,
                        school_id: req["sessionData"]["school_id"],
                    },
                });

                if (!classroomDetails) {
                    return res.status(404).json({message: "Classroom not found."});
                }

                classroom_id = classroomDetails.classroom_id;
            }

            const newStudent = await Student.create(
                {
                    admission_ID,
                    first_name,
                    last_name,
                    date_of_birth,
                    gender,
                    email,
                    phone_number,
                    address,
                    enrollment_date,
                    assignedClassroom: classroom_id,
                    school_code: schoolDetails.school_code,
                    father_photo: req.files.father_photo[0].path,
                    student_photo: req.files.student_photo[0].path,
                    status: "Active",
                    caste,
                    sub_caste: "",
                    mother_name,
                    father_name,
                    mother_phone_number,
                    school_id: req["sessionData"]["school_id"],
                },
                {transaction}
            );

            const newUser = await User.create(
                {
                    phone_number,
                    role: "student",
                    original_id: newStudent.student_id,
                },
                {transaction}
            );

            const createdData = {};
            if (req["sessionData"]["role"] === "admin") {
                createdData["admin_id"] = req["sessionData"]["id"];
            } else if (
                req["sessionData"]["role"] === "teacher" ||
                req["sessionData"]["role"] === "admin-teacher"
            ) {
                createdData["teacher_id"] = req["sessionData"]["teacher_id"];
            } else {
                return res.status(403).json({message: "Unauthorized role."});
            }

            const studentFee = [];

            for (let i = 0; i < feeDetails.length; i++) {
                const newStudentFee = await StudentFee.create(
                    {
                        fee_amount: feeDetails[i]["total_fee"],
                        total_fee_paid: 0,
                        fee_remaining: feeDetails[i]["total_fee"],
                        school_id: req["sessionData"]["school_id"],
                        category_id: feeDetails[i]["category_id"],
                        student_id: newStudent.student_id,
                        classroom_id: classroom_id,
                        created_by: req["sessionData"]["role"],
                        ...createdData,
                    },
                    {transaction}
                );

                studentFee.push(newStudentFee);
            }

            await transaction.commit();

            res.status(201).json({
                message: "Student and user created successfully",
                student: newStudent,
                user: newUser,
                studentFee,
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Error creating student and user:", error);

            if (error.name === "SequelizeUniqueConstraintError") {
                return res
                    .status(409)
                    .json({message: "Student with similar data already exists"});
            }

            res.status(500).json({
                message: "An error occurred while creating student and user",
                error: error.message,
            });
        }
    }
);
ManagingStudent.get(
    "/mobileAPI/students/:id",
    AdminAuth("student management"),
    async (req, res) => {
        try {
            const student_id = req.params.id;
            const [student] = await sequelize.query(
                "SELECT * FROM `students` LEFT JOIN classrooms ON classrooms.classroom_id=students.assginedClassroom LEFT JOIN student_fees ON student_fees.student_id=students.student_id WHERE students.student_id=:student_id"
                , {
                    replacements: {
                        student_id
                    },
                    type: Sequelize.QueryTypes.SELECT
                }
            );
            student['student_photo'] = Encrypt(student['student_photo'] + ':' + req.ip);
            student['father_photo'] = Encrypt(student['father_photo'] + ':' + req.ip);
            if (!student) {
                return res.status(404).json({message: "Student not found"});
            }

            res.status(200).json(student);
        } catch (error) {
            console.error("Error fetching student:", error);
            res.status(500).json({
                message: "An error occurred while fetching student",
            });
        }
    }
);

ManagingStudent.post(
    "/api/search/student",
    AdminAuth("student management"),
    async (req, res) => {
        const limit = parseInt(req.body.limit) || 10;
        const page = parseInt(req.body.page) || 1;
        const offset = (page - 1) * limit;

        const where = [];
        const body = req.body;

        if (body.email) {
            where.push(`students.email = '${body.email}'`);
        }
        if (body.phone_number) {
            where.push(`students.phone_number = '${body.phone_number}'`);
        }
        if (body.student_id) {
            where.push(`students.student_id = '${body.student_id}'`);
        }
        if (body.admission_ID) {
            where.push(`students.admission_ID = '${body.admission_ID}'`);
        }
        if (body.status) {
            where.push(`students.status = '${body.status}'`);
        }
        if (body.assginedClassroom) {
            where.push(`students.assginedClassroom = '${body.assginedClassroom}'`);
        } else if (body.standard) {
            where.push(`classrooms.standard = '${body.standard}'`);
            if (body.section) {
                where.push(`classrooms.section = '${body.section}'`);
            }
        }
        if (body.name) {
            where.push(
                `(students.first_name LIKE '${body.name}%' OR students.last_name LIKE '${body.name}%')`
            );
        }

        where.push(`students.school_id = '${req.sessionData.school_id}'`);

        let baseQuery = `
            SELECT students.*, classrooms.standard, classrooms.section
            FROM students
                     LEFT JOIN classrooms ON classrooms.classroom_id = students.assginedClassroom`;

        let countQuery = `
            SELECT COUNT(*) as totalCount
            FROM students
                     LEFT JOIN classrooms ON classrooms.classroom_id = students.assginedClassroom`;

        if (where.length > 0) {
            const condition = `WHERE ${where.join(" AND ")}`;
            baseQuery += ` ${condition}`;
            countQuery += ` ${condition}`;
        }

        baseQuery += ` LIMIT ${limit} OFFSET ${offset}`;

        try {
            const [students] = await sequelize.query(baseQuery);
            const [countResult] = await sequelize.query(countQuery);

            const totalCount = countResult[0]?.totalCount || 0;

            const totalPages = Math.ceil(totalCount / limit);

            res.json({
                students,
                pagination: {
                    totalCount,
                    totalPages,
                    currentPage: page,
                    limit,
                },
            });
        } catch (error) {
            console.error("Error executing query:", error);
            res.status(500).json({error: "Failed to fetch students data."});
        }
    }
);

ManagingStudent.put(
    "/api/student/:id",
    AdminAuth("student management"),
    upload.fields([
        {
            name: "student_photo",
            maxCount: 1,
        },
        {
            name: "father_photo",
            maxCount: 1,
        },
    ]),
    async (req, res) => {
        try {
            const studentId = req.params.id;
            const {
                first_name,
                last_name,
                date_of_birth,
                gender,
                email,
                phone_number,
                address,
                enrollment_date,
                assginedClassroom,
                status,
            } = req.body;

            const student = await Student.findByPk(studentId);
            if (!student) {
                return res.status(404).json({message: "Student not found"});
            }

            const student_photo = req.files?.student_photo ? req.files.student_photo[0].filename : student.student_photo;
            const father_photo = req.files?.father_photo ? req.files.father_photo[0].filename : student.father_photo;

            await student.update({
                first_name,
                last_name,
                date_of_birth,
                gender,
                email,
                phone_number,
                address,
                enrollment_date,
                assginedClassroom,
                student_photo,
                father_photo,
                status: status || "Active",
            });

            res.status(200).json({
                message: "Student updated successfully",
                student,
            });
        } catch (error) {
            console.error("Error updating student:", error);
            res.status(500).json({
                message: "An error occurred while updating the student",
                error: error.message,
            });
        }
    }
);

ManagingStudent.delete(
    "/api/student/:id",
    AdminAuth("student management"),
    async (req, res) => {
        try {
            const studentId = req.params.id;

            const student = await Student.findByPk(studentId);
            if (!student) {
                return res.status(404).json({message: "Student not found"});
            }
            await StudentPayment.destroy({
                where: {
                    student_id: studentId,
                    school_id: req["sessionData"]["school_id"],
                },
            });

            await StudentFee.destroy({
                where: {
                    student_id: studentId,
                    school_id: req["sessionData"]["school_id"],
                },
            });

            await User.destroy({
                where: {original_id: studentId, role: "student"},
            });

            await student.destroy();

            res
                .status(200)
                .json({message: "Student and associated user deleted successfully"});
        } catch (error) {
            console.error("Error deleting student:", error);
            res.status(500).json({
                message: "An error occurred while deleting the student",
                error: error.message,
            });
        }
    }
);

export default ManagingStudent;
