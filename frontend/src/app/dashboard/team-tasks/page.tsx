'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TaskList from '@/components/tasks/TaskList';
import CreateTaskDialog from '@/components/tasks/CreateTaskDialog';
import { Plus, Users, ListTodo, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamTasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    useEffect(() => {
        fetchTeamTasks();
    }, []);

    const fetchTeamTasks = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/tasks/team-tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTasks(data.data || []);
            } else {
                const data = await response.json();
                toast.error(data.message || 'Failed to fetch team tasks');
            }
        } catch (error) {
            console.error('Failed to fetch team tasks:', error);
            toast.error('Failed to fetch team tasks');
        } finally {
            setLoading(false);
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
                <p className="text-muted-foreground">Loading team tasks...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8" />
                        Team Tasks
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and monitor your team&apos;s tasks
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Task
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingTasks.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressTasks.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedTasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% completion
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tasks List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Team Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <TaskList tasks={tasks} onTaskClick={handleTaskClick} />
                </CardContent>
            </Card>

            {/* Create Task Dialog */}
            <CreateTaskDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={fetchTeamTasks}
            />
        </div>
    );
}
