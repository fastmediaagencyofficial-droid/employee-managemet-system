import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import prisma from '../config/database';
import logger from '../middlewares/logger';
import {
    parseExcelFile,
    parseCSVFile,
    validateEmployeeData,
    generateTemplate,
    formatValidationErrors,
    EmployeeRow,
} from '../utils/excelParser';
import { deleteFile } from '../middlewares/fileUpload';
import path from 'path';
import bcrypt from 'bcrypt';

/**
 * Upload bulk employees from Excel/CSV file
 */
export const uploadBulkEmployees = async (req: AuthRequest, res: Response) => {
    let filePath: string | undefined;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        // Parse file based on extension
        let employeeData: EmployeeRow[];

        if (fileExtension === '.csv') {
            employeeData = await parseCSVFile(filePath);
        } else {
            employeeData = parseExcelFile(filePath);
        }

        // Check row limit
        if (employeeData.length > 500) {
            await deleteFile(filePath);
            return res.status(400).json({
                success: false,
                message: 'Maximum 500 employees allowed per upload',
            });
        }

        if (employeeData.length === 0) {
            await deleteFile(filePath);
            return res.status(400).json({
                success: false,
                message: 'File is empty or has no valid data',
            });
        }

        // Validate data
        const validationErrors = validateEmployeeData(employeeData);

        // Check for existing emails in database
        const emails = employeeData
            .filter((row) => row.email) // Filter out rows with undefined/null email
            .map((row) => row.email.toLowerCase());
        const existingEmployees = await prisma.employee.findMany({
            where: {
                email: {
                    in: emails,
                },
            },
            select: {
                email: true,
            },
        });

        const existingEmails = new Set(existingEmployees.map((e) => e.email.toLowerCase()));
        employeeData.forEach((row, index) => {
            if (row.email && existingEmails.has(row.email.toLowerCase())) {
                validationErrors.push({
                    row: index + 2,
                    field: 'email',
                    message: `Email ${row.email} already exists in system`,
                });
            }
        });

        // Check if departments exist
        const departmentNames = [...new Set(employeeData
            .map((row) => row.department)
            .filter((dept) => dept && dept.trim() !== '')
        )];
        const existingDepartments = await prisma.department.findMany({
            where: {
                name: {
                    in: departmentNames,
                },
            },
            select: {
                name: true,
                id: true,
            },
        });

        const departmentMap = new Map(existingDepartments.map((d) => [d.name, d.id]));
        const missingDepartments: string[] = [];

        employeeData.forEach((row, index) => {
            if (!departmentMap.has(row.department)) {
                if (!missingDepartments.includes(row.department)) {
                    missingDepartments.push(row.department);
                }
                validationErrors.push({
                    row: index + 2,
                    field: 'department',
                    message: `Department '${row.department}' not found`,
                });
            }
        });

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            await deleteFile(filePath);

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors,
                summary: {
                    total: employeeData.length,
                    failed: validationErrors.length,
                    missingDepartments: missingDepartments.length > 0
                        ? `Available departments: ${existingDepartments.map(d => d.name).join(', ')}`
                        : undefined,
                },
            });
        }

        // Create employees in transaction
        const results = await prisma.$transaction(async (tx) => {
            const created = [];
            const failed = [];

            // Get current employee count for ID generation
            let employeeCount = await tx.employee.count();

            for (let i = 0; i < employeeData.length; i++) {
                const row = employeeData[i];

                try {
                    // Generate employee ID
                    employeeCount++;
                    const employeeId = `EMP${String(employeeCount).padStart(4, '0')}`;

                    // Create user first
                    const hashedPassword = await bcrypt.hash('password123', 10);
                    const user = await tx.user.create({
                        data: {
                            email: row.email,
                            password: hashedPassword,
                            name: `${row.firstName} ${row.lastName}`,
                            role: 'EMPLOYEE',
                        },
                    });

                    // Create employee
                    const employee = await tx.employee.create({
                        data: {
                            userId: user.id,
                            employeeId,
                            firstName: row.firstName,
                            lastName: row.lastName,
                            email: row.email,
                            phone: row.phone || null,
                            dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
                            gender: row.gender ? (row.gender.toUpperCase() as any) : null,
                            address: row.address || null,
                            city: row.city || null,
                            country: row.country || null,
                            postalCode: row.postalCode || null,
                            position: row.position,
                            departmentId: departmentMap.get(row.department)!,
                            salary: row.salary ? parseFloat(row.salary) : null,
                            hireDate: new Date(row.hireDate),
                            employmentType: row.employmentType.toUpperCase() as any,
                            status: 'ACTIVE',
                            cnic: row.cnic || null,
                            highestQualification: row.highestQualification || null,
                            institute: row.institute || null,
                        },
                    });

                    created.push({
                        row: i + 2,
                        employeeId: employee.employeeId,
                        name: `${employee.firstName} ${employee.lastName}`,
                        email: employee.email,
                    });
                } catch (error: any) {
                    logger.error(`Failed to create employee at row ${i + 2}:`, error);
                    failed.push({
                        row: i + 2,
                        email: row.email,
                        error: error.message,
                    });
                }
            }

            return { created, failed };
        });

        // Delete uploaded file
        await deleteFile(filePath);

        logger.info(`Bulk upload completed: ${results.created.length} created, ${results.failed.length} failed`);

        res.json({
            success: true,
            message: `Successfully created ${results.created.length} employees`,
            data: {
                created: results.created,
                failed: results.failed,
                summary: {
                    total: employeeData.length,
                    succeeded: results.created.length,
                    failed: results.failed.length,
                },
            },
        });
    } catch (error: any) {
        logger.error('Bulk upload error:', error);

        // Clean up file if it exists
        if (filePath) {
            try {
                await deleteFile(filePath);
            } catch (cleanupError) {
                logger.error('Failed to delete uploaded file:', cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to process bulk upload',
            error: error.message,
        });
    }
};

