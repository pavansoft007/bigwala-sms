import axiosInstance from "@/services/axiosInstance";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Classroom from "@/types/Classroom";
import fetchClassroomData from "@/services/FetchClassroomData";
import Subject from "@/types/Subject";
import fetchSubjectsData from "@/services/FetchSubjectsData";

type TeacherData = {
  teacher_id: number;
  TeacherID: string;
  first_name: string;
  last_name: string;
  subject_id: number;
  email: string;
  phone_number: string;
  hire_date: string;
  status: string;
  adminAccess: boolean;
  school_code: string;
  assignedClass: number;
  school_id: number;
  salary: number;
  teacher_qualification_certificate: string;
  teacher_photo: string;
  subject_name: string;
  subject_code: string;
  classroom_id: number;
  standard: string;
  section: string;
};

const TeacherDetails = () => {
  const { id } = useParams();
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TeacherData | null>(null);
  const [classroomDetails, setClassroomDetails] = useState<Classroom[]>([]);
  const [SubjectDetails, setSubjectDetails] = useState<Subject[]>([]);


  const getSyncData = async () => {
    try {
      const classDetails: Promise<Classroom[]> = fetchClassroomData();
      const SubjectDetails: Promise<Subject[]> = fetchSubjectsData();
      setClassroomDetails(await classDetails);
      setSubjectDetails(await SubjectDetails);
    } catch (e) {
      console.error("Error in getting sync details:", e);
    }
  }

  const getTeacherDetails = async () => {
    try {
      const response = await axiosInstance.get("/api/teacher/" + id);
      setTeacherData(response.data);
      setFormData(response.data);
    } catch (e) {
      console.error("Error in getting teacher details:", e);
    }
  };

  useEffect(() => {
    getSyncData();
    getTeacherDetails();
  }, [id]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };


  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      try {
        const form = new FormData();
  
        
        for (const key in formData) {
          if (Object.prototype.hasOwnProperty.call(formData, key)) {
            form.append(key as keyof TeacherData, formData[key as keyof TeacherData] as string | Blob);
          }
        }
  
        
        const photoInput = document.querySelector("input[name='teacher_photo']") as HTMLInputElement;
        const certificateInput = document.querySelector("input[name='teacher_qualification_certificate']") as HTMLInputElement;
  
        if (photoInput?.files?.[0]) {
          form.append("teacher_photo", photoInput.files[0]);
        }
  
        if (certificateInput?.files?.[0]) {
          form.append("teacher_qualification_certificate", certificateInput.files[0]);
        }
  
        
        await axiosInstance.put(`/api/teacher/${id}`, form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        setIsEditing(false);
        alert("Teacher details updated successfully!");
        getTeacherDetails();
      } catch (e) {
        console.error("Error saving teacher details:", e);
      }
    }
  };
  
  

  if (!teacherData) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-8 flex items-center ml-2 space-x-4">
        <img
          src={`${import.meta.env.VITE_API_URL}/staticFiles/teacher/${teacherData.teacher_photo}`}
          alt="teacher photo"
          className="w-32 h-32 rounded-full object-cover"
        />
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            {teacherData.first_name} {teacherData.last_name}
          </h1>
          <p className="text-lg text-gray-600">Teacher Details</p>
        </div>
      </div>



      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-lg font-medium">
              <span className="font-semibold">Teacher ID:</span>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="TeacherID"
                  value={formData?.TeacherID || ""}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                teacherData.TeacherID
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Email:</span>{" "}
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData?.email || ""}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                teacherData.email
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Phone:</span>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="phone_number"
                  value={formData?.phone_number || ""}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                teacherData.phone_number
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Subject:</span>{" "}
              {isEditing ? (
                <select
                  name="subject_id"
                  value={formData?.subject_id || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Subject</option>
                  {SubjectDetails.map((subject) => (
                    <option key={subject.subject_id} value={subject.subject_id}>
                      {subject.subject_name}-{subject.subject_code}
                    </option>
                  ))}
                </select>
              ) : (
                teacherData.subject_name
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Assigned Class:</span>{" "}
              {isEditing ? (
                <select
                  name="assginedClassroom"
                  value={formData?.assignedClass || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Classroom</option>
                  {classroomDetails.map((classroom) => (
                    <option key={classroom.classroom_id} value={classroom.classroom_id}>
                      {classroom.standard} - {classroom.section}
                    </option>
                  ))}
                </select>
              ) : (
                `${teacherData.standard} - ${teacherData.section}`
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Status:</span>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="status"
                  value={formData?.status || ""}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                teacherData.status
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Hire Date:</span>{" "}
              {isEditing ? (
                <input
                  type="date"
                  name="hire_date"
                  value={formData?.hire_date || ""}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                teacherData.hire_date
              )}
            </div>
          </div>

          {/* Advanced Information */}
          <div className="space-y-4">
            <div className="text-lg font-medium">
              <span className="font-semibold">School Code:</span>{" "}
              {isEditing ? (
                <input
                  type="text"
                  name="school_code"
                  readOnly
                  value={formData?.school_code || ""}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                teacherData.school_code
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Admin Access:</span>{" "}
              {isEditing ? (
                <input
                  type="checkbox"
                  name="adminAccess"
                  checked={formData?.adminAccess || false}
                  onChange={(e) => {
                    if (formData) {
                      setFormData({
                        ...formData,
                        adminAccess: e.target.checked,
                      });
                    }
                  }}
                  className="border p-2 rounded-md"
                />
              ) : (
                teacherData.adminAccess ? "Yes" : "No"
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Salary:</span>{" "}
              {isEditing ? (
                <input
                  type="number"
                  name="salary"
                  value={formData?.salary || ""}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                `${teacherData.salary}`
              )}
            </div>

            {
              isEditing && <div className="text-lg font-medium">
              <span className="font-semibold">Teacher Photo:</span>{" "}
              <input
                  type="file"
                  name="teacher_photo"
                  accept="image/*"
                  onChange={(e) => handleChange(e)}
                  className="border p-2 rounded-md w-full"
                />
            </div>
            }

            <div className="text-lg font-medium">
              <span className="font-semibold">Qualification Certificate:</span>{" "}
              {isEditing ? (
                <input
                  type="file"
                  name="teacher_qualification_certificate"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleChange(e)}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                teacherData.teacher_qualification_certificate && (
                  <a
                    href={`${import.meta.env.VITE_API_URL}/staticFiles/teacher/${teacherData.teacher_qualification_certificate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    View Qualification Certificate
                  </a>
                )
              )}
            </div>

          </div>
        </div>
        <div className="flex flex-row-reverse" >
          {/* Save Button */}
          {isEditing && (
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
              onClick={toggleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              {isEditing ? "Cancel Edit" : "Edit Details"}
            </button>
          </div>
        </div>


      </div>
    </div>
  );
};

export default TeacherDetails;
