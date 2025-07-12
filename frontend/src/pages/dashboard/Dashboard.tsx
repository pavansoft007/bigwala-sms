import {Link, Outlet} from "react-router-dom";
import {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import axiosInstance from "../../services/axiosInstance.ts";
import {
    FaUserGraduate,
    FaChalkboardTeacher,
    FaMoneyBillWave,
    FaUsersCog,
    FaBell,
    FaBook,
    FaSchool,
    FaClipboardList,
    FaImages,
    FaCog,
    FaBars,
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


const DashboardSideBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const userInfo = useSelector((state: RootState) => state.userInfo);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    // useEffect(() => {
    //     console.log("Redux userInfo state:", userInfo);
    //     if (userInfo?.admin_name) {
    //         setIsLoading(false);
    //     }
    // }, [userInfo]);

    const hasPermission = (link: string) => {
        return ["ADMIN", "principal", "vice-principal"].includes(userInfo.role_name) || userInfo.permissions.includes(link);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    function dashboardNavigation(){
        navigate('/dashboard');
    }


    return (
        <div className="flex flex-row min-h-screen bg-gray-100">
            <div
                className={`fixed md:relative bg-gray-800 text-white w-64 md:w-72 transition-all duration-300 ${isOpen ? "left-0" : "-left-64"} md:left-0 h-screen flex flex-col overflow-y-auto`}>
                <div className="p-5 flex items-center justify-between md:justify-start">
                    {/*<h1 className="text-2xl font-bold" onClick={dashboardNavigation} >{userInfo.school_name}</h1>*/}
                    <h1 className="text-2xl font-bold cursor-pointer hover:bg-gray-600 transition-colors" onClick={dashboardNavigation}>
                        {userInfo.school_name}
                    </h1>
                </div>
                <ul className="space-y-2 p-3 flex-1 overflow-y-auto">
                    {hasPermission("student management") && (
                        <li>
                            <Link to="students/manage-student"
                                  className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaUserGraduate className="mr-3"/> Student Management
                            </Link>
                        </li>
                    )}
                    {hasPermission("teacher management") && (
                        <li>
                            <Link to="teacher/manage-teacher"
                                  className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaChalkboardTeacher className="mr-3"/> Teacher Management
                            </Link>
                        </li>
                    )}
                    {hasPermission("fee management") && (
                        <li>
                            <Link to="fee/" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaMoneyBillWave className="mr-3"/> Fee Management
                            </Link>
                        </li>
                    )}
                    {hasPermission("user management") && (
                        <li>
                            <Link to="users" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaUsersCog className="mr-3"/> User Management
                            </Link>
                        </li>
                    )}
                    {hasPermission("attendance management") && (
                        <li>
                            <Link to="attendance" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaUsersCog className="mr-3"/> Attendance Management
                            </Link>
                        </li>
                    )}
                    {hasPermission("notice board") && (
                        <li>
                            <Link to="notice-board" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaBell className="mr-3"/> Notice Board
                            </Link>
                        </li>
                    )}
                    {hasPermission("subjects") && (
                        <li>
                            <Link to="subjects" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaBook className="mr-3"/> Subjects
                            </Link>
                        </li>
                    )}
                    {hasPermission("classroom") && (
                        <li>
                            <Link to="classroom" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaSchool className="mr-3"/> Classroom
                            </Link>
                        </li>
                    )}
                    {hasPermission("exams") && (
                        <li>
                            <Link to="exams" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaClipboardList className="mr-3"/> Exams
                            </Link>
                        </li>
                    )}
                    {hasPermission("gallery") && (
                        <li>
                            <Link to="gallery" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaImages className="mr-3"/> Gallery
                            </Link>
                        </li>
                    )}
                    {hasPermission("banner Images") && (
                        <li>
                            <Link to="bannerImages" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                                <FaImages className="mr-3"/> App Banner Images
                            </Link>
                        </li>
                    )}
                    <li>
                        <Link to="settings" className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                            <FaCog className="mr-3"/> Settings
                        </Link>
                    </li>
                </ul>
                {/* Profile Section */}
                <div className="p-5 bg-gray-900 flex justify-between items-center">
                    <div className="px-3 flex flex-row">
                        <img src={getProfileImage(userInfo.admin_name)} alt={userInfo.admin_name}
                             className="w-10 h-10 rounded-full mr-3"/>
                        <div>
                            <p className="text-sm font-medium">{userInfo.admin_name}</p>
                            <p className="text-xs text-gray-400">{userInfo?.role_name}</p>
                        </div>
                    </div>

                    <div className="px-3 flex flex-row ">
                        <div className="ml-2 flex items-center justify-center ">
                            <DropdownMenu>
                                <DropdownMenuTrigger> <BiDotsHorizontalRounded/> </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator/>
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem> <Link to="/logout"
                                                             className="text-red-500 text-bold">Logout</Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                    </div>
                </div>
            </div>

            <button className="fixed top-5 left-5 md:hidden text-gray-800" onClick={() => setIsOpen(true)}>
                <FaBars size={24}/>
            </button>

            <div className="flex-1 p-5  ml-2 overflow-y-auto h-screen">
                <Outlet/>
            </div>

        </div>
    );
};

export default DashboardSideBar;
