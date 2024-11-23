import { Link, Outlet } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="flex min-h-screen">
            {/* Side Navbar */}
            <div className="w-64 bg-gray-800 text-white">
                <div className="p-5">
                    <h1 className="text-xl font-semibold">Admin Dashboard</h1>
                </div>
                <ul className="space-y-2">
                    <li>
                        <Link to="students" className="block p-3 hover:bg-gray-700">
                            Students
                        </Link>
                    </li>
                    <li>
                        <Link to="teachers" className="block p-3 hover:bg-gray-700">
                            Teachers
                        </Link>
                    </li>
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
