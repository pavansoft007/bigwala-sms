import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import School from "./School.js";

const Role = sequelize.define('Role', {
    role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    role_name:{
        type: DataTypes.STRING(225),
        allowNull: false,
    },
    school_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:School,
            key:'school_id'
        }
    },
    permissions: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: false
});

export default Role;
