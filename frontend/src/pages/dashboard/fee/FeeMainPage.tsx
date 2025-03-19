import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
    CreditCard, FileText, Users, AlertTriangle, History, CirclePlus ,Hourglass
} from "lucide-react";
import axiosInstance from "@/services/axiosInstance.ts";

const AdminFeeDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<String>(null);
    const [revenueData, setRevenueData] = useState([]);
    const [recentTransactions,setRecentTransactions]=useState([]);

    useEffect(() => {
        axiosInstance.get('/api/fee/dashboard_data')
            .then(response => {
                setDashboardData(response.data.tab_data);
                setRevenueData(response.data.monthly_fee_data);
                setRecentTransactions(response.data.recent_transactions);
                setLoading(false);
            })
            .catch(err => {
                setError("Failed to load dashboard data.");
                console.log(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500">Loading dashboard data...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    const stats = [
        {
            title: "Total Collection",
            value: `₹${dashboardData.total_collection.toLocaleString()}`,
            change: "+12.5%",
            icon: <CreditCard className="text-blue-500" size={24}/>
        },
        {
            title: "Pending Payments",
            value: `₹${dashboardData.pending_payment.toLocaleString()}`,
            change: "-3.2%",
            icon: <AlertTriangle className="text-yellow-500" size={24}/>
        },
        {
            title: "Students Paid",
            value: `${dashboardData.fully_paid_students}/${dashboardData.total_students}`,
            change: "+8.5%",
            icon: <Users className="text-green-500" size={24}/>
        },
        {
            title: "Fee Categories",
            value: dashboardData.category_count,
            change: "0%",
            icon: <FileText className="text-purple-500" size={24}/>
        },
    ];

    const quickActions = [
        {text: "Add New Fee Category", icon: <CirclePlus size={20}/>, link: "/dashboard/fee/categories"},
        {text: "Collect Fee", icon: <CreditCard size={20}/>, link: "/dashboard/fee/collect"},
        {text: "Recent Transactions", icon: <History size={20} />, link: "/dashboard/fee/history"},
        {text: "Transactions pending", icon: <Hourglass size={20} />, link: "/dashboard/fee/approval"},
        //{text: "View Reports", icon: <ClipboardList size={20}/>, link: "/dashboard/fee/reports"},
    ];

    return (
        <div className="m-4 border bg-white rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Fee Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow border">
                        <div className="flex justify-between">
                            <div>
                                <p className="text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center">
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/*/!* Action Buttons *!/*/}
            {/*<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">*/}
            {/*    <DashboardButton link="/dashboard/fee/categories" text="Manage Fee Categories" color="bg-blue-500" />*/}
            {/*    <DashboardButton link="/dashboard/fee/collect" text="Collect Payment" color="bg-green-500" />*/}
            {/*    <DashboardButton link="/dashboard/fee/transactions" text="View Transactions" color="bg-yellow-500" />*/}
            {/*    <DashboardButton link="/dashboard/fee/students" text="Student Fee Records" color="bg-indigo-500" />*/}
            {/*</div>*/}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Collection Chart */}
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold mb-4">Monthly Fee Collection</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}/>
                            <Legend/>
                            <Bar dataKey="amount" fill="#4f46e5" name="Collection Amount"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Quick Actions (Replaces Payment Status by Class) */}
                <div className="bg-white p-4 rounded-lg shadow border">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.link}
                                className="flex items-center p-3 border rounded-lg shadow-sm hover:bg-gray-100 transition"
                            >
                                <div className="p-2 bg-gray-200 rounded-md">{action.icon}</div>
                                <span className="ml-3 text-lg">{action.text}</span>
                            </Link>
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
                            <th className="p-2 border">collected By</th>
                            <th className="p-2 border">payment mode</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentTransactions.map(transaction => (
                            <tr key={transaction.payment_id} className="text-center hover:bg-gray-50">
                                <td className="p-2 border">{transaction.payment_date}</td>
                                <td className="p-2 border">{transaction.first_name} - {transaction.last_name} </td>
                                <td className="p-2 border">{transaction.class}</td>
                                <td className="p-2 border">{transaction.amount}</td>
                                <td className="p-2 border">{transaction.collected_by}</td>
                                <td className="p-2 border">{transaction.payment_mode}</td>
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
