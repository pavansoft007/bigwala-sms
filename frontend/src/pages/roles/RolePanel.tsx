import { useState, useEffect } from 'react';
import axiosInstance from "../../services/axiosInstance";
import Modal from "../../components/Modal";

interface Role {
    role_id: number;
    role_name: string;
    permissions: string[];
}

const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions] = useState([
        'teacher attendance',
        'student management',
        'teacher management',
        'fee',
        'attendance',
        'gallery',
        'message board',
        'exam timetable',
        'expenses',
    ]);
    const [form, setForm] = useState({
        role_name: '',
        selectedPermissions: [] as string[],
    });
    const [editForm, setEditForm] = useState<{
        role_id?: number;
        role_name: string;
        selectedPermissions: string[];
    }>({
        role_name: '',
        selectedPermissions: [],
    });

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch roles
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get('/api/roles');
            setRoles(res.data.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
            alert('Failed to fetch roles. Please try again.');
        }
    };

    // Handle permission checkbox toggle for create form
    const handleCreateCheckboxChange = (permission: string) => {
        setForm((prev) => {
            const isSelected = prev.selectedPermissions.includes(permission);
            return {
                ...prev,
                selectedPermissions: isSelected
                    ? prev.selectedPermissions.filter((p) => p !== permission)
                    : [...prev.selectedPermissions, permission],
            };
        });
    };

    // Handle permission checkbox toggle for edit form
    const handleEditCheckboxChange = (permission: string) => {
        setEditForm((prev) => {
            const isSelected = prev.selectedPermissions.includes(permission);
            return {
                ...prev,
                selectedPermissions: isSelected
                    ? prev.selectedPermissions.filter((p) => p !== permission)
                    : [...prev.selectedPermissions, permission],
            };
        });
    };

    // Handle create form submission
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/api/roles', {
                role_name: form.role_name,
                permissions: form.selectedPermissions,
            });
            fetchRoles();
            // Reset form and close modal
            setForm({
                role_name: '',
                selectedPermissions: [],
            });
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating role:', error);
            alert('Failed to create role. Please try again.');
        }
    };

    // Handle edit form submission
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editForm.role_id) {
            alert('No role selected for editing');
            return;
        }

        try {
            await axiosInstance.put(`/api/roles/${editForm.role_id}`, {
                role_name: editForm.role_name,
                permissions: editForm.selectedPermissions,
            });
            fetchRoles();
            // Reset edit form and close modal
            setEditForm({
                role_name: '',
                selectedPermissions: [],
            });
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error editing role:', error);
            alert('Failed to edit role. Please try again.');
        }
    };

    // Handle role deletion
    const handleDeleteRole = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;

        try {
            await axiosInstance.delete(`/api/roles/${id}`);
            fetchRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('Failed to delete role. Please try again.');
        }
    };

    // Open edit modal with role details
    const handleEditOpen = (role: Role) => {
        setEditForm({
            role_id: role.role_id,
            role_name: role.role_name,
            selectedPermissions: role.permissions || [],
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Roles</h1>

            {/* Create Role Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Create New Role
                </button>
            </div>

            {/* Create Role Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Role"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Role Name</label>
                        <input
                            type="text"
                            placeholder="Enter role name"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={form.role_name}
                            onChange={(e) => setForm({...form, role_name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Permissions</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {permissions.map((permission) => (
                                <label key={permission} className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-500"
                                        checked={form.selectedPermissions.includes(permission)}
                                        onChange={() => handleCreateCheckboxChange(permission)}
                                    />
                                    <span className="ml-2 text-gray-700">{permission}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Create Role
                    </button>
                </form>
            </Modal>

            {/* Edit Role Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Role"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Role Name</label>
                        <input
                            type="text"
                            placeholder="Enter role name"
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editForm.role_name}
                            onChange={(e) => setEditForm({...editForm, role_name: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Permissions</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {permissions.map((permission) => (
                                <label key={permission} className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-blue-500"
                                        checked={editForm.selectedPermissions.includes(permission)}
                                        onChange={() => handleEditCheckboxChange(permission)}
                                    />
                                    <span className="ml-2 text-gray-700">{permission}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Update Role
                    </button>
                </form>
            </Modal>

            {/* Roles Table */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Roles List</h2>
                <div className="overflow-x-auto">
                    <table className="table-auto w-full text-left">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-gray-600">Role Name</th>
                            <th className="px-4 py-2 text-gray-600">Permissions</th>
                            <th className="px-4 py-2 text-center text-gray-600">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {roles.map((role) => (
                            <tr key={role.role_id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">{role.role_name}</td>
                                <td className="px-4 py-2 border">
                                    {role.permissions ? role.permissions.join(', ') : 'No permissions'}
                                </td>
                                <td className="px-4 py-2 text-center border">
                                    <button
                                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                                        onClick={() => handleEditOpen(role)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => handleDeleteRole(role.role_id)}
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
        </div>
    );
};

export default RoleManagement;