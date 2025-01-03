import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance.ts";
import FetchClassroomData from "@/services/FetchClassroomData.ts";

interface Student {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    school_id: string;
}

interface Classroom {
    classroom_id: string;
    standard: string;
    section: string;
}

const Students = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const [searchInfo, setSearchInfo] = useState({
        email: "",
        phone_number: "",
        name: "",
        admission_ID: "",
        assginedClassroom: "",
        status: "",
        limit: 10,
        page: 1,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const classroomData = await FetchClassroomData();
                setClassrooms(classroomData);
                fetchStudents();
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        fetchStudents(1);
    };

    const fetchStudents = async (page: number = 1) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post("/api/search/student", {
                ...searchInfo,
                page,
            });
            setStudents(response.data.students || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
            setCurrentPage(response.data.pagination?.currentPage || 1);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: string) => {
        navigate(`/dashboard/students/${id}`);
    };

    const prevPage = () => {
        if (currentPage > 1) fetchStudents(currentPage - 1);
    };

    const nextPage = () => {
        if (currentPage < totalPages) fetchStudents(currentPage + 1);
    };

    return (
        <div className="p-5">
            <h2 className="text-3xl font-bold text-center mb-5">Manage Students</h2>

            {/* Search Form */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-600">Search Students</h2>
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto"
                        value={searchInfo.name}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto"
                        value={searchInfo.email}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="phone_number"
                        placeholder="Phone Number"
                        className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto"
                        value={searchInfo.phone_number}
                        onChange={handleSearchChange}
                    />
                    <input
                        type="text"
                        name="admission_ID"
                        placeholder="Admission ID"
                        className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto"
                        value={searchInfo.admission_ID}
                        onChange={handleSearchChange}
                    />
                    <select
                        name="limit"
                        className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto bg-white"
                        value={searchInfo.limit}
                        onChange={handleSearchChange}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                    <select
                        name="assginedClassroom"
                        className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto bg-white"
                        value={searchInfo.assginedClassroom}
                        onChange={handleSearchChange}
                    >
                        <option value="">Select Classroom</option>
                        {classrooms.map((item) => (
                            <option key={item.classroom_id} value={item.classroom_id}>
                                {item.standard}-{item.section}
                            </option>
                        ))}
                    </select>
                    <select
                        name="status"
                        className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto bg-white"
                        value={searchInfo.status}
                        onChange={handleSearchChange}
                    >
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="InActive">Inactive</option>
                    </select>
                    <button
                        onClick={handleSearch}
                        className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors w-full md:w-auto"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Students List */}
            <div className="mt-8">
                {loading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                    </div>
                ) : students.length > 0 ? (
                    <>
                        <div className="flex justify-center items-center my-4">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`p-2 mx-2 rounded-lg text-center ${
                                    currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                            >
                                Prev
                            </button>
                            <p className="text-gray-600">
                                Page {currentPage} of {totalPages}
                            </p>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className={`p-2 mx-2 rounded-lg text-center ${
                                    currentPage === totalPages ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                            >
                                Next
                            </button>
                        </div>
                        {students.map((student) => (
                            <div key={student.student_id} className="bg-gray-100 p-3 rounded-lg shadow-sm">
                                <p className="font-medium text-gray-700">
                                    {student.first_name} {student.last_name} (ID: {student.student_id})
                                </p>
                                <p className="text-sm text-gray-500">
                                    Email: {student.email} | Phone: {student.phone_number}
                                </p>
                                <button
                                    onClick={() => handleEdit(student.student_id)}
                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg transition"
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </>
                ) : (
                    <p className="text-gray-500">No students found. Adjust the filters or try again later.</p>
                )}
            </div>
        </div>
    );
};

export default Students;