import {
    AlertTriangle,
    BookOpen,
    Calendar,
    CheckCircle,
    ClipboardList,
    CreditCard,
    History,
    Loader,
    User
} from "lucide-react";
import {useState} from "react";
import {CardHeader, CardTitle,CardContent,Card} from "@/components/ui/card.tsx";
import axiosInstance from "@/services/axiosInstance.ts";
import Student from "@/types/Student.ts";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";


interface MessageState {
    type: "success" | "error";
    text: string;
}

interface New_fee{
    standard:number,
    category_id:number,
    student_id:number,
    amount:number,
    remarks:string
}

const CollectFee = () => {
    const [message, setMessage] = useState<MessageState>();
    const [students,setStudents]=useState<Student[]>([]);
    const [student,setStudent]=useState<Student>();
    const [loading, setLoading] = useState<boolean>(false);
    const [newFee,setNewFee]=useState<New_fee>({
        standard:0,
        category_id:0,
        student_id:0,
        amount:0,
        remarks:''
    });


    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setNewFee((prevFee) => ({
            ...prevFee,
            [name]: name === 'standard' || name === 'student_id' || name === 'category_id' || name === 'amount'
                ? parseInt(value) || 0
                : value
        }));


        if (name === 'standard') {
            setNewFee((prevFee) => ({
                ...prevFee,
                student_id: 0,
                category_id: 0,
                amount: 0,
                remarks: ''
            }));
            fetchStudentsByClass(value);
        }else if(name === 'student_id'){
            setNewFee((prevFee) => ({
                ...prevFee,
                category_id: 0,
                amount: 0,
                remarks: ''
            }));
            fetchStudentDetails(value);
        }
    };

    const fetchStudentsByClass = async (standard: string): Promise<void> => {
        if (!standard) return;
        try {
            const res = await axiosInstance.get<Student[]>(`/api/fee/student_data/${standard}`);
            setStudents(res.data);
        } catch (err) {
            console.error("Error fetching students", err);
        }
    };

    const fetchStudentDetails=async (student_id:string):Promise<void> =>{
        if(!student_id)return ;
        try {
            const res = await axiosInstance.get<Student>(`/mobileAPI/students/${student_id}`);
            setStudent(res.data);
        } catch (err) {
            console.error("Error fetching students", err);
        }
    }

    const handleSubmit=async (e: React.FormEvent)=>{
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post<{message:string}>("/api/fee/fee-collect",{
                ...newFee,
                payment_mode:'cash'
            });
            await fetchStudentDetails(newFee.student_id.toString());
            setMessage({ type: "success", text: response.data.message });
        } catch (err: any) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Error collecting fee."
            });
        } finally {
            setLoading(false);
        }

    }

    const getSelectedStudentName = (): string => {
        const selectedStudent = students.find(s => s.student_id === String(newFee.student_id));
        return selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.admission_ID})` : '';
    };



    return <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800 flex items-center gap-2">
            <CreditCard className="text-indigo-600"/>
            Fee Collection
        </h1>

        {message && (
            <div
                className={`p-4 rounded-lg mb-6 text-white flex items-center ${message.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                {message.type === "success" ? <CheckCircle className="mr-2"/> : <AlertTriangle className="mr-2"/>}
                {message.text}
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-5 shadow-lg border-none">
                <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
                    <CardTitle>New Payment</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} >
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    Class
                                </label>
                                <select
                                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newFee.standard}
                                    name="standard"
                                    onChange={handleFormChange}
                                >
                                    <option value="">Select Class</option>
                                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    Student
                                </label>
                                <select
                                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newFee.student_id}
                                    name="student_id"
                                    onChange={handleFormChange}
                                >
                                    <option value="">Select Student</option>
                                    {
                                        students.map((item)=>{
                                            return <option value={item.student_id} >{item.admission_ID}- {item.first_name} {item.last_name}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
                                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                                    Fee category
                                </label>
                                <select
                                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newFee.category_id}
                                    name="category_id"
                                    onChange={handleFormChange}
                                >
                                    <option value="">Select Categories</option>
                                    {
                                        student && student.studentFee.map((item)=>{
                                            return <option value={item.category_id} >{item.category_name}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1 flex items-center gap-1">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                    Amount (₹)
                                </label>
                                <Input
                                    type="number"
                                    name="amount"
                                    value={newFee.amount}
                                    onChange={handleFormChange}
                                    className="border-indigo-200 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Remarks (Optional)</label>
                                <Input
                                    type="text"
                                    name="remarks"
                                    value={newFee.remarks}
                                    onChange={handleFormChange}
                                    className="border-indigo-200 focus:ring-indigo-500"
                                />
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
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card className="lg:col-span-7 shadow-lg border-none">
                <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {student ? `Payment History: ${getSelectedStudentName()}` : 'Select a Student to View History'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <Loader className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : student ? (
                        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
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
                    ) : student ? (
                        <div className="text-center p-8 text-gray-500">
                            Loading student data...
                        </div>
                    ) : (
                        <div className="text-center p-8 text-gray-500">
                            Select a student to view payment history.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

    </div>
}
export default CollectFee;