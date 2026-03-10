import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Verifying passwordResetToken column in users table...');

        // Query PostgreSQL information_schema
        const result: any = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'passwordResetToken';
    `;

        console.log('Query Result:', result);

        if (Array.isArray(result) && result.length > 0) {
            console.log('✅ Column passwordResetToken EXISTS.');
        } else {
            console.error('❌ Column passwordResetToken does NOT exist.');
        }

    } catch (error) {
        console.error('❌ Error executing query:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
