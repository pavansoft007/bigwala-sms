import {Link, Outlet, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
// import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../services/axiosInstance.ts";
import {
    FaUserGraduate,
    FaChalkboardTeacher,
    FaMoneyBillWave,
    FaUsersCog,
    FaBell,
    FaClipboardList,
    FaImages,
    FaCog,
    FaSignOutAlt,
    FaUser,
} from "react-icons/fa";
import {BiDotsHorizontalRounded} from "react-icons/bi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import getProfileImage from "@/services/getProfileImage.ts";
import {useDispatch, useSelector} from "react-redux";
import Classroom from "@/types/Classroom.ts";
import {putClassrooms} from "@/stores/ClassroomStore.ts";
import Subject from "@/types/Subject.ts";
import {putSubject} from "@/stores/SubjectStore.ts";
import UserData from "@/types/UserInfo.ts";
import {putData} from "@/stores/UserInfo.ts";
import {RootState} from "@/stores/store.ts";

interface DashboardItem {
    title: string;
    icon: React.ReactNode;
    link: string;
    permission: string;
    description: string;
    color: string;
}

const DashboardSideBar = () => {
    const [isLoading, setIsLoading] = useState(true);
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const dispatch = useDispatch();
    // const navigate = useNavigate();
    const location = useLocation();

    // Check if we're on the main dashboard page
    const isMainDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const FetchClassrooms = async () => {
                    const res = await axiosInstance.get<Classroom[]>("/mobileAPI/classroom");
                    dispatch(putClassrooms(res.data));
                };

                const FetchSubjects = async () => {
                    const res = await axiosInstance.get<Subject[]>("/api/subject");
                    dispatch(putSubject(res.data));
                };

                const FetchUserDetails = async () => {
                    const res = await axiosInstance.get<UserData>('/api/dashboard');
                    dispatch(putData(res.data));
                };

                await Promise.all([
                    FetchClassrooms(),
                    FetchSubjects(),
                    FetchUserDetails()
                ]);

                console.log(userInfo);
            } catch (error) {
                console.error('Error fetching data:', error);
            }finally {
                setIsLoading(false);
            }
        };

        fetchData();

    }, []);

    const hasPermission = (permission: string) => {
        return ["ADMIN", "principal", "vice-principal"].includes(userInfo.role_name) || userInfo.permissions.includes(permission);
    };

    const dashboardItems: DashboardItem[] = [
        {
            title: "Attendance Management",
            icon: <FaUsersCog className="text-3xl" />,
            link: "attendance",
            permission: "attendance management",
            description: "Track and manage attendance records",
            color: "from-red-500 to-red-600"
        },
        {
            title: "Leaves Management",
            icon: <FaUsersCog className="text-3xl" />,
            link: "leaves",
            permission: "leaves management",
            description: "Track and manage leaves",
            color: "from-indigo-500 to-indigo-600"
        },
        {
            title: "Fee Management",
            icon: <FaMoneyBillWave className="text-3xl" />,
            link: "fee/",
            permission: "fee management",
            description: "Handle fee collection and payments",
            color: "from-yellow-500 to-yellow-600"
        },
        {
            title: "Student Management",
            icon: <FaUserGraduate className="text-3xl" />,
            link: "students/manage-student",
            permission: "student management",
            description: "Manage student records and information",
            color: "from-blue-500 to-blue-600"
        },
        {
            title: "Teacher Management",
            icon: <FaChalkboardTeacher className="text-3xl" />,
            link: "teacher/manage-teacher",
            permission: "teacher management",
            description: "Manage teacher profiles and assignments",
            color: "from-green-500 to-green-600"
        },
        {
            title: "Gallery",
            icon: <FaImages className="text-3xl" />,
            link: "gallery",
            permission: "gallery",
            description: "Manage school photo gallery",
            color: "from-cyan-500 to-cyan-600"
        },
        {
            title: "User Management",
            icon: <FaUsersCog className="text-3xl" />,
            link: "users",
            permission: "user management",
            description: "Manage user accounts and permissions",
            color: "from-purple-500 to-purple-600"
        },
        {
            title: "Notice Board",
            icon: <FaBell className="text-3xl" />,
            link: "notice-board",
            permission: "notice board",
            description: "Post and manage announcements",
            color: "from-orange-500 to-orange-600"
        },
        // {
        //     title: "Subjects",
        //     icon: <FaBook className="text-3xl" />,
        //     link: "subjects",
        //     permission: "subjects",
        //     description: "Manage academic subjects and curriculum",
        //     color: "from-indigo-500 to-indigo-600"
        // },
        // {
        //     title: "Classroom",
        //     icon: <FaSchool className="text-3xl" />,
        //     link: "classroom",
        //     permission: "classroom",
        //     description: "Manage classroom assignments and schedules",
        //     color: "from-teal-500 to-teal-600"
        // },
        {
            title: "Exams",
            icon: <FaClipboardList className="text-3xl" />,
            link: "exams",
            permission: "exams",
            description: "Schedule and manage examinations",
            color: "from-pink-500 to-pink-600"
        },
        {
            title: "App Banner Images",
            icon: <FaImages className="text-3xl" />,
            link: "bannerImages",
            permission: "banner Images",
            description: "Manage application banner images",
            color: "from-lime-500 to-lime-600"
        }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (isMainDashboard) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {userInfo.school_name}
                            </h1>

                            {/* Profile Section */}
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={getProfileImage(userInfo.admin_name)}
                                        alt={userInfo.admin_name}
                                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                                    />
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-medium text-gray-900">{userInfo.admin_name}</p>
                                        <p className="text-xs text-gray-500">{userInfo?.role_name}</p>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                        <BiDotsHorizontalRounded className="text-gray-600" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer">
                                            <FaUser className="mr-2 h-4 w-4" />
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Link to="settings" className="flex items-center w-full">
                                                <FaCog className="mr-2 h-4 w-4" />
                                                Settings
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Link to="/logout" className="flex items-center w-full text-red-600">
                                                <FaSignOutAlt className="mr-2 h-4 w-4" />
                                                Logout
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {userInfo.admin_name}!
                        </h2>
                        <p className="text-gray-600">
                            Choose a module to get started with your school management tasks.
                        </p>
                    </div>

                    {/* Dashboard Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {dashboardItems
                            .filter(item => hasPermission(item.permission))
                            .map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.link}
                                    className="group block"
                                >
                                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1">
                                        <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color} text-white`}>
                                                    {item.icon}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}

                        {/* Settings Card - Always visible */}
                        <Link to="settings" className="group block">
                            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1">
                                <div className="h-2 bg-gradient-to-r from-gray-500 to-gray-600"></div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                                            <FaCog className="text-3xl" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        Settings
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        Configure system settings and preferences
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Quick Stats or Additional Info Section */}
                    <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {dashboardItems.filter(item => hasPermission(item.permission)).length}
                                </div>
                                <div className="text-sm text-gray-600">Available Modules</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{userInfo.role_name}</div>
                                <div className="text-sm text-gray-600">Your Role</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">Active</div>
                                <div className="text-sm text-gray-600">System Status</div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // For non-dashboard pages, render the outlet
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple header for other pages */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link
                            to="/dashboard"
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            ← {userInfo.school_name}
                        </Link>

                        <div className="flex items-center space-x-4">
                            <img
                                src={getProfileImage(userInfo.admin_name)}
                                alt={userInfo.admin_name}
                                className="w-8 h-8 rounded-full"
                            />
                            <span className="text-sm text-gray-600 hidden sm:inline">
                                {userInfo.admin_name}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardSideBar;