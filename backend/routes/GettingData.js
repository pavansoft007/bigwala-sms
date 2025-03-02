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
            assginedClassroom: assignedClass
        }
    });
    res.status(200).json(completeDetails);
});

GettingData.get('/api/dashboard', adminAuth('all'), async (req, res) => {
    try {
        const adminDetails = await sequelize.query
        (`SELECT UPPER(admin_name)  as admin_name,
                 UPPER(s.name)      as school_name,
                 UPPER(r.role_name) as role_name
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


        res.status(200).json(adminDetails[0]);
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
           status:'fresh',
        });

        res.status(200).send({message:"you have been added , you will be contacted by our team"})

    } catch (e) {
        console.error('error in getting the dashboard data:' + e);
        res.status(500).json({message: "internal server error"});
    }
});

GettingData.get('/api/userDetails', completeLogin, async (req, res) => {
    res.status(200).json(req['sessionData']);
});

export default GettingData;