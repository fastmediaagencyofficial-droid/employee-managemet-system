import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Testing Email Configuration...');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

import { sendEmail } from '../src/services/emailService';

async function testEmail() {
    console.log('Attempting to send test email...');
    try {
        const result = await sendEmail({
            to: process.env.EMAIL_USER || '', // Send to self
            subject: 'Test Email from Employee Management System',
            html: '<h1>It works!</h1><p>This is a test email to verify Nodemailer configuration.</p>',
            text: 'It works! This is a test email.',
        });

        if (result) {
            console.log('✅ Email sent successfully!');
        } else {
            console.error('❌ Failed to send email.');
        }
    } catch (error) {
        console.error('❌ Error testing email:', error);
    }
}

testEmail();
