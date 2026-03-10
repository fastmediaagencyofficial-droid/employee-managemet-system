
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'hamza@gmail.com';
    const newPassword = 'password123';

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user
    const updatedUser = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    console.log(`Password reset for ${updatedUser.email}`);
    console.log(`New Password: ${newPassword}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
