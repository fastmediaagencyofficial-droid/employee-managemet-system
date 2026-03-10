import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

export interface EmployeeRow {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    position: string;
    department: string;
    hireDate: string;
    employmentType: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    salary?: string;
    cnic?: string;
    highestQualification?: string;
    institute?: string;
}

export interface ValidationError {
    row: number;
    field: string;
    message: string;
}

export interface ParseResult {
    data: EmployeeRow[];
    errors: ValidationError[];
}

/**
 * Parse Excel file to JSON
 */
export const parseExcelFile = (filePath: string): EmployeeRow[] => {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json<EmployeeRow>(worksheet, {
            raw: false, // Convert dates to strings
            defval: '', // Default value for empty cells
        });

        return jsonData;
    } catch (error: any) {
        throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
};

/**
 * Parse CSV file to JSON
 */
export const parseCSVFile = (filePath: string): Promise<EmployeeRow[]> => {
    return new Promise((resolve, reject) => {
        const results: EmployeeRow[] = [];

        try {
            if (!fs.existsSync(filePath)) {
                return reject(new Error(`File not found: ${filePath}`));
            }

            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Validate employee data
 */
export const validateEmployeeData = (data: EmployeeRow[], rowOffset = 2): ValidationError[] => {
    const errors: ValidationError[] = [];
    const emailSet = new Set<string>();

    // Required fields
    const requiredFields: (keyof EmployeeRow)[] = [
        'firstName',
        'lastName',
        'email',
        'position',
        'department',
        'hireDate',
        'employmentType',
    ];

    // Valid employment types
    const validEmploymentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'];

    // Valid genders
    const validGenders = ['MALE', 'FEMALE', 'OTHER', ''];

    data.forEach((row, index) => {
        const rowNumber = index + rowOffset;

        // Check required fields
        requiredFields.forEach((field) => {
            if (!row[field] || String(row[field]).trim() === '') {
                errors.push({
                    row: rowNumber,
                    field,
                    message: `${field} is required`,
                });
            }
        });

        // Validate email format
        if (row.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email)) {
                errors.push({
                    row: rowNumber,
                    field: 'email',
                    message: 'Invalid email format',
                });
            }

            // Check for duplicate emails in file
            if (emailSet.has(row.email.toLowerCase())) {
                errors.push({
                    row: rowNumber,
                    field: 'email',
                    message: `Duplicate email: ${row.email}`,
                });
            } else {
                emailSet.add(row.email.toLowerCase());
            }
        }

        // Validate employment type
        if (row.employmentType && !validEmploymentTypes.includes(row.employmentType.toUpperCase())) {
            errors.push({
                row: rowNumber,
                field: 'employmentType',
                message: `Invalid employment type. Must be one of: ${validEmploymentTypes.join(', ')}`,
            });
        }

        // Validate gender
        if (row.gender && !validGenders.includes(row.gender.toUpperCase())) {
            errors.push({
                row: rowNumber,
                field: 'gender',
                message: `Invalid gender. Must be one of: MALE, FEMALE, OTHER`,
            });
        }

        // Validate date format (hireDate)
        if (row.hireDate) {
            const date = new Date(row.hireDate);
            if (isNaN(date.getTime())) {
                errors.push({
                    row: rowNumber,
                    field: 'hireDate',
                    message: 'Invalid date format. Use YYYY-MM-DD',
                });
            }
        }

        // Validate dateOfBirth if provided
        if (row.dateOfBirth && row.dateOfBirth.trim() !== '') {
            const date = new Date(row.dateOfBirth);
            if (isNaN(date.getTime())) {
                errors.push({
                    row: rowNumber,
                    field: 'dateOfBirth',
                    message: 'Invalid date format. Use YYYY-MM-DD',
                });
            }
        }

        // Validate salary if provided
        if (row.salary && row.salary.trim() !== '') {
            const salaryNum = parseFloat(row.salary);
            if (isNaN(salaryNum) || salaryNum < 0) {
                errors.push({
                    row: rowNumber,
                    field: 'salary',
                    message: 'Salary must be a positive number',
                });
            }
        }
    });

    return errors;
};

/**
 * Generate Excel template
 */
export const generateTemplate = (): Buffer => {
    const sampleData = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            position: 'Software Engineer',
            department: 'Engineering',
            hireDate: '2024-01-15',
            employmentType: 'FULL_TIME',
            dateOfBirth: '1990-05-20',
            gender: 'MALE',
            address: '123 Main St',
            city: 'New York',
            country: 'USA',
            postalCode: '10001',
            salary: '75000',
            cnic: '12345-1234567-1',
            highestQualification: "Bachelor's in Computer Science",
            institute: 'MIT',
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+1234567891',
            position: 'HR Manager',
            department: 'HR',
            hireDate: '2024-01-20',
            employmentType: 'FULL_TIME',
            dateOfBirth: '1988-08-15',
            gender: 'FEMALE',
            address: '456 Oak Ave',
            city: 'Boston',
            country: 'USA',
            postalCode: '02101',
            salary: '85000',
            cnic: '12345-1234567-2',
            highestQualification: "Master's in Human Resources",
            institute: 'Harvard',
        },
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    const columnWidths = [
        { wch: 15 }, // firstName
        { wch: 15 }, // lastName
        { wch: 25 }, // email
        { wch: 15 }, // phone
        { wch: 20 }, // position
        { wch: 15 }, // department
        { wch: 12 }, // hireDate
        { wch: 15 }, // employmentType
        { wch: 12 }, // dateOfBirth
        { wch: 10 }, // gender
        { wch: 25 }, // address
        { wch: 15 }, // city
        { wch: 15 }, // country
        { wch: 12 }, // postalCode
        { wch: 12 }, // salary
        { wch: 18 }, // cnic
        { wch: 30 }, // highestQualification
        { wch: 20 }, // institute
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
};

/**
 * Format validation errors for response
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
    if (errors.length === 0) return '';

    const errorsByRow = errors.reduce((acc, error) => {
        if (!acc[error.row]) {
            acc[error.row] = [];
        }
        acc[error.row].push(`${error.field}: ${error.message}`);
        return acc;
    }, {} as Record<number, string[]>);

    let formatted = 'Validation Errors:\n';
    Object.entries(errorsByRow).forEach(([row, messages]) => {
        formatted += `\nRow ${row}:\n`;
        messages.forEach((msg) => {
            formatted += `  - ${msg}\n`;
        });
    });

    return formatted;
};
