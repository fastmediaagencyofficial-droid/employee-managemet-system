'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/performance/StarRating';
import { ArrowLeft, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function GivenFeedbackPage() {
    const router = useRouter();
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/feedback/given', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setFeedback(data.data);
            }
        } catch (error) {
            toast.error('Failed to load feedback');
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
                    <h1 className="text-3xl font-bold tracking-tight">Given Feedback</h1>
                    <p className="text-muted-foreground">History of feedback sent by you</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading feedback...</div>
            ) : feedback.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p>You haven&apos;t given any feedback yet.</p>
                        <Button className="mt-4" onClick={() => router.push('/dashboard/performance/feedback/add')}>
                            Give Feedback
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {feedback.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base text-muted-foreground">
                                                To: <span className="text-foreground">{item.to.firstName} {item.to.lastName}</span>
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {format(new Date(item.createdAt), 'MMM dd, yyyy')} • {item.isAnonymous ? 'Anonymous' : 'Public'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {item.rating > 0 && <StarRating rating={item.rating} size={16} />}
                                </div>
                            </CardHeader>
                            <CardContent>
                                        <p className="text-sm text-foreground/80">
                                            &quot;{item.comment}&quot;
                                        </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
