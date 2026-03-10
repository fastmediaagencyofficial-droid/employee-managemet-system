'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ValidationError {
    row: number;
    field: string;
    message: string;
}

interface UploadResult {
    row: number;
    employeeId?: string;
    name?: string;
    email: string;
    error?: string;
}

interface BulkUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function BulkUploadDialog({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [results, setResults] = useState<{
        created?: UploadResult[];
        failed?: UploadResult[];
        errors?: ValidationError[];
        summary?: {
            total: number;
            succeeded?: number;
            failed: number;
        };
    } | null>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setFile(acceptedFiles[0]);
                setResults(null);
            }
        },
        onDropRejected: (fileRejections) => {
            const error = fileRejections[0]?.errors[0];
            if (error?.code === 'file-too-large') {
                toast.error('File size exceeds 10MB limit');
            } else if (error?.code === 'file-invalid-type') {
                toast.error('Invalid file type. Only XLSX and CSV files are allowed');
            } else {
                toast.error('Failed to upload file');
            }
        },
    });

    const handleDownloadTemplate = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/employees/bulk-upload/template', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'employee_template.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Template downloaded successfully');
            } else {
                toast.error('Failed to download template');
            }
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Failed to download template');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            formData.append('file', file);

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch('/api/employees/bulk-upload/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await response.json();

            if (response.ok && data.success) {
                setResults(data.data);
                toast.success(data.message);
                if (data.data.summary.succeeded > 0) {
                    onSuccess();
                }
            } else {
                // Validation errors
                setResults({
                    errors: data.errors || [],
                    summary: data.summary || { total: 0, failed: data.errors?.length || 0 },
                });
                toast.error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResults(null);
        setUploadProgress(0);
        onOpenChange(false);
    };

    const handleUploadAnother = () => {
        setFile(null);
        setResults(null);
        setUploadProgress(0);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Employees</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file to create multiple employees at once
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Download Template Button */}
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={handleDownloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>
                    </div>

                    {/* File Upload Area */}
                    {!results && (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 hover:border-primary'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            {file ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {isDragActive
                                            ? 'Drop the file here'
                                            : 'Drag and drop your Excel or CSV file here, or click to browse'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Supported formats: .xlsx, .xls, .csv (Max 10MB, 500 employees)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Uploading and processing...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}

                    {/* Results */}
                    {results && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="bg-muted p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Upload Summary</h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Total Rows</p>
                                        <p className="text-2xl font-bold">{results.summary?.total || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Succeeded</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {results.summary?.succeeded || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Failed</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {results.summary?.failed || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Errors */}
                            {results.errors && results.errors.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Validation Errors</h3>
                                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Row</TableHead>
                                                    <TableHead>Field</TableHead>
                                                    <TableHead>Error</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.errors.map((error, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{error.row}</TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {error.field}
                                                        </TableCell>
                                                        <TableCell className="text-red-600">
                                                            {error.message}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {/* Created Employees */}
                            {results.created && results.created.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2 text-green-600">
                                        Successfully Created ({results.created.length})
                                    </h3>
                                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Row</TableHead>
                                                    <TableHead>Employee ID</TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.created.map((result, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{result.row}</TableCell>
                                                        <TableCell className="font-mono">
                                                            {result.employeeId}
                                                        </TableCell>
                                                        <TableCell>{result.name}</TableCell>
                                                        <TableCell>{result.email}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="default" className="bg-green-600">
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Success
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {/* Failed Employees */}
                            {results.failed && results.failed.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2 text-red-600">
                                        Failed ({results.failed.length})
                                    </h3>
                                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Row</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Error</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.failed.map((result, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{result.row}</TableCell>
                                                        <TableCell>{result.email}</TableCell>
                                                        <TableCell className="text-red-600">
                                                            {result.error}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        {!results ? (
                            <>
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpload} disabled={!file || uploading}>
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button onClick={handleUploadAnother}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Another
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
