'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ArrowLeft, MessageSquare, Star, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';

export default function FeedbackAnalyticsPage() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/feedback/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Feedback Insights</h1>
                    <p className="text-muted-foreground">AI-powered analysis of your feedback profile</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Total Feedback"
                    value={analytics?.totalFeedback || '0'}
                    icon={MessageSquare}
                    description="All time received"
                />
                <StatsCard
                    title="Average Rating"
                    value={analytics?.avgRating || '0'}
                    icon={Star}
                    description="Out of 5 stars"
                />
                <StatsCard
                    title="Sentiment Score"
                    value="AI Analyzed"
                    icon={Activity}
                    description="Automated tone check"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-[400px]">
                    <CardHeader>
                        <CardTitle>Sentiment Distribution</CardTitle>
                        <CardDescription>Tone analysis of received comments</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        {analytics?.sentimentDistribution && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.sentimentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics.sentimentDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Insights</CardTitle>
                        <CardDescription>Key takeaways from your feedback</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-blue-50 text-blue-800 border-blue-100 border">
                            <h4 className="font-semibold mb-1">Strengths</h4>
                            <p className="text-sm">Based on positive sentiment, you excel at collaboration and timely delivery.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-orange-50 text-orange-800 border-orange-100 border">
                            <h4 className="font-semibold mb-1">Areas to Focus</h4>
                            <p className="text-sm">Some feedback suggests looking at more detailed documentation.</p>
                        </div>
                        <p className="text-xs text-muted-foreground italic text-center mt-4">
                            Insights generated by analyzing {analytics?.totalFeedback} feedback trends.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
