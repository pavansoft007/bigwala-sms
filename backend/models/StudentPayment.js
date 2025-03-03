import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import school from './School.js';
import FeeCategory from "./FeeCategory.js";
import Student from "./Student.js";
import Admin from "./Admin.js";

class StudentPayment extends Model {}

StudentPayment.init(
    {
        payment_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        amount:{
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
        payment_mode:{
            type:DataTypes.ENUM('cash','online','upi'),
            allowNull: false,
        },
        collected_by :{
            type:DataTypes.INTEGER,
            allowNull:true,
            references:{
                model:Admin,
                key:'admin_id'
            }
        },
        payment_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: 'StudentPayment',
        tableName: 'students_payments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default StudentPayment;