import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const email = 'test-reset@example.com';
const newPassword = 'newpassword456';

async function main() {
    try {
        // 1. Get the token from DB
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordResetToken) {
            console.error('❌ User or token not found. Run previous script first.');
            return;
        }

        const token = user.passwordResetToken;
        console.log('Using Token:', token);

        // 2. call Request Password Reset Endpoint
        console.log('Resetting password...');
        const response = await fetch('http://127.0.0.1:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: token,
                password: newPassword
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', data);

        if (response.ok) {
            console.log('✅ Password reset successfully.');

            // 3. Verify token is cleared
            const updatedUser = await prisma.user.findUnique({ where: { email } });
            if (!updatedUser?.passwordResetToken) {
                console.log('✅ Token cleared from database.');
            } else {
                console.warn('⚠️ Token NOT cleared from database.');
            }
        } else {
            console.error('❌ Failed to reset password.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
