import axiosInstance from "@/services/axiosInstance";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Classroom from "@/types/Classroom";
import fetchClassroomData from "@/services/FetchClassroomData";

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
  const [classroomDetails,setClassroomDetails]=useState<Classroom[]>([]);

  const getTeacherDetails = async () => {
    try {
      const classDetails:Promise<Classroom[]>=fetchClassroomData();
      console.log(classDetails);
      setClassroomDetails(await classDetails);
      const response = await axiosInstance.get("/api/teacher/" + id);
      console.log(response.data);
      setTeacherData(response.data);
      setFormData(response.data);
    } catch (e) {
      console.error("Error in getting teacher details:", e);
    }
  };

  useEffect(() => {
    getTeacherDetails();
  }, [id]);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        await axiosInstance.put(`/api/teacher/${id}`, formData);
        setIsEditing(false);
        alert("Teacher details updated successfully!");
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          {teacherData.first_name} {teacherData.last_name}
        </h1>
        <p className="text-lg text-gray-600">Teacher Details</p>
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
                <input
                  type="text"
                  name="subject_name"
                  value={formData?.subject_name || ""}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                />
              ) : (
                teacherData.subject_name
              )}
            </div>
            <div className="text-lg font-medium">
              <span className="font-semibold">Assigned Class:</span>{" "}
              {isEditing ? (
                // <input
                //   type="text"
                //   name="standard"
                //   value={formData?.standard || ""}
                //   onChange={handleChange}
                //   className="border p-2 rounded-md w-full"
                // />
                <select
                            name="assginedClassroom"
                            value={teacherData.assignedClass}
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
                `$${teacherData.salary}`
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
