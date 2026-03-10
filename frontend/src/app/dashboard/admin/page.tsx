'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MetricCard from '@/components/widgets/MetricCard';
import ListWidget from '@/components/widgets/ListWidget';
import ChartWidget from '@/components/widgets/ChartWidget';
import { Users, Building2, ListTodo, TrendingUp, AlertCircle, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AdminDashboardData {
    totalEmployees: number;
    totalDepartments: number;
    totalTasks: number;
    activeEmployees: number;
    recentActivities: any[];
    departmentStats: any[];
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AdminDashboardData | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch employees
            const employeesResponse = await fetch('http://localhost:5000/api/employees', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Fetch departments
            const departmentsResponse = await fetch('http://localhost:5000/api/departments', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Fetch all tasks
            const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (employeesResponse.ok && departmentsResponse.ok && tasksResponse.ok) {
                const employeesData = await employeesResponse.json();
                const departmentsData = await departmentsResponse.json();
                const tasksData = await tasksResponse.json();

                const employees = employeesData.data || [];
                const departments = departmentsData.data || [];
                const tasks = tasksData.data || [];

                setData({
                    totalEmployees: employees.length,
                    totalDepartments: departments.length,
                    totalTasks: tasks.length,
                    activeEmployees: employees.filter((e: any) => e.status === 'ACTIVE').length,
                    recentActivities: [],
                    departmentStats: departments.slice(0, 5).map((dept: any) => ({
                        id: dept.id,
                        title: dept.name,
                        description: dept.description || 'No description',
                        metadata: `${dept._count?.employees || 0} employees`,
                        icon: <Building2 className="h-4 w-4 text-muted-foreground" />,
                    })),
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
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard 🎯</h1>
                <p className="text-muted-foreground">Complete overview of your organization</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Employees"
                    value={data?.totalEmployees || 0}
                    description={`${data?.activeEmployees || 0} active`}
                    icon={Users}
                    trend={{ value: 5, isPositive: true }}
                />

                <MetricCard
                    title="Departments"
                    value={data?.totalDepartments || 0}
                    description="Active departments"
                    icon={Building2}
                />

                <MetricCard
                    title="Total Tasks"
                    value={data?.totalTasks || 0}
                    description="Across all teams"
                    icon={ListTodo}
                />

                <MetricCard
                    title="Active Users"
                    value={data?.activeEmployees || 0}
                    description="Currently active"
                    icon={UserCheck}
                    className="border-l-4 border-l-green-500"
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Department Overview */}
                <ListWidget
                    title="Departments"
                    description="Overview of all departments"
                    items={data?.departmentStats || []}
                    emptyMessage="No departments found"
                    onItemClick={(id) => router.push(`/dashboard/departments`)}
                />

                {/* Quick Actions */}
                <ChartWidget
                    title="Quick Actions"
                    description="Common administrative tasks"
                >
                    <div className="grid gap-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4"
                            onClick={() => router.push('/dashboard/employees')}
                        >
                            <Users className="mr-3 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">Manage Employees</div>
                                <div className="text-xs text-muted-foreground">
                                    Add, edit, or remove employees
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4"
                            onClick={() => router.push('/dashboard/departments')}
                        >
                            <Building2 className="mr-3 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">Manage Departments</div>
                                <div className="text-xs text-muted-foreground">
                                    Create and organize departments
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4"
                            onClick={() => router.push('/dashboard/team-tasks')}
                        >
                            <ListTodo className="mr-3 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">View All Tasks</div>
                                <div className="text-xs text-muted-foreground">
                                    Monitor organization-wide tasks
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-4"
                            onClick={() => router.push('/dashboard/analytics')}
                        >
                            <TrendingUp className="mr-3 h-5 w-5" />
                            <div className="text-left">
                                <div className="font-medium">View Analytics</div>
                                <div className="text-xs text-muted-foreground">
                                    Performance and productivity insights
                                </div>
                            </div>
                        </Button>
                    </div>
                </ChartWidget>
            </div>

            {/* System Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                    title="Employee Growth"
                    value="+12%"
                    description="Compared to last quarter"
                    icon={TrendingUp}
                    trend={{ value: 12, isPositive: true }}
                />

                <MetricCard
                    title="Task Completion Rate"
                    value="87%"
                    description="Organization average"
                    icon={ListTodo}
                    trend={{ value: 3, isPositive: true }}
                />

                <MetricCard
                    title="Pending Actions"
                    value="5"
                    description="Requires admin attention"
                    icon={AlertCircle}
                    className="border-l-4 border-l-orange-500"
                />
            </div>
        </div>
    );
}
