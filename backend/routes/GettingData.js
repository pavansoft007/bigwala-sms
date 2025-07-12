import express from "express";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import AdminAuth from "../middleware/AdminAuth.js";
import verifyToken from "../middleware/teacherAuth.js";
import completeLogin from "../middleware/completeLogin.js";
import adminAuth from "../middleware/AdminAuth.js";
import sequelize from "../config/database.js";
import {Sequelize} from "sequelize";
import InterestedSchools from "../models/InterestedSchools.js";


const GettingData = express.Router();


// GettingData.get('/mobileAPI/students/:id', AdminAuth('student management'),async (req, res) => {
//     try {
//         const [student] = await sequelize.query('SELECT * FROM `students` INNER JOIN classrooms ON classrooms.classroom_id=students.student_id WHERE student_id='+req.params.id);
//         if (!student) {
//             return res.status(404).json({ message: 'Student not found' });
//         }
//         res.status(200).json(student[0]);
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
        const teacher = await Teacher.findOne({
            where: {
                teacher_id: req.params.id,
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
    const assignedClass = req['sessionData']['assignedClass'];
    const completeDetails = await Student.findAll({
        where: {
            assignedClassroom: assignedClass
        }
    });
    res.status(200).json(completeDetails);
});

GettingData.get('/api/dashboard', adminAuth('all'), async (req, res) => {
    try {
        const [adminDetails] = await sequelize.query
        (`SELECT UPPER(admin_name)  as admin_name,
                 UPPER(s.name)      as school_name,
                 UPPER(r.role_name) as role_name,
                 r.permissions
          from admins
                   inner JOIN schools s on admins.school_id = s.school_id
                   inner join roles r on admins.role_id = r.role_id
          WHERE admins.admin_id = :admin_id;`
            , {
                replacements: {
                    admin_id: req['sessionData']['id']
                },
                type: Sequelize.QueryTypes.SELECT
            }
        );

        if (!adminDetails['permissions']) {
            adminDetails['permissions'] = [];
        }

        res.status(200).json(adminDetails);
    } catch (e) {
        console.error('error in getting the dashboard data:' + e);
        res.status(500).json({message: "internal server error"});
    }
});

GettingData.get("/api/main-dashboard", adminAuth('all'), async (req, res) => {
    try {
        const school_id = req['sessionData']['school_id'];
        const [teacherInfo] = await sequelize.query("select count(*) as total_teachers from students where school_id=:school_id group by school_id", {
            replacements: {
                school_id
            },
            type: Sequelize.QueryTypes.SELECT
        });
        const [studentInfo] = await sequelize.query(`
            SELECT sa.attendDate                                    as today_date,
                   COUNT(*)                                         as students_attended,
                   ts.total_students,
                   ROUND((COUNT(*) * 100.0 / ts.total_students), 2) as attendance_percentage
            FROM studentAttendance sa
                     CROSS JOIN (SELECT COUNT(*) as total_students
                                 FROM students
                                 WHERE school_id = :school_id) ts
            WHERE sa.school_id = :school_id
              AND sa.attendDate = CURDATE()
            GROUP BY sa.attendDate, ts.total_students;
        `, {
            replacements: {
                school_id
            },
            type: Sequelize.QueryTypes.SELECT
        });

        const [feeInfo] = await sequelize.query(`SELECT COALESCE(SUM(amount), 0) AS total_collection
                                                 FROM students_payments
                                                 WHERE school_id = :school_id;`, {
            replacements: {
                school_id
            },
            type: Sequelize.QueryTypes.SELECT
        });

        const [enrollmentData] =
            await sequelize.query(`SELECT c.standard, COUNT(students.assignedClassroom) AS count
                                   FROM students
                                       RIGHT JOIN bigwaladev.classrooms c
                                   ON students.assignedClassroom = c.classroom_id
                                       AND students.school_id = :school_id
                                   WHERE c.school_id = :school_id
                                   GROUP BY c.standard
                                   ORDER BY CAST (c.standard AS UNSIGNED)`, {
                replacements: {
                    school_id
                }
            })


        const [attendanceData]=await sequelize.query(`WITH RECURSIVE
                                                        week_days
                                                            AS (SELECT DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) as date_val,
                                                                       0                                                    as day_offset
                                                                UNION ALL
                                                                SELECT DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL day_offset + 1 DAY),
                                                                       day_offset + 1
                                                                FROM week_days
                                                                WHERE day_offset < 6),
                                                        student_totals AS (SELECT COUNT(*) as total_students
                                                                           FROM students
                                                                           WHERE school_id = :school_id),
                                                        teacher_totals AS (SELECT COUNT(*) as total_teachers
                                                                           FROM teachers
                                                                           WHERE school_id = :school_id)
                                                    SELECT CASE WEEKDAY(wd.date_val)
                                                               WHEN 0 THEN 'Mon'
                                                               WHEN 1 THEN 'Tue'
                                                               WHEN 2 THEN 'Wed'
                                                               WHEN 3 THEN 'Thu'
                                                               WHEN 4 THEN 'Fri'
                                                               WHEN 5 THEN 'Sat'
                                                               WHEN 6 THEN 'Sun'
                                                               END    as name,
                                                           COALESCE(
                                                                   ROUND((sa.students_attended * 100.0 / st.total_students), 0),
                                                                   0) as students,
                                                           COALESCE(
                                                                   ROUND((ta.teachers_attended * 100.0 / tt.total_teachers), 0),
                                                                   0) as teachers
                                                    FROM week_days wd
                                                             CROSS JOIN student_totals st
                                                             CROSS JOIN teacher_totals tt
                                                             LEFT JOIN (SELECT attendDate, COUNT(*) as students_attended
                                                                        FROM studentAttendance
                                                                        WHERE school_id = :school_id
                                                                        GROUP BY attendDate) sa
                                                                       ON wd.date_val = sa.attendDate
                                                             LEFT JOIN (SELECT attendDate, COUNT(*) as teachers_attended
                                                                        FROM teacherAttendance
                                                                        WHERE school_id = :school_id
                                                                        GROUP BY attendDate) ta
                                                                       ON wd.date_val = ta.attendDate
                                                    WHERE WEEKDAY(wd.date_val) < 6 -- Only Monday to Friday
                                                    ORDER BY wd.date_val

        `,{
            replacements: {
                school_id
            }
        });

        res.status(200).json({
            ...teacherInfo,
            ...studentInfo,
            ...feeInfo,
            enrollmentData,
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

        await InterestedSchools.create({
            school_name,
            location,
            admin_name,
            phone_number,
            status: 'fresh',
        });

        res.status(200).send({message: "you have been added , you will be contacted by our team"})

    } catch (e) {
        console.error('error in getting the dashboard data:' + e);
        res.status(500).json({message: "internal server error"});
    }
});

GettingData.get('/api/userDetails', completeLogin, async (req, res) => {
    res.status(200).json(req['sessionData']);
});

export default GettingData;