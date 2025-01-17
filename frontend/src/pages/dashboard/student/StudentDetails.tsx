import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../services/axiosInstance.ts";
import axios from "axios";
interface Classroom {
    classroom_id: string;
    standard: string;
    section: string;
}

// interface Student {
//     student_id: string;
//     first_name: string;
//     last_name: string;
//     email: string;
//     phone_number: string;
//     school_id: string;
// }

const StudentDetails = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        email: "",
        phone_number: "",
        address: "",
        enrollment_date: "",
        assginedClassroom: "",
        standard:'',
        section:''
    });

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [studentClassroomDetails,setStudentClassroomDetails]=useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const getStudentDetails=()=>{
        axiosInstance
            .get(`/mobileAPI/students/${id}`)
            .then((res) => {
                setFormData(res.data);
                console.log(formData);
                if(res.data.assginedClassroom){
                    setStudentClassroomDetails(res.data.standard +'-'+ res.data.section);
                }
            })
            .catch((e) => {
                console.error("Error fetching student details:", e);
                setError("Failed to load student details.");
            });
    };

    useEffect(() => {
        getStudentDetails();
    }, [id]);


    useEffect(() => {
        axiosInstance
            .get("/mobileAPI/classroom")
            .then((res) => {
                setClassrooms(res.data);
            })
            .catch((e) => {
                console.error("Error fetching classrooms:", e);
            });
    }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);


        try {
            await axiosInstance.put(`/api/student/${id}`, formData);
            setMessage("Student details updated successfully!");
            getStudentDetails();
            setIsEditMode(false);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Failed to update student details.");
            } else {
                console.error("Unexpected error updating student:", err);
                setError("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Student Details</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            {message && <p className="text-green-500 mb-4">{message}</p>}

            {!isEditMode ? (
                <div>
                    <div className="mb-4">
                        <strong>First Name:</strong> {formData.first_name}
                    </div>
                    <div className="mb-4">
                        <strong>Last Name:</strong> {formData.last_name}
                    </div>
                    <div className="mb-4">
                        <strong>Date of Birth:</strong> {formData.date_of_birth}
                    </div>
                    <div className="mb-4">
                        <strong>Gender:</strong> {formData.gender}
                    </div>
                    <div className="mb-4">
                        <strong>Email:</strong> {formData.email}
                    </div>
                    <div className="mb-4">
                        <strong>Phone Number:</strong> {formData.phone_number}
                    </div>
                    <div className="mb-4">
                        <strong>Address:</strong> {formData.address}
                    </div>
                    <div className="mb-4">
                        <strong>Classroom:</strong> {studentClassroomDetails || 'not assigned'}
                    </div>

                    <button
                        onClick={() => setIsEditMode(true)}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                        Edit
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Classroom</label>
                        <select
                            name="assginedClassroom"
                            value={formData.assginedClassroom}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Select Classroom</option>
                            {classrooms.map((classroom) => (
                                <option key={classroom.classroom_id} value={classroom.classroom_id}>
                                    {classroom.standard} - {classroom.section}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditMode(false)}
                            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default StudentDetails;
