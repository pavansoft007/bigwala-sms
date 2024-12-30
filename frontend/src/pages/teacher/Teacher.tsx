import {useEffect, useState} from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import axiosInstance from "@/services/axiosInstance.ts";


interface StudentDetails{
    teacher_id:number,
    TeacherID:string,
    first_name:string,
    last_name:string,
    phone_number:string,
    email:string,
    status:string,
    adminAccess:boolean,
    subject_name:string,
    standard:string,
    section:string
}

const Teacher=()=>{
    const [teachers,setTeachers]=useState<StudentDetails[]>([]);


    useEffect(() => {
        fetchTeacher();
    }, []);

    const fetchTeacher=async ()=>{
        axiosInstance.get('/api/teacher').then((res)=>{
            setTeachers(res.data);
        })
    }
    return <div className="bg-white rounded shadow-xl p-4" >
        <h1 className="text-3xl mb-2 text-center font-bold " >Manage teachers</h1>
        <div className="mt-3" >
            <Table className="text-md" >
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Teacher ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>email</TableHead>
                        <TableHead>phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center" >Assigned classroom</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        teachers.map((item,index)=>{
                            return <TableRow key={index} >
                                <TableCell className="font-medium">{item.TeacherID}</TableCell>
                                <TableCell>{item.first_name}-{item.last_name}</TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>{item.phone_number}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell>{item.subject_name}</TableCell>
                                <TableCell className="text-center" >{item.standard}-{item.section}</TableCell>
                                <TableCell className="text-center">
                                    <button className="p-1.5 mx-0.5 border-2 rounded-xl bg-green-500">edit</button>
                                    <button className="p-1.5 mx-0.5 border-2 rounded-xl bg-red-500 ">delete</button>
                                </TableCell>
                            </TableRow>

                        })
                    }
                </TableBody>
            </Table>
        </div>
    </div>
}
export default Teacher;