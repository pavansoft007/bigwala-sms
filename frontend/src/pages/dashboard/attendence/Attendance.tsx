import AttendanceCard from "@/pages/dashboard/attendence/components/AttendanceCard.tsx";
import {useEffect, useState} from "react";
import axiosInstance from "@/services/axiosInstance.ts";
import { TiTick } from "react-icons/ti";
import {RxCross2} from "react-icons/rx";


interface attendanceData {
    all_students: number;
    attended_students: number;
    all_teachers: number;
    attended_teachers: number
}
function Attendance() {
    const [attendanceData, setAttendanceData] = useState({
        all_students: 0,
        attended_students: 0,
        all_teachers: 0,
        attended_teachers: 0,
    })

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    async function fetchAttendanceData() {
        const response = await axiosInstance.get<{details: attendanceData}>('/api/get-attendance-data');
        if (response && response.data) {
            setAttendanceData(response.data.details);
        }
    }
    console.log(attendanceData);
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
            <table className="table-auto w-100 mt-4">
                <thead>
                <tr>
                    <th>Teacher ID</th>
                    <th>Teacher Name</th>
                    <th>In Time</th>
                    <th>Out Time</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>001</td>
                    <td>Sample</td>
                    <td>08:00 AM</td>
                    <td>05:00 PM</td>
                    <td>
                        <button className={"btn btn-sm btn-primary p-3 bg-green-600"}>
<TiTick />
                        </button>
                        <button className={"btn btn-sm btn-secondary p-3 bg-red-600 ms-3"}>
                            <RxCross2 />
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>

        </div>
    )
}

export default Attendance;