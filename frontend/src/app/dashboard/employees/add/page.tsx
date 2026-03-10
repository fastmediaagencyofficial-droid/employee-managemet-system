'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AddEmployeePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [departments, setDepartments] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
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
        shiftId: '',
        cnic: '',
        highestQualification: '',
        institute: '',
        hourlyRate: '',
    });
    const [cnicError, setCnicError] = useState('');
    const [document, setDocument] = useState<File | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                console.log('Fetching departments for employee form, token:', token ? 'exists' : 'missing');

                const response = await fetch('/api/departments', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('Department fetch response status:', response.status);
                const data = await response.json();
                console.log('Department fetch data:', data);

                if (data.success) {
                    setDepartments(data.data);
                    console.log('Departments set:', data.data.length, 'departments');
                } else {
                    console.error('Failed to fetch departments:', data.message);
                }
            } catch (err) {
                console.error('Failed to fetch departments', err);
            }
        };
        const fetchShifts = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('/api/shifts', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (data.success) setShifts(data.data);
            } catch (err) {
                console.error('Failed to fetch shifts', err);
            }
        };
        fetchDepartments();
        fetchShifts();
    }, []);

    // Validate CNIC format (XXXXX-XXXXXXX-X)
    const validateCNIC = (cnic: string): boolean => {
        if (!cnic) return true; // Optional field
        const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
        return cnicRegex.test(cnic);
    };

    // Handle CNIC change with validation
    const handleCNICChange = (value: string) => {
        setFormData({ ...formData, cnic: value });
        if (value && !validateCNIC(value)) {
            setCnicError('Invalid CNIC format. Use: 12345-1234567-1');
        } else {
            setCnicError('');
        }
    };

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Only PDF, DOC, and DOCX files are allowed');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size exceeds 5MB limit');
            return;
        }

        setDocument(file);
        toast.success('Document selected successfully');
    };

    // Remove selected document
    const handleRemoveDocument = () => {
        setDocument(null);
        toast.info('Document removed');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.position || !formData.departmentId || !formData.hireDate || !formData.employmentType) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Employee created successfully!');
                router.push('/dashboard/employees');
            } else {
                setError(data.message || 'Failed to create employee');
                toast.error(data.message || 'Failed to create employee');
            }
        } catch (err) {
            setError('Unable to connect to server');
            toast.error('Unable to connect to server');
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-3xl font-bold tracking-tight">Add Employee</h1>
                    <p className="text-muted-foreground">Create a new employee profile</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                    {/* Personal Information */}
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
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Male</SelectItem>
                                        <SelectItem value="FEMALE">Female</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
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

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Address</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Label htmlFor="address">Street Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input
                                    id="postalCode"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment Details */}
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
                                <Label htmlFor="departmentId">Department *</Label>
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
                                <Label htmlFor="shiftId">Assign Shift</Label>
                                <Select
                                    value={formData.shiftId}
                                    onValueChange={(value) => setFormData({ ...formData, shiftId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select shift" />
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
                                <Label htmlFor="hourlyRate">Hourly Rate (PKR)</Label>
                                <Input
                                    id="hourlyRate"
                                    type="number"
                                    value={formData.hourlyRate}
                                    onChange={(e) => {
                                        const rate = e.target.value;
                                        const salary = rate ? (parseFloat(rate) * 8 * 26).toString() : '';
                                        setFormData({ ...formData, hourlyRate: rate, salary });
                                    }}
                                    placeholder="e.g. 500"
                                />
                            </div>
                            <div>
                                <Label htmlFor="salary">Monthly Salary (Auto-calculated)</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    placeholder="Calculated based on 8h * 26d"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Based on 8 hours/day, 26 days/month
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Employee'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}


