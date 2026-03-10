'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/dashboard/StatsCard';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Users, TrendingUp, UserCheck, Activity, Briefcase, Award } from 'lucide-react';
import { toast } from 'sonner';

interface ExecutiveStats {
    totalEmployees: number;
    attendanceRate: number;
    avgPerformance: number | string;
    headcountByDept: { name: string; value: number }[];
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<ExecutiveStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/analytics/executive', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch analytics');
            }
        } catch (error) {
            console.error('Analytics fetch error:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading analytics...</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">Executive overview of organizational metrics</p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Headcount"
                    value={stats?.totalEmployees.toString() || '0'}
                    icon={Users}
                    description="Active employees"
                />
                <StatsCard
                    title="Attendance Rate"
                    value={`${stats?.attendanceRate}%`}
                    icon={UserCheck}
                    description="Last 30 days"
                />
                <StatsCard
                    title="Avg Performance"
                    value={stats?.avgPerformance.toString() || '0'}
                    icon={Award}
                    description="Across all reviews"
                />
                <StatsCard
                    title="Departments"
                    value={stats?.headcountByDept.length.toString() || '0'}
                    icon={Briefcase}
                    description="Active units"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Department Distribution Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Headcount by Department</CardTitle>
                        <CardDescription>Distribution of workforce across departments</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={stats?.headcountByDept}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="value" fill="#adfa1d" radius={[4, 4, 0, 0]}>
                                    {stats?.headcountByDept.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart Representation */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Department Ratio</CardTitle>
                        <CardDescription>Proportional view</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={stats?.headcountByDept}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats?.headcountByDept.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
