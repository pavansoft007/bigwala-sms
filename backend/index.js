import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from './config/database.js';
import User from './models/User.js'
import VerifyToken from './middleware/VerifyToken.js';
import Auth from "./routes/Auth.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(Auth);

sequelize.sync()
    .then(() => {
        console.log('Database synced successfully.');
    })
    .catch((error) => {
        console.error('Error syncing the database:', error);
    });

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword });

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        res.json({message: 'Login successful', token,});
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});


app.get('/dashboard', VerifyToken, (req, res) => {
    res.json({ message: 'Welcome to the dashboard', userId: req.userId });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
