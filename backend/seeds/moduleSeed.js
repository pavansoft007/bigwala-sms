import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const modules = [
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
    { id: 11, module_name: 'banner Images' }
];

async function main() {
    console.log('Start seeding modules...');

    for (const module of modules) {
        const result = await prisma.Modules.upsert({
            where: { id: module.id },
            update: {},
            create: {
                id: module.id,
                module_name: module.module_name
            }
        });
        console.log(`Created/Updated module: ${result.module_name}`);
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });