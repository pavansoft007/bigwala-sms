import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";

const GetAssignedClassroom=async (id,role)=>{
    try{
        if(role === 'teacher'){
            const teacherDetails=await Teacher.findByPk(id,{
                attributes:['assignedClass']
            })
            return teacherDetails.assignedClass;
        }else {
            const teacherDetails=await Student.findByPk(id,{
                attributes:['assignedClassroom']
            })
            return teacherDetails.assignedClassroom;
        }
    }catch (e) {
       console.error('error in getting the assigned classroom details'+e);
    }
}
export default GetAssignedClassroom;