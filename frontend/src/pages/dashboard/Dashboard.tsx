import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance.ts";

type DropdownState = {
    student: boolean;
    teacher: boolean;
    fee: boolean;
    userManagement: boolean;
};

const Dashboard = () => {
    const [openState, setOpenState] = useState<DropdownState>({
        student: false,
        teacher: false,
        fee: false,
        userManagement: false,
    });

    const [role, setRole] = useState<string>('');
    const [permissionsData, setPermissionsData] = useState<string[]>([]);

    useEffect(() => {
        axiosInstance.get('/api/get-all-roles')
            .then((res) => {
                setPermissionsData(res.data.permission);
                setRole(res.data.role);
            })
            .catch((e) => {
                console.error(e);
            });
    }, []);

    const toggleDropdown = (moduleName: keyof DropdownState) => {
        // Close all dropdowns and only open the clicked one
        setOpenState((prevState) => ({
            ...prevState,
            [moduleName]: !prevState[moduleName],
            student: moduleName === 'student' ? !prevState.student : false,
            teacher: moduleName === 'teacher' ? !prevState.teacher : false,
            fee: moduleName === 'fee' ? !prevState.fee : false,
            userManagement: moduleName === 'userManagement' ? !prevState.userManagement : false,
        }));
    };

    const hasPermission = (link: string) => {
        if (role === 'admin') {
            return true;
        }
        return permissionsData.includes(link);
    };

    const renderDropdownMenu = (moduleName: keyof DropdownState,name:string,items: string[], routes: string[]) => {
        if (!hasPermission(name)) return null;
        return (
            <li>
                <button
                    className={`block w-full text-left p-3 rounded-lg ${openState[moduleName] ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    onClick={() => toggleDropdown(moduleName)}
                >
                    {/* {name.charAt(0).toUpperCase() + moduleName.slice(1)} */}
                    {name}
                </button>
                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openState[moduleName] ? "max-h-40" : "max-h-0"
                    }`}
                >
                    <ul className="ml-5 space-y-1">
                        {items.map((item, index) => (
                            <li key={item}>
                                <Link to={routes[index]} className="block p-2 rounded-lg hover:bg-gray-600">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </li>
        );
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-5">
                    <h1 className="text-2xl font-semibold tracking-wide" > <Link to='' > Admin Dashboard </Link> </h1>
                </div>
                <ul className="space-y-2">
                    {renderDropdownMenu('student','student management', ['Add Student', 'Manage Students'], ['students/add', 'students/manage-student'])}
                    {renderDropdownMenu('teacher','teacher management', ['Add Teacher', 'Manage Teachers'], ['teacher/add', 'teacher/manage-teacher'])}
                    {renderDropdownMenu('fee','fee managment', ['Fee Categories', 'Users'], ['fee/categories', 'users'])}
                    {renderDropdownMenu('userManagement','user managment' ,['Roles', 'Users'], ['roles', 'users'])}
                    {hasPermission('notice board') && (
                        <li>
                            <Link to="notice-board" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">
                                Notice board
                            </Link>
                        </li>
                    )}
                    {hasPermission('subjects') && (
                        <li>
                            <Link to="subjects" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">
                                Subjects
                            </Link>
                        </li>
                    )}
                    {hasPermission('classroom') && (
                        <li>
                            <Link to="classroom" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">
                                Classroom
                            </Link>
                        </li>
                    )}
                    {hasPermission('exams') && (
                        <li>
                            <Link to="exams" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">
                                Exams
                            </Link>
                        </li>
                    )}
                    {hasPermission('gallery') && (
                        <li>
                            <Link to="gallery" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">
                                Gallery
                            </Link>
                        </li>
                    )}
                    {hasPermission('banner Images') && (
                        <li>
                            <Link to="bannerImages" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">
                                Banner Images
                            </Link>
                        </li>
                    )}
                    <li>
                        <Link to="settings" className="block p-3 rounded-lg hover:bg-gray-700 transition-colors">
                            Settings
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="flex-1 p-5">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;