import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import School from "./School.js";
import Teacher from "./Teacher.js";

class MessageBoard extends Model {}

MessageBoard.init({
    messageBoard_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    admission_id: {
        type: DataTypes.STRING(25),
        allowNull: true
    },
    section: {
        type: DataTypes.STRING(5),
        allowNull: true
    },
    standard: {
        type: DataTypes.STRING(5),
        allowNull: true
    },
    messageType: {
        type: DataTypes.ENUM('voice', 'message'),
        allowNull: false,
    },
    message: {
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
    teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Teacher,
            key: 'teacher_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    addedOn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    type:{
        type:DataTypes.ENUM('completeSchool','completeClass','student'),
        allowNull:false
    }
}, {
    sequelize,
    modelName: 'MessageBoard',
    tableName: 'messageboards',
    timestamps: false
});

export default MessageBoard;
