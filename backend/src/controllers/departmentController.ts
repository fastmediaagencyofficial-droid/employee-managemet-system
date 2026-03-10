import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Get all departments
 */
export const getAllDepartments = async (req: AuthRequest, res: Response) => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: { employees: true },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        res.json({
            success: true,
            data: departments,
        });
    } catch (_error: any) {
        logger.error('Get all departments error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch departments',
        });
    }
};

/**
 * Get single department
 */
export const getDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                employees: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                        email: true,
                    },
                },
            },
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found',
            });
        }

        res.json({
            success: true,
            data: department,
        });
    } catch (_error: any) {
        logger.error('Get department error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department',
        });
    }
};

/**
 * Create department
 */
export const createDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, headId } = req.body;

        const existing = await prisma.department.findUnique({
            where: { name },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists',
            });
        }

        const department = await prisma.department.create({
            data: {
                name,
                description,
                headId,
            },
        });

        logger.info(`Department created: ${department.name}`);

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department,
        });
    } catch (_error: any) {
        logger.error('Create department error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to create department',
        });
    }
};

/**
 * Update department
 */
export const updateDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, headId } = req.body;

        const department = await prisma.department.update({
            where: { id },
            data: {
                name,
                description,
                headId,
            },
        });

        logger.info(`Department updated: ${department.name}`);

        res.json({
            success: true,
            message: 'Department updated successfully',
            data: department,
        });
    } catch (_error: any) {
        logger.error('Update department error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to update department',
        });
    }
};

/**
 * Delete department
 */
export const deleteDepartment = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Check if department has employees
        const employeeCount = await prisma.employee.count({
            where: { departmentId: id },
        });

        if (employeeCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete department with assigned employees',
            });
        }

        await prisma.department.delete({
            where: { id },
        });

        logger.info(`Department deleted: ${id}`);

        res.json({
            success: true,
            message: 'Department deleted successfully',
        });
    } catch (_error: any) {
        logger.error('Delete department error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete department',
        });
    }
};
