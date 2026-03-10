import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Calculate payroll for an employee for a specific month
 */
export const calculatePayroll = async (req: AuthRequest, res: Response) => {
    try {
        const { employeeId, month } = req.query; // month in YYYY-MM format

        if (!employeeId || !month) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID and month are required',
            });
        }

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId as string },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        if (!employee.hourlyRate) {
            return res.status(400).json({
                success: false,
                message: 'Employee does not have an hourly rate assigned',
            });
        }

        const [year, monthNum] = (month as string).split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0); // Last day of month

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                employeeId: employeeId as string,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'PRESENT',
            },
        });

        let totalHours = 0;
        attendanceRecords.forEach(record => {
            if (record.hoursWorked) {
                totalHours += record.hoursWorked;
            }
        });

        const totalSalary = totalHours * Number(employee.hourlyRate);

        res.json({
            success: true,
            data: {
                employee: {
                    id: employee.id,
                    name: `${employee.firstName} ${employee.lastName}`,
                    hourlyRate: employee.hourlyRate,
                },
                month,
                totalHours: parseFloat(totalHours.toFixed(2)),
                totalSalary: parseFloat(totalSalary.toFixed(2)),
                currency: 'PKR' // Assuming default currency
            },
        });

    } catch (_error: any) {
        logger.error('Calculate payroll error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate payroll',
        });
    }
};
