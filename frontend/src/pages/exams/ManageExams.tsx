import  { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance.ts";

const ExamManagement = () => {
    const [exams, setExams] = useState([]);
    const [formData, setFormData] = useState({
        exam_name: "",
        start_date: "",
        end_date: "",
        standard: "",
        section: "",
    });

    const fetchExams = async () => {
        try {
            const response = await axiosInstance.get('/api/exam');
            setExams(response.data);
        } catch (error) {
            console.error("Error fetching exams:", error);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/api/exam', formData);
            setExams([...exams, response.data]);
            setFormData({
                exam_name: "",
                start_date: "",
                end_date: "",
                standard: "",
                section: "",
            });
        } catch (error) {
            console.error("Error adding exam:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/api/exam/${id}`);
            setExams(exams.filter((exam) => exam.exam_id !== id));
        } catch (error) {
            console.error("Error deleting exam:", error);
        }
    };

    return (
        <div>
            <h1>Exam Management</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Exam Name"
                    value={formData.exam_name}
                    onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                />
                <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
                <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Standard"
                    value={formData.standard}
                    onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
                <button type="submit">Add Exam</button>
            </form>

            <ul>
                {exams.map((exam) => (
                    <li key={exam.exam_id}>
                        {exam.exam_name} - {exam.start_date} to {exam.end_date}
                        <button onClick={() => handleDelete(exam.exam_id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExamManagement;
