'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { addDays } from 'date-fns';

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
    employee: {
        firstName: string;
        lastName: string;
        employeeId: string;
    };
}

export default function LeaveAcceptancePage() {
    const router = useRouter();
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [date, setDate] = useState<Date | undefined>(new Date());

    const fetchLeaves = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const url = statusFilter === 'ALL'
                ? '/api/leaves'
                : `/api/leaves?status=${statusFilter}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setLeaves(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    const handleApprove = async (id: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/leaves/${id}/approve`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchLeaves();
            }
        } catch (error) {
            console.error('Failed to approve leave:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/leaves/${id}/reject`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                fetchLeaves();
            }
        } catch (error) {
            console.error('Failed to reject leave:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            PENDING: { variant: 'secondary', icon: Clock },
            APPROVED: { variant: 'default', icon: CheckCircle },
            REJECTED: { variant: 'destructive', icon: XCircle },
        };
        const config = variants[status] || variants.PENDING;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const calculateDays = (start: string, end: string) => {
        const days = Math.ceil(
            (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        return days;
    };

    // Calendar logic
    const getLeaveModifiers = () => {
        const approved: Date[] = [];
        const pending: Date[] = [];
        const rejected: Date[] = [];

        leaves.forEach((leave) => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            let current = start;

            while (current <= end) {
                if (leave.status === 'APPROVED') approved.push(new Date(current));
                else if (leave.status === 'PENDING') pending.push(new Date(current));
                else if (leave.status === 'REJECTED') rejected.push(new Date(current));

                current = addDays(current, 1);
            }
        });

        return { approved, pending, rejected };
    };

    const modifiersStyles = {
        approved: { color: 'green', fontWeight: 'bold', backgroundColor: '#dcfce7' },
        pending: { color: 'orange', fontWeight: 'bold', backgroundColor: '#ffedd5' },
        rejected: { color: 'red', fontWeight: 'bold', backgroundColor: '#fee2e2' },
    };

    const getLeavesForDate = (date: Date) => {
        return leaves.filter(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            // Reset hours to compare dates only
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            return checkDate >= start && checkDate <= end;
        });
    };

    const selectedLeaves = date ? getLeavesForDate(date) : [];

    if (loading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leave Acceptance</h1>
                    <p className="text-muted-foreground">Review and manage employee leave requests</p>
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    {/* Leave Requests Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>All Leave Requests</CardTitle>
                                    <CardDescription>{leaves.length} total requests</CardDescription>
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Status</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                            <TableHead>Days</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaves.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center">
                                                    No leave requests found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            leaves.map((leave) => (
                                                <TableRow key={leave.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">
                                                                {leave.employee.firstName} {leave.employee.lastName}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {leave.employee.employeeId}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{leave.type}</TableCell>
                                                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>{calculateDays(leave.startDate, leave.endDate)} days</TableCell>
                                                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                                                    <TableCell>
                                                        {leave.status === 'PENDING' ? (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                                                    onClick={() => handleApprove(leave.id)}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                                                    onClick={() => handleReject(leave.id)}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground italic">
                                                                {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leave Calendar</CardTitle>
                                <CardDescription>View leaves by date</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border shadow"
                                    modifiers={getLeaveModifiers()}
                                    modifiersStyles={modifiersStyles}
                                />
                                <div className="ml-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-green-200"></div>
                                        <span>Approved</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-orange-200"></div>
                                        <span>Pending</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-200"></div>
                                        <span>Rejected</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Leaves on {date?.toLocaleDateString()}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {date && selectedLeaves.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedLeaves.map(leave => (
                                            <div key={leave.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                                                <div>
                                                    <p className="font-medium">{leave.employee.firstName} {leave.employee.lastName}</p>
                                                    <p className="text-sm text-muted-foreground">{leave.type}</p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(leave.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">
                                        No leaves found for this date
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
