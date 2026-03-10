import prisma from '../src/config/database';
import logger from '../src/middlewares/logger';

async function seedDepartments() {
    try {
        const departments = [
            {
                name: 'Engineering',
                description: 'Software development and technical operations',
            },
            {
                name: 'Human Resources',
                description: 'Employee relations, recruitment, and HR operations',
            },
            {
                name: 'Sales',
                description: 'Sales and business development',
            },
            {
                name: 'Marketing',
                description: 'Marketing, branding, and communications',
            },
            {
                name: 'Finance',
                description: 'Financial planning, accounting, and operations',
            },
            {
                name: 'Operations',
                description: 'Business operations and logistics',
            },
        ];

        logger.info('Seeding departments...');

        for (const dept of departments) {
            const existing = await prisma.department.findUnique({
                where: { name: dept.name },
            });

            if (!existing) {
                await prisma.department.create({
                    data: dept,
                });
                logger.info(`Created department: ${dept.name}`);
            } else {
                logger.info(`Department already exists: ${dept.name}`);
            }
        }

        logger.info('Department seeding completed!');
    } catch (error) {
        logger.error('Error seeding departments:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedDepartments()
    .then(() => {
        console.log('✅ Departments seeded successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error seeding departments:', error);
        process.exit(1);
    });
