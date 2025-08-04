import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Module extends Model {}

Module.init( {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    module_name: {
        type: DataTypes.STRING(225),
        allowNull: true,
        field: 'module_name'
    }
}, {
    sequelize,
    modelName: 'Modules',
    tableName: 'modules',
    timestamps: false
});



const seedModules = async (Module) => {
    try {
        const defaultModules = [
            { id: 1, module_name: 'student management' },
            { id: 2, module_name: 'teacher management' },
            { id: 3, module_name: 'homework' },
            { id: 4, module_name: 'classroom' },
            { id: 5, module_name: 'fee' },
            { id: 6, module_name: 'attendance' },
            { id: 7, module_name: 'gallery' },
            { id: 8, module_name: 'message board' },
            { id: 9, module_name: 'exam timetable' },
            { id: 10, module_name: 'expenses' },
            { id: 11, module_name: 'banner Images' },
            { id: 12, module_name: 'leaves management' }
        ];

        const modulesToInsert = [];
        let existingCount = 0;
        let insertedCount = 0;

        console.log('Checking modules and inserting missing ones...');

        for (const moduleData of defaultModules) {
            const existingModule = await Module.findOne({
                where: {
                    id: moduleData.id
                }
            });

            if (!existingModule) {
                modulesToInsert.push(moduleData);
                console.log(`⚠️  Module ID ${moduleData.id} (${moduleData.module_name}) not found - will be inserted`);
            } else {
                existingCount++;
                console.log(`✅ Module ID ${moduleData.id} (${moduleData.module_name}) already exists`);
            }
        }

        // Insert missing modules if any
        if (modulesToInsert.length > 0) {
            await Module.bulkCreate(modulesToInsert);
            insertedCount = modulesToInsert.length;
            console.log(`🚀 Successfully inserted ${insertedCount} missing modules!`);
        }

        // Summary
        console.log(`📊 Summary: ${existingCount} existing, ${insertedCount} inserted, ${existingCount + insertedCount} total modules`);

    } catch (error) {
        console.error('Error seeding modules:', error);
    }
};

export default Module;
export { seedModules };