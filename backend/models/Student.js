import { DataTypes, Model } from 'sequelize';
import School from './School.js';
import sequelize from "../config/database.js";
import classroom from "./Classroom.js";

class Student extends Model {}

Student.init({
    student_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    admission_ID: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female', 'Other'),
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
        allowNull: true,
        unique: true
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    enrollment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active'
    },
    assginedClassroom:{
        type:DataTypes.INTEGER,
        allowNull: true,
        references:{
            model:classroom,
            key:'classroom_id'
        }
    },
    school_code:{
      type:DataTypes.STRING(20),
      allowNull:false
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
    modelName: 'Student',
    tableName: 'students',
    timestamps: false
});

export default Student;
