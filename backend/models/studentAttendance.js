import { DataTypes, Model } from 'sequelize';
import School from './School.js';
import Student from "./Student.js";
import sequelize from '../config/database.js';

class studentAttendance extends Model {}

studentAttendance.init({
    attendance_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Student,
            key: 'student_id'
        }
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: School,
            key: 'school_id'
        }
    },
    attendDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    attendTime: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'studentAttendance',
    tableName: 'studentAttendance',
    timestamps: false
});

export default studentAttendance;
