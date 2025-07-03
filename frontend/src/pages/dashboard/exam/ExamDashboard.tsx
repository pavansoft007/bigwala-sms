import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axiosInstance from "@/services/axiosInstance";
import { Exam, ExamStatus } from "@/types/Exam";
import {useSelector} from "react-redux";
import Classroom from "@/types/Classroom.ts";
import formatDateToInput from "@/services/formatDateToInput.ts";
import {RootState} from "@/stores/store.ts";

const ExamDashboard = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const classrooms = useSelector((state: RootState) => state.classrooms);
    const [editMode, setEditMode] = useState<null | number>(null);


    const [formData, setFormData] = useState<Omit<Exam, "exam_id" | "school_id" | "timetable_photo"> & {
        timetable_photo?: File | null;
    }>({
        classroom_id:null,
        standard:'',
        section:'',
        exam_name: "",
        class_id: 0,
        start_date: "",
        end_date: "",
        status: ExamStatus.Scheduled,
        timetable_photo: null
    });

    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        axiosInstance.get("/api/exam").then((res) => {
            if (res.data) {
                const data = Array.isArray(res.data) ? res.data : [res.data];
                setExams(data);
            }
        });
    }, [refresh]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "class_id" ? parseInt(value) : value
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFormData((prev) => ({
                ...prev,
                timetable_photo: e.target.files![0]
            }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "timetable_photo" && value instanceof File) {
                data.append("timetable_photo", value);
            } else {
                data.append(key, String(value));
            }
        });

        try {
            if (editMode) {
                await axiosInstance.put(`/api/exam/${editMode}`, data);
            } else {
                await axiosInstance.post("/api/exam", data);
            }
            alert(editMode ? "Exam edited successfully" : "Exam created successfully" );
            setEditMode(null);
            setFormData({
                classroom_id:null,
                standard:'',
                section:'',
                exam_name: "",
                class_id: 0,
                start_date: "",
                end_date: "",
                status: ExamStatus.Scheduled,
                timetable_photo: null
            });
            setRefresh((prev) => !prev);
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to create exam");
        }
    };

    const handleEditExam = (exam: Exam) => {
        setEditMode(exam.exam_id);
        setFormData({
            classroom_id: exam.classroom_id,
            standard: exam.standard,
            section: exam.section,
            exam_name: exam.exam_name,
            class_id: exam.class_id,
            start_date: formatDateToInput(exam.start_date),
            end_date: formatDateToInput(exam.end_date),
            status: exam.status,
            timetable_photo: null, // File can't be pre-filled, skip it
        });
    };

    const clearForm = () => {
        setEditMode(null);
        setFormData({
            classroom_id:null,
            standard:'',
            section:'',
            exam_name: "",
            class_id: 0,
            start_date: "",
            end_date: "",
            status: ExamStatus.Scheduled,
            timetable_photo: null
        });
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Exam Dashboard</h2>

            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        className="border p-2 rounded"
                        placeholder="Exam Name"
                        name="exam_name"
                        value={formData.exam_name}
                        onChange={handleChange}
                        required
                    />
                    {/*<input*/}
                    {/*    className="border p-2 rounded"*/}
                    {/*    placeholder="Class ID"*/}
                    {/*    name="class_id"*/}
                    {/*    type="number"*/}
                    {/*    value={formData.class_id}*/}
                    {/*    onChange={handleChange}*/}
                    {/*    required*/}
                    {/*/>*/}
                    <select
                        className="border p-2 rounded"
                        name="class_id"
                        value={formData.class_id}
                        onChange={handleChange}
                        required
                    >
                        {
                            classrooms.map((classroom: Classroom) => {
                                return <option key={classroom.classroom_id} value={classroom.classroom_id} > {classroom.standard} - {classroom.section} </option>
                            })
                        }
                    </select>
                    <select
                        className="border p-2 rounded"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        {Object.values(ExamStatus).map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <input
                        className="border p-2 rounded"
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                    />
                    <input
                        className="border p-2 rounded"
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="file"
                        className="border p-2 rounded col-span-full"
                        name="timetable_photo"
                        onChange={handleFileChange}
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {editMode ? "edit exam" : "create exam"}
                </button>
                <button
                    onClick={clearForm}
                    className="mt-4 mx-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    clear
                </button>
            </form>

            <ul className="divide-y">
                {exams.map((exam) => (
                    <li key={exam.exam_id} className="py-4 px-4 hover:bg-gray-50 rounded transition-all duration-200">
                        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-800">{exam.exam_name}</h4>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Status:</span> {exam.status} <br />
                                    <span className="font-medium">Date:</span> {exam.start_date} to {exam.end_date} <br />
                                    <span className="font-medium">Class:</span> {exam.standard} - {exam.section}
                                </p>
                            </div>
                            <div className="mt-2 md:mt-0 flex gap-2">
                                <button
                                    onClick={() => handleEditExam(exam)}
                                    className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                {/* You can add a delete button here if needed */}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

        </div>
    );
};

export default ExamDashboard;