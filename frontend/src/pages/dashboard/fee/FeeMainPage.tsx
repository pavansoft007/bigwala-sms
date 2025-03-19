import {useEffect, useState} from "react";
import DashboardButton from "@/components/DashboardButton.tsx";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, CreditCard, FileText, BarChart2, Users, AlertTriangle, Download } from "lucide-react";
import axiosInstance from "@/services/axiosInstance.ts";

const AdminFeeDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<String>(null);
    const [selectedTimeframe, setSelectedTimeframe] = useState("weekly");
    const [feeCategories,setFeeCategories]=useState<string[]>([]);

    useEffect(() => {
        axiosInstance.get('/api/fee/dashboard_data')
            .then(response => {
                setDashboardData(response.data.tab_data);
                setFeeCategories(response.data.fee_categories_list);
                setLoading(false);
            })
            .catch(err => {
                setError("Failed to load dashboard data.");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500">Loading dashboard data...</p>;
    }


    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    const revenueData = [
        { name: "Jan", amount: 120000 },
        { name: "Feb", amount: 135000 },
        { name: "Mar", amount: 98000 },
        { name: "Apr", amount: 115000 },
        { name: "May", amount: 126000 },
        { name: "Jun", amount: 105000 },
    ];

    //const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    const recentTransactions = [
        { id: 1, date: "2025-03-03", student: "John Doe", amount: "₹10,000", status: "Paid", class: "Class X" },
        { id: 2, date: "2025-03-02", student: "Jane Smith", amount: "₹8,500", status: "Pending", class: "Class IX" },
        { id: 3, date: "2025-03-01", student: "Robert Johnson", amount: "₹12,000", status: "Paid", class: "Class XI" },
        { id: 4, date: "2025-02-28", student: "Emily Davis", amount: "₹9,500", status: "Overdue", class: "Class VIII" },
        { id: 5, date: "2025-02-28", student: "Michael Brown", amount: "₹11,200", status: "Paid", class: "Class XII" },
    ];

    const stats = [
        {
            title: "Total Collection",
            value: `₹${dashboardData.total_collection.toLocaleString()}`,
            change: "+12.5%",
            icon: <CreditCard className="text-blue-500" size={24} />
        },
        {
            title: "Pending Payments",
            value: `₹${dashboardData.pending_payment.toLocaleString()}`,
            change: "-3.2%",
            icon: <AlertTriangle className="text-yellow-500" size={24} />
        },
        {
            title: "Students Paid",
            value: `${dashboardData.fully_paid_students}/${dashboardData.total_students}`,
            change: "+8.5%",
            icon: <Users className="text-green-500" size={24} />
        },
        {
            title: "Fee Categories",
            value: dashboardData.category_count,
            change: "0%",
            icon: <FileText className="text-purple-500" size={24} />
        },
    ];


    return (
        <div className="m-4 border bg-white rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Fee Dashboard</h1>
                {/*<div className="flex gap-2">*/}
                {/*    <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">*/}
                {/*        <Calendar size={16} className="inline mr-2" />*/}
                {/*        2024-2025*/}
                {/*    </button>*/}
                {/*    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">*/}
                {/*        <Download size={16} className="mr-2" />*/}
                {/*        Export Report*/}
                {/*    </button>*/}
                {/*</div>*/}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow border">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : stat.change === '0%' ? 'text-gray-500' : 'text-red-500'}`}>
                                    {stat.change} from last month
                                </p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center">
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <DashboardButton link="/dashboard/fee/categories" text="Manage Fee Categories" color="bg-blue-500" />
                <DashboardButton link="/dashboard/fee/collect" text="Collect Payment" color="bg-green-500" />
                <DashboardButton link="/dashboard/fee/transactions" text="View Transactions" color="bg-yellow-500" />
                <DashboardButton link="/dashboard/fee/students" text="Student Fee Records" color="bg-indigo-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Collection Chart */}
                <div className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Monthly Fee Collection</h2>
                        <div className="flex gap-2">
                            <button
                                className={`px-3 py-1 rounded-md ${selectedTimeframe === 'weekly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setSelectedTimeframe('weekly')}
                            >
                                Weekly
                            </button>
                            <button
                                className={`px-3 py-1 rounded-md ${selectedTimeframe === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                                onClick={() => setSelectedTimeframe('monthly')}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                            <Legend />
                            <Bar dataKey="amount" fill="#4f46e5" name="Collection Amount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Fee Categories List */}
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold mb-4">Fee Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {feeCategories.map((category, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-md text-sm font-medium text-center shadow-md ${
                                    index % 4 === 0
                                        ? "bg-blue-100 text-blue-700"
                                        : index % 4 === 1
                                            ? "bg-green-100 text-green-700"
                                            : index % 4 === 2
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-purple-100 text-purple-700"
                                }`}
                            >
                                {category}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Quick Actions & Fee Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Quick Actions */}
                <div className="bg-white p-4 rounded-lg shadow border col-span-1">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center">
                            <CreditCard size={18} className="mr-2" /> Send Payment Reminders
                        </button>
                        <button className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center">
                            <FileText size={18} className="mr-2" /> Generate Receipt Batch
                        </button>
                        <button className="w-full py-2 px-4 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center">
                            <BarChart2 size={18} className="mr-2" /> Create Custom Report
                        </button>
                        <button className="w-full py-2 px-4 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 flex items-center">
                            <AlertTriangle size={18} className="mr-2" /> View Due Notifications
                        </button>
                    </div>
                </div>

                {/* Payment Status Overview */}
                <div className="bg-white p-4 rounded-lg shadow border col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Payment Status by Class</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {['Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'].map((cls, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <h3 className="font-medium">{cls}</h3>
                                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-green-500 rounded-full"
                                        style={{width: `${Math.floor(Math.random() * 50) + 50}%`}}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-sm">
                                    <span>{Math.floor(Math.random() * 5) + 35}/{Math.floor(Math.random() * 5) + 40}</span>
                                    <span className="text-green-600">
                                        {Math.floor(Math.random() * 30) + 70}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table: Recent Transactions */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-semibold">Recent Transactions</h2>
                    <button className="text-blue-500 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border rounded-md">
                        <thead>
                        <tr className="bg-gray-300">
                            <th className="p-2 border">Date</th>
                            <th className="p-2 border">Student</th>
                            <th className="p-2 border">Class</th>
                            <th className="p-2 border">Amount</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentTransactions.map(transaction => (
                            <tr key={transaction.id} className="text-center hover:bg-gray-50">
                                <td className="p-2 border">{transaction.date}</td>
                                <td className="p-2 border">{transaction.student}</td>
                                <td className="p-2 border">{transaction.class}</td>
                                <td className="p-2 border">{transaction.amount}</td>
                                <td className="p-2 border">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        transaction.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                    }`}>
                                        {transaction.status}
                                    </span>
                                </td>
                                <td className="p-2 border">
                                    <div className="flex justify-center space-x-2">
                                        <button className="text-blue-500 hover:text-blue-700">
                                            View
                                        </button>
                                        <button className="text-green-500 hover:text-green-700">
                                            Receipt
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFeeDashboard;