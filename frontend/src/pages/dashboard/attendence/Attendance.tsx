import AttendanceCard from "@/pages/dashboard/attendence/components/AttendanceCard.tsx";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance.ts";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";

// --- Consolidated Interfaces for better code reuse ---

interface AttendanceData {
    all_students: number;
    attended_students: number;
    all_teachers: number;
    attended_teachers: number;
}

interface Teacher {
    teacher_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
}

// Single, reusable interface for all attendance records
interface AttendanceRecord {
    attendance_id: number;
    teacher_id: number;
    school_id: number;
    attendDate: string;
    attendTime: string;
    status: string;
    submitted_at: string;
    // The property name 'Teacher' is kept to match the API response
    Teachers: Teacher;
}

function Attendance(): JSX.Element {
    const [attendanceData, setAttendanceData] = useState<AttendanceData>({
        all_students: 0,
        attended_students: 0,
        all_teachers: 0,
        attended_teachers: 0,
    });

    const [pendingRequests, setPendingRequests] = useState<AttendanceRecord[]>([]);
    const [attendedToday, setAttendedToday] = useState<AttendanceRecord[]>([]);

    // Separate loading states for different UI sections
    const [pendingLoading, setPendingLoading] = useState<boolean>(false);
    const [attendedLoading, setAttendedLoading] = useState<boolean>(false);
    const [actionLoading, setActionLoading] = useState<boolean>(false);


    // Fetch all necessary data on component mount
    useEffect(() => {
        fetchAttendanceData();
        fetchPendingRequests();
        fetchAttendedToday();
    }, []);

    async function fetchAttendanceData(): Promise<void> {
        try {
            const response = await axiosInstance.get<{details: AttendanceData}>('/api/get-attendance-data');
            if (response?.data?.details) {
                setAttendanceData(response.data.details);
            }
        } catch (error:any) {
            console.error('Error fetching attendance data:', error);
        }
    }

    async function fetchPendingRequests(): Promise<void> {
        try {
            setPendingLoading(true);
            const response = await axiosInstance.get<AttendanceRecord[]>('/api/attendance/admin/pending');
            setPendingRequests(response.data || []);
        } catch (error:any) {
            console.error('Error fetching pending requests:', error);
            // If API returns 404 (Not Found), it means no pending requests exist.
            if (error.response?.status === 404) {
                setPendingRequests([]);
            }
        } finally {
            setPendingLoading(false);
        }
    }

    async function fetchAttendedToday(): Promise<void> {
        try {
            setAttendedLoading(true);
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const response = await axiosInstance.get<AttendanceRecord[]>(`/api/attendance/admin/attended-today?date=${today}`);
            setAttendedToday(response.data || []);
        } catch (error:any) {
            console.error('Error fetching attended today:', error);
            if (error.response?.status === 404) {
                setAttendedToday([]);
            }
        } finally {
            setAttendedLoading(false);
        }
    }

    async function handleApprove(attendanceId: number): Promise<void> {
        setActionLoading(true);
        try {
            await axiosInstance.put(`/api/attendance/admin/approve/${attendanceId}`);
            // Refetch all related data to ensure UI is consistent
            await Promise.all([
                fetchPendingRequests(),
                fetchAttendedToday(),
                fetchAttendanceData()
            ]);
        } catch (error:any) {
            console.error('Error approving attendance:', error);
        } finally {
            setActionLoading(false);
        }
    }

    async function handleReject(attendanceId: number): Promise<void> {
        setActionLoading(true);
        try {
            await axiosInstance.put(`/api/attendance/admin/reject/${attendanceId}`, {
                attendance_id: attendanceId
            });
            // Refetch pending requests to update the list
            await fetchPendingRequests();
        } catch (error:any) {
            console.error('Error rejecting attendance:', error.response?.status);
        } finally {
            setActionLoading(false);
        }
    }

    // --- Helper Functions for Formatting ---

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string): string => {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    return(
        <div className={"w-full space-y-6"}>
            {/* --- Top Attendance Cards --- */}
            <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"}>
                <AttendanceCard title={"Total Students"} count={attendanceData.all_students} color_class={"blue"}/>
                <AttendanceCard title={"Attended Students"} count={attendanceData.attended_students} color_class={"red"}/>
                <AttendanceCard title={"Total Teachers"} count={attendanceData.all_teachers} color_class={"green"}/>
                <AttendanceCard title={"Attended Teachers"} count={attendanceData.attended_teachers} color_class={"yellow"}/>
            </div>

            {/* --- Pending Attendance Requests Table --- */}
            <div>
                <h3 className="text-xl font-semibold mb-3">Pending Attendance Requests</h3>
                {pendingLoading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 rounded-lg bg-gray-50">No pending attendance requests found.</div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-left text-gray-900">Teacher ID</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-left text-gray-900">Teacher Name</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-left text-gray-900">Attend Date</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-left text-gray-900">Attend Time</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-left text-gray-900">Status</th>
                                <th className="whitespace-nowrap px-4 py-3 font-medium text-center text-gray-900">Action</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {pendingRequests.map((request) => (
                                <tr key={request.attendance_id}>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{request.Teachers?.teacher_id ?? 'N/A'}</td>
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                                        {`${request.Teachers?.first_name ?? 'Unknown'} ${request.Teachers?.last_name ?? 'Teacher'}`}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{formatDate(request.attendDate)}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{formatTime(request.attendTime)}</td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                            <span className="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold capitalize">
                                                {request.status}
                                            </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 space-x-2 text-center">
                                        <button
                                            className={"p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"}
                                            onClick={() => handleApprove(request.attendance_id)}
                                            disabled={actionLoading}
                                            aria-label="Approve"
                                        >
                                            <TiTick size={18} />
                                        </button>
                                        <button
                                            className={"p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"}
                                            onClick={() => handleReject(request.attendance_id)}
                                            disabled={actionLoading}
                                            aria-label="Reject"
                                        >
                                            <RxCross2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- Attended Today Section --- */}
            <div>
                <h3 className="text-xl font-semibold mb-3">Teachers Who Attended Today</h3>
                {attendedLoading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : attendedToday.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 rounded-lg bg-gray-50">No teachers have been marked as attended today.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {attendedToday.map((record) => (
                            <div key={record.attendance_id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-800">
                                        {`${record.Teachers?.first_name ?? 'Unknown'} ${record.Teachers?.last_name ?? 'Teacher'}`}
                                    </h4>
                                    <span className="inline-block px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold capitalize">
                                        {record.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Teacher ID:</strong> {record.Teachers?.teacher_id ?? 'N/A'}</p>
                                    <p><strong>Email:</strong> {record.Teachers?.email ?? 'N/A'}</p>
                                    <p><strong>Phone:</strong> {record.Teachers?.phone_number ?? 'N/A'}</p>
                                    <p><strong>Attend Time:</strong> {formatTime(record.attendTime)}</p>
                                    <p><strong>Date:</strong> {formatDate(record.attendDate)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Attendance;