import React, { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableCaption,
    TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/services/axiosInstance.ts";


interface Classroom {
    classroom_id: string;
    standard: string;
    section: string;
}

interface TeacherDetails {
    teacher_id: number;
    TeacherID: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    status: string;
    adminAccess: boolean;
    subject_name: string;
    standard: string;
    section: string;
}

const Teacher = () => {
    const [teachers, setTeachers] = useState<TeacherDetails[]>([]);
    const [searchInfo, setSearchInfo] = useState({
        email: '',
        phone_number: '',
        name: '',
        TeacherID: '',
        subject_name: '',
        assignedClass: '',
        status: '',
        limit: 10,
    });
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate=useNavigate();

    useEffect(() => {
        getClassroomDetails();
        fetchTeachers();
    }, []);

    const getClassroomDetails = async () => {
        try {
            const res = await axiosInstance.get("/mobileAPI/classroom");
            setClassrooms(res.data);
        } catch (e) {
            console.error("Error fetching classrooms:", e);
        }
    };

    const handleSubmit=()=>{
        fetchTeachers();
    }

    const fetchTeachers = async (page = 1) => {
        try {
            const response = await axiosInstance.post('/api/search/teacher', {
                ...searchInfo,
                page
            });
            setTeachers(response.data.teachers || []);
            setTotalPages(response.data.pagination?.totalPages || 1);
            setCurrentPage(response.data.pagination?.currentPage || 1);
        } catch (error) {
            console.error("Error fetching teachers:", error);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSearchInfo((prev) => ({ ...prev, [name]: value }));
        
    };

    const handleEdit = (id: number) => {
        navigate(`/dashboard/teacher/${id}`);
    };

    

    const prevPage = () => {
        if (currentPage > 1) fetchTeachers(currentPage - 1);
    };

    const nextPage = () => {
        if (currentPage < totalPages) fetchTeachers(currentPage + 1);
    };

    const renderInput = (name: string, placeholder: string, type = "text") => (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto"
            value={searchInfo[name as keyof typeof searchInfo]}
            onChange={handleSearchChange}
        />
    );

    const renderSelect = (name: string, options:string[], defaultOption: string) => (
        <select
            name={name}
            className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto bg-white"
            value={searchInfo[name as keyof typeof searchInfo]}
            onChange={handleSearchChange}
        >
            <option value="">{defaultOption}</option>
            {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );

    const clearFunction=()=>{
        setSearchInfo({
            email: '',
            phone_number: '',
            name: '',
            TeacherID: '',
            subject_name: '',
            assignedClass: '',
            status: '',
            limit: 10,
        });
        
    }

    return (
        <div className="bg-gray-100 rounded-lg shadow-md p-6">
            <h1 className="text-4xl mb-4 text-center font-bold text-gray-700">Manage Teachers</h1>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-600">Search Teachers</h2>
                <div className="flex flex-wrap gap-4">
                    {renderInput("name", "Name")}
                    {renderInput("email", "Email")}
                    {renderInput("phone_number", "Phone Number")}
                    {renderInput("TeacherID", "Teacher ID")}
                    {renderInput("subject_name", "Subject")}
                    <select
                        name="assignedClass"
                        className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-auto bg-white"
                        value={searchInfo.assignedClass}
                        onChange={handleSearchChange}
                    >
                        <option value=""> select the classroom</option>
                        {
                            classrooms.map((item, index) => {
                                return <option key={index}
                                               value={item.classroom_id}>{item.standard} - {item.section}</option>
                            })
                        }
                    </select>
                    {renderSelect("status", ["Active", "Inactive"], "Select Status")}
                    {renderSelect("limit", ["5", "10", "20"], "Results per page")}
                    <button
                        onClick={handleSubmit}
                        className="p-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors w-full md:w-auto"
                    >
                        Search
                    </button>
                    <button
                        onClick={clearFunction}
                        className="p-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors w-full md:w-auto"
                    >
                        clear
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
            {/*    <div className="flex justify-center items-center my-4">*/}
            {/*        <button*/}
            {/*            onClick={prevPage}*/}
            {/*            disabled={currentPage === 1}*/}
            {/*            className={`p-2 mx-2 rounded-lg text-center ${*/}
            {/*                currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"*/}
            {/*            }`}*/}
            {/*        >*/}
            {/*            Prev*/}
            {/*        </button>*/}
            {/*        <p className="text-gray-600">*/}
            {/*            Page {currentPage} of {totalPages}*/}
            {/*        </p>*/}
            {/*        <button*/}
            {/*            onClick={nextPage}*/}
            {/*            disabled={currentPage === totalPages}*/}
            {/*            className={`p-2 mx-2 rounded-lg text-center ${*/}
            {/*                currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"*/}
            {/*            }`}*/}
            {/*        >*/}
            {/*            Next*/}
            {/*        </button>*/}
            {/*    </div>*/}
                <Table className="text-sm bg-white rounded-lg shadow-md">
                    <TableCaption>
                        <div className="flex justify-center items-center my-4">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className={`p-2 mx-2 rounded-lg text-center ${
                                    currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
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
                                    currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
                                }`}
                            >
                                Next
                            </button>
                        </div>
                    </TableCaption>
                    <TableHeader className="bg-gray-200">
                        <TableRow>
                            <TableHead>Teacher ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Assigned Classroom</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers.map((teacher, index) => (
                            <TableRow key={index} className="hover:bg-gray-100 transition-colors">
                                <TableCell>{teacher.TeacherID}</TableCell>
                                <TableCell>{teacher.first_name} {teacher.last_name}</TableCell>
                                <TableCell>{teacher.email}</TableCell>
                                <TableCell>{teacher.phone_number}</TableCell>
                                <TableCell>{teacher.status}</TableCell>
                                <TableCell>{teacher.subject_name}</TableCell>
                                <TableCell>{teacher.standard}-{teacher.section}</TableCell>
                                <TableCell>
                                    <button 
                                      
                                      onClick={()=>handleEdit(teacher.teacher_id)}
                                      className="p-2 mx-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                
                                    >
                                        Edit
                                    </button>
                                    <button className="p-2 mx-1 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                        Delete
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Teacher;
