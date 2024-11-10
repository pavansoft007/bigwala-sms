import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import School from "./School.js";

class YoutudeModel extends Model {}

YoutudeModel.init({
    youtude_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    event_name: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    youtudeLink: {
        type: DataTypes.STRING(225),
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
    modelName: 'YoutudeModel',
    tableName: 'youtudeVideo',
    timestamps: false
});

export default YoutudeModel;
