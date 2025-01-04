import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import School from "./School.js";
import Student from "./Student.js";

class MessageBoard extends Model {}

MessageBoard.init({
    message_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: Student,
            key: 'student_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    classroom_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'classrooms',
            key: 'classroom_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    message_type: {
        type: DataTypes.ENUM('text', 'voice'),
        allowNull: false,
    },
    text_message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    voice_location: {
        type: DataTypes.STRING(225),
        allowNull: true
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: School,
            key: 'school_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    added_by: {
        type: DataTypes.ENUM('teacher', 'admin'),
        allowNull: false
    },
    added_member_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    added_on: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('completeSchool', 'completeClass', 'student'),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'MessageBoard',
    tableName: 'messageBoards',
    timestamps: false
});

export default MessageBoard;
