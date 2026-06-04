import prisma from '../lib/prisma.js';

async function generateAdmissionID(school_code) {
    const lastStudent = await prisma.students.findFirst({
        where: { school_code },
        orderBy: { admission_ID: 'desc' }
    });

    let nextAdmissionNumber = 1;
    if (lastStudent && lastStudent.admission_ID) {
        const lastAdmissionNumber = parseInt(lastStudent.admission_ID.substring(school_code.length), 10);
        nextAdmissionNumber = lastAdmissionNumber + 1;
    }
    return `${school_code}${nextAdmissionNumber.toString().padStart(7, '0')}`;
}

export default generateAdmissionID;
