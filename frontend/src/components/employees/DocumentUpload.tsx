'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2, Download, Trash2 } from 'lucide-react';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import DocumentUploadDialog from './DocumentUploadDialog';

interface EmployeeDocument {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    documentType: string;
    uploadedAt: string;
}

interface DocumentUploadProps {
    employeeId: string;
    documents: EmployeeDocument[];
    onUploadSuccess: () => void;
}

export default function DocumentUpload({ employeeId, documents, onUploadSuccess }: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                await handleUpload(acceptedFiles[0]);
            }
        },
        onDropRejected: (fileRejections) => {
            const error = fileRejections[0]?.errors[0];
            if (error?.code === 'file-too-large') {
                toast.error('File size exceeds 5MB limit');
            } else if (error?.code === 'file-invalid-type') {
                toast.error('Invalid file type. Only PDF, DOC, and DOCX files are allowed');
            } else {
                toast.error('Failed to upload file');
            }
        },
    });

    const handleUpload = async (file: File) => {
        setUploading(true);
        setUploadProgress(0);

        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentType', 'CV'); // Default type, can be made selectable

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

    const handleDownload = async (documentId: string, fileName: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/documents/${documentId}/download`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success('Document downloaded successfully');
            } else {
                toast.error('Failed to download document');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download document');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/documents/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Document deleted successfully');
                onUploadSuccess();
            } else {
                toast.error(data.message || 'Failed to delete document');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document');
        } finally {
            setDeleteId(null);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Upload Button */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                </Button>
            </div>

            {/* Documents List */}
            {documents.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Upload Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{doc.fileName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{doc.documentType}</Badge>
                                    </TableCell>
                                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                                    <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(doc.id, doc.fileName)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(doc.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No documents uploaded yet</p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this document? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Upload Dialog */}
            <DocumentUploadDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                employeeId={employeeId}
                onUploadSuccess={onUploadSuccess}
            />
        </div>
    );
}
