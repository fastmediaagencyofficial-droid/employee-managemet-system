'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { StarRating } from '@/components/performance/StarRating';
import { toast } from 'sonner';

import { useSearchParams } from 'next/navigation';

export default function AddReviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [cycles, setCycles] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        employeeId: searchParams.get('employeeId') || '',
        cycleId: '',
        reviewPeriod: `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
        overallRating: 0,
        strengths: '',
        improvements: '',
        goals: '',
        comments: '',
    });

    useEffect(() => {
        fetchEmployees();
        fetchCycles();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/employees', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setEmployees(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch employees');
        }
    };

    const fetchCycles = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/review-cycles', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                const active = data.data.filter((c: any) => c.status === 'ACTIVE');
                setCycles(active);
                if (active.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        cycleId: active[0].id,
                        reviewPeriod: active[0].name
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch cycles');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.employeeId) return toast.error('Please select an employee');
        if (formData.overallRating === 0) return toast.error('Please provide a rating');

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Review submitted successfully');
                router.push('/dashboard/performance/reviews');
            } else {
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (err) {
            toast.error('Unable to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Performance Review</h1>
                    <p className="text-muted-foreground">Provide constructive feedback for an employee</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Detailed Feedback</CardTitle>
                            <CardDescription>Sectional review of employee performance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="employeeId">Employee *</Label>
                                    <select
                                        id="employeeId"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select an employee...</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.firstName} {emp.lastName} ({emp.employeeId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="cycleId">Review Cycle</Label>
                                    <select
                                        id="cycleId"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={formData.cycleId}
                                        onChange={(e) => {
                                            const cycle = cycles.find(c => c.id === e.target.value);
                                            setFormData({
                                                ...formData,
                                                cycleId: e.target.value,
                                                reviewPeriod: cycle ? cycle.name : formData.reviewPeriod
                                            });
                                        }}
                                    >
                                        <option value="">Manual Period Entry...</option>
                                        {cycles.map(cycle => (
                                            <option key={cycle.id} value={cycle.id}>
                                                {cycle.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reviewPeriod">Review Period *</Label>
                                <Input
                                    id="reviewPeriod"
                                    value={formData.reviewPeriod}
                                    onChange={(e) => setFormData({ ...formData, reviewPeriod: e.target.value })}
                                    placeholder="e.g., 2024-Q1"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="strengths">Key Strengths</Label>
                                <Textarea
                                    id="strengths"
                                    placeholder="What did the employee excel at?"
                                    value={formData.strengths}
                                    onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="improvements">Areas for Improvement</Label>
                                <Textarea
                                    id="improvements"
                                    placeholder="Where can the employee grow?"
                                    value={formData.improvements}
                                    onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="goals">Future Goals</Label>
                                <Textarea
                                    id="goals"
                                    placeholder="Set specific objectives for the next period"
                                    value={formData.goals}
                                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Assessment</CardTitle>
                            <CardDescription>Final rating and comments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                <Label className="text-base">Overall Rating *</Label>
                                <StarRating
                                    rating={formData.overallRating}
                                    size={32}
                                    editable
                                    onRatingChange={(r) => setFormData({ ...formData, overallRating: r })}
                                />
                                <span className="text-sm font-medium">
                                    {formData.overallRating > 0 ? `${formData.overallRating} / 5` : 'Click to rate'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comments">Additional Comments</Label>
                                <Textarea
                                    id="comments"
                                    placeholder="Any other observations..."
                                    value={formData.comments}
                                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                    rows={5}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Submitting...' : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Submit Review
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
