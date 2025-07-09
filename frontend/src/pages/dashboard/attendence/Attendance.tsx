import AttendanceCard from "@/pages/dashboard/attendence/components/AttendanceCard.tsx";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance.ts";
import { TiTick } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";

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

interface PendingAttendanceRequest {
    attendance_id: number;
    teacher_id: number;
    school_id: number;
    attendDate: string;
    attendTime: string;
    status: string;
    submitted_at: string;
    Teacher: Teacher;
}

interface AttendedTodayRequest {
    attendance_id: number;
    teacher_id: number;
    school_id: number;
    attendDate: string;
    attendTime: string;
    status: string;
    submitted_at: string;
    Teacher: Teacher;
}

function Attendance(): JSX.Element {
    const [attendanceData, setAttendanceData] = useState<AttendanceData>({
        all_students: 0,
        attended_students: 0,
        all_teachers: 0,
        attended_teachers: 0,
    });

    const [pendingRequests, setPendingRequests] = useState<PendingAttendanceRequest[]>([]);
    const [attendedToday, setAttendedToday] = useState<AttendedTodayRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [attendedLoading, setAttendedLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchAttendanceData();
        fetchPendingRequests();
        fetchAttendedToday();
    }, []);

    async function fetchAttendanceData(): Promise<void> {
        try {
            const response = await axiosInstance.get<{details: AttendanceData}>('/api/get-attendance-data');
            if (response && response.data) {
                setAttendanceData(response.data.details);
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    }

    async function fetchPendingRequests(): Promise<void> {
        try {
            setLoading(true);
            const response = await axiosInstance.get<PendingAttendanceRequest[]>('/api/attendance/admin/pending');
            if (response && response.data) {
                setPendingRequests(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching pending requests:', error);
            // Handle case where no pending requests are found
            if (error.response?.status === 404) {
                setPendingRequests([]);
            }
        } finally {
            setLoading(false);
        }
    }

    async function fetchAttendedToday(): Promise<void> {
        try {
            setAttendedLoading(true);
            const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
            const response = await axiosInstance.get<AttendedTodayRequest[]>(`/api/attendance/admin/attended-today?date=${today}`);
            if (response && response.data) {
                setAttendedToday(response.data);
            }
        } catch (error: any) {
            console.error('Error fetching attended today:', error);
            // Handle case where no attendance found for today
            if (error.response?.status === 404) {
                setAttendedToday([]);
            }
        } finally {
            setAttendedLoading(false);
        }
    }

    async function handleApprove(attendanceId: number): Promise<void> {
        try {
            setLoading(true);
            const response = await axiosInstance.put(`/api/attendance/admin/approve/${attendanceId}`);
            if (response.status === 200) {
                // Remove the approved request from the pending list
                setPendingRequests(prev => prev.filter(req => req.attendance_id !== attendanceId));
                // Refresh attendance data
                await fetchAttendanceData();
                console.log('Attendance approved successfully');
            }
        } catch (error) {
            console.error('Error approving attendance:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleReject(attendanceId: number): Promise<void> {
        try {
            setLoading(true);
            const response = await axiosInstance.put(`/api/attendance/admin/reject/${attendanceId}`, {
                attendance_id: attendanceId
            });
            if (response.status === 200) {
                // Remove the rejected request from the pending list
                setPendingRequests(prev => prev.filter(req => req.attendance_id !== attendanceId));
                console.log('Attendance rejected successfully');
            }
        } catch (error:any) {
            console.error('Error rejecting attendance:', error.response?.status);
        } finally {
            setLoading(false);
        }
    }

    const formatTime = (timeString: string): string => {
        // Format time string to readable format (HH:MM:SS format)
        return timeString;
    };

    const formatDate = (dateString: string): string => {
        // Format date string to readable format
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return(
        <div className={"w-100"}>
            <div className={"flex gap-4 w-100 "}>
                <AttendanceCard title={"Total Students"} count={attendanceData.all_students} color_class={"blue"}/>
                <AttendanceCard title={"Attended Students"} count={attendanceData.attended_students}
                                color_class={"red"}/>
                <AttendanceCard title={"Total Teachers"} count={attendanceData.all_teachers} color_class={"green"}/>
                <AttendanceCard title={"Attended Teachers"} count={attendanceData.attended_teachers}
                                color_class={"yellow"}/>
            </div>

            <hr/>

            <div className="mt-4">
                <h3 className="text-lg font-semibold mb-3">Pending Attendance Requests</h3>

                {loading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : pendingRequests.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No pending attendance requests</div>
                ) : (
                    <table className="table-auto w-100">
                        <thead>
                        <tr>
                            <th className="px-4 py-2 border">Teacher ID</th>
                            <th className="px-4 py-2 border">Teacher Name</th>
                            <th className="px-4 py-2 border">Attend Date</th>
                            <th className="px-4 py-2 border">Attend Time</th>
                            <th className="px-4 py-2 border">Status</th>
                            <th className="px-4 py-2 border">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pendingRequests.map((request) => (
                            <tr key={request.attendance_id}>
                                <td className="px-4 py-2 border">{request.Teacher.teacher_id}</td>
                                <td className="px-4 py-2 border">
                                    {request.Teacher.first_name} {request.Teacher.last_name}
                                </td>
                                <td className="px-4 py-2 border">{formatDate(request.attendDate)}</td>
                                <td className="px-4 py-2 border">{formatTime(request.attendTime)}</td>
                                <td className="px-4 py-2 border">
                                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2 border">
                                    <button
                                        className={"btn btn-sm btn-primary p-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"}
                                        onClick={() => handleApprove(request.attendance_id)}
                                        disabled={loading}
                                    >
                                        <TiTick />
                                    </button>
                                    <button
                                        className={"btn btn-sm btn-secondary p-3 bg-red-600 text-white rounded hover:bg-red-700 ms-3 disabled:opacity-50"}
                                        onClick={() => handleReject(request.attendance_id)}
                                        disabled={loading}
                                    >
                                        <RxCross2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Attended Today Section */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Teachers Who Attended Today</h3>

                {attendedLoading ? (
                    <div className="text-center py-4">Loading...</div>
                ) : attendedToday.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No teachers attended today</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {attendedToday.map((teacher) => (
                            <div key={teacher.attendance_id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-800">
                                        {teacher.Teacher.first_name} {teacher.Teacher.last_name}
                                    </h4>
                                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm">
                                        {teacher.status}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><strong>Teacher ID:</strong> {teacher.Teacher.teacher_id}</p>
                                    <p><strong>Email:</strong> {teacher.Teacher.email}</p>
                                    <p><strong>Phone:</strong> {teacher.Teacher.phone_number}</p>
                                    <p><strong>Attend Time:</strong> {formatTime(teacher.attendTime)}</p>
                                    <p><strong>Date:</strong> {formatDate(teacher.attendDate)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <hr className="my-6"/>

            {/* Pending Requests Section */}
        </div>
    )
}

export default Attendance;