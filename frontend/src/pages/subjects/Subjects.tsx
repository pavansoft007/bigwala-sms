import { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance.ts";

interface Subject {
    subject_id: number;
    subject_name: string;
    subject_code: string;
}

const AddSubjects = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [newSubject, setNewSubject] = useState({ subject_name: "", subject_code: "" });
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);

    useEffect(() => {
        axiosInstance
            .get("/api/subject")
            .then((res) => {
                setSubjects(res.data);
            })
            .catch(() => {
                console.error("Error in getting the subjects");
            });
    }, []);

    const handleAddSubject = () => {
        axiosInstance
            .post("/api/subject", newSubject)
            .then((res) => {
                setSubjects((prev) => [...prev, res.data]);
                setIsAddModalOpen(false);
                setNewSubject({ subject_name: "", subject_code: "" });
            })
            .catch(() => {
                console.error("Error in adding the subject");
            });
    };

    const handleEditSubject = () => {
        if (currentSubject) {
            axiosInstance
                .put(`/api/subject/${currentSubject.subject_id}`, currentSubject)
                .then(() => {
                    setSubjects((prev) =>
                        prev.map((subject) =>
                            subject.subject_id === currentSubject.subject_id
                                ? currentSubject
                                : subject
                        )
                    );
                    setIsEditModalOpen(false);
                    setCurrentSubject(null);
                })
                .catch(() => {
                    console.error("Error in editing the subject");
                });
        }
    };

    const handleDeleteSubject = () => {
        if (currentSubject) {
            axiosInstance
                .delete(`/api/subject/${currentSubject.subject_id}`)
                .then(() => {
                    setSubjects((prev) =>
                        prev.filter((subject) => subject.subject_id !== currentSubject.subject_id)
                    );
                    setIsDeleteModalOpen(false);
                    setCurrentSubject(null);
                })
                .catch(() => {
                    console.error("Error in deleting the subject");
                });
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-8">Subjects List</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {subjects.map((subject) => (
                    <div
                        key={subject.subject_id}
                        className="bg-white shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">
                            {subject.subject_name}
                        </h2>
                        <p className="text-gray-600">
                            <strong>Code:</strong> {subject.subject_code}
                        </p>
                        <div className="mt-2 flex space-x-2">
                            <button
                                className="text-blue-500 hover:underline"
                                onClick={() => {
                                    setCurrentSubject(subject);
                                    setIsEditModalOpen(true);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="text-red-500 hover:underline"
                                onClick={() => {
                                    setCurrentSubject(subject);
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
                    Add New Subject
                </button>
            </div>

            {/* Add Subject Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add New Subject</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Subject Name
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={newSubject.subject_name}
                                onChange={(e) =>
                                    setNewSubject({ ...newSubject, subject_name: e.target.value })
                                }
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Subject Code
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={newSubject.subject_code}
                                onChange={(e) =>
                                    setNewSubject({ ...newSubject, subject_code: e.target.value })
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
                                onClick={handleAddSubject}
                            >
                                Add Subject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Subject Modal */}
            {isEditModalOpen && currentSubject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Edit Subject</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Subject Name
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={currentSubject.subject_name}
                                onChange={(e) =>
                                    setCurrentSubject({
                                        ...currentSubject,
                                        subject_name: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Subject Code
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                value={currentSubject.subject_code}
                                onChange={(e) =>
                                    setCurrentSubject({
                                        ...currentSubject,
                                        subject_code: e.target.value
                                    })
                                }
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                onClick={handleEditSubject}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && currentSubject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Delete Subject</h2>
                        <p className="text-gray-800 mb-6">
                            Are you sure you want to delete the subject{" "}
                            <span className="font-semibold">{currentSubject.subject_name}</span>?
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
                                onClick={handleDeleteSubject}
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

export default AddSubjects;
