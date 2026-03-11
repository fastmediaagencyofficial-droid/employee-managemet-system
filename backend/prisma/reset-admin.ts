import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPasswords() {
    try {
        console.log('Resetting passwords for FastMedia admins...');
        const hashedPassword = await bcrypt.hash('fastmedia123', 12);
        
        const emails = [
            'fastmediaagencyofficial@gmail.com',
            'xfastgroup001@gmail.com',
            'hafsaakbar071@gmail.com'
        ];

        for (const email of emails) {
            const user = await prisma.user.findUnique({
                where: { email }
            });
            
            if (user) {
                await prisma.user.update({
                    where: { email },
                    data: { password: hashedPassword, emailVerified: new Date() }
                });
                console.log(`✅ Password reset for: ${email}`);
            } else {
                console.log(`⚠️ User not found in local DB: ${email}`);
            }
        }

        console.log('\nAll passwords have been reset to: fastmedia123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPasswords();
