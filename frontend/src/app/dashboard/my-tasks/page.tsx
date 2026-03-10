'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TaskList from '@/components/tasks/TaskList';
import CreateTaskDialog from '@/components/tasks/CreateTaskDialog';
import { Plus, ListTodo, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TaskStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    completionRate: number;
}

export default function MyTasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        // Get user role from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            setUserRole(userData.role);
        }

        fetchMyTasks();
        fetchTaskStatistics();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/tasks/my-tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(data.data || []);
            } else {
                toast.error('Failed to fetch tasks');
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const fetchTaskStatistics = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/tasks/statistics', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch statistics:', error);
        }
    };

    const handleTaskClick = (taskId: string) => {
        router.push(`/dashboard/tasks/${taskId}`);
    };

    const pendingTasks = tasks.filter((t: any) => t.status === 'PENDING');
    const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS');
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED');

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage your assigned tasks and track your progress
                    </p>
                </div>
                {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Task
                    </Button>
                )}
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <ListTodo className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.inProgress}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completed}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.overdue}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.completionRate}% completion rate
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tasks Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">All Tasks ({tasks.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
                    <TabsTrigger value="in-progress">In Progress ({inProgressTasks.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                    <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
                </TabsContent>

                <TabsContent value="pending">
                    <TaskList tasks={pendingTasks} onTaskClick={handleTaskClick} showFilters={false} />
                </TabsContent>

                <TabsContent value="in-progress">
                    <TaskList tasks={inProgressTasks} onTaskClick={handleTaskClick} showFilters={false} />
                </TabsContent>

                <TabsContent value="completed">
                    <TaskList tasks={completedTasks} onTaskClick={handleTaskClick} showFilters={false} />
                </TabsContent>
            </Tabs>

            {/* Create Task Dialog */}
            <CreateTaskDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={() => {
                    fetchMyTasks();
                    fetchTaskStatistics();
                }}
            />
        </div>
    );
}
