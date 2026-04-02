import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';

/**
 * Clock in
 */
export const clockIn = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const employee = await prisma.employee.findUnique({
            where: { userId },
            include: { shift: true },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check for active session (clocked in but not clocked out)
        const activeSession = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                },
                clockOut: null,
            },
        });

        if (activeSession) {
            return res.status(400).json({
                success: false,
                message: 'You are already clocked in',
            });
        }

        // Check assigned shift for punctuality and restriction
        let status: 'PRESENT' | 'LATE' = 'PRESENT';

        if (employee.shift) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes();

            const [startHour, startMin] = employee.shift.startTime.split(':').map(Number);
            const [endHour, endMin] = employee.shift.endTime.split(':').map(Number);

            const shiftStart = startHour * 60 + startMin;
            const shiftEnd = endHour * 60 + endMin;

            // Allow 30 minutes early clock-in
            // const allowedStart = shiftStart - 30;

            // Removing the strict shift block as it causes issues with timezones and late employees
            // if (currentTime < allowedStart || currentTime > shiftEnd) {
            //     return res.status(400).json({
            //         success: false,
            //         message: `You can only clock in during your shift (${employee.shift.startTime} - ${employee.shift.endTime})`,
            //     });
            // }

            // Check for late status (15 minutes grace period)
            if (currentTime > shiftStart + 15) {
                status = 'LATE';
            }
        }

        const attendance = await prisma.attendance.create({
            data: {
                employeeId: employee.id,
                date: new Date(),
                clockIn: new Date(),
                status,
            },
        });

        logger.info(`Clock in: ${employee.email} - Status: ${status}`);

        res.json({
            success: true,
            message: status === 'LATE' ? 'Clocked in successfully (Late)' : 'Clocked in successfully',
            data: attendance,
        });
    } catch (_error: any) {
        logger.error('Clock in error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to clock in',
        });
    }
};

/**
 * Clock out
 */
export const clockOut = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await prisma.attendance.findFirst({
            where: {
                employeeId: employee.id,
                date: {
                    gte: today,
                },
                clockOut: null, // Find active session
            },
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: 'No active clock-in record found',
            });
        }

        const clockOutTime = new Date();
        const clockInTime = new Date(attendance.clockIn);
        const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

        const updated = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                clockOut: clockOutTime,
                hoursWorked: parseFloat(hoursWorked.toFixed(2)),
            },
        });

        logger.info(`Clock out: ${employee.email}`);

        res.json({
            success: true,
            message: 'Clocked out successfully',
            data: updated,
        });
    } catch (_error: any) {
        logger.error('Clock out error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to clock out',
        });
    }
};

/**
 * Get monthly summary
 */
export const getMonthlySummary = async (req: AuthRequest, res: Response) => {
    try {
        const { month } = req.params; // Format: YYYY-MM
        const userId = req.user?.userId;

        const employee = await prisma.employee.findUnique({
            where: { userId },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        const [year, monthNum] = month.split('-').map(Number);
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0);

        const attendance = await prisma.attendance.findMany({
            where: {
                employeeId: employee.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                date: 'asc',
            },
        });

        // Calculate unique days
        const uniqueDays = new Set(attendance.map(a => a.date.toISOString().split('T')[0]));
        const totalDays = uniqueDays.size; // This is actually days worked

        // Count status based on unique days (if any record for a day is PRESENT, day is PRESENT)
        // Group by day
        const dayRecords: Record<string, typeof attendance> = {};
        attendance.forEach(a => {
            const day = a.date.toISOString().split('T')[0];
            if (!dayRecords[day]) dayRecords[day] = [];
            dayRecords[day].push(a);
        });

        let presentDays = 0;
        let absentDays = 0;
        let lateDays = 0;

        Object.values(dayRecords).forEach(records => {
            const hasPresent = records.some(r => r.status === 'PRESENT');
            const hasLate = records.some(r => r.status === 'LATE');
            const hasAbsent = records.every(r => r.status === 'ABSENT'); // Only if ALL are absent

            if (hasPresent) presentDays++;
            else if (hasLate) lateDays++;
            else if (hasAbsent) absentDays++;
            // Note: This logic assumes if you clock in LATE then clock in again PRESENT, it counts as PRESENT? 
            // Or simplest: if any record is present/late, user was there.
            // Adjust logic as needed. Here prioritizing Present > Late > Absent
            if (records.some(r => r.status === 'PRESENT')) {
                // checks above cover this
            }
        });

        // Re-calculate simpler counters for now to match interface
        // Just counting records might be misleading if multiple per day. 
        // Let's use the grouped logic.

        presentDays = Object.values(dayRecords).filter(records => records.some(r => r.status === 'PRESENT')).length;
        lateDays = Object.values(dayRecords).filter(records => !records.some(r => r.status === 'PRESENT') && records.some(r => r.status === 'LATE')).length;
        absentDays = Object.values(dayRecords).filter(records => records.every(r => r.status === 'ABSENT')).length;

        // Total expected working days could be calculated based on month, but for now we return worked days stats

        res.json({
            success: true,
            data: {
                month,
                attendance,
                summary: {
                    totalDays,
                    presentDays,
                    absentDays,
                    lateDays,
                    attendanceRate: totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0,
                },
            },
        });
    } catch (_error: any) {
        logger.error('Get monthly summary error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch monthly summary',
        });
    }
};

/**
 * Get detailed attendance report
 */
export const getAttendanceReport = async (req: AuthRequest, res: Response) => {
    try {
        const { startDate, endDate, departmentId, employeeId } = req.query;

        const where: any = {};

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate as string);
            if (endDate) where.date.lte = new Date(endDate as string);
        }

        if (employeeId) {
            where.employeeId = employeeId;
        } else if (departmentId) {
            where.employee = {
                departmentId: departmentId as string
            };
        }

        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                employee: {
                    select: {
                        firstName: true,
                        lastName: true,
                        employeeId: true,
                        department: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        res.json({
            success: true,
            data: attendance
        });
    } catch (_error: any) {
        logger.error('Get attendance report error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance report',
        });
    }
};
