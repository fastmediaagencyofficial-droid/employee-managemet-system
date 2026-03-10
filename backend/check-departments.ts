
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDepartments() {
    try {
        const departments = await prisma.department.findMany();
        console.log('Departments:', departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDepartments();
