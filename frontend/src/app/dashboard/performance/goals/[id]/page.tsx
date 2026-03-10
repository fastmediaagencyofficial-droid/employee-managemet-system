'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, Target, TrendingUp } from 'lucide-react';

interface Goal {
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    targetValue: string;
    currentValue: string;
    progress: number;
    status: string;
    priority: string;
    startDate: string;
    dueDate: string;
    completedAt: string;
    createdAt: string;
    updatedAt: string;
}

export default function GoalDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [goal, setGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchGoal = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/performance/goals/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setGoal(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch goal:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchGoal();
    }, [fetchGoal]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            NOT_STARTED: { variant: 'secondary', label: 'Not Started' },
            IN_PROGRESS: { variant: 'default', label: 'In Progress' },
            COMPLETED: { variant: 'outline', label: 'Completed' },
            OVERDUE: { variant: 'destructive', label: 'Overdue' },
            CANCELLED: { variant: 'secondary', label: 'Cancelled' },
        };
        const config = variants[status] || variants.NOT_STARTED;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            LOW: 'bg-blue-100 text-blue-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            HIGH: 'bg-orange-100 text-orange-800',
            URGENT: 'bg-red-100 text-red-800',
        };
        return <Badge className={colors[priority] || colors.MEDIUM}>{priority}</Badge>;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    if (!goal) {
        return <div className="flex items-center justify-center h-96">Goal not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{goal.title}</h1>
                        <p className="text-muted-foreground">Goal Details</p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/dashboard/performance/goals/${id}/edit`)}>
                    Edit Goal
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{goal.progress}%</div>
                        <Progress value={goal.progress} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="mt-2">{getStatusBadge(goal.status)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Priority</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="mt-2">{getPriorityBadge(goal.priority)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Goal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Description</p>
                            <p className="font-medium">{goal.description || 'No description provided'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <Badge variant="outline">{goal.category}</Badge>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Type</p>
                                <Badge variant="outline">{goal.type}</Badge>
                            </div>
                        </div>
                        {goal.type === 'QUANTITATIVE' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Target Value</p>
                                    <p className="font-medium">{goal.targetValue || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current Value</p>
                                    <p className="font-medium">{goal.currentValue || 'Not set'}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Start Date</p>
                            <p className="font-medium">{new Date(goal.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Due Date</p>
                            <p className="font-medium">{new Date(goal.dueDate).toLocaleDateString()}</p>
                        </div>
                        {goal.completedAt && (
                            <div>
                                <p className="text-sm text-muted-foreground">Completed At</p>
                                <p className="font-medium">{new Date(goal.completedAt).toLocaleDateString()}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Created At</p>
                            <p className="font-medium">{new Date(goal.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last Updated</p>
                            <p className="font-medium">{new Date(goal.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
