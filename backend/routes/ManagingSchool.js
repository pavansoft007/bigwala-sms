import express from "express";
import School from "../models/School.js";
import Role from "../models/Role.js";
import Admin from "../models/Admin.js";
import sequelize from "../config/database.js";
import SchoolFinancials from "../models/SchoolFinancials.js";
import FeeCategory from "../models/FeeCategory.js";
import MasterAdminAuth from "../middleware/MasterAdminAuth.js";
import AcademicYear from "../models/AcademicYear.js";

const ManagingSchool = express.Router();

ManagingSchool.post("/super-admin/schools", MasterAdminAuth,async (req, res) => {
    try {
        const t = await sequelize.transaction();
        const {
            school_name,
            address,
            phone_number,
            email,
            school_code,
            admin_name,
            admin_email,
            admin_phone_number,
            admin_password,
            year
        } = req.body;
        const school = await School.create({
            name: school_name,
            address: address,
            phone_number: phone_number,
            school_code: school_code,
            email: email,
        }, {
            transaction: t
        });

        const academicYear=await AcademicYear.create({
            year,
            school_id: school.school_id,
            is_current: true,
        },{
            transaction: t
        });

        const role = await Role.create({
            role_name: 'admin',
            school_id: school.school_id,
        }, {
            transaction: t
        });

        await Admin.create({
            admin_name: admin_name,
            admin_email: admin_email,
            admin_phone_number: admin_phone_number,
            admin_password: admin_password,
            role_id: role.role_id,
            school_id: school.school_id,
        }, {
            transaction: t
        });

        await FeeCategory.create({
            school_id: school.school_id,
            category_name:"tuition fee",
            description:"Default tuition Fee for the school",
        },{
            transaction: t
        });

        await SchoolFinancials.create({
            year_id: academicYear.id,
            year:new Date().getFullYear(),
            school_id: school.school_id,
            current_balance: 0
        }, {
            transaction: t
        });

        await t.commit();

        res.status(200).json({
            "message": "success added the school",
        });

    } catch (e) {
        res.status(500).json({
            "error": "internal server error",
        });
        console.error("error in adding new school" + e);
    }
});

export default ManagingSchool;