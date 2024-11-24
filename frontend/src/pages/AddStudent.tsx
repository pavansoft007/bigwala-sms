import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance.ts";

const AddStudent = () => {
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        email: "",
        phone_number: "",
        address: "",
        enrollment_date: "",
        standard: "",
        section: "",
    });

    const [standards, setStandards] = useState<string[]>([]);
    const [sections, setSections] = useState<string[]>([]);
    const [selectedStandard, setSelectedStandard] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch standards on component mount
    useEffect(() => {
        const fetchStandards = async () => {
            try {
                const response = await axiosInstance.get("/mobileAPI/standard");
                setStandards(response.data);
            } catch (e) {
                console.error("Error fetching standards:", e);
                setError("Failed to load standards. Please try again later.");
            }
        };

        fetchStandards();
    }, []);

    const handleStandardChange = async (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const selected = event.target.value;
        setSelectedStandard(selected);
        setFormData({ ...formData, standard: selected });

        if (selected) {
            try {
                const response = await axiosInstance.get("/mobileAPI/section?standard="+selected);
                setSections(response.data);
            } catch (e) {
                console.error("Error fetching sections:", e);
                setError("Failed to load sections. Please try again later.");
            }
        } else {
            setSections([]);
            setSelectedSection("");
        }
    };

    const handleSectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = event.target.value;
        setSelectedSection(selected);
        setFormData({ ...formData, section: selected });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        try {
            const response = await axiosInstance.post("/api/student", formData);
            setMessage("Student added successfully!");
            setFormData({
                first_name: "",
                last_name: "",
                date_of_birth: "",
                gender: "",
                email: "",
                phone_number: "",
                address: "",
                enrollment_date: "",
                standard: "",
                section: "",
            });
            setSelectedStandard("");
            setSelectedSection("");
            setSections([]);
        } catch (err: any) {
            setError(err.response?.data?.message || "An error occurred while adding the student.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
            <h2 className="text-2xl font-bold mb-6">Add Student</h2>

            {message && <p className="text-green-500 mb-4">{message}</p>}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
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
                        required
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
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
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
                        required
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
                    <label className="block text-sm font-medium text-gray-700">Class</label>
                    <select
                        name="standard"
                        value={selectedStandard}
                        onChange={handleStandardChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select Class</option>
                        {standards.map((standard) => (
                            <option key={standard} value={standard}>
                                {standard}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Section</label>
                    <select
                        name="section"
                        value={selectedSection}
                        onChange={handleSectionChange}
                        required
                        disabled={!selectedStandard}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select Section</option>
                        {sections.map((section) => (
                            <option key={section} value={section}>
                                {section}
                            </option>
                        ))}
                    </select>
                </div>


                <div>
                    <label className="block text-sm font-medium text-gray-700">Enrollment Date</label>
                    <input
                        type="date"
                        name="enrollment_date"
                        value={formData.enrollment_date}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>


                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                    Add Student
                </button>
            </form>
        </div>
    );
};

export default AddStudent;
