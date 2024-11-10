import { DataTypes, Model } from 'sequelize';
import School from './School.js';
import sequelize from '../config/database.js';

class Subject extends Model {}

Subject.init({
    subject_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    subject_name:{
      type:DataTypes.STRING(225),
      allowNull:false
    },
    subject_code:{
        type:DataTypes.STRING(10),
        allowNull:false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: School,
            key: 'school_id'
        }
    },
}, {
    sequelize,
    modelName: 'Subject',
    tableName: 'subjects',
    timestamps: false
});

export default Subject;
