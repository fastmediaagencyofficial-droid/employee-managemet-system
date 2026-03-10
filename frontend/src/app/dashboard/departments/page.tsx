'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
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

interface Department {
    id: string;
    name: string;
    description: string;
    _count?: {
        employees: number;
    };
    createdAt: string;
}

export default function DepartmentsPage() {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            console.log('Fetching departments with token:', token ? 'exists' : 'missing');

            const response = await fetch('/api/departments', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                setDepartments(data.data);
                setError('');
            } else {
                setError(data.message || 'Failed to load departments');
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error);
            setError('Unable to connect to server. Make sure backend is running on port 5000.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/departments/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchDepartments();
                setDeleteId(null);
            }
        } catch (error) {
            console.error('Failed to delete department:', error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
                    <p className="text-muted-foreground">Manage company departments and teams</p>
                </div>
                <Button onClick={() => router.push('/dashboard/departments/add')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                </Button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Departments</CardTitle>
                    <CardDescription>
                        {departments.length} department{departments.length !== 1 ? 's' : ''} total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Employees</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                    <TableCell>{dept.description || 'No description'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {dept._count?.employees || 0}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/dashboard/departments/${dept.id}`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setDeleteId(dept.id)}
                                                disabled={(dept._count?.employees || 0) > 0}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the department.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
