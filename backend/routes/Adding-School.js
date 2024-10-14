import express from "express";
import School from "../models/School.js";
const AddingSchool=express.Router();

AddingSchool.post('/mobileAPI/schools', async (req, res) => {
    try {
        console.log(req.body);
        const school = await School.create(req.body);
        res.status(201).json(school);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default AddingSchool;