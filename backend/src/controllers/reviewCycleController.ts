import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllCycles = async (req: Request, res: Response) => {
    try {
        const cycles = await prisma.reviewCycle.findMany({
            include: {
                _count: {
                    select: { reviews: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: cycles });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCycleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cycle = await prisma.reviewCycle.findUnique({
            where: { id },
            include: {
                reviews: {
                    include: {
                        employee: true,
                        reviewer: true
                    }
                }
            }
        });
        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Review cycle not found' });
        }
        res.json({ success: true, data: cycle });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createCycle = async (req: Request, res: Response) => {
    try {
        const { name, description, startDate, endDate, status } = req.body;
        const cycle = await prisma.reviewCycle.create({
            data: {
                name,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || 'ACTIVE'
            }
        });
        res.status(201).json({ success: true, data: cycle });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCycle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, startDate, endDate, status } = req.body;
        const cycle = await prisma.reviewCycle.update({
            where: { id },
            data: {
                name,
                description,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                status
            }
        });
        res.json({ success: true, data: cycle });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCycle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if there are reviews associated
        const count = await prisma.review.count({ where: { cycleId: id } });
        if (count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete cycle with associated reviews. Close the cycle instead.'
            });
        }

        await prisma.reviewCycle.delete({ where: { id } });
        res.json({ success: true, message: 'Review cycle deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
