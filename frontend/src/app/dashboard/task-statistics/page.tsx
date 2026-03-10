'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartWidget from '@/components/widgets/ChartWidget';
import MetricCard from '@/components/widgets/MetricCard';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, ListTodo, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function TaskStatisticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            // Fetch task statistics
            const statsResponse = await fetch('http://localhost:5000/api/tasks/statistics', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            // Fetch all tasks for detailed analysis
            const tasksResponse = await fetch('http://localhost:5000/api/tasks/my-tasks', {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (statsResponse.ok && tasksResponse.ok) {
                const statsData = await statsResponse.json();
                const tasksData = await tasksResponse.json();

                setStats(statsData.data);
                setTasks(tasksData.data);
            }
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
            toast.error('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (tasks.length === 0) {
            toast.error('No tasks to export');
            return;
        }

        // Prepare CSV data
        const headers = ['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Assigned To', 'Created At'];
        const rows = tasks.map(task => [
            task.title,
            task.description || '',
            task.priority,
            task.status,
            new Date(task.dueDate).toLocaleDateString(),
            `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
            new Date(task.createdAt).toLocaleDateString(),
        ]);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Tasks exported successfully');
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading statistics...</p>
            </div>
        );
    }

    // Prepare chart data
    const statusData = [
        { name: 'Pending', value: stats?.pending || 0, color: '#f59e0b' },
        { name: 'In Progress', value: stats?.inProgress || 0, color: '#3b82f6' },
        { name: 'Completed', value: stats?.completed || 0, color: '#10b981' },
        { name: 'Overdue', value: stats?.overdue || 0, color: '#ef4444' },
    ];

    const priorityData = tasks.reduce((acc: any, task) => {
        const existing = acc.find((item: any) => item.name === task.priority);
        if (existing) {
            existing.value++;
        } else {
            acc.push({ name: task.priority, value: 1 });
        }
        return acc;
    }, []);

    const completionRate = stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Task Statistics 📊</h1>
                    <p className="text-muted-foreground">Analyze your task performance and trends</p>
                </div>
                <Button onClick={exportToCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to CSV
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Tasks"
                    value={stats?.total || 0}
                    description="All time"
                    icon={ListTodo}
                />
                <MetricCard
                    title="Completion Rate"
                    value={`${completionRate}%`}
                    description={`${stats?.completed || 0} completed`}
                    icon={CheckCircle2}
                    className="border-l-4 border-l-green-500"
                />
                <MetricCard
                    title="In Progress"
                    value={stats?.inProgress || 0}
                    description="Currently active"
                    icon={Clock}
                    className="border-l-4 border-l-blue-500"
                />
                <MetricCard
                    title="Overdue"
                    value={stats?.overdue || 0}
                    description="Needs attention"
                    icon={TrendingUp}
                    className="border-l-4 border-l-red-500"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Tasks by Status */}
                <ChartWidget
                    title="Tasks by Status"
                    description="Distribution of tasks across different statuses"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartWidget>

                {/* Tasks by Priority */}
                <ChartWidget
                    title="Tasks by Priority"
                    description="Distribution of tasks by priority level"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={priorityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#3b82f6" name="Tasks" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartWidget>
            </div>

            {/* Task Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Task Summary</CardTitle>
                    <CardDescription>Overview of your task performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Total Tasks</span>
                            <span className="text-sm text-muted-foreground">{stats?.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Pending Tasks</span>
                            <span className="text-sm text-muted-foreground">{stats?.pending || 0}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">In Progress Tasks</span>
                            <span className="text-sm text-muted-foreground">{stats?.inProgress || 0}</span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Completed Tasks</span>
                            <span className="text-sm text-muted-foreground">{stats?.completed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overdue Tasks</span>
                            <span className="text-sm text-red-600 font-semibold">{stats?.overdue || 0}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
