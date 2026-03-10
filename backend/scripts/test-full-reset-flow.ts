import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const email = 'test-reset@example.com';

async function main() {
    try {
        // 1. Create a test user
        console.log('Creating test user...');
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: 'password123',
                name: 'Test User',
                role: 'EMPLOYEE',
            },
        });
        console.log('Test User Created:', user.id);

        // 2. Request Password Reset
        console.log('Requesting password reset...');
        const response = await fetch('http://127.0.0.1:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', data);

        if (response.ok) {
            console.log('✅ Password reset email sent successfully.');

            // 3. Verify token in database
            const updatedUser = await prisma.user.findUnique({ where: { email } });
            console.log('Reset Token in DB:', updatedUser?.passwordResetToken ? 'Present' : 'Missing');

            if (updatedUser?.passwordResetToken) {
                console.log('✅ Token stored in database.');
            }
        } else {
            console.error('❌ Failed to send reset email.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
