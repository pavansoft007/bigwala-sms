export enum ExamStatus {
    Scheduled = "scheduled",
    Ongoing = "ongoing",
    Completed = "completed",
    Postponed = "postponed"
}

export interface Exam {
    classroom_id: number | null;
    exam_id: number;
    exam_name: string;
    standard:string;
    section: string;
    class_id: number;
    school_id: number;
    start_date: string;
    end_date: string;
    timetable_photo: string;
    status: ExamStatus;
}
