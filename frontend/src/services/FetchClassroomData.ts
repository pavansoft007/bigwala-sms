import axiosInstance from "@/services/axiosInstance.ts";


// interface Classroom {
//     classroom_id: string;
//     standard: string;
//     section: string;
// }

const fetchClassroomData=async ()=>{
    try{
        const fetchClassroomData=await axiosInstance.get("/mobileAPI/classroom")
        return fetchClassroomData.data;
    } catch (e){
        console.error('error in fetching the classroom data:',e);
        return [];
    }

}
export default fetchClassroomData;