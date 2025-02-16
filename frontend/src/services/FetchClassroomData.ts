import axiosInstance from "@/services/axiosInstance.ts";
import Classroom from "@/types/Classroom.ts";


const fetchClassroomData = async (): Promise<Classroom[]> => {
    try {
        const fetchClassroomData = await axiosInstance.get<Classroom[]>("/mobileAPI/classroom");
        return fetchClassroomData.data;
    } catch (e) {
        console.error('error in fetching the classroom data:', e);
        return [];
    }

}
export default fetchClassroomData;