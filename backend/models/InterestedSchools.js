import {DataTypes, Model} from "sequelize";
import sequelize from "../config/database.js";

class InterestedSchools extends Model{}

InterestedSchools.init({
    school_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    school_name:{
        type:DataTypes.STRING(225),
        allowNull:false
    },
    location:{
        type:DataTypes.STRING(225),
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('fresh','contacted-no-response','contacted-awaiting-response','closed'),
        allowNull:false
    },
    admin_name:{
        type:DataTypes.STRING(225),
        allowNull:false
    },
    phone_number:{
        type:DataTypes.STRING(13),
        allowNull:false
    }
},{
    sequelize,
    modelName: 'InterestedSchools',
    tableName: 'interested_schools',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
})

export default InterestedSchools;