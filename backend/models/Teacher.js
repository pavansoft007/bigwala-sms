import { DataTypes, Model } from 'sequelize';
import School from './School.js';
import sequelize from '../config/database.js';
import classroom from "./Classroom.js";

class Teacher extends Model {}

Teacher.init({
    teacher_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone_number: {
        type: DataTypes.STRING(15),
        unique: true,
        allowNull: false
    },
    subject_specialization: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false
    },
    adminAccess:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    },
    assignedClass:{
        type:DataTypes.INTEGER,
        allowNull:true,
        references:{
            model:classroom,
            key:'classroom_id'
        }
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: School,
            key: 'school_id'
        }
    }
}, {
    sequelize,
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: false
});

export default Teacher;
