import express from 'express';
import Role from "../models/Role.js";
import AdminAuth from "../middleware/AdminAuth.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";

const ManageUserRights = express.Router();


ManageUserRights.post('/api/roles', AdminAuth('roles'), async (req, res) => {
    try {
        const { role_name, permissions } = req.body;
        const school_id = req['sessionData']['school_id'];

        if (!role_name || !permissions) {
            return res.status(400).json({ message: 'role_name and permissions are required.' });
        }

        const newRole = await Role.create({
            school_id,
            role_name,
            permissions,
        });

        return res.status(201).json({
            message: 'Role created successfully',
            data: newRole,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});


ManageUserRights.get('/api/roles', AdminAuth('roles'), async (req, res) => {
    const school_id = req['sessionData']['school_id'];
    try {
        const roles = await Role.findAll({ where: { school_id} });
        return res.status(200).json({ data: roles });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});


ManageUserRights.put('/api/roles/:id', AdminAuth('roles'), async (req, res) => {
    const { id } = req.params;
    const { role_name, permissions } = req.body;
    try {
        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        await role.update({ role_name, permissions });
        return res.status(200).json({ message: 'Role updated successfully', data: role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});


ManageUserRights.delete('/api/roles/:id', AdminAuth('roles'), async (req, res) => {
    const { id } = req.params;
    try {
        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ message: 'Role not found' });

        const isReferenced = await Admin.count({ where: { role_id: id } });
        if (isReferenced > 0) {
            return res.status(400).json({ message: 'Role cannot be deleted as it is referenced in other records' });
        }

        await role.destroy();
        return res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});



ManageUserRights.post('/api/users', AdminAuth('roles'), async (req, res) => {
    const { admin_name, admin_email, admin_password, role_id, admin_phone_number } = req.body;
    const school_id = req['sessionData']['school_id'];
    try {
        const newUser = await Admin.create({
            admin_name,
            admin_email,
            admin_password,
            admin_phone_number,
            school_id,
            role_id,
        });

        await User.create({
            phone_number: admin_phone_number,
            role: 'admin',
            original_id: newUser.admin_id,
        });

        return res.status(201).json({
            message: 'New Admin created successfully',
            data: newUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});


ManageUserRights.get('/api/users', AdminAuth('roles'), async (req, res) => {
    const school_id = req['sessionData']['school_id'];
    try {
        const users = await Admin.findAll({
            where: {
                school_id,
            }
        });
        return res.status(200).json({ one:req['sessionData']['admin_id'],data: users });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});


ManageUserRights.put('/api/users/:id', AdminAuth('roles'), async (req, res) => {
    const { id } = req.params;
    const { admin_name, admin_email, admin_password, role_id, admin_phone_number } = req.body;
    try {
        const user = await Admin.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({
            admin_name,
            admin_email,
            admin_password,
            role_id,
            admin_phone_number,
        });

        return res.status(200).json({ message: 'User updated successfully', data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});


ManageUserRights.delete('/api/users/:id', AdminAuth('roles'), async (req, res) => {
    const { id } = req.params;
    try {
        const user = await Admin.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Delete the user from both Admin and User models
        await User.destroy({ where: { original_id: user.admin_id, role: 'admin' } });
        await user.destroy();

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});

ManageUserRights.get('/api/get-all-module',AdminAuth('all'),async (req,res)=>{
    try{
        const [modulesData]=await sequelize.query(`select module_name from modules`);
        return res.json({
            modulesData
        });
    }catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred' });
    }
});

ManageUserRights.get('/api/get-all-roles',AdminAuth('all'),async (req,res)=>{
     try{
         const [permission]=await sequelize.query(`
             SELECT s.permissions,s.role_name FROM admins INNER JOIN roles s on s.role_id=admins.role_id WHERE admin_id=${req['sessionData']['id']}
         `);
         return res.json({
             permission:permission[0]['permissions'] || [] ,
             role:permission[0]['role_name']
         });
     }catch (error) {
         console.error(error);
         return res.status(500).json({ message: 'An error occurred' });
     }
});

export default ManageUserRights;
