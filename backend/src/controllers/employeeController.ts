import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';
import { hashPassword, generateRandomPassword } from '../utils/bcrypt';
import { sendWelcomeEmail } from '../services/emailService';

/**
 * Get all employees
 */
export const getAllEmployees = async (req: AuthRequest, res: Response) => {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                shift: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: employees,
            total: employees.length,
        });
    } catch (_error: any) {
        logger.error('Get all employees error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
        });
    }
};

/**
 * Get single employee
 */
export const getEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                department: true,
                manager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                subordinates: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        position: true,
                    },
                },
                attendance: {
                    take: 10,
                    orderBy: {
                        date: 'desc',
                    },
                },
                leaveRequests: {
                    take: 5,
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                goals: {
                    take: 5,
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                shift: true,
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        res.json({
            success: true,
            data: employee,
        });
    } catch (_error: any) {
        logger.error('Get employee error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch employee',
        });
    }
};

/**
 * Create employee
 */
export const createEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            address,
            city,
            country,
            postalCode,
            position,
            departmentId,
            managerId,
            salary,
            hireDate,
            employmentType,
            cnic,
            highestQualification,
            institute,
            hourlyRate,
        } = req.body;

        // Validations
        if (!departmentId) {
            return res.status(400).json({
                success: false,
                message: 'Department is required',
            });
        }

        // Check for existing user/employee/cnic to give better error messages
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        if (cnic) {
            const existingCnic = await prisma.employee.findUnique({ where: { cnic } });
            if (existingCnic) {
                return res.status(400).json({ success: false, message: 'CNIC already exists' });
            }
        }

        const existingPhone = await prisma.employee.findFirst({ where: { phone } });
        if (existingPhone) {
            return res.status(400).json({ success: false, message: 'Phone number already exists' });
        }

        // Generate employee ID by safely finding the absolute maximum numerical ID
        // Note: fetching all IDs avoids string alphabetical sort problems (e.g., 'EMP003' > 'EMP0004')
        const allEmployees = await prisma.employee.findMany({
            select: { employeeId: true }
        });
        
        let maxId = 0;
        for (const emp of allEmployees) {
            if (emp.employeeId && emp.employeeId.startsWith('EMP')) {
                const parts = emp.employeeId.match(/\d+$/);
                if (parts) {
                    const num = parseInt(parts[0], 10);
                    if (!isNaN(num) && num > maxId) {
                        maxId = num;
                    }
                }
            }
        }
        
        let nextNumber = maxId > 0 ? maxId + 1 : allEmployees.length + 1;
        const employeeId = `EMP${String(nextNumber).padStart(4, '0')}`;

        // Validate department existence
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
        });

        if (!department) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department ID',
            });
        }

        // Generate random password
        const plainPassword = generateRandomPassword(12);
        const hashedPassword = await hashPassword(plainPassword);

        // Transaction to ensure atomicity
        const result = await prisma.$transaction(async (prisma) => {
            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: `${firstName} ${lastName}`,
                    role: 'EMPLOYEE',
                },
            });

            // Create employee
            const employee = await prisma.employee.create({
                data: {
                    userId: user.id,
                    employeeId,
                    firstName,
                    lastName,
                    email,
                    phone,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    gender,
                    address,
                    city,
                    country,
                    postalCode,
                    position,
                    departmentId,
                    managerId: managerId || null,
                    salary,
                    hireDate: new Date(hireDate),
                    employmentType,
                    status: 'ACTIVE',
                    cnic: cnic || null,
                    highestQualification: highestQualification || null,
                    institute: institute || null,
                    hourlyRate: hourlyRate ? Number(hourlyRate) : null,
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            role: true,
                        },
                    },
                    department: true,
                    shift: true,
                },
            });

            return employee;
        });

        // Send welcome email (outside transaction)
        try {
            const emailSent = await sendWelcomeEmail(email, `${firstName} ${lastName}`, plainPassword, employeeId);
            if (emailSent) {
                logger.info(`✅ Welcome email sent successfully to: ${email}`);
            } else {
                logger.warn(`⚠️ Welcome email was NOT sent to ${email}. Check your EMAIL_USER and EMAIL_PASSWORD variables.`);
            }
        } catch (emailError) {
            logger.error(`❌ Failed to send welcome email to ${email}:`, emailError);
            // We don't fail the request if email fails, but we log it.
        }

        logger.info(`Employee created: ${result.email}`);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: result,
        });
    } catch (error: any) {
        logger.error('Create employee error:', error);

        // Handle unique constraint violations if race conditions occur
        if (error.code === 'P2002') {
            const field = error.meta?.target?.[0];
            return res.status(400).json({
                success: false,
                message: `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Field'} already exists`,
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create employee',
        });
    }
};

/**
 * Update employee
 */
export const updateEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData.userId;
        delete updateData.employeeId;
        delete updateData.createdAt;

        // Convert date strings to Date objects or null
        if (updateData.dateOfBirth) {
            updateData.dateOfBirth = new Date(updateData.dateOfBirth);
        } else if (updateData.dateOfBirth === '') {
            updateData.dateOfBirth = null;
        }

        if (updateData.hireDate) {
            updateData.hireDate = new Date(updateData.hireDate);
        } else if (updateData.hireDate === '') {
            updateData.hireDate = undefined; // Hire date usually shouldn't be nullified if required, but handle empty string
        }

        // Handle optional fields that might be empty strings
        const optionalFields = ['cnic', 'highestQualification', 'institute', 'address', 'city', 'country', 'postalCode'];
        optionalFields.forEach(field => {
            if (updateData[field] === '') {
                updateData[field] = null;
            }
        });

        // Convert empty managerId to null
        if (updateData.managerId === '' || updateData.managerId === 'null' || updateData.managerId === undefined) {
            updateData.managerId = null;
        }

        // Handle numeric fields
        if (updateData.hourlyRate) {
            updateData.hourlyRate = Number(updateData.hourlyRate);
        } else if (updateData.hourlyRate === '') {
            updateData.hourlyRate = null;
        }

        if (updateData.salary) {
            updateData.salary = Number(updateData.salary); // Assuming salary is Decimal in Prisma, passing number or string usually works but empty string fails
        } else if (updateData.salary === '') {
            updateData.salary = null;
        }

        const employee = await prisma.employee.update({
            where: { id },
            data: {
                ...updateData,
            },
            include: {
                user: {
                    select: {
                        email: true,
                        role: true,
                    },
                },
                department: true,
                shift: true,
            },
        });

        logger.info(`Employee updated: ${employee.email}`);

        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee,
        });
    } catch (_error: any) {
        logger.error('Update employee error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to update employee',
        });
    }
};

/**
 * Delete employee
 */
export const deleteEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Get employee to find user ID
        const employee = await prisma.employee.findUnique({
            where: { id },
            select: { userId: true, email: true },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Delete user (will cascade delete employee due to onDelete: Cascade on the relation)
        await prisma.user.delete({
            where: { id: employee.userId },
        });

        logger.info(`Employee deleted: ${employee.email}`);

        res.json({
            success: true,
            message: 'Employee deleted successfully',
        });
    } catch (_error: any) {
        logger.error('Delete employee error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete employee',
        });
    }
};

/**
 * Get dashboard stats
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalEmployees = await prisma.employee.count({
            where: { status: 'ACTIVE' },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const presentToday = await prisma.attendance.count({
            where: {
                date: {
                    gte: today,
                },
                status: 'PRESENT',
            },
        });

        const onLeave = await prisma.leaveRequest.count({
            where: {
                status: 'APPROVED',
                startDate: {
                    lte: new Date(),
                },
                endDate: {
                    gte: new Date(),
                },
            },
        });

        const pendingRequests = await prisma.leaveRequest.count({
            where: {
                status: 'PENDING',
            },
        });

        res.json({
            success: true,
            data: {
                totalEmployees,
                presentToday,
                onLeave,
                pendingRequests,
            },
        });
    } catch (_error: any) {
        logger.error('Get dashboard stats error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
        });
    }
};

/**
 * Upload employee document
 */
export const uploadDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { documentType } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Verify employee exists
        const employee = await prisma.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found',
            });
        }

        // Create document record
        const document = await prisma.employeeDocument.create({
            data: {
                employeeId: id,
                documentType: documentType || 'OTHER',
                fileName: req.file.originalname,
                filePath: req.file.path,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                uploadedBy: req.user?.userId,
            },
        });

        logger.info(`Document uploaded for employee: ${id}`);

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: document,
        });
    } catch (_error: any) {
        logger.error('Upload document error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
        });
    }
};

/**
 * Get employee documents
 */
export const getEmployeeDocuments = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const documents = await prisma.employeeDocument.findMany({
            where: {
                employeeId: id,
            },
            orderBy: {
                uploadedAt: 'desc',
            },
        });

        res.json({
            success: true,
            data: documents,
        });
    } catch (_error: any) {
        logger.error('Get documents error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
        });
    }
};

/**
 * Delete employee document
 */
export const deleteDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { documentId } = req.params;

        const document = await prisma.employeeDocument.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        // Delete file from filesystem
        const fs = require('fs');
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Delete database record
        await prisma.employeeDocument.delete({
            where: { id: documentId },
        });

        logger.info(`Document deleted: ${documentId}`);

        res.json({
            success: true,
            message: 'Document deleted successfully',
        });
    } catch (_error: any) {
        logger.error('Delete document error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
        });
    }
};

/**
 * Download employee document
 */
export const downloadDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { documentId } = req.params;

        const document = await prisma.employeeDocument.findUnique({
            where: { id: documentId },
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found',
            });
        }

        const fs = require('fs');
        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server',
            });
        }

        res.download(document.filePath, document.fileName);
    } catch (_error: any) {
        logger.error('Download document error:', _error);
        res.status(500).json({
            success: false,
            message: 'Failed to download document',
        });
    }
};

