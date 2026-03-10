'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/performance/StarRating';
import { ArrowLeft, UserCircle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ReceivedFeedbackPage() {
    const router = useRouter();
    const [feedback, setFeedback] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/feedback/received', {
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

    const getSentimentColor = (label?: string) => {
        switch (label?.toLowerCase()) {
            case 'positive': return 'bg-green-100 text-green-800 border-green-200';
            case 'negative': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Received Feedback</h1>
                    <p className="text-muted-foreground">See what others are saying about your work</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading feedback...</div>
            ) : feedback.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                        <p>You haven&apos;t received any feedback yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {feedback.map((item) => (
                        <Card key={item.id} className="flex flex-col h-full">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <CardTitle className="text-base">
                                                {item.from ? `${item.from.firstName} ${item.from.lastName}` : 'Anonymous'}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {format(new Date(item.createdAt), 'MMM dd, yyyy')} • {item.type}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {item.rating > 0 && <StarRating rating={item.rating} size={16} />}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col gap-4">
                                <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                                    &quot;{item.comment}&quot;
                                </p>

                                {item.sentimentLabel && (
                                    <div className="flex items-center gap-2 pt-2 border-t mt-auto">
                                        <span className="text-xs text-muted-foreground">AI Sentiment:</span>
                                        <Badge variant="outline" className={getSentimentColor(item.sentimentLabel)}>
                                            {item.sentimentLabel}
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
