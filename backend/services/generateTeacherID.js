import Teacher from "../models/Teacher.js";

async function generateTeacherID(school_code) {
    try {
        const lastTeacher = await Teacher.findOne({
            where: { school_code },
            order: [['TeacherID', 'DESC']]
        });

        let nextAdmissionNumber = 1;

        if (lastTeacher && lastTeacher.TeacherID) {
            const lastTeacherIDNumber = parseInt(lastTeacher.TeacherID.substring(school_code.length + 3), 10); // +3 for '0TS'
            nextAdmissionNumber = lastTeacherIDNumber + 1;
        }

        return `${school_code}0TS${nextAdmissionNumber.toString().padStart(3, '0')}`;
    } catch (error) {
        console.error("Error generating teacher ID:", error);
        throw new Error("Could not generate teacher ID");
    }
}

export default generateTeacherID;
