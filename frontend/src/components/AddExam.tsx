import { useSelector } from "react-redux";
import { RootState } from "@/stores/store.ts";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance.ts";

interface Exam {
    exam_id: number;
    exam_name: string;
    classroom_id: number;
    standard: number;
    section: string;
    timetable_photo: string;
    status: "completed";
    start_date: string;
    end_date: string;
}

interface AddExamProps {
    classroomId: number;
    studentId: number;
}

const AddExam = ({ classroomId, studentId }: AddExamProps) => {
    const subjects = useSelector((state: RootState) => state.subjects);
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<number>(0);
    const [marksData, setMarksData] = useState<{ [subjectId: number]: number }>({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function fetchExamInfo() {
            try {
                const res = await axiosInstance.get<Exam[]>("/api/exam");
                setExams(res.data);
            } catch (e) {
                console.log("Error in fetching the exams info:", e);
            }
        }
        fetchExamInfo();
    }, []);

    const handleSubmit = async () => {
        const marks: { [key: string]: { marks: number } } = {};
        Object.entries(marksData).forEach(([subjectId, value]) => {
            marks[subjectId] = { marks: value };
        });

        const payload = {
            classroom_id: classroomId,
            student_id: studentId,
            exam_id: selectedExamId,
            marks,
        };

        try {
            await axiosInstance.post("/api/exam-marks", payload);
            setMessage("Marks submitted successfully!");
            setMarksData({});
            setSelectedExamId(0);
        } catch (err) {
            console.error("Failed to submit marks:", err);
            setMessage("Failed to submit marks.");
        }
    };

    return (
        <div className="space-y-6 w-full">
            <h2 className="text-xl font-bold text-gray-800">Add Exam Marks</h2>

            {/* Exam Dropdown */}
            <div>
                <label className="block font-medium text-gray-700">Select Exam</label>
                <select
                    className="mt-1 w-full border p-2 rounded"
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(Number(e.target.value))}
                >
                    <option value="">-- Choose an exam --</option>
                    {exams
                        .filter((e) => e.classroom_id === classroomId)
                        .map((e) => (
                            <option key={e.exam_id} value={e.exam_id}>
                                {e.exam_name}
                            </option>
                        ))}
                </select>
            </div>

            {/* Subject-wise Marks Inputs */}
            {selectedExamId !== 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Subject-wise Marks</h3>
                    {subjects.map((subject) => (
                        <div key={subject.subject_id}>
                            <label className="block text-sm text-gray-700">
                                {subject.subject_name}
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={marksData[subject.subject_id] || ""}
                                onChange={(e) =>
                                    setMarksData({
                                        ...marksData,
                                        [subject.subject_id]: parseInt(e.target.value),
                                    })
                                }
                                className="mt-1 w-full border p-2 rounded"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!selectedExamId}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Submit Marks
                </button>
            </div>

            {/* Response Message */}
            {message && (
                <p className="text-center text-sm font-medium text-green-600">{message}</p>
            )}
        </div>
    );
};

export default AddExam;
