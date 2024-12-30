import express from "express";
import AdminAuth from "../middleware/AdminAuth.js";
import generateTeacherID from "../services/generateTeacherID.js";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";

const ManagingTeacher=express.Router();

ManagingTeacher.post('/api/teacher', AdminAuth('teacher management') ,async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone_number,
            hire_date,
            status,
            subject_id,
            salary
        } = req.body;

        const adminAccess = req.body.adminAccess || false;


        const newTeacherID=await generateTeacherID(req['sessionData']['school_code']);

        const newTeacher = await Teacher.create({
            first_name,
            last_name,
            TeacherID:newTeacherID,
            email,
            phone_number,
            subject_id,
            salary,
            hire_date,
            school_id:req['sessionData']['school_id'],
            school_code:req['sessionData']['school_code'],
            adminAccess,
            status: status || 'Active'
        });
        const newUser = await User.create({
            phone_number,
            role: adminAccess ? 'admin-teacher' : 'teacher',
            original_id: newTeacher.teacher_id
        });


        res.status(201).json({
            message: 'Teacher and user created successfully',
            teacher: newTeacher,
            user: newUser
        });
    } catch (error) {
        if(error.original && error.original.errno === 1062){
            res.status(403).json({
                message:error.errors[0].message
            })
        }else{
            res.status(500).json({
                message: 'An error occurred while creating teacher and user',
                error: error.message
            });
        }
    }
});



ManagingTeacher.put('/api/teacher/:id', AdminAuth('teacher management'), async (req, res) => {
    try {
        const teacherId = req.params.id;
        const {
            first_name,
            last_name,
            email,
            phone_number,
            hire_date,
            status,
            subject_id,
            adminAccess
        } = req.body;

        const teacher = await Teacher.findByPk(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }


        await teacher.update({
            first_name,
            last_name,
            email,
            phone_number,
            subject_id,
            hire_date: hire_date,
            status: status || 'Active',
            adminAccess
        });

        await User.update(
            { role: adminAccess ? 'admin-teacher' : 'teacher' },
            { where: { original_id: teacherId } }
        );

        res.status(200).json({
            message: 'Teacher updated successfully',
            teacher
        });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({
            message: 'An error occurred while updating the teacher',
            error: error.message
        });
    }
});

ManagingTeacher.get('/api/teacher/:id',AdminAuth('teacher management'),async (req,res)=>{
    const teacherID=req.params.id;
    const school_id=req['sessionData']['school_id'];
    try{
        const [teacherDetails]=await sequelize.query(
            'SELECT *,s.subject_name,s.subject_name,c.standard,c.section FROM `teachers` INNER JOIN subjects s ON s.subject_id=teachers.subject_id INNER JOIN classrooms c ON c.classroom_id=teachers.assignedClass where c.school_id=? and  teacher_id=?'
        ,{
                replacements: [school_id,teacherID]
         }
        );


        if(teacherDetails){
            teacherDetails[0]['adminAccess']= teacherDetails[0]['adminAccess'] === '0';
            res.json(teacherDetails[0]);
        }else {
            res.status(404).json({message:"teacher not found"});
        }

    }catch (e) {
        console.error('Error deleting teacher:', e);
        res.status(500).json({
            message: 'An error occurred while getting the teacher',
        });
    }
});

ManagingTeacher.get('/api/teacher',AdminAuth('teacher management'),async (req,res)=>{
    const school_id=req['sessionData']['school_id'];
    try{
        let [teacherDetails]=await sequelize.query(
            `SELECT teachers.teacher_id,teachers.TeacherID,teachers.first_name,teachers.last_name,teachers.status,teachers.adminAccess,
                     teachers.email,teachers.phone_number,
                     s.subject_name,s.subject_name,c.standard,c.section FROM teachers left join subjects s ON s.subject_id=teachers.subject_id 
                     left join classrooms c ON c.classroom_id=teachers.assignedClass 
                     where teachers.school_id=${school_id}`);
        if(teacherDetails){
            teacherDetails=teacherDetails.map((item)=>{
                   item['adminAccess']=item['adminAccess'] === 0;

                   return item;
            })
            res.json(teacherDetails);
        }else {
            res.status(404).json({message:"teacher not found"});
        }

    }catch (e) {
        console.error('Error getting teachers:', e);
        res.status(500).json({
            message: 'An error occurred while getting the teacher',
        });
    }
});

ManagingTeacher.delete('/api/teacher/:id', AdminAuth('teacher management'), async (req, res) => {
    try {
        const teacherId = req.params.id;

        const teacher = await Teacher.findByPk(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        await User.destroy({ where: { original_id: teacherId ,
                role: adminAccess ? 'admin-teacher' : 'teacher'
        } });


        await teacher.destroy();

        res.status(200).json({ message: 'Teacher and associated user deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({
            message: 'An error occurred while deleting the teacher',
            error: error.message
        });
    }
});




export default ManagingTeacher;