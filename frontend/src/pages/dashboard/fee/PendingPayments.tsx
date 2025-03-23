import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PendingOnlinePayments = () => {
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const fetchPendingPayments = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/fee/pending-online-fee");
            setPendingPayments(response.data);
        } catch (err) {
            setError("Failed to load pending payments.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (paymentId) => {
        try {
            await axiosInstance.put(`/api/fee/update-online-fee/${paymentId}`, { remarks: "Approved" });
            fetchPendingPayments(); // Refresh list
        } catch (err) {
            alert("Failed to approve payment.");
        }
    };

    const handleReject = async (paymentId) => {
        try {
            await axiosInstance.put(`/api/fee/reject-online-fee/${paymentId}`);
            fetchPendingPayments(); // Refresh list
        } catch (err) {
            alert("Failed to reject payment.");
        }
    };

    if (loading) return <p className="text-center text-gray-500">Loading pending payments...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="m-4 bg-white p-6 shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Pending Online Payments</h1>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="p-3 border">Admission ID</th>
                        <th className="p-3 border">Student Name</th>
                        <th className="p-3 border">Amount (₹)</th>
                        <th className="p-3 border">Status</th>
                        <th className="p-3 border">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {pendingPayments.map((payment) => (
                        <tr key={payment.payment_id} className="text-center hover:bg-gray-50">
                            <td className="p-3 border">{payment.admission_ID}</td>
                            <td className="p-3 border">{payment.first_name} {payment.last_name}</td>
                            <td className="p-3 border">₹{payment.amount.toLocaleString()}</td>
                            <td className="p-3 border">
                                <span className="text-yellow-600 font-semibold">Pending</span>
                            </td>
                            <td className="p-3 border flex justify-center space-x-2">
                                <Button
                                    className="bg-green-500 text-white flex items-center px-3 py-1"
                                    onClick={() => handleApprove(payment.payment_id)}
                                >
                                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button
                                    className="bg-red-500 text-white flex items-center px-3 py-1"
                                    onClick={() => handleReject(payment.payment_id)}
                                >
                                    <XCircle className="w-4 h-4 mr-1" /> Reject
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingOnlinePayments;