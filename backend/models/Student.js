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
        validate: {
            isEmail: true
        }
    },
    student_photo:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    father_photo:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull:false
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
    mother_name:{
        type:DataTypes.STRING(225),
        allowNull:false
    },
    father_name:{
        type:DataTypes.STRING(225),
        allowNull:false
    },
    mother_phone_number:{
        type:DataTypes.STRING(20),
        allowNull:false
    },
    caste: {
        type: DataTypes.ENUM('OC','BC-A','BC-B','BC-C','BC-D','BC-E','SC','ST'),
        allowNull: false,
    },
    sub_caste:{
        type:DataTypes.STRING(225),
        allowNull:false
    },
    assignedClassroom:{
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
