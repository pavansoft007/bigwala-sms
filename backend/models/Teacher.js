import { DataTypes, Model } from 'sequelize';
import School from './School.js';
import sequelize from '../config/database.js';
import classroom from "./Classroom.js";
import Subject from "./Subject.js";
import Role from "./Role.js";

class Teacher extends Model {}

Teacher.init({
    teacher_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    TeacherID:{
      type:DataTypes.STRING(20),
      unique:true,
      allowNull:false
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    subject_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Subject,
            key:'subject_id'
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    phone_number: {
        type: DataTypes.STRING(15),
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
    school_code:{
      type:DataTypes.STRING(10),
      allowNull:false
    },
    salary:{
      type:DataTypes.INTEGER,
      allowNull:false
    },
    assignedClass:{
        type:DataTypes.INTEGER,
        allowNull:true,
        unique:true,
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
    },
    role_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Role,
            key:'role_id'
        }
    },
    teachers_qualification: {
        type: DataTypes.STRING,
        allowNull: true
    },
    teacher_photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    teacher_qualification_certificate: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: false
});

export default Teacher;
