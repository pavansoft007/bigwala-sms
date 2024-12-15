import  { useState } from "react";
import axiosInstance from "../../services/axiosInstance.ts";

const SubjectManagement = ({ examId }) => {
    const [subjects, setSubjects] = useState([]);
    const [subjectDetails, setSubjectDetails] = useState({
        subject_id: "",
        exam_date: "",
    });

    const addSubject = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`/api/exam-subject/${examId}`, {
                exam_details: [subjectDetails],
            });
            setSubjects([...subjects, ...response.data.examSubjects]);
            setSubjectDetails({ subject_id: "", exam_date: "" });
        } catch (error) {
            console.error("Error adding subject:", error);
        }
    };

    const deleteSubject = async (subjectId) => {
        try {
            await axiosInstance.delete(`/api/exam-subject/${subjectId}`);
            setSubjects(subjects.filter((subj) => subj.exam_subject_id !== subjectId));
        } catch (error) {
            console.error("Error deleting subject:", error);
        }
    };

    return (
        <div>
            <h2>Manage Subjects for Exam</h2>
            <form onSubmit={addSubject}>
                <input
                    type="text"
                    placeholder="Subject ID"
                    value={subjectDetails.subject_id}
                    onChange={(e) => setSubjectDetails({ ...subjectDetails, subject_id: e.target.value })}
                />
                <input
                    type="date"
                    value={subjectDetails.exam_date}
                    onChange={(e) => setSubjectDetails({ ...subjectDetails, exam_date: e.target.value })}
                />
                <button type="submit">Add Subject</button>
            </form>
            <ul>
                {subjects.map((subj) => (
                    <li key={subj.exam_subject_id}>
                        {subj.subject_name} - {subj.exam_date}
                        <button onClick={() => deleteSubject(subj.exam_subject_id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubjectManagement;
