import { useState, useEffect } from 'react';
import axiosInstance from "../../../services/axiosInstance";
import Modal from "@/components/Modal.tsx";
import User from "@/types/User.ts";
import {Link} from "react-router-dom";

interface Role {
    role_id: number;
    role_name: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [form, setForm] = useState({
        admin_name: '',
        admin_email: '',
        admin_password: '',
        admin_phone_number: '',
        role_id: '',
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentEditUser, setCurrentEditUser] = useState<User | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // New state for the create user modal

    // Fetch users and roles
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.get('/api/users');
            setUsers(res.data.data);
            const rolesRes = await axiosInstance.get('/api/roles');
            setRoles(rolesRes.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Handle form submission for creating a new user
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/users', form);
            fetchUsers();
            resetForm();
            setIsCreateModalOpen(false); // Close modal after submit
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setForm({
            admin_name: '',
            admin_email: '',
            admin_password: '',
            admin_phone_number: '',
            role_id: '',
        });
    };

    // Handle user deletion
    const handleDeleteUser = async (id: number) => {
        try {
            await axiosInstance.delete(`/api/users/${id}`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Open edit modal and set current user
    const openEditModal = (user: User) => {
        setCurrentEditUser(user);
        setIsEditModalOpen(true);
    };

    // Handle edit form change
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (currentEditUser) {
            setCurrentEditUser({ ...currentEditUser, [e.target.name]: e.target.value });
        }
    };

    // Submit edited user
    const handleEditSubmit = async () => {
        if (currentEditUser) {
            try {
                await axiosInstance.put(`/api/users/${currentEditUser.admin_id}`, currentEditUser);
                setIsEditModalOpen(false);
                fetchUsers();
            } catch (error) {
                console.error('Error updating user:', error);
            }
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between" >
                <div>
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Admin Users</h1>
                </div>
                <div>
                    <button
                        className="px-4 mx-2 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-6"
                    >
                        <Link to='/dashboard/roles'>
                            Manage roles
                        </Link>
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-6"
                    >
                        Create Admin User
                    </button>
                </div>
            </div>


            {/* Users Table */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Admin Users List</h2>
                <div className="overflow-x-auto">
                    <table className="table-auto w-full text-left">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-gray-600">Name</th>
                            <th className="px-4 py-2 text-gray-600">Email</th>
                            <th className="px-4 py-2 text-gray-600">Phone</th>
                            <th className="px-4 py-2 text-center text-gray-600">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.admin_id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">{user.admin_name}</td>
                                <td className="px-4 py-2 border">{user.admin_email}</td>
                                <td className="px-4 py-2 border">{user.admin_phone_number}</td>
                                <td className="px-4 py-2 text-center border">
                                    <button
                                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                                        onClick={() => openEditModal(user)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => handleDeleteUser(user.admin_id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Admin User"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                placeholder="Enter admin name"
                                className="w-full px-4 py-2 border rounded-md"
                                value={form.admin_name}
                                onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="w-full px-4 py-2 border rounded-md"
                                value={form.admin_email}
                                onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="w-full px-4 py-2 border rounded-md"
                                value={form.admin_password}
                                onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="Enter phone number"
                                className="w-full px-4 py-2 border rounded-md"
                                value={form.admin_phone_number}
                                onChange={(e) => setForm({ ...form, admin_phone_number: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Role</label>
                        <select
                            className="w-full px-4 py-2 border rounded-md"
                            value={form.role_id}
                            onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                            required
                        >
                            {roles.map((role) => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name === 'admin' ? 'admin(full access)' : role.role_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-center" >
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                            Create Admin User
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Admin User"
            >
                {currentEditUser && (
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="admin_name"
                            placeholder="Name"
                            className="w-full px-4 py-2 border rounded-md"
                            value={currentEditUser.admin_name}
                            onChange={handleEditChange}
                        />
                        <input
                            type="email"
                            name="admin_email"
                            placeholder="Email"
                            className="w-full px-4 py-2 border rounded-md"
                            value={currentEditUser.admin_email}
                            onChange={handleEditChange}
                        />
                        <input
                            type="tel"
                            name="admin_phone_number"
                            placeholder="Phone Number"
                            className="w-full px-4 py-2 border rounded-md"
                            value={currentEditUser.admin_phone_number}
                            onChange={handleEditChange}
                        />
                        <select
                            name="role_id"
                            className="w-full px-4 py-2 border rounded-md"
                            value={currentEditUser.role_id}
                            onChange={handleEditChange}
                        >
                            {roles.map((role) => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-center" >
                            <button
                                onClick={handleEditSubmit}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;
