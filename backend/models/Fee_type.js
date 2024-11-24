import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import school from "./School.js";

class Fee_type extends Model {}

Fee_type.init({
    fee_type_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: school,
            key: 'school_id',
        },
    },
    fee_type_name: {
        type: DataTypes.STRING(225),
        allowNull: false,
        defaultValue: null,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: null,
    },
    fee:{
       type:DataTypes.DECIMAL(10,0),
       allowNull:false
    }, standard: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: null,
    },
}, {
    sequelize,
    modelName: 'Fee_type',
    tableName: 'fee_type',
    timestamps: false
});

export default Fee_type;
