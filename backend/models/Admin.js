import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Role from "./Role.js";

class Admin extends Model {}

Admin.init({
    admin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'schools',
            key: 'school_id'
        }
    },
    admin_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    admin_email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    admin_phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    admin_password: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    role_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:Role,
            key:'role_id'
        }
    }
}, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
    timestamps: false
});

export default Admin;
