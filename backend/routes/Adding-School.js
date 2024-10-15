import express from "express";
import School from "../models/School.js";
import Admin from "../models/Admin.js";
import sequelize  from "../config/database.js";

const AddingSchool = express.Router();

AddingSchool.post('/mobileAPI/schools', async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { school_name, address, admin_name, admin_email, admin_phone_number, admin_password } = req.body;


        const newSchool = await School.create({
            name:school_name,
            address
        }, { transaction });


        const newAdmin = await Admin.create({
            school_id: newSchool.school_id,
            admin_name,
            admin_email,
            admin_phone_number,
            admin_password
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'School and admin created successfully',
            school: newSchool,
            admin: newAdmin
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating school and admin:', error);
        res.status(500).json({
            message: 'An error occurred while creating school and admin',
            error: error.message
        });
    }
});

export default AddingSchool;
