import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import school from './School.js';

class FeeCategory extends Model {}

FeeCategory.init(
    {
        category_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        school_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: school,
                key: 'school_id',
            },
        },
        category_name: {
            type: DataTypes.STRING(225),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
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
        modelName: 'FeeCategory',
        tableName: 'fee_categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export default FeeCategory;
