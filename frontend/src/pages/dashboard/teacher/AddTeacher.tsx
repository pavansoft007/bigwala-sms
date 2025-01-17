import {useEffect, useState} from "react";
import {AxiosError} from "axios";
import axiosInstance from "@/services/axiosInstance.ts";

interface SubjectDetails{
    subject_id:number,
    subject_name:string,
    subject_code:string
}

const AddTeacher = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        hire_date: "",
        status: "Active",
        subject_id: "",
        salary: "",
        adminAccess: false,
    });

    const [message, setMessage] = useState("");
    const [subjectDetails,setSubjectDetails]=useState<SubjectDetails[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects=async ()=>{
        await axiosInstance.get('/api/subject').then((res)=>{
            setSubjectDetails(res.data);
        }).catch((e)=>{
            console.error(e);
            setError('error in loading the subject details');
        })
    }

    const handleChange = (e:React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if(e.target instanceof HTMLInputElement){
            const { name, value, type, checked } = e.target;
            setFormData({
                ...formData,
                [name]: type === "checkbox" ? checked : name === "subject_id" ? Number(value) : value,
            });
        }else if(e.target instanceof HTMLSelectElement){
            const { name, value } = e.target;
            setFormData({
                ...formData,
                [name]:  Number(value),
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await axiosInstance.post("/api/teacher", formData);
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
                adminAccess: false,
            });
        } catch (err:unknown) {
            console.error("error in saving the teacher",err)
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message);
            } else {
                setError("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="bg-white rounded shadow-xl p-8">
            <h1 className="text-xl font-extrabold mb-4">Add New Teacher</h1>

            {message && <div className="text-green-600 mb-4">{message}</div>}
            {error && <div className="text-red-600 mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-bold">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block font-bold">Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block font-bold">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block font-bold">Phone Number</label>
                    <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block font-bold">Hire Date</label>
                    <input
                        type="date"
                        name="hire_date"
                        value={formData.hire_date}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full"
                        required
                    />
                </div>

                <div>
                    <label className="block font-bold">Subject ID</label>
                    <select
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleChange}
                        required
                        aria-placeholder="select the subject ID"
                        className="border rounded px-3 py-2 w-full"
                    >
                        { subjectDetails.map((item:SubjectDetails,index:number)=> {
                            return <option key={index} value={item.subject_id} >{item.subject_name} - {item.subject_code}</option>
                        })

                        }

                    </select>
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    name="subject_id"*/}
                    {/*    value={formData.subject_id}*/}
                    {/*    onChange={handleChange}*/}
                    {/*    className="border rounded px-3 py-2 w-full"*/}
                    {/*    required*/}
                    {/*/>*/}
                </div>

                <div>
                    <label className="block font-bold">Salary</label>
                    <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full"
                        required
                        min="1"
                    />
                </div>

                <div>
                    <label className="block font-bold">Admin Access</label>
                    <input
                        type="checkbox"
                        name="adminAccess"
                        checked={formData.adminAccess}
                        onChange={handleChange}
                        className="mr-2"
                    />
                    Grant admin access
                </div>

                <div>
                    <label className="block font-bold">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 w-full"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Teacher
                </button>
            </form>
        </div>
    );
};

export default AddTeacher;
