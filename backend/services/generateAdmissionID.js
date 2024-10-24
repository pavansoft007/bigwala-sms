import Student from "../models/Student.js";

async function generateAdmissionID() {
    const lastStudent = await Student.findOne({
        order: [['admission_ID', 'DESC']]
    });

    let nextAdmissionNumber = 1;

    if (lastStudent && lastStudent.admission_ID) {
        const lastAdmissionNumber = parseInt(lastStudent.admission_ID.substring(3), 10);
        nextAdmissionNumber = lastAdmissionNumber + 1;
    }

    return `ADM${nextAdmissionNumber.toString().padStart(7, '0')}`;
}
export default generateAdmissionID;