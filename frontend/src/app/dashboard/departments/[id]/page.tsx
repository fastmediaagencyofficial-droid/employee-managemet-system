'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    email: string;
}

interface Department {
    id: string;
    name: string;
    description: string;
    employees: Employee[];
}

export default function EditDepartmentPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [department, setDepartment] = useState<Department | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const fetchDepartment = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/departments/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setDepartment(data.data);
                setFormData({
                    name: data.data.name,
                    description: data.data.description || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch department:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDepartment();
    }, [fetchDepartment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/departments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard/departments');
            } else {
                setError(data.message || 'Failed to update department');
            }
        } catch (err) {
            setError('Unable to connect to server');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    if (!department) {
        return <div className="flex items-center justify-center h-96">Department not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Department</h1>
                    <p className="text-muted-foreground">Update department information</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Department Information</CardTitle>
                        <CardDescription>Update the department details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="name">Department Name *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Employees ({department.employees.length})
                    </CardTitle>
                    <CardDescription>Employees in this department</CardDescription>
                </CardHeader>
                <CardContent>
                    {department.employees.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {department.employees.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell className="font-medium">
                                            {emp.firstName} {emp.lastName}
                                        </TableCell>
                                        <TableCell>{emp.position}</TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No employees in this department yet
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