/**
 * Download Excel template
 */
export const downloadTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const buffer = generateTemplate();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=employee_template.xlsx');
        res.send(buffer);
    } catch (error: any) {
        logger.error('Template download error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate template',
        });
    }
};

/**
 * Validate bulk file without creating employees
 */
export const validateBulkFile = async (req: AuthRequest, res: Response) => {
    let filePath: string | undefined;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        // Parse file
        let employeeData: EmployeeRow[];

        if (fileExtension === '.csv') {
            employeeData = await parseCSVFile(filePath);
        } else {
            employeeData = parseExcelFile(filePath);
        }

        // Validate data
        const validationErrors = validateEmployeeData(employeeData);

        // Check for existing emails
        const emails = employeeData
            .filter((row) => row.email) // Filter out rows with undefined/null email
            .map((row) => row.email.toLowerCase());
        const existingEmployees = await prisma.employee.findMany({
            where: {
                email: {
                    in: emails,
                },
            },
            select: {
                email: true,
            },
        });

        const existingEmails = new Set(existingEmployees.map((e) => e.email.toLowerCase()));
        employeeData.forEach((row, index) => {
            if (row.email && existingEmails.has(row.email.toLowerCase())) {
                validationErrors.push({
                    row: index + 2,
                    field: 'email',
                    message: `Email ${row.email} already exists in system`,
                });
            }
        });

        // Delete uploaded file
        await deleteFile(filePath);

        res.json({
            success: validationErrors.length === 0,
            message: validationErrors.length === 0
                ? 'File validation successful'
                : 'Validation errors found',
            data: {
                totalRows: employeeData.length,
                validRows: employeeData.length - validationErrors.length,
                errors: validationErrors,
            },
        });
    } catch (error: any) {
        logger.error('Validation error:', error);

        if (filePath) {
            try {
                await deleteFile(filePath);
            } catch (cleanupError) {
                logger.error('Failed to delete uploaded file:', cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to validate file',
            error: error.message,
        });
    }
};
