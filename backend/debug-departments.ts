
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const depts = await prisma.department.findMany();
    console.log('--- DEPARTMENTS ---');
    depts.forEach(d => {
        console.log(`- ${d.name} (ID: ${d.id})`);
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
