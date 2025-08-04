import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class AcademicYear extends Model {}

AcademicYear.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    year:{
      type:DataTypes.STRING,
      allowNull:false,
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'schools',
            key: 'school_id'
        }
    },
    is_current: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, {
    sequelize,
    modelName: 'AcademicYear',
    tableName: 'academic_year',
    timestamps: false
});

export default AcademicYear;
