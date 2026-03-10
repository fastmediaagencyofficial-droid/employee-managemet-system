import prisma from '../config/database';

/**
 * Helper function to get employee database ID (UUID) from user ID
 * @param userId - The user ID from JWT token
 * @returns Employee database ID (UUID) or null if not found
 */
export const getEmployeeIdFromUserId = async (userId: string): Promise<string | null> => {
    const employee = await prisma.employee.findFirst({
        where: { userId },
        select: { id: true },
    });

    return employee?.id || null;
};
