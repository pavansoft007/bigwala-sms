import { DataTypes, Model } from 'sequelize';
import School from './School.js';
import sequelize from '../config/database.js';

class Classroom extends Model {}

Classroom.init({
    classroom_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    standard: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    section: {
        type: DataTypes.STRING(10),
        allowNull: false
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
    modelName: 'Classroom',
    tableName: 'classrooms',
    timestamps: false
});

export default Classroom;
