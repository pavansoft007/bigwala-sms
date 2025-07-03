import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import Subject from "./Subject.js";
import Classroom from "./Classroom.js";
import Student from "./Student.js";
import Exam from "./Exam.js";

class ExamMarks extends Model {}

ExamMarks.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    subject_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Subject,
            key:'subject_id'
        }
    },
    class_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Classroom,
            key:'classroom_id'
        }
    },
    student_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Student,
            key:'student_id'
        }
    },
    exam_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Exam,
            key:'exam_id'
        }
    },
    marks:{
        type: DataTypes.INTEGER,
        allowNull:false,
    }
}, {
    sequelize, // ✅ This is required
    modelName: 'ExamMarks',
    tableName: 'exam_marks', // optional, to match DB table naming
    timestamps: false // optional, if you don't have createdAt/updatedAt
});

export default ExamMarks;