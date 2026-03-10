import prisma from '../src/config/database';
import { hashPassword } from '../src/utils/bcrypt';

async function updatePasswords() {
    console.log('🔄 resetting passwords for admin accounts...');

    const updates = [
        { email: 'fastmediaagencyofficial@gmail.com', password: 'KAKKEZg6HpbruJHU!@#' },
        { email: 'xfastgroup001@gmail.com', password: 'LCZlBkIxDkmLjflv!@#' },
        { email: 'hafsaakbar071@gmail.com', password: 'dA/bm1BIW5ZXUWjn!@#' }
    ];

    for (const update of updates) {
        const hashedPassword = await hashPassword(update.password);

        try {
            const user = await prisma.user.update({
                where: { email: update.email },
                data: { password: hashedPassword }
            });
            console.log(`✅ Password updated for: ${user.email}`);
        } catch (error) {
            console.error(`❌ Failed to update password for ${update.email}. User might not exist.`);
        }
    }
}

updatePasswords()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
