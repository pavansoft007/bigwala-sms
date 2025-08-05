import express from "express";
import { PrismaClient } from '@prisma/client';
import AdminAuth from "../middleware/AdminAuth.js";
import verifyToken from "../middleware/teacherAuth.js";
import completeLogin from "../middleware/completeLogin.js";
import adminAuth from "../middleware/AdminAuth.js";

const prisma = new PrismaClient();
const GettingData = express.Router();

// Original commented route - converted for reference:
// GettingData.get('/mobileAPI/students/:id', AdminAuth('student management'), async (req, res) => {
//     try {
//         const student = await prisma.Students.findFirst({
//             where: {
//                 student_id: parseInt(req.params.id)
//             },
//             include: {
//                 Classrooms: true
//             }
//         });
//         if (!student) {
//             return res.status(404).json({ message: 'Student not found' });
//         }
//         res.status(200).json(student);
//     } catch (error) {
//         console.error('Error fetching student:', error);
//         res.status(500).json({
//             message: 'An error occurred while fetching student',
//             error: error.message
//         });
//     }
// });

GettingData.get('/mobileAPI/teachers/:id', AdminAuth('student management'), async (req, res) => {
    try {
        const teacher = await prisma.Teachers.findFirst({
            where: {
                teacher_id: parseInt(req.params.id),
                school_id: req.sessionData.school_id
            }
        });
        if (!teacher) {
            return res.status(404).json({message: 'Teacher not found'});
        }
        res.status(200).json(teacher);
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({
            message: 'An error occurred while fetching teacher',
            error: error.message
        });
    }
});

GettingData.get('/mobileAPI/getStudent', verifyToken, async (req, res) => {
    try {
        const assignedClass = req['sessionData']['assignedClass'];
        const completeDetails = await prisma.Students.findMany({
            where: {
                assignedClassroom: assignedClass
            }
        });
        res.status(200).json(completeDetails);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            message: 'An error occurred while fetching students',
            error: error.message
        });
    }
});

GettingData.get('/api/dashboard', adminAuth('all'), async (req, res) => {
    try {
        const adminDetails = await prisma.Admin.findFirst({
            where: {
                admin_id: req['sessionData']['id']
            },
            include: {
                School: true,
                Roles: true
            }
        });

        if (!adminDetails) {
            return res.status(404).json({message: 'Admin not found'});
        }

        const response = {
            admin_name: adminDetails.admin_name.toUpperCase(),
            school_name: adminDetails.School.name.toUpperCase(),
            role_name: adminDetails.Roles.role_name.toUpperCase(),
            permissions: adminDetails.Roles.permissions || []
        };

        res.status(200).json(response);
    } catch (e) {
        console.error('error in getting the dashboard data:' + e);
        res.status(500).json({message: "internal server error"});
    }
});

GettingData.get("/api/main-dashboard", adminAuth('all'), async (req, res) => {
    try {
        const school_id = req['sessionData']['school_id'];

        // Get teacher count
        const teacherCount = await prisma.Teachers.count({
            where: {
                school_id: school_id
            }
        });

        // Get today's student attendance info
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalStudents = await prisma.Students.count({
            where: {
                school_id: school_id
            }
        });

        const studentsAttendedToday = await prisma.StudentAttendance.count({
            where: {
                school_id: school_id,
                attendDate: today
            }
        });

        const attendancePercentage = totalStudents > 0
            ? Math.round((studentsAttendedToday * 100.0) / totalStudents * 100) / 100
            : 0;

        // Get fee collection info
        const feeCollection = await prisma.StudentsPayments.aggregate({
            _sum: {
                amount: true
            },
            where: {
                school_id: school_id
            }
        });

        // Get enrollment data by class
        const enrollmentData = await prisma.Classrooms.findMany({
            where: {
                school_id: school_id
            },
            include: {
                Students: {
                    where: {
                        school_id: school_id
                    }
                }
            },
            orderBy: {
                standard: 'asc'
            }
        });

        const formattedEnrollmentData = enrollmentData.map(classroom => ({
            name: classroom.standard,
            count: classroom.Students.length
        }));

        // Get weekly attendance data (Monday to Friday)
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const weekDays = [];
        for (let i = 0; i < 5; i++) { // Monday to Friday
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }

        const totalTeachers = await prisma.Teachers.count({
            where: {
                school_id: school_id
            }
        });

        const attendanceData = await Promise.all(weekDays.map(async (day) => {
            const studentAttendance = await prisma.StudentAttendance.count({
                where: {
                    school_id: school_id,
                    attendDate: day
                }
            });

            const teacherAttendance = await prisma.TeacherAttendance.count({
                where: {
                    school_id: school_id,
                    attendDate: day
                }
            });

            const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            const dayName = dayNames[day.getDay() - 1]; // Adjust for Monday = 0

            return {
                name: dayName,
                students: totalStudents > 0 ? Math.round((studentAttendance * 100.0) / totalStudents) : 0,
                teachers: totalTeachers > 0 ? Math.round((teacherAttendance * 100.0) / totalTeachers) : 0
            };
        }));

        res.status(200).json({
            total_teachers: teacherCount,
            today_date: today.toISOString().split('T')[0],
            students_attended: studentsAttendedToday,
            total_students: totalStudents,
            attendance_percentage: attendancePercentage,
            total_collection: feeCollection._sum.amount || 0,
            enrollmentData: formattedEnrollmentData,
            attendanceData
        });

    } catch (e) {
        console.error('error in getting the dashboard data:' + e);
        res.status(500).json({message: "internal server error"});
    }
});

GettingData.post("/api/interested_school", async (req, res) => {
    const {school_name, location, admin_name, phone_number} = req.body;
    try {
        await prisma.InterestedSchools.create({
            data: {
                school_name,
                location,
                admin_name,
                phone_number,
                status: 'fresh',
                created_at: new Date(),
                updated_at: new Date()
            }
        });

        res.status(200).send({message: "you have been added , you will be contacted by our team"});

    } catch (e) {
        console.error('error in creating interested school:' + e);
        res.status(500).json({message: "internal server error"});
    }
});

GettingData.get('/api/userDetails', completeLogin, async (req, res) => {
    res.status(200).json(req['sessionData']);
});

export default GettingData;