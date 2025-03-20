import { useState, useEffect } from "react";
import axiosInstance from "@/services/axiosInstance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Loader, CreditCard, Calendar, User, BookOpen, ClipboardList, History } from "lucide-react";

// TypeScript interfaces
interface Student {
    student_id: string;
    admission_ID: string;
    first_name: string;
    last_name: string;
}

interface Category {
    category_id: string;
    category_name: string;
}

interface Transaction {
    payment_id: string;
    student_name: string;
    amount: number;
    category_name: string;
    payment_date: string;
    remarks?: string;
}

interface MessageState {
    type: "success" | "error";
    text: string;
}

interface StudentFee{
    category_name: string,
    total_fee_paid: number,
    fee_remaining: number,
    fee_amount: number
}

interface StudentFeeHistory{
    "category_name": string,
    "amount": number,
    "payment_date": string
}

interface Student {
    admission_ID: string;
    student_id: string;
    mother_phone_number: string;
    mother_name: string;
    father_name: string;
    caste: string;
    status: string;
    student_photo: string;
    father_photo: string;
    classroom_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    email: string;
    phone_number: string;
    address: string;
    enrollment_date: string;
    assginedClassroom: string;
    standard: string;
    section: string;
    studentFee:StudentFee[];
    studentFeeHistory:StudentFeeHistory[];
}
const FeeCollection = () => {
    const [amount, setAmount] = useState<string>("");
    const [classId, setClassId] = useState<string>("");
    const [studentId, setStudentId] = useState<string>("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [remarks, setRemarks] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<MessageState | null>(null);
    const [classes, setClasses] = useState<string[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [student, setStudent] = useState<Student>(null);
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

    useEffect(() => {
        fetchClasses();
        fetchCategories();
    }, []);

    const fetchClasses = async (): Promise<void> => {
        try {
            const res = await axiosInstance.get("/api/fee/class");
            setClasses(res.data);
        } catch (err) {
            console.error("Error fetching classes", err);
        }
    };

    const fetchStudentsByClass = async (standard: string): Promise<void> => {
        if (!standard) return;
        try {
            const res = await axiosInstance.get(`/api/fee/student_data/${standard}`);
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students", err);
        }
    };

    const fetchCategories = async (): Promise<void> => {
        try {
            const res = await axiosInstance.get("/api/fee_category");
            setCategories(res.data);
        } catch (err) {
            console.error("Error fetching fee categories", err);
        }
    };


    const fetchStudentPaymentHistory = async (id: string): Promise<void> => {
        if (!id) return;

        setLoadingHistory(true);
        try {
            const res = await axiosInstance.get(`/mobileAPI/students/${id}`);
            setStudent(res.data);
        } catch (err) {
            console.error("Error fetching student payment history", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleClassChange = (value: string): void => {
        setClassId(value);
        setStudentId("");
        fetchStudentsByClass(value);
    };

    const handleStudentChange = (value: string): void => {
        setStudentId(value);
        fetchStudentPaymentHistory(value);
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!amount || !studentId || !categoryId) {
            setMessage({ type: "error", text: "Please fill all required fields." });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await axiosInstance.post("/api/fee/fee-collect", {
                amount: parseInt(amount),
                student_id: studentId,
                category_id: categoryId,
                remarks
            });

            setMessage({ type: "success", text: response.data.message });
            await fetchStudentPaymentHistory(studentId); // Refresh student payment history
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Error collecting fee."
            });
        } finally {
            setLoading(false);
        }
    };


    const getSelectedStudentName = (): string => {
        const student = students.find(s => s.student_id === studentId);
        return student ? `${student.first_name} ${student.last_name} (${student.admission_ID})` : '';
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-6 text-indigo-800 flex items-center gap-2">
                <CreditCard className="text-indigo-600" />
                Fee Collection
            </h1>

            {message && (
                <div className={`p-4 rounded-lg mb-6 text-white flex items-center ${message.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {message.type === "success" ? <CheckCircle className="mr-2" /> : <AlertTriangle className="mr-2" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Payment Form */}
                <Card className="lg:col-span-5 shadow-lg border-none">
                    <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
                        <CardTitle>New Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
                                        <BookOpen className="w-4 h-4 text-indigo-600" />
                                        Class
                                    </label>
                                    <Select onValueChange={handleClassChange} value={classId}>
                                        <SelectTrigger className="border-indigo-200 focus:ring-indigo-500">
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((classItem) => (
                                                <SelectItem key={classItem} value={classItem}>
                                                    {classItem}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
                                        <User className="w-4 h-4 text-indigo-600" />
                                        Student
                                    </label>
                                    <Select onValueChange={handleStudentChange} value={studentId} disabled={!classId}>
                                        <SelectTrigger className="border-indigo-200 focus:ring-indigo-500">
                                            <SelectValue placeholder={classId ? "Select Student" : "Select Class First"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.student_id} value={student.student_id}>
                                                    {student.admission_ID} {student.first_name} {student.last_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
                                        <ClipboardList className="w-4 h-4 text-indigo-600" />
                                        Fee Category
                                    </label>
                                    <Select onValueChange={setCategoryId} value={categoryId}>
                                        <SelectTrigger className="border-indigo-200 focus:ring-indigo-500">
                                            <SelectValue placeholder="Select Fee Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.category_id} value={category.category_id}>
                                                    {category.category_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                        Amount (₹)
                                    </label>
                                    <Input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="border-indigo-200 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Remarks (Optional)</label>
                                    <Input
                                        type="text"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        className="border-indigo-200 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : "Collect Payment"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Student Payment History */}
                <Card className="lg:col-span-7 shadow-lg border-none">
                    <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-5 h-5" />
                            {studentId ? `Payment History: ${getSelectedStudentName()}` : 'Select a Student to View History'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {
                            student && <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Student Fee Details</h2>

                                {/* Outstanding Fees */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-300 rounded-lg">
                                        <thead className="bg-gray-200">
                                        <tr>
                                            <th className="py-2 px-4 border">Category</th>
                                            <th className="py-2 px-4 border">Total Fee</th>
                                            <th className="py-2 px-4 border">Paid</th>
                                            <th className="py-2 px-4 border">Remaining</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {student.studentFee.length > 0 ? (
                                            student.studentFee.map((fee, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="py-2 px-4 border">{fee.category_name}</td>
                                                    <td className="py-2 px-4 border text-green-600 font-medium">
                                                        ₹{fee.fee_amount}
                                                    </td>
                                                    <td className="py-2 px-4 border text-blue-600 font-medium">
                                                        ₹{fee.total_fee_paid}
                                                    </td>
                                                    <td className="py-2 px-4 border text-red-600 font-medium">
                                                        ₹{fee.fee_remaining}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="py-2 px-4 text-center text-gray-500">
                                                    No fee details available.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Payment History */}
                                <h2 className="text-2xl font-semibold text-gray-800 mt-6">Fee Payment History</h2>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-300 rounded-lg">
                                        <thead className="bg-gray-200">
                                        <tr>
                                            <th className="py-2 px-4 border">Category</th>
                                            <th className="py-2 px-4 border">Amount Paid</th>
                                            <th className="py-2 px-4 border">Payment Date</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {student.studentFeeHistory.length > 0 ? (
                                            student.studentFeeHistory.map((history, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="py-2 px-4 border">{history.category_name}</td>
                                                    <td className="py-2 px-4 border text-green-600 font-medium">
                                                        ₹{history.amount}
                                                    </td>
                                                    <td className="py-2 px-4 border">{history.payment_date}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-2 px-4 text-center text-gray-500">
                                                    No payment history available.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FeeCollection;