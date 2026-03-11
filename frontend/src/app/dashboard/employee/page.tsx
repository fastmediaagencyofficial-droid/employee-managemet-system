'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MetricCard from '@/components/widgets/MetricCard';
import ListWidget from '@/components/widgets/ListWidget';
import { ListTodo, Calendar, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TaskPriorityBadge from '@/components/tasks/TaskPriorityBadge';

interface DashboardData {
    tasks: {
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        overdue: number;
    };
    recentTasks: any[];
    attendance: {
        thisMonth: number;
        lastMonth: number;
        trend: number;
    };
}

export default function EmployeeDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Get user name
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setUserName(`${userData.firstName || ''} ${userData.lastName || ''}`);
        }

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch task statistics
            const tasksResponse = await fetch('/api/tasks/statistics', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Fetch recent tasks
            const recentTasksResponse = await fetch('/api/tasks/my-tasks?status=PENDING', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (tasksResponse.ok && recentTasksResponse.ok) {
                const tasksData = await tasksResponse.json();
                const recentTasksData = await recentTasksResponse.json();

                setData({
                    tasks: tasksData.data,
                    recentTasks: recentTasksData.data.slice(0, 5),
                    attendance: {
                        thisMonth: 22,
                        lastMonth: 20,
                        trend: 10,
                    },
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

    const taskItems = data?.recentTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        metadata: `Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`,
        icon: <TaskPriorityBadge priority={task.priority} />,
    })) || [];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}! 👋</h1>
                <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your work today.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="My Tasks"
                    value={data?.tasks.total || 0}
                    description={`${data?.tasks.pending || 0} pending`}
                    icon={ListTodo}
                />

                <MetricCard
                    title="In Progress"
                    value={data?.tasks.inProgress || 0}
                    description="Active tasks"
                    icon={Clock}
                    className="border-l-4 border-l-blue-500"
                />

                <MetricCard
                    title="Completed"
                    value={data?.tasks.completed || 0}
                    description={`${(data?.tasks?.total || 0) > 0 ? Math.round(((data?.tasks?.completed || 0) / (data?.tasks?.total || 1)) * 100) : 0}% completion rate`}
                    icon={CheckCircle2}
                    className="border-l-4 border-l-green-500"
                />

                <MetricCard
                    title="Overdue"
                    value={data?.tasks.overdue || 0}
                    description="Needs attention"
                    icon={AlertCircle}
                    className="border-l-4 border-l-red-500"
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Tasks */}
                <ListWidget
                    title="My Pending Tasks"
                    description="Tasks assigned to you that need attention"
                    items={taskItems}
                    emptyMessage="No pending tasks. Great job!"
                    onItemClick={(id) => router.push(`/dashboard/tasks/${id}`)}
                />

                {/* Quick Actions */}
                <div className="space-y-6">
                    {/* Attendance Summary */}
                    <MetricCard
                        title="Attendance This Month"
                        value={`${data?.attendance.thisMonth || 0} days`}
                        description="Present days"
                        icon={Calendar}
                        trend={{
                            value: data?.attendance.trend || 0,
                            isPositive: (data?.attendance.trend || 0) > 0,
                        }}
                    />

                    {/* Performance Score */}
                    <MetricCard
                        title="Performance Score"
                        value="85%"
                        description="Based on task completion and quality"
                        icon={TrendingUp}
                        trend={{
                            value: 5,
                            isPositive: true,
                        }}
                    />

                    {/* Quick Actions */}
                    <div className="space-y-3">
                        <h3 className="font-semibold">Quick Actions</h3>
                        <div className="grid gap-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push('/dashboard/my-tasks')}
                            >
                                <ListTodo className="mr-2 h-4 w-4" />
                                View All My Tasks
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push('/dashboard/attendance')}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Mark Attendance
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push('/dashboard/leaves')}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                Request Leave
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
