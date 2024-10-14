import { DataTypes, Model } from 'sequelize';
import School from './School.js';
import sequelize from '../config/database.js';

class Teacher extends Model {}

Teacher.init({
    teacher_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    subject_specialization: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: true
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
