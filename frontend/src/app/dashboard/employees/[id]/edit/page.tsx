'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Department {
    id: string;
    name: string;
}

interface Shift {
    id: string;
    name: string;
}

interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    position: string;
    departmentId: string;
    managerId: string;
    salary: string;
    hireDate: string;
    employmentType: string;
    status: string;
    cnic?: string;
    highestQualification?: string;
    institute?: string;
    shiftId?: string;
}

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        position: '',
        departmentId: '',
        managerId: '',
        salary: '',
        hireDate: '',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        shiftId: '',
        cnic: '',
        highestQualification: '',
        institute: '',
    });
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [cnicError, setCnicError] = useState('');
    const [document, setDocument] = useState<File | null>(null);

    const handleCNICChange = (value: string) => {
        // Allow only number and dash
        if (!/^[0-9-]*$/.test(value)) return;

        // Auto insert dash
        let formattedCnic = value.replace(/-/g, '');
        if (formattedCnic.length > 5) {
            formattedCnic = formattedCnic.slice(0, 5) + '-' + formattedCnic.slice(5);
        }
        if (formattedCnic.length > 13) {
            formattedCnic = formattedCnic.slice(0, 13) + '-' + formattedCnic.slice(13);
        }
        if (formattedCnic.length > 15) return;

        setFormData({ ...formData, cnic: formattedCnic });

        // Validate Format (13 digits total)
        const digitsOnly = formattedCnic.replace(/-/g, '');
        if (digitsOnly.length === 13) {
            setCnicError('');
        } else {
            setCnicError('CNIC must be 13 digits');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('File size should be less than 5MB');
                return;
            }
            setDocument(file);
        }
    };

    const handleRemoveDocument = () => {
        setDocument(null);
    };
    const fetchShifts = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/shifts', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setShifts(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch shifts', err);
        }
    }, []);

    const fetchDepartments = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/departments', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setDepartments(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    }, []);

    const fetchEmployee = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                const emp = data.data;
                setFormData({
                    firstName: emp.firstName || '',
                    lastName: emp.lastName || '',
                    email: emp.email || '',
                    phone: emp.phone || '',
                    dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
                    gender: emp.gender || '',
                    address: emp.address || '',
                    city: emp.city || '',
                    country: emp.country || '',
                    postalCode: emp.postalCode || '',
                    position: emp.position || '',
                    departmentId: emp.departmentId || '',
                    managerId: emp.managerId || '',
                    salary: emp.salary || '',
                    hireDate: emp.hireDate ? emp.hireDate.split('T')[0] : '',
                    employmentType: emp.employmentType || 'FULL_TIME',
                    status: emp.status || 'ACTIVE',
                    shiftId: emp.shiftId || '',
                    cnic: emp.cnic || '',
                    highestQualification: emp.highestQualification || '',
                    institute: emp.institute || '',
                });
            }
        } catch (err) {
            console.error('Failed to fetch employee', err);
            setError('Failed to load employee data');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDepartments();
        fetchShifts();
        fetchEmployee();
    }, [fetchDepartments, fetchShifts, fetchEmployee]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Employee updated successfully!');
                router.push('/dashboard/employees');
            } else {
                setError(data.message || 'Failed to update employee');
                toast.error(data.message || 'Failed to update employee');
            }
        } catch (err) {
            setError('Unable to connect to server');
            toast.error('Unable to connect to server');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Employee</h1>
                    <p className="text-muted-foreground">Update employee information</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Basic employee details</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                required
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name *</Label>
                            <Input
                                id="lastName"
                                required
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cnic">CNIC Number</Label>
                            <Input
                                id="cnic"
                                placeholder="12345-1234567-1"
                                value={formData.cnic}
                                onChange={(e) => handleCNICChange(e.target.value)}
                                className={cnicError ? 'border-red-500' : ''}
                            />
                            {cnicError && (
                                <p className="text-sm text-red-500 mt-1">{cnicError}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="highestQualification">Highest Qualification</Label>
                            <Input
                                id="highestQualification"
                                placeholder="e.g., Bachelor's in Computer Science"
                                value={formData.highestQualification}
                                onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="institute">Institute/University</Label>
                            <Input
                                id="institute"
                                placeholder="e.g., MIT, Harvard"
                                value={formData.institute}
                                onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Document Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Document Upload</CardTitle>
                        <CardDescription>Upload CV/Resume or other documents (Optional)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {!document ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <div className="text-center">
                                            <Label htmlFor="document" className="cursor-pointer text-primary hover:underline">
                                                Click to upload document
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                PDF, DOC, DOCX (Max 5MB)
                                            </p>
                                        </div>
                                        <Input
                                            id="document"
                                            type="file"
                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="border rounded-lg p-4 bg-muted">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-8 w-8 text-primary" />
                                            <div>
                                                <p className="font-medium">{document.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(document.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleRemoveDocument}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="position">Position *</Label>
                            <Input
                                id="position"
                                required
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="department">Department *</Label>
                            <Select
                                value={formData.departmentId}
                                onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="shift">Assign Shift</Label>
                            <Select
                                value={formData.shiftId}
                                onValueChange={(value) => setFormData({ ...formData, shiftId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select shift (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Shift</SelectItem>
                                    {shifts.map((shift) => (
                                        <SelectItem key={shift.id} value={shift.id}>
                                            {shift.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="hireDate">Hire Date *</Label>
                            <Input
                                id="hireDate"
                                type="date"
                                required
                                value={formData.hireDate}
                                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="employmentType">Employment Type *</Label>
                            <Select
                                value={formData.employmentType}
                                onValueChange={(value) => setFormData({ ...formData, employmentType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                                    <SelectItem value="CONTRACT">Contract</SelectItem>
                                    <SelectItem value="INTERN">Intern</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="status">Status *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                                    <SelectItem value="TERMINATED">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
