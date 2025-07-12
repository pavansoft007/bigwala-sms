import {Users, BookOpen, CreditCard, Bell, Settings, FileText, Clock, Clipboard} from "lucide-react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {useSelector} from "react-redux";
import {RootState} from "@/stores/store.ts";
import getProfileImage from "@/services/getProfileImage.ts";

const AdminDashboard = () => {
    const userInfo=useSelector((state: RootState) => state.userInfo);

    const attendanceData = [
        {name: "Mon", students: 95, teachers: 98},
        {name: "Tue", students: 93, teachers: 100},
        {name: "Wed", students: 94, teachers: 99},
        {name: "Thu", students: 91, teachers: 97},
        {name: "Fri", students: 89, teachers: 100},
    ];

    // Sample enrollment data
    const enrollmentData = [
        {name: "Class VI", count: 120},
        {name: "Class VII", count: 115},
        {name: "Class VIII", count: 110},
        {name: "Class IX", count: 105},
        {name: "Class X", count: 108},
        {name: "Class XI", count: 86},
        {name: "Class XII", count: 84},
    ];

    interface AdmissionData {
        name: string,
        value: number
    }

    // Sample Admission Status
    const admissionData:AdmissionData[] = [
        {name: "Applied", value: 150},
        {name: "Shortlisted", value: 80},
        {name: "Enrolled", value: 50},
        {name: "Rejected", value: 20},
    ];
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    // Quick stats
    const stats = [
        {title: "Total Students", value: "728", icon: <Users size={24}/>},
        {title: "Total Staff", value: "56", icon: <Users size={24}/>},
        {title: "Fee Collection", value: "₹4.8L", icon: <CreditCard size={24}/>},
        {title: "Attendance", value: "93%", icon: <Clock size={24}/>},
    ];

    // Upcoming events
    const events = [
        {date: "05 Mar", title: "Parent-Teacher Meeting", category: "Meeting"},
        {date: "12 Mar", title: "Annual Sports Day", category: "Event"},
        {date: "15 Mar", title: "Science Exhibition", category: "Academic"},
        {date: "20 Mar", title: "Final Exam Begins", category: "Exam"},
    ];

    // Recent notifications
    const notifications = [
        {title: "Fee Payment Reminder", time: "2 hours ago", priority: "high"},
        {title: "New Admission Application", time: "5 hours ago", priority: "medium"},
        {title: "Staff Meeting Rescheduled", time: "Yesterday", priority: "medium"},
        {title: "Academic Calendar Updated", time: "2 days ago", priority: "low"},
    ];

    return (
        <div className="m-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {userInfo.admin_name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full bg-gray-100 relative">
                            <Bell size={20}/>
                            <span
                                className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">4</span>
                        </button>
                        <button className="p-2 rounded-full bg-gray-100">
                            <Settings size={20}/>
                        </button>
                        <div className="flex items-center space-x-2">
                            {/*<div*/}
                            {/*    className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">*/}
                            {/*    A*/}
                            {/*</div>*/}
                            <img src={getProfileImage(userInfo.admin_name)} alt={userInfo.admin_name}
                                 className="w-10 h-10 rounded-full mr-3"/>
                            <div>
                                <p className="font-medium">{userInfo.school_name}</p>
                                <p className="text-sm text-gray-500">{userInfo.role_name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <div key={index}
                         className="bg-white p-6 rounded-lg shadow-md flex items-center border-l-4 border-blue-500">
                        <div className="p-3 bg-blue-100 text-blue-500 rounded-full mr-4">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-gray-500">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Weekly Attendance */}
                <div className="bg-white p-4 rounded-lg shadow-md col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Weekly Attendance</h2>
                        <button className="text-blue-500 hover:underline text-sm">View Details</button>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis domain={[80, 100]}/>
                            <Tooltip/>
                            <Legend/>
                            <Bar dataKey="students" name="Students (%)" fill="#4f46e5"/>
                            <Bar dataKey="teachers" name="Teachers (%)" fill="#10b981"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Enrollment by Class */}
                <div className="bg-white p-4 rounded-lg shadow-md col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Enrollment by Class</h2>
                        <button className="text-blue-500 hover:underline text-sm">Details</button>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={enrollmentData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip/>
                            <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} dot={{r: 4}}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Admission Status */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Admission Status</h2>
                        <button className="text-blue-500 hover:underline text-sm"  >View All</button>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={admissionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {admissionData.map((entry, index) => (
                                    <Cell name={entry.name} key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Upcoming Events</h2>
                        <button className="text-blue-500 hover:underline text-sm">Calendar</button>
                    </div>
                    <div className="space-y-3">
                        {events.map((event, index) => (
                            <div key={index} className="flex items-start space-x-3 border-b pb-3 last:border-b-0">
                                <div className="bg-blue-100 text-blue-800 p-2 rounded min-w-14 text-center">
                                    <p className="text-xs">MAR</p>
                                    <p className="text-xl font-bold">{event.date.split(" ")[0]}</p>
                                </div>
                                <div>
                                    <p className="font-medium">{event.title}</p>
                                    <p className="text-sm text-gray-500">{event.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Recent Notifications</h2>
                        <button className="text-blue-500 hover:underline text-sm">View All</button>
                    </div>
                    <div className="space-y-3">
                        {notifications.map((notification, index) => (
                            <div key={index} className="flex items-start space-x-3 border-b pb-3 last:border-b-0">
                                <div className={`p-2 rounded-full ${
                                    notification.priority === 'high' ? 'bg-red-100 text-red-500' :
                                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-500' :
                                            'bg-green-100 text-green-500'
                                }`}>
                                    <Bell size={16}/>
                                </div>
                                <div>
                                    <p className="font-medium">{notification.title}</p>
                                    <p className="text-sm text-gray-500">{notification.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Access */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center hover:bg-blue-100 cursor-pointer">
                        <div className="bg-blue-100 text-blue-500 p-3 rounded-full inline-flex mb-2">
                            <Users size={24}/>
                        </div>
                        <p className="font-medium">Students</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center hover:bg-green-100 cursor-pointer">
                        <div className="bg-green-100 text-green-500 p-3 rounded-full inline-flex mb-2">
                            <Users size={24}/>
                        </div>
                        <p className="font-medium">Teachers</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center hover:bg-purple-100 cursor-pointer">
                        <div className="bg-purple-100 text-purple-500 p-3 rounded-full inline-flex mb-2">
                            <BookOpen size={24}/>
                        </div>
                        <p className="font-medium">Classes</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center hover:bg-yellow-100 cursor-pointer">
                        <div className="bg-yellow-100 text-yellow-500 p-3 rounded-full inline-flex mb-2">
                            <CreditCard size={24}/>
                        </div>
                        <p className="font-medium">Fee</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center hover:bg-red-100 cursor-pointer">
                        <div className="bg-red-100 text-red-500 p-3 rounded-full inline-flex mb-2">
                            <Clipboard size={24}/>
                        </div>
                        <p className="font-medium">Exams</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg text-center hover:bg-indigo-100 cursor-pointer">
                        <div className="bg-indigo-100 text-indigo-500 p-3 rounded-full inline-flex mb-2">
                            <FileText size={24}/>
                        </div>
                        <p className="font-medium">Reports</p>
                    </div>
                </div>
            </div>

            {/* To-Do & Reminders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* To-Do */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">To-Do List</h2>
                        <button className="text-blue-500 hover:underline text-sm">Add Task</button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center p-2 bg-gray-50 rounded">
                            <input type="checkbox" className="mr-3"/>
                            <span>Review new admission applications</span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded">
                            <input type="checkbox" className="mr-3"/>
                            <span>Finalize exam schedule</span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded">
                            <input type="checkbox" className="mr-3" checked/>
                            <span className="line-through">Update fee structure</span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded">
                            <input type="checkbox" className="mr-3"/>
                            <span>Prepare monthly financial report</span>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">System Status</h2>
                        <span
                            className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">All Systems Operational</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span>Database</span>
                            </div>
                            <span className="text-sm text-gray-500">99.9% uptime</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span>API Services</span>
                            </div>
                            <span className="text-sm text-gray-500">100% operational</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span>SMS Gateway</span>
                            </div>
                            <span className="text-sm text-gray-500">Active</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span>Payment Gateway</span>
                            </div>
                            <span className="text-sm text-gray-500">Connected</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            System Diagnostics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;