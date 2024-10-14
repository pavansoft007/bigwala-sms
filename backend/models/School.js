import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class School extends Model {}

School.init({
    school_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    }
}, {
    sequelize,
    modelName: 'School',
    tableName: 'schools',
    timestamps: false
});

export default School;
