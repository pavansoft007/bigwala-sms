import express from "express";
import sequelize from "./config/database.js";
import Auth from "./routes/Auth.js";
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from "helmet";
import path from 'path';
import { fileURLToPath } from 'url';
import StudentsAdding from "./routes/Students-Adding.js";
import TeachersAdding from "./routes/Teachers-Adding.js";
import AddingSchool from "./routes/Adding-School.js";
import GettingData from "./routes/GettingData.js";
import Managing_classrooms from "./routes/Managing_classrooms.js";
import TestingRoute from "./routes/TestingRoute.js";
import ManageAttendance from "./routes/ManageAttendance.js";
import ManagingHomework from "./routes/ManagingHomework.js";
import ManagingMessageBoard from "./routes/ManagingMessageBoard.js";
import ManagingGallery from "./routes/ManagingGallery.js";
import ManagingVideo from "./routes/ManagingVideo.js";
import ManagingSubjects from "./routes/ManagingSubjects.js";
import ManagingTeacher from "./routes/ManagingTeacher.js";
import ManagingStudent from "./routes/ManagingStudent.js";
import ManagingExam from "./routes/ManagingExam.js";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

sequelize.sync()
    .then(() => {
        console.log('Database synced successfully.');
    })
    .catch((error) => {
        console.error('Error syncing the database:', error);
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

app.use('/uploads', express.static('uploads'));
app.use(Auth);
app.use(StudentsAdding);
app.use(TeachersAdding);
app.use(AddingSchool);
app.use(GettingData);
app.use(Managing_classrooms);
app.use(TestingRoute);
app.use(ManageAttendance);
app.use(ManagingHomework);
app.use(ManagingMessageBoard);
app.use(ManagingGallery);
app.use(ManagingVideo);
app.use(ManagingSubjects);
app.use(ManagingTeacher);
app.use(ManagingStudent);
app.use(ManagingExam);


dotenv.config();
app.get('/mobileAPI/*',(req, res)=>{
    res.status(404).json({});
});

app.get('/api/*',(req, res)=>{
    res.status(404).json({});
});

app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
