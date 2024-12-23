import { Link, Outlet } from "react-router-dom";
import {useEffect, useState} from "react";
import axiosInstance from "../../services/axiosInstance.ts";

const Dashboard = () => {
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState<boolean>(false);
    const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState<boolean>(false);
    const [isUserManagementDropdownOpen,setIsUserManagementDropdownOpen]=useState<boolean>(false);
    const [role,setRole]=useState<string>('');
    const [permissionsData,setPermissionsData]=useState<string[]>([]);

    useEffect(() => {
      axiosInstance.get('/api/get-all-roles').then((res)=>{
          setPermissionsData(res.data.permissions);
          setRole(res.data.role);
      }).catch((e)=>{
         console.error(e);
      });
    }, []);

    const toggleStudentDropdown = () => {
        setIsStudentDropdownOpen((prevState) => !prevState);
    };

    const toggleTeacherDropdown = () => {
        setIsTeacherDropdownOpen((prevState) => !prevState);
    };

    const toggleUserManagementDropdown=()=>{
        setIsUserManagementDropdownOpen((prevState)=>!prevState);
    }

    const hasPermission = (link:string) =>{
        if(role === 'admin'){
              return true;
        }
        return permissionsData.includes(link);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-5">
                    <h1 className="text-2xl font-semibold tracking-wide">Admin Dashboard</h1>
                </div>
                <ul className="space-y-2">
                    {
                        hasPermission('student management') && <li>
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
                    }


                    {hasPermission('teacher management') &&
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
                                    isTeacherDropdownOpen  ? "max-h-40" : "max-h-0"
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
                    }
                    {
                        hasPermission('roles') && <li>
                            <button
                                className={`block w-full text-left p-3 rounded-lg ${
                                    isUserManagementDropdownOpen ? "bg-gray-700" : "hover:bg-gray-700"
                                } transition-colors`}
                                onClick={toggleUserManagementDropdown}
                            >
                                Manage admins
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${
                                    isUserManagementDropdownOpen ? "max-h-40" : "max-h-0"
                                }`}
                            >
                                <ul className="ml-5 space-y-1">
                                    <li>
                                        <Link
                                            to="roles"
                                            className="block p-2 rounded-lg hover:bg-gray-600"
                                        >
                                            roles
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="users"
                                            className="block p-2 rounded-lg hover:bg-gray-600"
                                        >
                                            users
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    }
                    {
                        hasPermission('subjects') &&
                        <li>
                            <Link
                                to="subjects"
                                className="block p-3 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                subjects
                            </Link>
                        </li>
                    }
                    {
                        hasPermission('classroom') &&
                        <li>
                            <Link
                                to="classroom"
                                className="block p-3 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                classroom
                            </Link>
                        </li>
                    }
                    {
                        hasPermission('exams') &&
                        <li>
                            <Link
                                to="exams"
                                className="block p-3 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                exams
                            </Link>
                        </li>
                    }
                    {
                        hasPermission('gallery') &&
                        <li>
                            <Link
                                to="gallery"
                                className="block p-3 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                gallery
                            </Link>
                        </li>
                    }
                    {
                        hasPermission('banner Images') &&
                        <li>
                            <Link
                                to="bannerImages"
                                className="block p-3 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                banner Images
                            </Link>
                        </li>
                    }

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

            <div className="flex-1 p-5">
                <Outlet/>
            </div>
        </div>
    );
};

export default Dashboard;
