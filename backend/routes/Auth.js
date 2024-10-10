import express from 'express';
import Student from "../models/Student.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const Auth=express.Router();

Auth.get('/', (req, res)=>{
   res.send({message:"hello there"});
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
       { phone,otp },
       JWT_SECRET,
       { expiresIn: '10m' }
   );
   res.status(200).json({message: 'OTP sent successfully', token: token});
});


Auth.post('/mobileAPI/otp-verify', async (req, res) => {
   const { otp, token } = req.body;

   if (!otp || !token) {
      return res.status(400).json({ message: 'OTP and token are required' });
   }

   try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.otp === otp) {
         const student = await Student.findOne({ where: { phone_number: decoded.phone } });

         if (student) {
            res.status(200).json({
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
            res.status(404).json({ message: 'Student not found' });
         }
      } else {
         res.status(400).json({ message: 'Invalid OTP' });
      }
   } catch (error) {
      res.status(400).json({ message: 'Invalid or expired token' });
   }
});

Auth.post('/mobileAPI/add-new-student', async (req, res) => {
   try {
      const {
         admission_ID,
         first_name,
         last_name,
         date_of_birth,
         gender,
         email,
         phone_number,
         address,
         enrollment_date
      } = req.body;


      const newStudent = await Student.create({
         admission_ID,
         first_name,
         last_name,
         date_of_birth,
         gender,
         email,
         phone_number,
         address,
         enrollment_date,
         status: 'Active'
      });

      const newUser = await User.create({
         phone_number: phone_number,
         role: 'student',
         original_id: newStudent.student_id
      });

      res.status(201).json({
         message: 'Student and user created successfully',
         student: newStudent,
         user: newUser
      });
   } catch (error) {
      console.error('Error creating student and user:', error);
      res.status(500).json({
         message: 'An error occurred while creating student and user',
         error: error.message
      });
   }
});

export default Auth;