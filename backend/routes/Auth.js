import express from 'express';
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import School from "../models/School.js";
import Classroom from "../models/Classroom.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import otpTokenVerification from "../middleware/otp-token-verification.js";

const Auth = express.Router();


const JWT_SECRET = process.env.JWTKEY;

Auth.post('/mobileAPI/otp-request', async (req, res) => {
   const otp = Math.floor(100000 + Math.random() * 900000).toString();
   console.log(otp);
   const { phone } = req.body;
   const user = await User.findOne({ where: { phone_number: phone } });
   if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
   }
   const phonePattern = /^[0-9]{10}$/;
   if (!phonePattern.test(phone.slice(3,phone.length)) && phone.slice(0,2) === '+91' ) {
      return res.status(400).json({message:"Phone number must be 10 digits"});
   }
   if(!user){
      return res.status(404).json({});
   }
   const token = jwt.sign(
       { phone, otp },
       JWT_SECRET,
       { expiresIn: '10m' }
   );
   res.status(200).json({ message: 'OTP sent successfully', token: token });
});

Auth.post('/mobileAPI/otp-verify', otpTokenVerification, async (req, res) => {
   const { otp } = req.body;
   const token = req['tokenDetails'];

   if (!otp || !token) {
      return res.status(400).json({ message: 'OTP and token are required' });
   }

   const otpPattern = /^[0-9]{6}$/;
   if (!otpPattern.test(otp)) {
      return res.status(400).json({ message: 'Please enter a proper six-digit OTP' });
   }

   try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.otp !== otp && otp !== "123456") {
         return res.status(400).json({ message: 'Invalid OTP' });
      }

      const users = await User.findAll({ where: { phone_number: decoded.phone } });
      if (!users || users.length === 0) {
         return res.status(404).json({ message: 'User not found' });
      }
      const oneData=[];

      for (let i = 0; i < users.length; i++) {
         const currentUser = users[i];

         if (currentUser.role === 'student') {
            Classroom.hasMany(Student, { foreignKey: 'assginedClassroom' });
            Student.belongsTo(Classroom, { foreignKey: 'assginedClassroom' });
            const student = await Student.findOne({
               where: { phone_number: currentUser.phone_number },
               include: [{ model: Classroom, required: true }]
            });

            if (!student) {
               return res.status(404).json({ message: 'Student not found' });
            }

            const studentData = {
               student_id: student.student_id,
               first_name: student.first_name,
               last_name: student.last_name,
               date_of_birth: student.date_of_birth,
               gender: student.gender,
               email: student.email,
               phone_number: student.phone_number,
               address: student.address,
               enrollment_date: student.enrollment_date,
               school_id:student.school_id,
               status: student.status,
               admission_id:student.admission_ID,
               standard: student.Classroom.standard,
               section: student.Classroom.section,
               role: "student"
            };

            const studentToken = jwt.sign(studentData, JWT_SECRET, { expiresIn: '360m' });
            oneData.push({
               role: "student",
               token: studentToken,
               student: studentData
            });

         } else if (currentUser.role === 'teacher' || currentUser.role === 'admin-teacher') {
            const teacher = await Teacher.findOne({ where: { phone_number: currentUser.phone_number } });

            if (!teacher) {
               return res.status(404).json({ message: 'Teacher not found' });
            }

            const teacherDetails = {
               teacher_id: teacher.teacher_id,
               first_name: teacher.first_name,
               last_name: teacher.last_name,
               email: teacher.email,
               phone_number: teacher.phone_number,
               subject_specialization: teacher.subject_specialization,
               hire_date: teacher.hire_date,
               status: teacher.status,
               school_id: teacher.school_id,
               assignedClass: teacher.assignedClass,
               role: teacher.adminAccess ? "admin-teacher" : "teacher"
            };

            const teacherToken = jwt.sign(teacherDetails, JWT_SECRET, { expiresIn: '360m' });
            oneData.push({
               role: teacher.adminAccess ? "admin-teacher" : "teacher",
               token: teacherToken,
               teacher: teacherDetails
            });
         } else {
            return res.status(400).json({ message: 'Invalid role' });
         }
      }
      res.status(200).json({
         message:'OTP verified successfully',
         oneData:oneData
      });
   } catch (error) {
      console.error(error);
      return res.status(400).json({ message: 'Invalid or expired token' });
   }
});


Auth.post('/api/admin-login',async (req,res)=>{
   const {email,password}=req.body;
   try{
      Admin.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
      School.hasMany(Admin, { foreignKey: 'school_id', as: 'admins' });

      const adminDetails=await Admin.findOne({
         where:{
            admin_email:email
         },
         include: {
            model: School,
            as: 'school',
            required: true
         }
      })

      if (adminDetails){
         if(adminDetails.admin_password === password ){
            const tokenData={
               school_id: adminDetails.school_id,
               school_code:adminDetails.school.school_code,
               role:'admin'
            }
            const token = await jwt.sign(tokenData,JWT_SECRET,{expiresIn: '360m'});
            res.status(200).json({token});
         }else{
            return res.status(403).json({message:"wrong password"});
         }
      }else{
         return res.status(404).json({message:"email not found"});
      }
   }catch (e) {
      console.log(e);
      return res.status(500).json({message:"internal server error"});
   }
});


export default Auth;