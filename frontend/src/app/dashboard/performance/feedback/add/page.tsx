'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from '@/components/performance/StarRating';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function GiveFeedbackPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        toEmployeeId: '',
        type: 'PEER',
        rating: 0,
        comment: '',
        anonymous: false
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/employees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setEmployees(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch employees');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.toEmployeeId) return toast.error('Please select an employee');
        if (!formData.comment) return toast.error('Please provide comments');

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Feedback submitted successfully');
                router.push('/dashboard/performance/feedback');
            } else {
                toast.error(data.message || 'Failed to submit feedback');
            }
        } catch (err) {
            toast.error('Unable to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Give Feedback</h1>
                    <p className="text-muted-foreground">Share your thoughts to help others improve</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Feedback Details</CardTitle>
                    <CardDescription>Your feedback helps build a better workplace</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="employee">Recipient *</Label>
                            <select
                                id="employee"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.toEmployeeId}
                                onChange={(e) => setFormData({ ...formData, toEmployeeId: e.target.value })}
                                required
                            >
                                <option value="">Select a colleague...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} ({emp.position})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Feedback Type</Label>
                            <select
                                id="type"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="PEER">Peer to Peer</option>
                                <option value="MANAGER">To Manager</option>
                                <option value="SUBORDINATE">To Direct Report</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Rating (Optional)</Label>
                            <div className="pt-2">
                                <StarRating
                                    rating={formData.rating}
                                    size={32}
                                    editable
                                    onRatingChange={(r) => setFormData({ ...formData, rating: r })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="comment">Comments *</Label>
                            <Textarea
                                id="comment"
                                placeholder="What went well? What could be improved?"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                rows={5}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="anonymous"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={formData.anonymous}
                                onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                            />
                            <Label htmlFor="anonymous" className="font-normal">
                                Submit anonymously
                            </Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Submitting...' : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Send Feedback
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
