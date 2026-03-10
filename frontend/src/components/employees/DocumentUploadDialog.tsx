'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface DocumentUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: string;
    onUploadSuccess: () => void;
}

const DOCUMENT_TYPES = [
    { value: 'CV', label: 'CV/Resume' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'OFFER_LETTER', label: 'Offer Letter' },
    { value: 'ID_CARD', label: 'ID Card' },
    { value: 'OTHER', label: 'Other' },
];

export default function DocumentUploadDialog({
    open,
    onOpenChange,
    employeeId,
    onUploadSuccess,
}: DocumentUploadDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<string>('CV');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setSelectedFile(acceptedFiles[0]);
            }
        },
        onDropRejected: (fileRejections) => {
            const error = fileRejections[0]?.errors[0];
            if (error?.code === 'file-too-large') {
                toast.error('File size exceeds 5MB limit');
            } else if (error?.code === 'file-invalid-type') {
                toast.error('Invalid file type. Only PDF, DOC, and DOCX files are allowed');
            } else {
                toast.error('Failed to select file');
            }
        },
    });

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        if (!documentType) {
            toast.error('Please select a document type');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('documentType', documentType);

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

            const response = await fetch(`/api/employees/${employeeId}/documents`, {
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
                toast.success('Document uploaded successfully');
                onUploadSuccess();
                handleClose();
            } else {
                toast.error(data.message || 'Failed to upload document');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload document');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setDocumentType('CV');
        setUploadProgress(0);
        onOpenChange(false);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Upload a new document for this employee. Supported formats: PDF, DOC, DOCX (Max 5MB)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Document Type Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="documentType">Document Type *</Label>
                        <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger id="documentType">
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                {DOCUMENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <Label>File *</Label>
                        {!selectedFile ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-300 hover:border-primary'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    {isDragActive
                                        ? 'Drop the file here'
                                        : 'Drag and drop a file here, or click to browse'}
                                </p>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4 bg-muted">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-8 w-8 text-primary" />
                                        <div>
                                            <p className="font-medium">{selectedFile.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatFileSize(selectedFile.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedFile(null)}
                                        disabled={uploading}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Uploading...</span>
                                <span className="font-medium">{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                        {uploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
