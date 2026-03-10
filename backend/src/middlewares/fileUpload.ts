import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Ensure upload directories exist
// On Vercel (Serverless), we must use /tmp
const uploadDir = isVercel
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, '../../uploads');

const employeeDocsDir = path.join(uploadDir, 'employees');
const bulkUploadDir = path.join(uploadDir, 'bulk');

// Create directories (safe for /tmp on Vercel)
[uploadDir, employeeDocsDir, bulkUploadDir].forEach((dir) => {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    } catch (error) {
        // Log error but don't crash if possible (though without dirs, uploads will fail)
        console.error(`Failed to create directory ${dir}:`, error);
    }
});

// Storage configuration for employee documents
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const employeeId = req.params.id || 'temp';
        const employeeDir = path.join(employeeDocsDir, employeeId);

        if (!fs.existsSync(employeeDir)) {
            fs.mkdirSync(employeeDir, { recursive: true });
        }

        cb(null, employeeDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomhash-originalname
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
    },
});

// Storage configuration for bulk uploads
const bulkUploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, bulkUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
    },
});

// File filter for documents (PDF, DOC, DOCX)
const documentFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
};

// File filter for bulk uploads (XLSX, CSV)
const bulkFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv',
    ];

    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only XLSX and CSV files are allowed.'));
    }
};

// Multer instance for employee documents (5MB limit)
export const uploadDocument = multer({
    storage: documentStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

// Multer instance for bulk uploads (10MB limit)
export const uploadBulkFile = multer({
    storage: bulkUploadStorage,
    fileFilter: bulkFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});

// Helper function to delete file
export const deleteFile = (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// Helper function to get file size
export const getFileSize = (filePath: string): number => {
    const stats = fs.statSync(filePath);
    return stats.size;
};
