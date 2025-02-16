import {useEffect, useState} from "react";
import {AxiosError} from "axios";
import {useNavigate} from "react-router-dom";
import axiosInstance from "@/services/axiosInstance.ts";
import Classroom from "@/types/Classroom";
import Role from "@/types/Role";
import classroom from "@/types/Classroom";
import SubjectDetails from "@/types/Subject.ts";


interface FormData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    hire_date: string;
    status: string;
    subject_id: string;
    salary: string;
    adminAccess: boolean;
    role_id: string;
    assignedClass: string;
    teacher_photo: File | null;
    teacher_qualification_certificate: File | null;
}


const AddTeacher = () => {
    const [formData, setFormData] = useState<FormData>({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        hire_date: "",
        status: "Active",
        subject_id: "",
        salary: "",
        adminAccess: false,
        role_id: "",
        assignedClass:'',
        teacher_photo: null as File | null,
        teacher_qualification_certificate: null as File | null,
    });

    const [message, setMessage] = useState("");
    const [subjectDetails, setSubjectDetails] = useState<SubjectDetails[]>([]);
    const [error, setError] = useState("");
    const [classroom, setClassroom] = useState<Classroom[]>([]);
    const [role, setRole] = useState<Role[]>([]);
    const navigation = useNavigate();

    useEffect(() => {
        fetchSubjects();
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const res = await axiosInstance.get("/api/roles");
            setRole(res.data.data);
            const classData = await axiosInstance.get("/mobileAPI/classroom");
            setClassroom(classData.data);
        } catch (e) {
            console.error(e);
            setError("Error in loading the role details");
        }
    };

    const fetchSubjects = async () => {
        await axiosInstance
            .get("/api/subject")
            .then((res) => {
                setSubjectDetails(res.data);
            })
            .catch((e) => {
                console.error(e);
                setError("Error in loading the subject details");
            });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        if (e.target instanceof HTMLInputElement) {
            const {name, value, type, checked, files} = e.target;
            setFormData({
                ...formData,
                [name]:
                    type === "checkbox"
                        ? checked
                        : name === "teacher_photo" || name === "teacher_qualification_certificate"
                            ? files && files[0] // Store the file if it's photo or certificate
                            : name === "subject_id"
                                ? Number(value)
                                : value,
            });
        } else if (e.target instanceof HTMLSelectElement) {
            const {name, value} = e.target;
            console.log(name, value);
            setFormData({
                ...formData,
                [name]: Number(value),
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const formDataToSend = new FormData();


        Object.keys(formData).forEach((key) => {
            const value = formData[key as keyof FormData];
            if (value !== null && value !== "") {
                formDataToSend.append(key, value as string);
            }
        });


        try {
            const response = await axiosInstance.post("/api/teacher", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage(response.data.message);
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone_number: "",
                hire_date: "",
                status: "Active",
                subject_id: "",
                salary: "",
                role_id: "",
                assignedClass:'',
                adminAccess: false,
                teacher_photo: null,
                teacher_qualification_certificate: null,
            });
            navigation('/dashboard/teacher/' + response.data.teacher.teacher_id);
        } catch (err: unknown) {
            console.error("Error in saving the teacher", err);
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message);
            } else {
                setError("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="min-h-screen p-2 bg-gray-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full">
                <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">
                    Add New Teacher
                </h1>

                {message && <div className="text-green-600 mb-4">{message}</div>}
                {error && <div className="text-red-600 mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Row 1 - First Name & Last Name */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex-1">
                            <label className="block font-semibold text-lg">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Row 2 - Email & Phone Number */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Phone Number</label>
                            <input
                                type="text"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Row 3 - Role & Subject */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Role</label>
                            <select
                                name="role_id"
                                value={formData.role_id}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            >
                                <option> select the role </option>
                                {role.map((item: Role, index: number) => (
                                    <option key={index} value={item.role_id}>
                                        {item.role_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Subject</label>
                            <select
                                name="subject_id"
                                value={formData.subject_id}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            >
                                <option> select the subject </option>
                                {subjectDetails.map((item: SubjectDetails, index: number) => (
                                    <option key={index} value={item.subject_id}>
                                        {item.subject_name} - {item.subject_code}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Row 4 - Salary & Hire Date */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Salary</label>
                            <input
                                type="number"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                                min="1"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Hire Date</label>
                            <input
                                type="date"
                                name="hire_date"
                                value={formData.hire_date}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            />
                        </div>
                    </div>

                    {/* Row 5 - Admin Access & Status */}
                    <div className="flex flex-wrap gap-6">

                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Classroom Data</label>
                            <select
                                name="assignedClass"
                                value={formData.assignedClass}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                required
                            >
                                <option> select the classroom </option>
                                {classroom.map((item: classroom , index: number) => (
                                    <option key={index} value={item.classroom_id}>
                                        {item.standard} - {item.section}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            >
                                <option> select the Status </option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 6 - Teacher Photo & Qualification Certificate */}
                    <div className="flex flex-wrap gap-6">
                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Teacher Photo</label>
                            <input
                                type="file"
                                name="teacher_photo"
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block font-semibold text-lg">Qualification Certificate</label>
                            <input
                                type="file"
                                name="teacher_qualification_certificate"
                                onChange={handleChange}
                                className="border rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg mt-4 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                        Add Teacher
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTeacher;
