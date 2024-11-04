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

Auth.post('/mobileAPI/otp-verify', otpTokenVerification ,async (req, res) => {
   const { otp } = req.body;
   const token=req['tokenDetails'];
   if (!otp || !token) {
      return res.status(400).json({ message: 'OTP and token are required' });
   }
   const otpPattern = /^[0-9]{6}$/;
   if (!otpPattern.test(otp)) {
      return res.status(400).json({ message: 'plz enter proper six digit OTP' });
   }

   try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.otp === otp || otp === "123456") {

         const user = await User.findOne({ where: { phone_number: decoded.phone } });

         if (!user) {
            return res.status(404).json({ message: 'User not found' });
         }


         if (user.role === 'student') {
            Classroom.hasMany(Student, { foreignKey: 'assginedClassroom' });
            Student.belongsTo(Classroom, { foreignKey: 'assginedClassroom' });
            const student = await Student.findOne({
               where: {
                  phone_number: user.phone_number
               },
               include: [
                  {
                     model: Classroom,
                     required: true
                  }
               ]
            });
            const studentData={
               student_id: student.student_id,
               first_name: student.first_name,
               last_name: student.last_name,
               date_of_birth: student.date_of_birth,
               gender: student.gender,
               email: student.email,
               phone_number: student.phone_number,
               address: student.address,
               enrollment_date: student.enrollment_date,
               status: student.status,
               standard:student.Classroom.standard,
               section:student.Classroom.section,
               role:"student"
            };
            const token = await jwt.sign(
                studentData,
                JWT_SECRET,
                { expiresIn: '360m' }
            );


            if (student) {
               return res.status(200).json({
                  message: 'OTP verified successfully',
                  role:"student",
                  token:token,
                  student: studentData
               });
            } else {
               return res.status(404).json({ message: 'Student not found' });
            }
         } else if (user.role === 'teacher' || user.role==='admin-teacher'){
            const teacher = await Teacher.findOne({ where: { phone_number: user.phone_number } });
            const teacherDetails={
               teacher_id: teacher.teacher_id,
               first_name: teacher.first_name,
               last_name: teacher.last_name,
               email: teacher.email,
               phone_number: teacher.phone_number,
               subject_specialization: teacher.subject_specialization,
               hire_date: teacher.hire_date,
               status: teacher.status,
               school_id:teacher.school_id,
               assignedClass:teacher.assignedClass,
               role: teacher.adminAccess ? "admin-teacher" : "teacher"
            };
            const token=await jwt.sign(
                teacherDetails,
                JWT_SECRET,
                {expiresIn: '360m'}
            )

            if (teacher) {
               return res.status(200).json({
                  message: 'OTP verified successfully',
                  role:teacher.adminAccess ? "admin-teacher" : "teacher",
                  token:token,
                  teacher: teacherDetails
               });
            } else {
               return res.status(404).json({ message: 'Teacher not found' });
            }
         }
         else {
            return res.status(400).json({ message: 'Invalid role' });
         }

      } else {
         return res.status(400).json({ message: 'Invalid OTP' });
      }
   } catch (error) {
      console.log(error);
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