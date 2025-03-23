interface StudentFee{
    category_id:number,
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

interface Student {
    admission_ID: string;
    student_id: string;
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
    assginedClassroom: string;
    standard: string;
    section: string;
    studentFee:StudentFee[];
    studentFeeHistory:StudentFeeHistory[];
}

export default Student;