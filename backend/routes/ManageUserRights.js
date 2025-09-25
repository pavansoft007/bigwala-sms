import express from "express";
import { PrismaClient } from "@prisma/client";
import AdminAuth from "../middleware/AdminAuth.js";

const ManageUserRights = express.Router();
const prisma = new PrismaClient();

ManageUserRights.post("/api/roles", AdminAuth("roles"), async (req, res) => {
    try {
        const { role_name, permissions } = req.body;
        const school_id = req["sessionData"]["school_id"];

        if (!role_name || !permissions) {
            return res.status(400).json({
                message: "role_name and permissions are required.",
            });
        }

        const newRole = await prisma.roles.create({
            data: {
                school_id,
                role_name,
                permissions: permissions,
            },
        });

        return res.status(201).json({
            message: "Role created successfully",
            data: newRole,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

ManageUserRights.get("/api/roles", AdminAuth("roles"), async (req, res) => {
    const school_id = req["sessionData"]["school_id"];
    try {
        const roles = await prisma.roles.findMany({
            where: {
                school_id,
                role_name: { not: "admin" },
            },
        });
        return res.status(200).json({ data: roles });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

ManageUserRights.put("/api/roles/:id", AdminAuth("roles"), async (req, res) => {
    const { id } = req.params;
    const { role_name, permissions } = req.body;
    try {
        const role = await prisma.roles.findUnique({
            where: { role_id: Number(id) },
        });
        if (!role) return res.status(404).json({ message: "Role not found" });

        const updatedRole = await prisma.roles.update({
            where: { role_id: Number(id) },
            data: { role_name, permissions },
        });

        return res.status(200).json({ message: "Role updated successfully", data: updatedRole });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

ManageUserRights.delete("/api/roles/:id", AdminAuth("roles"), async (req, res) => {
    const { id } = req.params;
    try {
        const isReferenced = await prisma.admin.count({
            where: { role_id: Number(id) },
        });
        if (isReferenced > 0) {
            return res.status(400).json({
                message: "Role cannot be deleted as it is referenced in other records",
            });
        }

        await prisma.roles.delete({
            where: { role_id: Number(id) },
        });

        return res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

ManageUserRights.post("/api/users", AdminAuth("roles"), async (req, res) => {
    const { admin_name, admin_email, admin_password, role_id, admin_phone_number } = req.body;
    const school_id = req["sessionData"]["school_id"];
    try {
        const newAdmin = await prisma.admin.create({
            data: {
                admin_name,
                admin_email,
                admin_password,
                role_id,
                admin_phone_number,
                school_id,
            },
        });

        await prisma.user.create({
            data: {
                phone_number: admin_phone_number,
                role: "admin",
                original_id: newAdmin.admin_id.toString(),
            },
        });

        return res.status(201).json({ message: "New Admin created successfully", data: newAdmin });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

ManageUserRights.get("/api/users", AdminAuth("roles"), async (req, res) => {
    const school_id = req["sessionData"]["school_id"];
    try {
        const users = await prisma.admin.findMany({ where: { school_id } });
        return res.status(200).json({ one: req["sessionData"]["admin_id"], data: users });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});


ManageUserRights.put("/api/users/:id", AdminAuth("roles"), async (req, res) => {
    const { id } = req.params;
    const { admin_name, admin_email, admin_password, role_id, admin_phone_number } = req.body;

    try {
        const user = await prisma.admin.findUnique({ where: { admin_id: Number(id) } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const updatedUser = await prisma.admin.update({
            where: { admin_id: Number(id) },
            data: { admin_name, admin_email, admin_password, role_id, admin_phone_number },
        });

        return res.status(200).json({ message: "User updated successfully", data: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});

ManageUserRights.delete("/api/users/:id", AdminAuth("roles"), async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.admin.findUnique({ where: { admin_id: Number(id) } });
        if (!user) return res.status(404).json({ message: "User not found" });

        await prisma.user.deleteMany({
            where: { original_id: user.admin_id.toString(), role: "admin" },
        });

        await prisma.admin.delete({ where: { admin_id: Number(id) } });

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
});


ManageUserRights.get("/api/get-all-module", AdminAuth("all"), async (req, res) => {
    try {
        const modulesData = await prisma.modules.findMany({ select: { module_name: true } });
        return res.json({ modulesData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred" });
    }
});

// Get current user's role and permissions
ManageUserRights.get("/api/get-all-roles", AdminAuth("all"), async (req, res) => {
    try {
        const adminId = req["sessionData"]["id"];
        const adminData = await prisma.admin.findUnique({
            where: { admin_id: Number(adminId) },
            include: { Roles: true },
        });

        return res.json({
            permission: adminData?.Roles?.permissions || [],
            role: adminData?.Roles?.role_name || "",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred" });
    }
});

export default ManageUserRights;