'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Search, Filter, Download, Calendar, User, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
    id: string;
    date: string;
    clockIn: string;
    clockOut: string | null;
    status: string;
    employee: {
        firstName: string;
        lastName: string;
        employeeId: string;
        department: {
            name: string;
        };
    };
}

export default function AttendanceReportsPage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        departmentId: 'all',
        employeeId: ''
    });
    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);

    const fetchDepartments = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setDepartments(data.data);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    }, []);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.departmentId !== 'all') params.append('departmentId', filters.departmentId);
            if (filters.employeeId) params.append('employeeId', filters.employeeId);

            const response = await fetch(`/api/attendance/report?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRecords(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
            toast.error('Failed to load attendance report');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDepartments();
        fetchReport();
    }, [fetchDepartments, fetchReport]);

    const handleExportCSV = () => {
        if (records.length === 0) return;

        const headers = ['Date', 'Employee ID', 'Name', 'Department', 'Clock In', 'Clock Out', 'Status'];
        const rows = records.map(r => [
            new Date(r.date).toLocaleDateString(),
            r.employee.employeeId,
            `${r.employee.firstName} ${r.employee.lastName}`,
            r.employee.department.name,
            new Date(r.clockIn).toLocaleTimeString(),
            r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : '-',
            r.status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Attendance Reporting</h1>
                    <p className="text-muted-foreground">Detailed insights and records for workforce presence</p>
                </div>
                <Button onClick={handleExportCSV} variant="outline" disabled={records.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            <Card className="bg-muted/30">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Start Date</Label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground ml-1">End Date</Label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Department</Label>
                            <Select
                                value={filters.departmentId}
                                onValueChange={(v) => setFilters({ ...filters, departmentId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button className="w-full" onClick={fetchReport}>
                                <Filter className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>Found {records.length} records for the selected criteria</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Employee</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading records...</TableCell>
                                </TableRow>
                            ) : records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No records found.</TableCell>
                                </TableRow>
                            ) : (
                                records.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">
                                            {new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{record.employee.firstName} {record.employee.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{record.employee.employeeId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{record.employee.department.name}</TableCell>
                                        <TableCell>{new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                        <TableCell>
                                            {record.clockOut ?
                                                new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                                <Badge variant="outline" className="text-xs opacity-50">Active</Badge>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={record.status === 'LATE' ? 'destructive' : 'default'} className="text-[10px]">
                                                {record.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <label className={className}>{children}</label>;
}
