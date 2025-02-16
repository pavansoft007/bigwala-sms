import {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import axiosInstance from "@/services/axiosInstance.ts";
import axios from "axios";
import Classroom from "@/types/Classroom.ts";

const StudentDetails = () => {
    const {id} = useParams();
    const [formData, setFormData] = useState({
        admission_ID: '',
        student_id: "",
        mother_phone_number: "",
        mother_name: "",
        father_name: "",
        caste: "",
        status: "",
        student_photo: "",
        father_photo: "",
        classroom_id: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        email: "",
        phone_number: "",
        address: "",
        enrollment_date: "",
        assginedClassroom: "",
        standard: '',
        section: ''
    });

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const getStudentDetails = () => {
        axiosInstance
            .get(`/mobileAPI/students/${id}`)
            .then((res) => {
                setFormData(res.data);
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
        const { name, type, value } = e.target;

        if (type === "file") {
            const fileInput = e.target as HTMLInputElement;
            setFormData((prevData) => ({
                ...prevData,
                [name]: fileInput.files ? fileInput.files[0] : null,
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        const formDataToSend = new FormData();
        Object.keys(formData).forEach((key) => {
            const value = (formData as any)[key];
            if (value !== null && value !== undefined) {
                formDataToSend.append(key, value);
            }
        });


        try {
            await axiosInstance.put(`/api/student/${id}`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
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
        <div className="container mx-auto p-6">
            <div className="text-center mb-8 flex items-center ml-2 space-x-4">
                <img
                    src={formData.student_photo ? `${import.meta.env.VITE_API_URL}/staticFiles/photos/${formData.student_photo}`
                        : '/blank-profile-picture.png'}
                    alt="student details"
                    className="w-32 h-32 rounded-full object-cover"
                />
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800">
                        {formData.first_name} {formData.last_name}
                    </h1>
                    <p className="text-lg text-gray-600">Student Details</p>
                </div>
            </div>


            <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="text-lg font-medium">
                            <span className="font-semibold">Teacher ID:</span>{" "}
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="admission_ID"
                                    value={formData?.admission_ID || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded-md w-full"
                                />
                            ) : (
                                formData.admission_ID
                            )}
                        </div>
                        <div className="text-lg font-medium">
                            <span className="font-semibold">Email:</span>{" "}
                            {isEditMode ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={formData?.email || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded-md w-full"
                                />
                            ) : (
                                formData.email
                            )}
                        </div>
                        <div className="text-lg font-medium">
                            <span className="font-semibold">Phone:</span>{" "}
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="phone_number"
                                    value={formData?.phone_number || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded-md w-full"
                                />
                            ) : (
                                formData.phone_number
                            )}
                        </div>
                        <div className="text-lg font-medium">
                            <span className="font-semibold">Assigned Class:</span>{" "}
                            {isEditMode ? (
                                <select
                                    name="assginedClassroom"
                                    value={formData?.assginedClassroom || ""}
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
                            ) : (
                                `${formData.standard} - ${formData.section}`
                            )}
                        </div>
                        <div className="text-lg font-medium">
                            <span className="font-semibold">Status:</span>{" "}
                            {isEditMode ? (
                                <input
                                    type="text"
                                    name="status"
                                    value={formData?.status || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded-md w-full"
                                />
                            ) : (
                                formData.status
                            )}
                        </div>
                        <div className="text-lg font-medium">
                            <span className="font-semibold">Joined ON : </span>
                            {isEditMode ? (
                                <input
                                    type="date"
                                    name="enrollment_date"
                                    value={formData?.enrollment_date || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded-md w-full"
                                />
                            ) : (
                                formData.enrollment_date
                            )}
                        </div>
                        <div className="text-lg font-medium">
                            <span className="font-semibold">Date of Birth : </span>
                            {isEditMode ? (
                                <input
                                    type="date"
                                    name="enrollment_date"
                                    value={formData?.date_of_birth || ""}
                                    onChange={handleChange}
                                    className="border p-2 rounded-md w-full"
                                />
                            ) : (
                                formData.date_of_birth
                            )}
                        </div>
                    </div>

                    {/* Advanced Information */}
                    <div className="space-y-4">
                        {
                            isEditMode && <div className="text-lg font-medium">
                                <span className="font-semibold">Teacher Photo:</span>{" "}
                                <input
                                    type="file"
                                    name="student_photo"
                                    accept="image/*"
                                    onChange={(e) => handleChange(e)}
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                        }

                        <div className="text-lg font-medium">
                            <span className="font-semibold">Father photo:</span>{" "}
                            {isEditMode ? (
                                <input
                                    type="file"
                                    name="father_photo"
                                    accept="application/pdf,image/*"
                                    onChange={(e) => handleChange(e)}
                                    className="border p-2 rounded-md w-full"
                                />
                            ) : (
                                formData.father_photo && (
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/staticFiles/photos/${formData.father_photo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500"
                                    >
                                        View father photo
                                    </a>
                                )
                            )}
                        </div>

                    </div>
                </div>
                <div className="flex flex-row-reverse">
                    {/* Save Button */}
                    {isEditMode && (
                        <div className="text-right mx-4">
                            <button
                                onClick={handleSubmit}
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                    <div className="text-right">
                        <button
                            onClick={() => {
                                setIsEditMode((prev) => !prev)
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                        >
                            {isEditMode ? "Cancel Edit" : "Edit Details"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
