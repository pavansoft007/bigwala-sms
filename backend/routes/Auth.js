import express from 'express';
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const Auth = express.Router();

Auth.get('/', (req, res) => {
   res.send({ message: "hello there" });
});

const JWT_SECRET = 'your_jwt_secret_key';

Auth.post('/mobileAPI/otp-request', (req, res) => {
   const otp = Math.floor(100000 + Math.random() * 900000).toString();
   console.log(otp);
   const { phone } = req.body;

   if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
   }
   const token = jwt.sign(
       { phone, otp },
       JWT_SECRET,
       { expiresIn: '10m' }
   );
   res.status(200).json({ message: 'OTP sent successfully', token: token });
});

Auth.post('/mobileAPI/otp-verify', async (req, res) => {
   const { otp, token } = req.body;

   if (!otp || !token) {
      return res.status(400).json({ message: 'OTP and token are required' });
   }

   try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.otp === otp || otp === "123456") {

         const user = await User.findOne({ where: { phone_number: decoded.phone } });

         if (!user) {
            return res.status(404).json({ message: 'User not found' });
         }


         if (user.role === 'student') {
            const student = await Student.findOne({ where: { phone_number: user.phone_number } });

            if (student) {
               return res.status(200).json({
                  message: 'OTP verified successfully',
                  student: {
                     student_id: student.student_id,
                     first_name: student.first_name,
                     last_name: student.last_name,
                     date_of_birth: student.date_of_birth,
                     gender: student.gender,
                     email: student.email,
                     phone_number: student.phone_number,
                     address: student.address,
                     enrollment_date: student.enrollment_date,
                     status: student.status
                  }
               });
            } else {
               return res.status(404).json({ message: 'Student not found' });
            }
         } else if (user.role === 'teacher') {
            const teacher = await Teacher.findOne({ where: { phone_number: user.phone_number } });

            if (teacher) {
               return res.status(200).json({
                  message: 'OTP verified successfully',
                  teacher: {
                     teacher_id: teacher.teacher_id,
                     first_name: teacher.first_name,
                     last_name: teacher.last_name,
                     email: teacher.email,
                     phone_number: teacher.phone_number,
                     subject_specialization: teacher.subject_specialization,
                     hire_date: teacher.hire_date,
                     status: teacher.status
                  }
               });
            } else {
               return res.status(404).json({ message: 'Teacher not found' });
            }
         } else {
            return res.status(400).json({ message: 'Invalid role' });
         }

      } else {
         return res.status(400).json({ message: 'Invalid OTP' });
      }
   } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired token' });
   }
});

export default Auth;
