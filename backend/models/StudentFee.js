import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import school from './School.js';
import FeeCategory from "./FeeCategory.js";
import Student from "./Student.js";
import Classroom from "./Classroom.js";
import Admin from "./Admin.js";
import Teacher from "./Teacher.js";

class StudentFee extends Model {}

StudentFee.init(
    {
        fee_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fee_amount:{
          type:DataTypes.INTEGER,
          allowNull:false,
        },
        total_fee_paid:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        fee_remaining:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        school_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: school,
                key: 'school_id',
            },
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: FeeCategory,
                key: 'category_id',
            },
        },
        student_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Student,
                key: 'student_id',
            },
        },
        classroom_id:{
          type:DataTypes.INTEGER,
          allowNull:false,
          references:{
              model:Classroom,
              key:'classroom_id'
          }
        },
        created_by:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        teacher_id:{
            type:DataTypes.INTEGER,
            allowNull:true,
            references:{
                model:Teacher,
                key:'teacher_id'
            }
        },
        admin_id:{
            type:DataTypes.INTEGER,
            allowNull:true,
            references:{
                model:Admin,
                key:'admin_id'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'StudentFee',
        tableName: 'student_fees',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default StudentFee;
