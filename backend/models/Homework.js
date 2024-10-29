import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import School from "./School.js";
import Classroom from "./Classroom.js";

class Homework extends Model {}

Homework.init({
    homework_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    school_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: School,
            key: 'school_id'
        }
    },
    classroom_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references: {
            model: Classroom,
            key: 'school_id'
        }
    },
    subject:{
        type:DataTypes.STRING(20),
        allowNull:false
    },
    context:{
        type:DataTypes.TEXT,
        allowNull:false
    },
}, {
    sequelize,
    modelName: 'Homework',
    tableName: 'homeworks',
    timestamps: false
});

export default Homework;
