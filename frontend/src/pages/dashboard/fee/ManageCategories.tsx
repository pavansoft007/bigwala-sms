import  { useEffect, useState } from "react";
import Modal from "@/components/Modal.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import AxiosInstance from "@/services/axiosInstance.ts";

interface Categories{
    category_id: number,
    category_name: string,
    description:string
}


const FeeCategoryManager = () => {
    const [feeCategories, setFeeCategories] = useState<Categories[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<Categories | null>(null);
    const [formData, setFormData] = useState({ category_name: "" });


    const fetchCategories = async () => {
        try {
            const response = await AxiosInstance.get("/api/fee_category");
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
                await AxiosInstance.put(`/api/fee_category/${selectedCategory.category_id}`, formData);
            } else {
                await AxiosInstance.post("/api/fee_category", formData);
            }
            fetchCategories();
            setIsModalOpen(false);
            setFormData({ category_name: "" });
            setSelectedCategory(null);
        } catch (error) {
            console.error("Error saving category:", error);
        }
    };


    const handleDelete = async (id:number) => {
        try {
            await AxiosInstance.delete(`/api/fee_category/${id}`);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return (
        <div className="p-5 rounded border-2 shadow-xl ">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">Manage Fee Categories</h1>
                <button
                    className="px-4 py-1.5 text-white bg-green-500 hover:bg-green-600 rounded"
                    onClick={() => {
                        setFormData({ category_name: "" });
                        setSelectedCategory(null);
                        setIsModalOpen(true);
                    }}
                >
                    Add Fee Category
                </button>
            </div>

            <div className="my-4" >
                <Table className="text-sm bg-white rounded-lg shadow-md" >
                    <TableHeader className="bg-gray-200" >
                        <TableRow>
                            <TableHead >Category ID</TableHead>
                            <TableHead >Category Name</TableHead>
                            <TableHead className="text-center" >Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {feeCategories.map((category) => (
                            <TableRow key={category.category_id} className="hover:bg-gray-100 transition-colors" >
                                <TableCell >{category.category_id}</TableCell>
                                <TableCell >{category.category_name}</TableCell>
                                <TableCell className="text-center" >
                                    <button
                                        className="px-2 py-1 text-white bg-blue-500 hover:bg-blue-600 rounded"
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            
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
