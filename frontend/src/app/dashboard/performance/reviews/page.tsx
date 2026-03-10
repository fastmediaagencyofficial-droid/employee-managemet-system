'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Filter, Calendar, Settings2 } from 'lucide-react';
import { StarRating } from '@/components/performance/StarRating';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Review {
    id: string;
    employeeId: string;
    employee: {
        firstName: string;
        lastName: string;
        employeeId: string;
    };
    reviewer: {
        firstName: string;
        lastName: string;
    };
    period: string;
    overallRating: number;
    createdAt: string;
}

export default function ReviewsListPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('All');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/reviews', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setReviews(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch reviews');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch =
            `${review.employee.firstName} ${review.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPeriod = filterPeriod === 'All' || review.period === filterPeriod;

        return matchesSearch && matchesPeriod;
    });

    const uniquePeriods = ['All', ...Array.from(new Set(reviews.map(r => r.period)))];

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading reviews...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Performance Reviews</h1>
                    <p className="text-muted-foreground">Manage and view employee performance evaluations</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/dashboard/performance/reviews/cycles')}>
                        <Settings2 className="mr-2 h-4 w-4" /> Manage Cycles
                    </Button>
                    <Button onClick={() => router.push('/dashboard/performance/reviews/add')}>
                        <Plus className="mr-2 h-4 w-4" /> New Review
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search employee or ID..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filterPeriod}
                        onChange={(e) => setFilterPeriod(e.target.value)}
                    >
                        {uniquePeriods.map(period => (
                            <option key={period} value={period}>{period}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                    <CardDescription>A list of all performance reviews in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Reviewer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReviews.length > 0 ? (
                                filteredReviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{review.employee.firstName} {review.employee.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{review.employee.employeeId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{review.period}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <StarRating rating={review.overallRating} size={16} />
                                        </TableCell>
                                        <TableCell>
                                            {review.reviewer.firstName} {review.reviewer.lastName}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/dashboard/performance/reviews/${review.id}`)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No reviews found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
