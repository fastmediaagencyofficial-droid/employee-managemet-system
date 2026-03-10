'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Calendar, Award, TrendingUp, Target, MessageSquare } from 'lucide-react';
import { StarRating } from '@/components/performance/StarRating';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ReviewDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const id = params.id as string;

    const fetchReview = useCallback(async () => {
        if (!id) return;
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setReview(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch review');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading review details...</div>;
    }

    if (!review) {
        return <div className="flex flex-col items-center justify-center h-96 gap-4">
            <p className="text-muted-foreground">Review not found</p>
            <Button onClick={() => router.push('/dashboard/performance/reviews')}>Go Back</Button>
        </div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Review Details</h1>
                        <p className="text-muted-foreground">Evaluation for {review.employee.firstName} {review.employee.lastName}</p>
                    </div>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                    {review.period}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-yellow-500" />
                                Key Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {review.strengths || 'No strengths noted for this period.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                Areas for Improvement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {review.improvements || 'No specific areas for improvement noted.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-green-500" />
                                Future Goals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {review.goals || 'No future goals defined for this period.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-purple-500" />
                                Reviewer Comments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm italic leading-relaxed whitespace-pre-wrap">
                                &quot;{review.comments || 'No additional comments.'}&quot;
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="text-center">
                            <CardTitle className="text-lg">Overall Performance</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <StarRating rating={review.overallRating} size={32} />
                            <div className="text-4xl font-bold">{review.overallRating} <span className="text-xl text-muted-foreground">/ 5</span></div>
                            <Separator className="my-2" />
                            <div className="w-full space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Reviewer</span>
                                    <span className="font-medium text-right">{review.reviewer.firstName} {review.reviewer.lastName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</span>
                                    <span className="font-medium">{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Employee Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground">
                                    {review.employee.firstName[0]}{review.employee.lastName[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{review.employee.firstName} {review.employee.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{review.employee.position}</p>
                                </div>
                            </div>
                            <Separator />
                            <Button className="w-full text-xs" variant="outline" onClick={() => router.push(`/dashboard/employees/${review.employeeId}`)}>
                                View Full Profile
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
