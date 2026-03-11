'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MetricCard from '@/components/widgets/MetricCard';
import ListWidget from '@/components/widgets/ListWidget';
import { Users, FileText, Calendar, UserPlus, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface HRDashboardData {
    totalEmployees: number;
    pendingLeaves: number;
    upcomingInterviews: number;
    newHires: number;
    recentLeaveRequests: any[];
}

export default function HRDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<HRDashboardData | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch employees
            const employeesResponse = await fetch('/api/employees', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (employeesResponse.ok) {
                const employeesData = await employeesResponse.json();
                const employees = employeesData.data || [];

                setData({
                    totalEmployees: employees.length,
                    pendingLeaves: 8, // Mock data
                    upcomingInterviews: 3, // Mock data
                    newHires: 5, // Mock data
                    recentLeaveRequests: [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">HR Dashboard 👥</h1>
                <p className="text-muted-foreground">Manage employee lifecycle and HR operations</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Employees"
                    value={data?.totalEmployees || 0}
                    description="Active workforce"
                    icon={Users}
                />

                <MetricCard
                    title="Pending Leaves"
                    value={data?.pendingLeaves || 0}
                    description="Awaiting approval"
                    icon={Clock}
                    className="border-l-4 border-l-yellow-500"
                />

                <MetricCard
                    title="Upcoming Interviews"
                    value={data?.upcomingInterviews || 0}
                    description="This week"
                    icon={Calendar}
                    className="border-l-4 border-l-blue-500"
                />

                <MetricCard
                    title="New Hires"
                    value={data?.newHires || 0}
                    description="This month"
                    icon={UserPlus}
                    className="border-l-4 border-l-green-500"
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Leave Requests */}
                <ListWidget
                    title="Pending Leave Requests"
                    description="Requests awaiting your approval"
                    items={[
                        {
                            id: '1',
                            title: 'John Doe - Sick Leave',
                            description: '3 days starting tomorrow',
                            metadata: 'Submitted 2 hours ago',
                            icon: <FileText className="h-4 w-4 text-yellow-600" />,
                        },
                        {
                            id: '2',
                            title: 'Jane Smith - Vacation',
                            description: '5 days next week',
                            metadata: 'Submitted yesterday',
                            icon: <FileText className="h-4 w-4 text-yellow-600" />,
                        },
                    ]}
                    emptyMessage="No pending leave requests"
                    onItemClick={(id) => router.push('/dashboard/leaves')}
                />

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Quick Actions</h3>
                    <div className="grid gap-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4"
                            onClick={() => router.push('/dashboard/employees')}
                        >
                            <UserPlus className="mr-3 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">Add New Employee</div>
                                <div className="text-xs text-muted-foreground">
                                    Onboard a new team member
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4"
                            onClick={() => router.push('/dashboard/leaves')}
                        >
                            <FileText className="mr-3 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">Manage Leave Requests</div>
                                <div className="text-xs text-muted-foreground">
                                    Approve or reject leave applications
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4"
                            onClick={() => router.push('/dashboard/attendance')}
                        >
                            <Calendar className="mr-3 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">View Attendance</div>
                                <div className="text-xs text-muted-foreground">
                                    Monitor employee attendance
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4"
                            onClick={() => router.push('/dashboard/performance')}
                        >
                            <CheckCircle2 className="mr-3 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">Performance Reviews</div>
                                <div className="text-xs text-muted-foreground">
                                    Conduct employee evaluations
                                </div>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    title="Average Tenure"
                    value="2.5 years"
                    description="Company average"
                    icon={Users}
                />

                <MetricCard
                    title="Attendance Rate"
                    value="94%"
                    description="This month"
                    icon={Calendar}
                    trend={{ value: 2, isPositive: true }}
                />

                <MetricCard
                    title="Open Positions"
                    value="7"
                    description="Currently hiring"
                    icon={UserPlus}
                />
            </div>
        </div>
    );
}
