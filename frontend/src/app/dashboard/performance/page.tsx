'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Award, Users, Plus, CheckCircle2, Clock, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';

interface Goal {
    id: string;
    title: string;
    progress: number;
    status: string;
    dueDate: string;
    completedAt?: string;
}

interface PerformanceMetrics {
    goals: {
        total: number;
        completed: number;
        inProgress: number;
        onTime: number;
        late: number;
        averageProgress: number;
    };
    reviews: {
        total: number;
        averageRating: number;
        recent: any[];
    };
}

interface TrendData {
    month: string;
    completed: number;
    avgRating: number;
}

export default function PerformanceDashboard() {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setError(null);
            try {
                await Promise.all([
                    fetchGoals(),
                    fetchMetrics(),
                    fetchTrends()
                ]);
            } catch (err) {
                setError('Failed to load dashboard data. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const fetchGoals = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/performance/goals', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setGoals(data.data.slice(0, 5));
            } else {
                setError(data.message || 'Failed to fetch goals');
            }
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        }
    };

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/performance/metrics', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setMetrics(data.data);
            } else {
                setError(data.message || 'Failed to fetch performance metrics');
            }
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        }
    };

    const fetchTrends = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/performance/trends', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setTrends(data.data);
            } else {
                setError(data.message || 'Failed to fetch performance trends');
            }
        } catch (error) {
            console.error('Failed to fetch trends:', error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading performance data...</div>;
    }

    if (error || !metrics) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <p className="text-destructive font-medium">{error || 'Failed to load performance metrics.'}</p>
                <p className="text-muted-foreground text-sm">Please ensure you have an employee profile or try again later.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    const completionRate = metrics.goals.total > 0
        ? Math.round((metrics.goals.completed / metrics.goals.total) * 100)
        : 0;

    const onTimeRate = metrics.goals.completed > 0
        ? Math.round((metrics.goals.onTime / metrics.goals.completed) * 100)
        : 0;

    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
    const pieData = [
        { name: 'Completed', value: metrics.goals.completed },
        { name: 'In Progress', value: metrics.goals.inProgress },
        { name: 'Late', value: metrics.goals.late },
        { name: 'On Time', value: metrics.goals.onTime },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
                    <p className="text-muted-foreground">Detailed metrics, trends, and goal tracking</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push('/dashboard/performance/goals/add')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Goal
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <Target className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completionRate}%</div>
                        <Progress value={completionRate} className="h-1 mt-2" />
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{onTimeRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {metrics.goals.onTime} of {metrics.goals.completed} goals on time
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                        <Award className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.reviews.averageRating}/5.0</div>
                        <div className="flex gap-0.5 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Award key={star} className={`h-3 w-3 ${star <= metrics.reviews.averageRating ? 'fill-amber-500 text-amber-500' : 'text-muted'}`} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Goal Velocity</CardTitle>
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{trends[trends.length - 1]?.completed || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Goals finished this month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-muted-foreground" />
                            Performance Trends
                        </CardTitle>
                        <CardDescription>Monthly goal completion and average ratings</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    name="Goals Completed"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#3b82f6' }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avgRating"
                                    name="Avg Rating"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#ec4899' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                            Goal Status
                        </CardTitle>
                        <CardDescription>Overall distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Lower Section: Recent Goals & Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Active Goals</CardTitle>
                                <CardDescription>Your current and recently completed objectives</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/performance/goals')}>
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {goals.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No active goals found.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {goals.map((goal) => {
                                    const isCompleted = goal.status === 'COMPLETED';
                                    const isLate = isCompleted && goal.completedAt && goal.dueDate && new Date(goal.completedAt) > new Date(goal.dueDate);
                                    const isOnTime = isCompleted && !isLate;

                                    return (
                                        <div
                                            key={goal.id}
                                            className="flex flex-col p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group"
                                            onClick={() => router.push(`/dashboard/performance/goals/${goal.id}`)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold group-hover:text-primary transition-colors">{goal.title}</h4>
                                                        <Badge variant={isCompleted ? 'secondary' : 'default'} className="text-[10px] h-5">
                                                            {goal.status.replace('_', ' ')}
                                                        </Badge>
                                                        {isOnTime && (
                                                            <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                On-time
                                                            </Badge>
                                                        )}
                                                        {isLate && (
                                                            <Badge variant="outline" className="text-[10px] h-5 bg-red-50 text-red-700 border-red-200">
                                                                Late
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Due: {new Date(goal.dueDate).toLocaleDateString()}
                                                        </span>
                                                        {isCompleted && goal.completedAt && (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                                Finished: {new Date(goal.completedAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg font-bold">{goal.progress}%</span>
                                                </div>
                                            </div>
                                            <Progress value={goal.progress} className="h-1.5 mt-3" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Help</CardTitle>
                        <CardDescription>Tips for better performance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-blue-50 rounded-md border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">💡 Pro Tip</p>
                            <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-1">
                                Setting specific, measurable goals increases completion rate by 40%.
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-md border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800">
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">✅ On-Time Delivery</p>
                            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                                Break large goals into smaller weekly tasks to ensure on-time delivery.
                            </p>
                        </div>
                        <Button variant="outline" className="w-full mt-2" onClick={() => router.push('/dashboard/performance/feedback')}>
                            Give Feedback to Peers
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
