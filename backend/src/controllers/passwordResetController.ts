import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import { hashPassword } from '../utils/bcrypt';
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from '../services/emailService';
import logger from '../middlewares/logger';
import crypto from 'crypto';

/**
 * Request password reset
 */
export const forgotPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'If that email exists, a password reset link has been sent.',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save token to database (you'll need to add these fields to User model)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                // @ts-ignore - these fields need to be added to schema
                resetToken: resetTokenHash,
                resetTokenExpiry,
            },
        });

        // Send email
        const name = user.employee
            ? `${user.employee.firstName} ${user.employee.lastName}`
            : user.name;

        const emailSent = await sendPasswordResetEmail(email, resetToken, name);

        if (!emailSent) {
            logger.error('Failed to send password reset email');
        }

        logger.info(`Password reset requested for: ${email}`);

        res.json({
            success: true,
            message: 'If that email exists, a password reset link has been sent.',
        });
    } catch (_error: any) {
        logger.error('Forgot password error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
        });
    }
};

/**
 * Reset password
 */
export const resetPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and password are required',
            });
        }

        // Hash the token to compare with database
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await prisma.user.findFirst({
            where: {
                // @ts-ignore - these fields need to be added to schema
                resetToken: resetTokenHash,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                // @ts-ignore
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        // Send confirmation email
        const name = user.employee
            ? `${user.employee.firstName} ${user.employee.lastName}`
            : user.name;

        await sendPasswordResetConfirmation(user.email, name);

        logger.info(`Password reset successful for: ${user.email}`);

        res.json({
            success: true,
            message: 'Password has been reset successfully',
        });
    } catch (_error: any) {
        logger.error('Reset password error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
        });
    }
};
