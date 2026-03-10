'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Briefcase, Calendar, MapPin, Building2 } from 'lucide-react';

interface EmployeeProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    employee?: {
        employeeId: string;
        firstName: string;
        lastName: string;
        phone: string;
        position: string;
        hireDate: string;
        employmentType: string;
        status: string;
        department: {
            name: string;
        };
        manager?: {
            firstName: string;
            lastName: string;
            position: string;
        };
    };
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setProfile(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="flex items-center justify-center h-96">Profile not found</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">View your personal and employment information</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarFallback className="text-2xl">
                                    {profile.employee?.firstName?.[0]}{profile.employee?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-xl">
                            {profile.employee?.firstName} {profile.employee?.lastName}
                        </CardTitle>
                        <CardDescription>{profile.employee?.position}</CardDescription>
                        <div className="flex justify-center gap-2 mt-2">
                            <Badge variant="outline">{profile.role}</Badge>
                            <Badge
                                variant={profile.employee?.status === 'ACTIVE' ? 'default' : 'secondary'}
                            >
                                {profile.employee?.status}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Details Cards */}
                <div className="md:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                                </div>
                            </div>
                            {profile.employee?.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Phone</p>
                                        <p className="text-sm text-muted-foreground">{profile.employee.phone}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Employment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Employment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Employee ID</p>
                                    <p className="text-sm text-muted-foreground">{profile.employee?.employeeId}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Department</p>
                                    <p className="text-sm text-muted-foreground">{profile.employee?.department?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Employment Type</p>
                                    <p className="text-sm text-muted-foreground">{profile.employee?.employmentType?.replace('_', ' ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Hire Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {profile.employee?.hireDate ? new Date(profile.employee.hireDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            {profile.employee?.manager && (
                                <div className="flex items-center gap-3">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Reports To</p>
                                        <p className="text-sm text-muted-foreground">
                                            {profile.employee.manager.firstName} {profile.employee.manager.lastName} - {profile.employee.manager.position}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
