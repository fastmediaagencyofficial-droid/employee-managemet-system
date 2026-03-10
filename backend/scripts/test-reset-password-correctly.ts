import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import crypto from 'crypto';

const prisma = new PrismaClient();
const email = 'test-reset@example.com';
const newPassword = 'brandnewpassword789';

async function main() {
    try {
        // 1. Generate a valid token pair manually
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(rawToken)
            .digest('hex'); // This goes to DB

        console.log('Generated Raw Token:', rawToken);
        console.log('Generated Hash:', hashedToken);

        // 2. Update DB with the HASH
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        await prisma.user.update({
            where: { email },
            data: {
                passwordResetToken: hashedToken,
                passwordResetExpires: expiry
            }
        });
        console.log('✅ DB updated with hashed token.');

        // 3. Call API with RAW token
        console.log('Calling Reset Password API...');
        const response = await fetch('http://127.0.0.1:5000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: rawToken,
                password: newPassword
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', data);

        if (response.ok) {
            console.log('✅ Password reset successfully.');

            // 4. Verify DB is cleared
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
