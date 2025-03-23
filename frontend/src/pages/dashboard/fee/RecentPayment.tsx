import {useEffect, useState} from "react";
import {CheckCircleIcon} from "lucide-react";
import axiosInstance from "@/services/axiosInstance.ts";
import Transactions from "@/types/Transactions.ts";

interface Response{
    page: number,
    limit: number,
    totalPages: number,
    totalRecords: number,
    transactions: Transactions[]
}

const RecentTransactions = () => {
    const [transactions, setTransactions] = useState<Transactions[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchTransactions(page);
    }, [page]);

    const fetchTransactions = (currentPage: number) => {
        setLoading(true);
        axiosInstance
            .get<Response>(`/api/fee/recent-transactions?page=${currentPage}&limit=${limit}`)
            .then((response) => {
                setTransactions(response.data.transactions);
                setTotalPages(response.data.totalPages);
                setLoading(false);
            })
            .catch((error) => {
                setError("Failed to load recent transactions.");
                console.error(error);
                setLoading(false);
            });
    };

    if (loading) return <p className="text-center text-gray-500">Loading transactions...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full border rounded-md">
                    <thead>
                    <tr className="bg-gray-300">
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Student</th>
                        <th className="p-2 border">Class</th>
                        <th className="p-2 border">Category</th>
                        <th className="p-2 border">Amount</th>
                        <th className="p-2 border">Collected By</th>
                        <th className="p-2 border">Payment Mode</th>
                    </tr>
                    </thead>
                    <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.payment_id} className="text-center hover:bg-gray-50">
                            <td className="p-2 border">{new Date(transaction.payment_date).toLocaleDateString()}</td>
                            <td className="p-2 border">
                                {transaction.first_name} {transaction.last_name}
                            </td>
                            <td className="p-2 border">{transaction.class}</td>
                            <td className="p-2 border">{transaction.category_name}</td>
                            <td className="p-2 border">₹{transaction.amount.toLocaleString()}</td>
                            <td className="p-2 border flex items-center justify-center space-x-2">
                               <span className="font-medium text-gray-700">{transaction.collected_by || "N/A"}</span>
                                {transaction.payment_mode === "upi" && (
                                    <span className="text-green-600 text-sm font-semibold flex items-center">
                                    <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500"/>Verified</span>
                                )}
                            </td>
                            <td className="p-2 border capitalize">{transaction.payment_mode}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center space-x-4 mt-4">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded ${page === 1 ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                    Previous
                </button>
                <span className="px-4 py-2 border rounded">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded ${page === totalPages ? "bg-gray-300" : "bg-blue-500 text-white hover:bg-blue-600"}`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default RecentTransactions;