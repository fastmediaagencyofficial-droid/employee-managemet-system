'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import BulkUploadDialog from '@/components/employees/BulkUploadDialog';

interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    position: string;
    department: {
        name: string;
    };
    shift?: {
        name: string;
    };
    status: string;
    hireDate: string;
}

export default function EmployeesPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [shiftFilter, setShiftFilter] = useState('all');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

    useEffect(() => {
        fetchEmployees();
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/shifts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setShifts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch shifts:', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/employees', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setEmployees(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast.success('Employee deleted successfully');
                fetchEmployees(); // Refresh the list
                setDeleteId(null);
            } else {
                toast.error('Failed to delete employee');
            }
        } catch (error) {
            console.error('Failed to delete employee:', error);
            toast.error('Failed to delete employee');
        }
    };

    const filteredEmployees = employees.filter((emp) => {
        const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.position}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesShift = shiftFilter === 'all' || emp.shift?.name === shiftFilter;
        return matchesSearch && matchesShift;
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            ACTIVE: 'default',
            INACTIVE: 'secondary',
            ON_LEAVE: 'secondary',
            TERMINATED: 'destructive',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading employees...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                    <p className="text-muted-foreground">
                        Manage your organization&apos;s employees
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setBulkUploadOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Bulk Upload
                    </Button>
                    <Button onClick={() => router.push('/dashboard/employees/add')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee List</CardTitle>
                    <CardDescription>
                        {filteredEmployees.length} {filteredEmployees.length !== 1 ? 'employees' : 'employee'} found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={shiftFilter} onValueChange={setShiftFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Shifts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Shifts</SelectItem>
                                    {shifts.map((s) => (
                                        <SelectItem key={s.id} value={s.name}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Shift</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Hire Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">
                                            No employees found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEmployees.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="font-medium">{employee.employeeId}</TableCell>
                                            <TableCell>
                                                {employee.firstName} {employee.lastName}
                                            </TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>{employee.position}</TableCell>
                                            <TableCell>{employee.department.name}</TableCell>
                                            <TableCell>
                                                {employee.shift ? (
                                                    <Badge variant="outline">{employee.shift.name}</Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">None</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(employee.status)}</TableCell>
                                            <TableCell>
                                                {new Date(employee.hireDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                router.push(`/dashboard/employees/${employee.id}`)
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                router.push(`/dashboard/employees/${employee.id}/edit`)
                                                            }
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => setDeleteId(employee.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the employee
                            and remove their data from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Upload Dialog */}
            <BulkUploadDialog
                open={bulkUploadOpen}
                onOpenChange={setBulkUploadOpen}
                onSuccess={fetchEmployees}
            />
        </div>
    );
}



