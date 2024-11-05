import { Sequelize, DataTypes } from 'sequelize'
import sequelize from "../config/database.js";

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('student', 'teacher', 'admin','admin-teacher'),
        allowNull: false,
    },
    original_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'users',
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
});

export default User;
