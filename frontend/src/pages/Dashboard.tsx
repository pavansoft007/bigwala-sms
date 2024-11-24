import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

const Dashboard = () => {
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

    const toggleStudentDropdown = () => {
        setIsStudentDropdownOpen((prevState) => !prevState);
    };

    return (
        <div className="flex min-h-screen">
            {/* Side Navbar */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-5">
                    <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                </div>
                <ul className="space-y-2">
                    {/* Students with Dropdown */}
                    <li>
                        <button
                            className="block w-full text-left p-3 hover:bg-gray-700"
                            onClick={toggleStudentDropdown}
                        >
                            Students
                        </button>
                        {isStudentDropdownOpen && (
                            <ul className="ml-5 space-y-1">
                                <li>
                                    <Link
                                        to="students/add"
                                        className="block p-2 hover:bg-gray-600"
                                    >
                                        Add Student
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="students/manage"
                                        className="block p-2 hover:bg-gray-600"
                                    >
                                        Manage Students
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Teachers */}
                    <li>
                        <Link to="teachers" className="block p-3 hover:bg-gray-700">
                            Teachers
                        </Link>
                    </li>

                    {/* Settings */}
                    <li>
                        <Link to="settings" className="block p-3 hover:bg-gray-700">
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
