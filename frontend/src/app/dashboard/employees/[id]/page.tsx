'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Building2, Target, Award, Eye, CreditCard, GraduationCap, School } from 'lucide-react';
import DocumentUpload from '@/components/employees/DocumentUpload';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarRating } from '@/components/performance/StarRating';
import { format } from 'date-fns';

interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    position: string;
    department: {
        name: string;
    };
    salary: string;
    hireDate: string;
    employmentType: string;
    status: string;
    cnic?: string;
    highestQualification?: string;
    institute?: string;
}

export default function EmployeeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployee = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setEmployee(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch employee:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchReviews = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/reviews/employee/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setReviews(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews');
        }
    }, [id]);

    const fetchGoals = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/performance/goals?employeeId=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setGoals(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch goals');
        }
    }, [id]);

    const fetchDocuments = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`/api/employees/${id}/documents`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) {
                setDocuments(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch documents');
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchEmployee();
            fetchReviews();
            fetchGoals();
            fetchDocuments();
        }
    }, [id, fetchEmployee, fetchReviews, fetchGoals, fetchDocuments]);

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            ACTIVE: 'default',
            INACTIVE: 'secondary',
            ON_LEAVE: 'secondary',
            TERMINATED: 'destructive',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    if (!employee) {
        return <div className="flex items-center justify-center h-96">Employee not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {employee.firstName} {employee.lastName}
                        </h1>
                        <p className="text-muted-foreground">{employee.position} • {employee.employeeId}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/dashboard/performance/reviews/add?employeeId=${id}`)}>
                        Create Review
                    </Button>
                    <Button onClick={() => router.push(`/dashboard/employees/${id}/edit`)}>
                        Edit Profile
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="info" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="info">General Info</TabsTrigger>
                    <TabsTrigger value="reviews">Review History</TabsTrigger>
                    <TabsTrigger value="goals">Performance Goals</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{employee.email}</p>
                                    </div>
                                </div>
                                {employee.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{employee.phone}</p>
                                        </div>
                                    </div>
                                )}
                                {employee.address && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="font-medium">
                                                {employee.address}
                                                {employee.city && `, ${employee.city}`}
                                                {employee.country && `, ${employee.country}`}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {employee.cnic && (
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">CNIC</p>
                                            <p className="font-medium">{employee.cnic}</p>
                                        </div>
                                    </div>
                                )}
                                {employee.highestQualification && (
                                    <div className="flex items-center gap-3">
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Highest Qualification</p>
                                            <p className="font-medium">{employee.highestQualification}</p>
                                        </div>
                                    </div>
                                )}
                                {employee.institute && (
                                    <div className="flex items-center gap-3">
                                        <School className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Institute/University</p>
                                            <p className="font-medium">{employee.institute}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Employment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Department</p>
                                        <p className="font-medium">{employee.department.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Position</p>
                                        <p className="font-medium">{employee.position}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Hire Date</p>
                                        <p className="font-medium">
                                            {format(new Date(employee.hireDate), 'PPP')}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Employment Type</p>
                                    <p className="font-medium">{employee.employmentType.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    {getStatusBadge(employee.status)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="reviews">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Reviews</CardTitle>
                            <CardDescription>Historical performance evaluations for this employee</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {reviews.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No reviews found for this employee.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg">{review.period}</span>
                                                    <Badge variant="secondary">{format(new Date(review.createdAt), 'MMM yyyy')}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StarRating rating={review.overallRating} size={16} />
                                                    <span className="text-sm text-muted-foreground">by {review.reviewer.firstName} {review.reviewer.lastName}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/performance/reviews/${review.id}`)}>
                                                <Eye className="h-4 w-4 mr-2" /> View Details
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="goals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active & Past Goals</CardTitle>
                            <CardDescription>Strategic objectives assigned to this employee</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {goals.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No goals assigned to this employee.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {goals.map((goal) => (
                                        <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold">{goal.title}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                                                </div>
                                                <Badge variant={goal.status === 'COMPLETED' ? 'default' : 'outline'}>
                                                    {goal.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Due {format(new Date(goal.dueDate), 'MMM dd')}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Target className="h-3 w-3" />
                                                    <span>{goal.progress}% Complete</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-primary h-full transition-all"
                                                    style={{ width: `${goal.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employee Documents</CardTitle>
                            <CardDescription>Manage CV, certificates, and other employee documents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DocumentUpload
                                employeeId={id}
                                documents={documents}
                                onUploadSuccess={fetchDocuments}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
