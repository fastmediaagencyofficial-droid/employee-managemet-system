import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Create employee record for current user if it doesn't exist
 * @route POST /api/auth/create-employee-record
 * @access Private
 */
export const createEmployeeRecord = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const email = req.user?.email;

        if (!userId || !email) {
            return res.status(400).json({
                success: false,
                message: 'User information not found',
            });
        }

        // Check if employee record already exists
        const existingEmployee = await prisma.employee.findFirst({
            where: { userId },
        });

        if (existingEmployee) {
            return res.status(200).json({
                success: true,
                message: 'Employee record already exists',
                data: existingEmployee,
            });
        }

        // Get user details
        const user = await prisma.user.findUnique({
            where: { id: userId },
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

        // Get a default department (or create one if none exists)
        let department = await prisma.department.findFirst();

        if (!department) {
            department = await prisma.department.create({
                data: {
                    name: 'General',
                    description: 'Default department',
                },
            });
        }

        // Generate employee ID
        const employeeCount = await prisma.employee.count();
        const employeeId = `EMP${String(employeeCount + 1).padStart(3, '0')}`;

        // Extract name from email (before @)
        const emailName = email.split('@')[0];
        const nameParts = emailName.split(/[._-]/);
        const firstName = nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || 'User';
        const lastName = nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || 'Account';

        // Create employee record
        const employee = await prisma.employee.create({
            data: {
                userId: user.id,
                employeeId,
                firstName,
                lastName,
                email: user.email,
                position: user.role === 'ADMIN' ? 'System Administrator' : 'Employee',
                departmentId: department.id,
                salary: 0,
                hireDate: new Date(),
                employmentType: 'FULL_TIME',
                status: 'ACTIVE',
            },
        });

        logger.info(`Employee record created for user: ${user.email}`);

        res.status(201).json({
            success: true,
            message: 'Employee record created successfully',
            data: employee,
        });
    } catch (error: any) {
        logger.error('Create employee record error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create employee record',
            error: error.message,
        });
    }
};
