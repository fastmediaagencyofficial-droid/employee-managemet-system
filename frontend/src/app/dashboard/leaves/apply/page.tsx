'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ApplyLeavePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        type: '',
        startDate: '',
        endDate: '',
        reason: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/leaves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard/leaves');
            } else {
                setError(data.message || 'Failed to apply for leave');
            }
        } catch (err) {
            setError('Unable to connect to server');
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
                    <h1 className="text-3xl font-bold tracking-tight">Apply for Leave</h1>
                    <p className="text-muted-foreground">Submit a new leave request</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Details</CardTitle>
                        <CardDescription>Fill in the information below</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="type">Leave Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SICK">Sick Leave</SelectItem>
                                    <SelectItem value="CASUAL">Casual Leave</SelectItem>
                                    <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                                    <SelectItem value="MATERNITY">Maternity Leave</SelectItem>
                                    <SelectItem value="PATERNITY">Paternity Leave</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor="startDate">Start Date *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate">End Date *</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="reason">Reason *</Label>
                            <Textarea
                                id="reason"
                                required
                                placeholder="Please provide a reason for your leave request..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
