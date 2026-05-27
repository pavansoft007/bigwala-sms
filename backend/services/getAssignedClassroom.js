import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GetAssignedClassroom=async (id,role)=>{
    try{
        if(role === 'teacher'){
            const teacherDetails=await prisma.teachers.findUnique({
                where: { teacher_id: Number(id) },
                select: { assignedClass: true }
            })
            return teacherDetails?.assignedClass;
        }else {
            const studentDetails=await prisma.students.findUnique({
                where: { student_id: Number(id) },
                select: { assignedClassroom: true }
            })
            return studentDetails?.assignedClassroom;
        }
    }catch (e) {
       console.error('error in getting the assigned classroom details'+e);
    }
}
export default GetAssignedClassroom;