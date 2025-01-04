import { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance.ts";
import ClipLoader from 'react-spinners/ClipLoader';
import Classroom from "@/types/Classroom.ts";

const ClassroomManagement = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isLoading,setIsLoading]=useState<boolean>(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newClassroom, setNewClassroom] = useState({ standard: "", section: "" });
    const [currentClassroom, setCurrentClassroom] = useState<Classroom | null>(null);

    // Fetch classrooms
    useEffect(() => {
        setIsLoading(()=>true);
        axiosInstance
            .get("/mobileAPI/classroom")
            .then((response) => {
                    setIsLoading(false);
                    setClassrooms(response.data);
            })
            .catch(() => {
                setIsLoading(false);
                console.error("Error fetching classrooms");
            });
    }, []);

    // Add new classroom
    const handleAddClassroom = () => {
        axiosInstance
            .post("/mobileAPI/classroom", newClassroom)
            .then((response) => {
                setClassrooms((prev) => [...prev, response.data]);
                setIsAddModalOpen(false);
                setNewClassroom({ standard: "", section: "" });
            })
            .catch(() => {
                console.error("Error adding classroom");
            });
    };

    // Delete classroom
    const handleDeleteClassroom = () => {
        if (currentClassroom) {
            axiosInstance
                .delete(`/mobileAPI/classroom/${currentClassroom.classroom_id}`)
                .then(() => {
                    setClassrooms((prev) =>
                        prev.filter((classroom) => classroom.classroom_id !== currentClassroom.classroom_id)
                    );
                    setIsDeleteModalOpen(false);
                    setCurrentClassroom(null);
                })
                .catch(() => {
                    console.error("Error deleting classroom");
                });
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-8">Classroom Management</h1>
            <div className=" flex justify-center items-center  w-full" >
                <ClipLoader  loading={isLoading} size={50}  />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {classrooms.map((classroom) => (
                    <div
                        key={classroom.classroom_id}
                        className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            Standard: {classroom.standard}
                        </h2>
                        <p className="text-gray-600">Section: {classroom.section}</p>
                        <div className="mt-2">
                            <button
                                className="text-red-500 hover:underline"
                                onClick={() => {
                                    setCurrentClassroom(classroom);
                                    setIsDeleteModalOpen(true);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add New Classroom
                </button>
            </div>


            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add New Classroom</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Standard</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={newClassroom.standard}
                                onChange={(e) =>
                                    setNewClassroom({ ...newClassroom, standard: e.target.value })
                                }
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Section</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={newClassroom.section}
                                onChange={(e) =>
                                    setNewClassroom({ ...newClassroom, section: e.target.value })
                                }
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                onClick={handleAddClassroom}
                            >
                                Add Classroom
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {isDeleteModalOpen && currentClassroom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Delete Classroom</h2>
                        <p className="text-gray-800 mb-6">
                            Are you sure you want to delete the classroom with Standard{" "}
                            <span className="font-semibold">{currentClassroom.standard}</span> and Section{" "}
                            <span className="font-semibold">{currentClassroom.section}</span>?
                        </p>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                onClick={handleDeleteClassroom}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassroomManagement;
