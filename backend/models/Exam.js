import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import School from "./School.js";
import Classroom from "./Classroom.js";

class Exam extends Model {}

Exam.init({
    exam_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    exam_name:{
        type:DataTypes.STRING(225),
        allowNull:false
    },
    classroom_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Classroom,
            key:'classroom_id'
        }
    },
    school_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:School,
            key:'school_id'
        }
    },
    addedOn:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    start_date:{
        type:DataTypes.DATE,
        allowNull:false
    },
    end_date:{
        type:DataTypes.DATE,
        allowNull:false
    }
}, {
    sequelize,
    modelName: 'Exam',
    tableName: 'exams',
    timestamps: false
});

export default Exam;
