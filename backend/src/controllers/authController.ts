import { Response } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import logger from '../middlewares/logger';
import { blacklistToken } from '../services/tokenBlacklist';
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from '../services/emailService';

/**
 * Register new user
 */
export const register = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, role = 'EMPLOYEE' } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        logger.info(`New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user,
        });
    } catch (_error: any) {
        logger.error('Registration error:', _error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
        });
    }
};

/**
 * Login user
 */
export const login = async (req: AuthRequest, res: Response) => {
    try {
        let { email, password } = req.body;
        
        // Trim inputs to handle copy-paste trailing spaces from emails
        email = email?.trim();
        password = password?.trim();

        // Check for hardcoded env users
        const hardcodedUsers = [
            {
                email: process.env.SUPER_ADMIN_EMAIL,
                password: process.env.SUPER_ADMIN_PASSWORD,
                role: 'ADMIN',
                name: 'Super Admin',
                employee: null
            },
            {
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'ADMIN',
                name: 'Admin',
                employee: null
            },
            {
                email: process.env.HR_EMAIL,
                password: process.env.HR_PASSWORD,
                role: 'HR',
                name: 'HR Manager',
                employee: null
            }
        ];

        const envUser = hardcodedUsers.find(
            (u) => u.email && u.password && u.email === email && u.password === password
        );

        if (envUser) {
            const userId = envUser.email; // Use email as ID for env users

            const accessToken = generateAccessToken({
                userId,
                email: envUser.email,
                role: envUser.role,
            });

            const refreshToken = generateRefreshToken({
                userId,
                email: envUser.email,
                role: envUser.role,
            });

            logger.info(`Env user logged in: ${email}`);

            return res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: userId,
                        email: envUser.email,
                        name: envUser.name,
                        role: envUser.role,
                        employee: null
                    },
                    accessToken,
                    refreshToken,
                },
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                employee: {
                    select: {
                        id: true,
                        employeeId: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                        department: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        logger.info(`User logged in: ${email}`);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                accessToken,
                refreshToken,
            },
        });
    } catch (_error: any) {
        logger.error('Login error:', _error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
        });
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        // Check for hardcoded env users
        const hardcodedUsers = [
            {
                email: process.env.SUPER_ADMIN_EMAIL,
                role: 'ADMIN',
                name: 'Super Admin',
            },
            {
                email: process.env.ADMIN_EMAIL,
                role: 'ADMIN',
                name: 'Admin',
            },
            {
                email: process.env.HR_EMAIL,
                role: 'HR',
                name: 'HR Manager',
            }
        ];

        const envUser = hardcodedUsers.find(u => u.email && u.email === req.user?.userId);
        if (envUser) {
            return res.json({
                success: true,
                data: {
                    id: envUser.email,
                    email: envUser.email,
                    name: envUser.name,
                    role: envUser.role,
                    employee: null
                },
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                employee: {
                    include: {
                        department: true,
                        manager: {
                            select: {
                                firstName: true,
                                lastName: true,
                                position: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        res.json({
            success: true,
            data: userWithoutPassword,
        });
    } catch (_error: any) {
        logger.error('Get profile error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
        });
    };
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const { name, email, phone } = req.body;

        // Check if email is being changed and if it's already taken
        if (email && email !== req.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use',
                });
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });

        // Update employee phone if provided and employee exists
        if (phone) {
            await prisma.employee.updateMany({
                where: { userId: req.user.userId },
                data: { phone },
            });
        }

        logger.info(`Profile updated: ${updatedUser.email}`);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    } catch (error: any) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
        });
    }
};

/**
 * Change user password
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new passwords are required',
            });
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Verify current password
        const isValidPassword = await comparePassword(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { password: hashedPassword },
        });

        logger.info(`Password changed: ${user.email}`);

        res.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error: any) {
        logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
        });
    }
};

/**
 * Logout user
 */
export const logout = async (req: AuthRequest, res: Response) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);

            // Blacklist the access token
            // Tokens expire in 15 minutes, so blacklist for that duration
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            await blacklistToken(token, expiresAt);
        }

        logger.info(`User logged out: ${req.user?.email}`);

        res.json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error: any) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
        });
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: AuthRequest, res: Response) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
        }

        // Verify user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Optionally generate new refresh token (token rotation)
        const newRefreshToken = generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        logger.info(`Token refreshed for user: ${user.email}`);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error: any) {
        logger.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }
};

/**
 * Forgot password
 */
export const forgotPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Check if employee exists with this email but no user account (edge case)
            // But generally we just return success to avoid enumeration, or 404 if internal tool.
            // Let's return 404 for clarity in this system
            return res.status(404).json({
                success: false,
                message: 'User with this email does not exist',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const passwordResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Token expires in 1 hour
        const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken,
                passwordResetExpires,
            },
        });

        // Send email
        try {
            await sendPasswordResetEmail(user.email, resetToken, user.name || 'User');

            res.json({
                success: true,
                message: 'Password reset link sent to email',
            });
        } catch (emailError) {
            // Rollback token if email fails
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetToken: null,
                    passwordResetExpires: null,
                },
            });

            logger.error('Send password reset email error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send password reset email',
            });
        }
    } catch (error: any) {
        logger.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request',
        });
    }
};

/**
 * Reset password
 */
export const resetPassword = async (req: AuthRequest, res: Response) => {
    try {
        const { token, password } = req.body;

        // Hash token to compare with DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token is invalid or has expired',
            });
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null,
            },
        });

        // Send confirmation email
        try {
            await sendPasswordResetConfirmation(user.email, user.name || 'User');
        } catch (emailError) {
            logger.error('Send password reset confirmation error:', emailError);
        }

        res.json({
            success: true,
            message: 'Password reset successful',
        });
    } catch (error: any) {
        logger.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
        });
    }
};
