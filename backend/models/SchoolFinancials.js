import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import School from './School.js';
import academicYear from "./AcademicYear.js";

class SchoolFinancials extends Model {}

SchoolFinancials.init(
    {
        school_financial_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        year: {
            type: DataTypes.STRING,
            allowNull: false
        },
        year_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: academicYear,
                key: 'id'
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
        current_balance: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        modelName: 'SchoolFinancials',
        tableName: 'school_financials',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

export default SchoolFinancials;