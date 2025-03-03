import Student from "../models/Student.js";

async function generateAdmissionID(school_code) {
    const lastStudent = await Student.findOne({
        where: { school_code },
        order: [['admission_ID', 'DESC']]
    });

    let nextAdmissionNumber = 1;
    if (lastStudent && lastStudent.admission_ID) {
        const lastAdmissionNumber = parseInt(lastStudent.admission_ID.substring(school_code.length), 10);
        nextAdmissionNumber = lastAdmissionNumber + 1;
    }
    return `${school_code}${nextAdmissionNumber.toString().padStart(7, '0')}`;
}

export default generateAdmissionID;
