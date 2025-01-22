import axiosInstance from "@/services/axiosInstance.ts";
import Subject from "@/types/Subject";


const fetchSubjectsData =async ():Promise<Subject[]>=>{
    try{
        const fetchClassroomData=await axiosInstance.get("/api/subject")
        return fetchClassroomData.data;
    } catch (e){
        console.error('error in fetching the classroom data:',e);
        return [];
    }

}
export default fetchSubjectsData;