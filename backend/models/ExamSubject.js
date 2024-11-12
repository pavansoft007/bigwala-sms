import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import subject from "./Subject.js";
import exam from "./Exam.js";

class ExamSubject extends Model {}

ExamSubject.init({
    exams_subject_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    exam_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:exam,
            key:'exam_id'
        }
    },
    subject_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:subject,
            key:'subject_id'
        }
    },
    exam_date:{
        type:DataTypes.DATE,
        allowNull:false
    },
}, {
    sequelize,
    modelName: 'ExamSubject',
    tableName: 'exam_subjects',
    timestamps: false
});

export default ExamSubject;
