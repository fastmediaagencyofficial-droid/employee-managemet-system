import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get all shifts
 */
export const getAllShifts = async (req: AuthRequest, res: Response) => {
    try {
        console.log(`[ShiftController] Getting all shifts for user: ${req.user?.userId}`);
        const shifts = await prisma.shift.findMany({
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        });
        console.log(`[ShiftController] Found ${shifts.length} shifts`);

        res.json({
            success: true,
            data: shifts,
        });
    } catch (error) {
        logger.error('Get all shifts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shifts',
        });
    }
};

/**
 * Get shift by ID
 */
export const getShiftById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const shift = await prisma.shift.findUnique({
            where: { id },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        position: true,
                    }
                }
            }
        });

        if (!shift) {
            return res.status(404).json({
                success: false,
                message: 'Shift not found',
            });
        }

        res.json({
            success: true,
            data: shift,
        });
    } catch (error) {
        logger.error('Get shift error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch shift',
        });
    }
};

/**
 * Create new shift
 */
export const createShift = async (req: AuthRequest, res: Response) => {
    try {
        const { name, startTime, endTime, workDays } = req.body;

        const shift = await prisma.shift.create({
            data: {
                name,
                startTime,
                endTime,
                workDays,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Shift created successfully',
            data: shift,
        });
    } catch (error) {
        logger.error('Create shift error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create shift',
        });
    }
};

/**
 * Update shift
 */
export const updateShift = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, startTime, endTime, workDays } = req.body;

        const shift = await prisma.shift.update({
            where: { id },
            data: {
                name,
                startTime,
                endTime,
                workDays,
            },
        });

        res.json({
            success: true,
            message: 'Shift updated successfully',
            data: shift,
        });
    } catch (error) {
        logger.error('Update shift error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update shift',
        });
    }
};

/**
 * Delete shift
 */
export const deleteShift = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check if employees are assigned
        const employeeCount = await prisma.employee.count({
            where: { shiftId: id }
        });

        if (employeeCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete shift with assigned employees',
            });
        }

        await prisma.shift.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Shift deleted successfully',
        });
    } catch (error) {
        logger.error('Delete shift error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete shift',
        });
    }
};

/**
 * Assign employee to shift
 */
export const assignShift = async (req: AuthRequest, res: Response) => {
    try {
        const { employeeId, shiftId } = req.body;

        const updatedEmployee = await prisma.employee.update({
            where: { id: employeeId },
            data: { shiftId },
        });

        res.json({
            success: true,
            message: 'Employee assigned to shift successfully',
            data: updatedEmployee
        });
    } catch (error) {
        logger.error('Assign shift error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign shift',
        });
    }
};
