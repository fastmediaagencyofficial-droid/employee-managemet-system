import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function addTestUser() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('password123', 12);

        // Create the user
        const user = await prisma.user.create({
            data: {
                email: 'maheenadeel3@gmail.com',
                password: hashedPassword,
                name: 'Test User',
                role: 'EMPLOYEE',
            },
        });

        console.log('✅ Test user created successfully!');
        console.log('Email:', user.email);
        console.log('Password: password123');
        console.log('\nYou can now test password reset with this email!');
    } catch (error: any) {
        if (error.code === 'P2002') {
            console.log('⚠️  User with this email already exists!');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

addTestUser();
