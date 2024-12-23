import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import School from "./School.js";

class BannerImages extends Model {}

BannerImages.init({
    banner_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    filename: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: School,
            key: 'school_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    uploadedOn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'BannerImages',
    tableName: 'bannerImages',
    timestamps: false
});

export default BannerImages;
