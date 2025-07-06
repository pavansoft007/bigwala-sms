// interface StudentFee{
//     category_id:number,
//     category_name: string,
//     total_fee_paid: number,
//     fee_remaining: number,
//     fee_amount: number
// }
//
// interface StudentFeeHistory{
//     "category_name": string,
//     "amount": number,
//     "payment_date": string
// }
//
// interface Student {
//     admission_ID: string;
//     student_id: string;
//     mother_phone_number: string;
//     mother_name: string;
//     father_name: string;
//     caste: string;
//     status: string;
//     student_photo: string;
//     father_photo: string;
//     classroom_id: string;
//     first_name: string;
//     last_name: string;
//     date_of_birth: string;
//     gender: string;
//     email: string;
//     phone_number: string;
//     address: string;
//     enrollment_date: string;
//     assginedClassroom: string;
//     standard: string;
//     section: string;
//     studentFee:StudentFee[];
//     studentFeeHistory:StudentFeeHistory[];
// }
interface StudentFee{
    category_id?:number
    category_name: string,
    total_fee_paid: number,
    fee_remaining: number,
    fee_amount: number
}

interface StudentFeeHistory{
    "category_name": string,
    "amount": number,
    "payment_date": string
}

interface SubjectWiseMarks{
    subject_name: string
    marks: number
}

interface ExamInfo{
    exam_name : string,
    total : number,
    subject_wise_marks : SubjectWiseMarks[]
}

interface Student {
    admission_ID: string;
    student_id: number;
    mother_phone_number: string;
    mother_name: string;
    father_name: string;
    caste: string;
    status: string;
    student_photo: string;
    father_photo: string;
    classroom_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    gender: string;
    email: string;
    phone_number: string;
    address: string;
    enrollment_date: string;
    assignedClassroom: number;
    standard: string;
    section: string;
    studentFee:StudentFee[];
    studentFeeHistory:StudentFeeHistory[];
    examInfo:ExamInfo[]
}
export type { Student, StudentFee, StudentFeeHistory, SubjectWiseMarks, ExamInfo };