
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const employees = await prisma.employee.findMany();
    console.log('--- ALL EMPLOYEES ---');
    employees.forEach(e => {
        console.log(`- ${e.firstName} ${e.lastName} (${e.email}) [UserID: ${e.userId}]`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
