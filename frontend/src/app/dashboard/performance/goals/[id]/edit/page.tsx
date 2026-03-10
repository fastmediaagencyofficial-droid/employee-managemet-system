'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditGoalPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'INDIVIDUAL',
        type: 'QUALITATIVE',
        targetValue: '',
        currentValue: '',
        progress: '0',
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        dueDate: '',
    });

    useEffect(() => {
        const fetchGoal = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/performance/goals/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (data.success) {
                    const goal = data.data;
                    setFormData({
                        title: goal.title || '',
                        description: goal.description || '',
                        category: goal.category || 'INDIVIDUAL',
                        type: goal.type || 'QUALITATIVE',
                        targetValue: goal.targetValue || '',
                        currentValue: goal.currentValue || '',
                        progress: goal.progress?.toString() || '0',
                        status: goal.status || 'NOT_STARTED',
                        priority: goal.priority || 'MEDIUM',
                        dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : '',
                    });
                } else {
                    toast.error(data.message || 'Failed to load goal');
                    router.push('/dashboard/performance/goals');
                }
            } catch (error) {
                console.error('Failed to fetch goal:', error);
                toast.error('Failed to load goal');
                router.push('/dashboard/performance/goals');
            } finally {
                setLoading(false);
            }
        };

        fetchGoal();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/performance/goals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    progress: parseInt(formData.progress),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Goal updated successfully!');
                router.push('/dashboard/performance/goals');
            } else {
                setError(data.message || 'Failed to update goal');
                toast.error(data.message || 'Failed to update goal');
            }
        } catch (err) {
            setError('Unable to connect to server');
            toast.error('Unable to connect to server');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading goal data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Goal</h1>
                    <p className="text-muted-foreground">Update your performance goal</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Goal Information</CardTitle>
                        <CardDescription>Basic details about the goal</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div>
                            <Label htmlFor="title">Goal Title *</Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Complete React Advanced Course"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the goal in detail..."
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                        <SelectItem value="TEAM">Team</SelectItem>
                                        <SelectItem value="DEPARTMENT">Department</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="QUANTITATIVE">Quantitative (Measurable)</SelectItem>
                                        <SelectItem value="QUALITATIVE">Qualitative (Descriptive)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Progress Tracking</CardTitle>
                        <CardDescription>Set targets and track progress</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {formData.type === 'QUANTITATIVE' && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="targetValue">Target Value</Label>
                                    <Input
                                        id="targetValue"
                                        value={formData.targetValue}
                                        onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                                        placeholder="e.g., 20 PRs"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="currentValue">Current Value</Label>
                                    <Input
                                        id="currentValue"
                                        value={formData.currentValue}
                                        onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                                        placeholder="e.g., 5 PRs"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <Label htmlFor="progress">Progress (0-100%) *</Label>
                            <Input
                                id="progress"
                                type="number"
                                min="0"
                                max="100"
                                required
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status & Priority</CardTitle>
                        <CardDescription>Set goal status and priority level</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="status">Status *</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="priority">Priority *</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="dueDate">Due Date *</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
