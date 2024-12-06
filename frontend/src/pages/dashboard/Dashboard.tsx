import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState<boolean>(false);
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState<boolean>(false);

    const toggleStudentDropdown = () => {
        setIsStudentDropdownOpen((prevState) => !prevState);
    };

    const toggleTeacherDropdown = () => {
        setIsTeacherDropdownOpen((prevState) => !prevState);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-5">
                    <h1 className="text-2xl font-semibold tracking-wide">Admin Dashboard</h1>
                </div>
                <ul className="space-y-2">
                    <li>
                        <button
                            className={`block w-full text-left p-3 rounded-lg ${
                                isStudentDropdownOpen ? "bg-gray-700" : "hover:bg-gray-700"
                            } transition-colors`}
                            onClick={toggleStudentDropdown}
                        >
                            Students
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ${
                                isStudentDropdownOpen ? "max-h-40" : "max-h-0"
                            }`}
                        >
                            <ul className="ml-5 space-y-1">
                                <li>
                                    <Link
                                        to="students/add"
                                        className="block p-2 rounded-lg hover:bg-gray-600"
                                    >
                                        Add Student
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="students/manage-student"
                                        className="block p-2 rounded-lg hover:bg-gray-600"
                                    >
                                        Manage Students
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </li>


                    <li>
                        <button
                            className={`block w-full text-left p-3 rounded-lg ${
                                isTeacherDropdownOpen ? "bg-gray-700" : "hover:bg-gray-700"
                            } transition-colors`}
                            onClick={toggleTeacherDropdown}
                        >
                            Teachers
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ${
                                isTeacherDropdownOpen ? "max-h-40" : "max-h-0"
                            }`}
                        >
                            <ul className="ml-5 space-y-1">
                                <li>
                                    <Link
                                        to="teacher/add"
                                        className="block p-2 rounded-lg hover:bg-gray-600"
                                    >
                                        Add Teacher
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="teacher/manage-teacher"
                                        className="block p-2 rounded-lg hover:bg-gray-600"
                                    >
                                        Manage Teachers
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </li>

                    <li>
                        <Link
                            to="settings"
                            className="block p-3 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Settings
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-5">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
