import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance.ts";

interface Student {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    school_id: string;
}

interface Classroom {
    classroom_id: string;
    standard: string;
    section: string;
}

const Students = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassroom, setSelectedClassroom] = useState("");
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance
            .get("/mobileAPI/getClassroomDetails")
            .then((res) => {
                setClassrooms(res.data);
            })
            .catch((e) => {
                console.error("Error in getting the details:", e);
            });
    }, []);

    const fetchStudents = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedClassroom) {
            alert("Please select a classroom.");
            return;
        }

        setLoading(true);

        axiosInstance
            .get(`/mobileAPI/getStudent/${selectedClassroom}`)
            .then((res) => {
                setStudents(res.data);
            })
            .catch((e) => {
                console.error("Error fetching students:", e);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleEdit = (id: string) => {
        navigate(`/dashboard/students/${id}`);
    };

    return (
        <div className="p-5">
            <h2 className="text-3xl font-bold text-center mb-5">Manage Students</h2>

            <form
                onSubmit={fetchStudents}
                className="bg-white shadow-md rounded-lg p-5 max-w-md mx-auto space-y-4"
            >
                <label htmlFor="classroom" className="block text-gray-700 font-medium">
                    Select a Classroom:
                </label>
                <select
                    id="classroom"
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    <option value="">-- Select a Classroom --</option>
                    {classrooms.map((classroom) => (
                        <option key={classroom.classroom_id} value={classroom.classroom_id}>
                            {classroom.standard}-{classroom.section}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
                >
                    Get Students
                </button>
            </form>

            {/* Students List */}
            <div className="mt-8">
                {loading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                    </div>
                ) : students.length > 0 ? (
                    <div className="space-y-2">
                        {students.map((student) => (
                            <div
                                key={student.student_id}
                                className="bg-gray-100 p-3 rounded-lg shadow-sm"
                            >
                                <p className="font-medium text-gray-700">
                                    {student.first_name} {student.last_name} (ID: {student.student_id})
                                </p>
                                <p className="text-sm text-gray-500">
                                    Email: {student.email} | Phone: {student.phone_number}
                                </p>
                                <button
                                    onClick={() => handleEdit(student.school_id)}
                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg transition"
                                >
                                    Edit
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No students found. Select a classroom to see details.</p>
                )}
            </div>
        </div>
    );
};

export default Students;
