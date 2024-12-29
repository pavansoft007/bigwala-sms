import  { useEffect, useState } from "react";
import axios from "../../services/axiosInstance.ts";
import Modal from "../../components/Modal.tsx";

const FeeCategoryManager = () => {
    const [feeCategories, setFeeCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({ category_name: "" });


    const fetchCategories = async () => {
        try {
            const response = await axios.get("/api/fee_category");
            setFeeCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle Add/Edit Submission
    const handleSubmit = async () => {
        try {
            if (selectedCategory) {
                // Edit existing category
                await axios.put(`/api/fee_category/${selectedCategory.category_id}`, formData);
            } else {
                // Add new category
                await axios.post("/api/fee_category", formData);
            }
            fetchCategories();
            setIsModalOpen(false);
            setFormData({ category_name: "" });
            setSelectedCategory(null);
        } catch (error) {
            console.error("Error saving category:", error);
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/fee_category/${id}`);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Manage Fee Categories</h1>
                <button
                    className="px-4 py-2 text-white bg-blue-500 rounded"
                    onClick={() => {
                        setFormData({ category_name: "" });
                        setSelectedCategory(null);
                        setIsModalOpen(true);
                    }}
                >
                    Add Fee Category
                </button>
            </div>

            <table className="w-full mt-4 border-collapse">
                <thead>
                <tr>
                    <th className="border">Category ID</th>
                    <th className="border">Category Name</th>
                    <th className="border">Actions</th>
                </tr>
                </thead>
                <tbody>
                {feeCategories.map((category) => (
                    <tr key={category.category_id}>
                        <td className="border">{category.category_id}</td>
                        <td className="border">{category.category_name}</td>
                        <td className="border">
                            <button
                                className="px-2 py-1 text-white bg-yellow-500 rounded"
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setFormData({ category_name: category.category_name });
                                    setIsModalOpen(true);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="ml-2 px-2 py-1 text-white bg-red-500 rounded"
                                onClick={() => handleDelete(category.category_id)}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Modal for Add/Edit */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedCategory ? "Edit Fee Category" : "Add Fee Category"}
            >
                <form onSubmit={(e) => e.preventDefault()}>
                    <label className="block mb-2 text-sm font-bold text-gray-700">
                        Category Name
                    </label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 mb-4 border rounded"
                        value={formData.category_name}
                        onChange={(e) => setFormData({ category_name: e.target.value })}
                    />
                    <button
                        className="px-4 py-2 text-white bg-green-500 rounded"
                        onClick={handleSubmit}
                    >
                        Save
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default FeeCategoryManager
