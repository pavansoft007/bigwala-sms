import { DataTypes, Model } from 'sequelize';
import School from './School.js';
import Teacher from './Teacher.js';
import sequelize from '../config/database.js';

class TeacherAttendance extends Model {}

TeacherAttendance.init({
    attendance_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Teacher,
            key: 'teacher_id'
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
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'TeacherAttendance',
    tableName: 'teacherAttendance',
    timestamps: false
});

export default TeacherAttendance;
