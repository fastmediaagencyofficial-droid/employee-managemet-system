'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MetricCard from '@/components/widgets/MetricCard';
import ListWidget from '@/components/widgets/ListWidget';
import { Users, ListTodo, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TaskPriorityBadge from '@/components/tasks/TaskPriorityBadge';
import TaskStatusBadge from '@/components/tasks/TaskStatusBadge';

interface ManagerDashboardData {
    teamSize: number;
    teamTasks: {
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        overdue: number;
    };
    recentTasks: any[];
    teamMembers: any[];
}

export default function ManagerDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ManagerDashboardData | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            const apiUrl = process.env.NEXT_PUBLIC_API_URL 
                ? `${process.env.NEXT_PUBLIC_API_URL}/api`
                : 'http://localhost:5000/api';

            // Fetch team tasks
            const teamTasksResponse = await fetch(`${apiUrl}/tasks/team-tasks`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Fetch employees (team members)
            const employeesResponse = await fetch(`${apiUrl}/employees`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (teamTasksResponse.ok && employeesResponse.ok) {
                const teamTasksData = await teamTasksResponse.json();
                const employeesData = await employeesResponse.json();

                const tasks = teamTasksData.data || [];
                const employees = employeesData.data || [];

                setData({
                    teamSize: employees.length,
                    teamTasks: {
                        total: tasks.length,
                        pending: tasks.filter((t: any) => t.status === 'PENDING').length,
                        inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
                        completed: tasks.filter((t: any) => t.status === 'COMPLETED').length,
                        overdue: tasks.filter((t: any) =>
                            new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
                        ).length,
                    },
                    recentTasks: tasks.slice(0, 5),
                    teamMembers: employees.slice(0, 5),
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
        description: `Assigned to: ${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
        metadata: `Due: ${format(new Date(task.dueDate), 'MMM dd, yyyy')}`,
        icon: <TaskPriorityBadge priority={task.priority} />,
        action: <TaskStatusBadge status={task.status} />,
    })) || [];

    const teamItems = data?.teamMembers.map((member) => ({
        id: member.id,
        title: `${member.firstName} ${member.lastName}`,
        description: member.position,
        metadata: member.department?.name || 'No department',
        icon: <Users className="h-4 w-4 text-muted-foreground" />,
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard 👨‍💼</h1>
                    <p className="text-muted-foreground">Manage your team and track their progress</p>
                </div>
                <Button onClick={() => router.push('/dashboard/team-tasks')}>
                    <ListTodo className="mr-2 h-4 w-4" />
                    View All Team Tasks
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <MetricCard
                    title="Team Size"
                    value={data?.teamSize || 0}
                    description="Active members"
                    icon={Users}
                />

                <MetricCard
                    title="Total Tasks"
                    value={data?.teamTasks.total || 0}
                    description="Assigned to team"
                    icon={ListTodo}
                />

                <MetricCard
                    title="In Progress"
                    value={data?.teamTasks.inProgress || 0}
                    description="Active tasks"
                    icon={Clock}
                    className="border-l-4 border-l-blue-500"
                />

                <MetricCard
                    title="Completed"
                    value={data?.teamTasks.completed || 0}
                    description={`${(data?.teamTasks?.total || 0) > 0 ? Math.round(((data?.teamTasks?.completed || 0) / (data?.teamTasks?.total || 1)) * 100) : 0}% completion`}
                    icon={CheckCircle2}
                    className="border-l-4 border-l-green-500"
                />

                <MetricCard
                    title="Overdue"
                    value={data?.teamTasks.overdue || 0}
                    description="Needs attention"
                    icon={AlertCircle}
                    className="border-l-4 border-l-red-500"
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Team Tasks */}
                <ListWidget
                    title="Recent Team Tasks"
                    description="Latest tasks assigned to your team"
                    items={taskItems}
                    emptyMessage="No tasks assigned yet"
                    onItemClick={(id) => router.push(`/dashboard/tasks/${id}`)}
                />

                {/* Team Members */}
                <ListWidget
                    title="Team Members"
                    description="Your direct reports"
                    items={teamItems}
                    emptyMessage="No team members found"
                    onItemClick={(id) => router.push(`/dashboard/employees/${id}`)}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => {
                        const event = new CustomEvent('openCreateTaskDialog');
                        window.dispatchEvent(event);
                        router.push('/dashboard/team-tasks');
                    }}
                >
                    <ListTodo className="h-6 w-6" />
                    <span>Assign New Task</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => router.push('/dashboard/employees')}
                >
                    <Users className="h-6 w-6" />
                    <span>View All Employees</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => router.push('/dashboard/performance')}
                >
                    <TrendingUp className="h-6 w-6" />
                    <span>Team Performance</span>
                </Button>
            </div>
        </div>
    );
}
