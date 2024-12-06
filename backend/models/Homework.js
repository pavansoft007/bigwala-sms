import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import School from "./School.js";
import Classroom from "./Classroom.js";
import Subject from "./Subject.js";

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
            key: 'classroom_id'
        }
    },
    subject_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Subject,
            key:'subject_id'
        }
    },
    context:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    addedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    }
}, {
    sequelize,
    modelName: 'Homework',
    tableName: 'homeworks',
    timestamps: false
});
Homework.belongsTo(School, { foreignKey: 'school_id' });
Homework.belongsTo(Classroom, { foreignKey: 'classroom_id' });

export default Homework;
