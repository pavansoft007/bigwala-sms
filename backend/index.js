import express from "express";
import sequelize from './config/database.js';
import Auth from "./routes/Auth.js";
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from "helmet";
import StudentsAdding from "./routes/Students-Adding.js";
import TeachersAdding from "./routes/Teachers-Adding.js";
import AddingSchool from "./routes/Adding-School.js";
import GettingData from "./routes/GettingData.js";
import Managing_classrooms from "./routes/Managing_classrooms.js";
import TestingRoute from "./routes/TestingRoute.js";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});app.use(limiter);

sequelize.sync()
    .then(() => {
        console.log('Database synced successfully.');
    })
    .catch((error) => {
        console.error('Error syncing the database:', error);
    });

app.use(Auth);
app.use(StudentsAdding);
app.use(TeachersAdding);
app.use(AddingSchool);
app.use(GettingData);
app.use(Managing_classrooms);
app.use(TestingRoute);

dotenv.config({
    path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev'
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
