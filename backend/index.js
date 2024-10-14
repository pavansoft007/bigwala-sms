import express from "express";
import sequelize from './config/database.js';
import Auth from "./routes/Auth.js";
import dotenv from 'dotenv';
import StudentsAdding from "./routes/Students-Adding.js";
import TeachersAdding from "./routes/Teachers-Adding.js";
import AddingSchool from "./routes/Adding-School.js";
import GettingData from "./routes/GettingData.js";
dotenv.config();

const app = express();
app.use(express.json());

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


const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
