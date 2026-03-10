
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Database connected successfully. Found ${userCount} users.`);
        if (userCount === 0) {
            console.error('Database is empty! Run seed.');
        } else {
            const users = await prisma.user.findMany({ select: { email: true, role: true } });
            console.log('Sample users:', users);
        }
    } catch (e) {
        console.error('Database check failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
