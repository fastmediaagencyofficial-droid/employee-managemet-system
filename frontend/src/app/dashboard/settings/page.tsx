'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Bell, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface Preferences {
    emailNotifications: boolean;
    leaveRequestUpdates: boolean;
    performanceReviews: boolean;
    theme: 'light' | 'dark' | 'system';
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [preferences, setPreferences] = useState<Preferences>({
        emailNotifications: true,
        leaveRequestUpdates: true,
        performanceReviews: true,
        theme: 'system'
    });

    useEffect(() => {
        fetchUserProfile();
        fetchPreferences();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setProfileData({
                    name: data.data.name || '',
                    email: data.data.email || '',
                    phone: data.data.employee?.phone || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/preferences', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setPreferences({
                    emailNotifications: data.data.emailNotifications,
                    leaveRequestUpdates: data.data.leaveRequestUpdates,
                    performanceReviews: data.data.performanceReviews,
                    theme: data.data.theme
                });
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Profile updated successfully');
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Password changed successfully');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                toast.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePreferences = async (updatedPrefs: Partial<Preferences>) => {
        const newPreferences = { ...preferences, ...updatedPrefs };
        setPreferences(newPreferences);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('/api/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newPreferences)
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Preferences saved');
            } else {
                toast.error(data.message || 'Failed to save preferences');
            }
        } catch (error) {
            toast.error('Failed to save preferences');
        }
    };

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        handleUpdatePreferences({ theme });

        // Apply theme to document
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // System theme
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Lock className="mr-2 h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance">
                        <Palette className="mr-2 h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information and contact details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Employee Record Card */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Employee Record</CardTitle>
                            <CardDescription>Create your employee record to access task management features</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    If you&apos;re unable to see tasks or other employee-related features, you may need to create an employee record linked to your account.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const token = localStorage.getItem('accessToken');
                                            const response = await fetch('/api/auth/create-employee-record', {
                                                method: 'POST',
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            });
                                            const data = await response.json();
                                            if (data.success) {
                                                toast.success('Employee record created successfully! Please refresh the page.');
                                                setTimeout(() => window.location.reload(), 2000);
                                            } else {
                                                toast.info(data.message || 'Employee record already exists');
                                            }
                                        } catch (error) {
                                            toast.error('Failed to create employee record');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create Employee Record'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Manage how you receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer"
                                    checked={preferences.emailNotifications}
                                    onChange={(e) => handleUpdatePreferences({ emailNotifications: e.target.checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Leave Request Updates</p>
                                    <p className="text-sm text-muted-foreground">Get notified when leave requests are approved/rejected</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer"
                                    checked={preferences.leaveRequestUpdates}
                                    onChange={(e) => handleUpdatePreferences({ leaveRequestUpdates: e.target.checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Performance Reviews</p>
                                    <p className="text-sm text-muted-foreground">Notifications for upcoming and completed reviews</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer"
                                    checked={preferences.performanceReviews}
                                    onChange={(e) => handleUpdatePreferences({ performanceReviews: e.target.checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance Settings</CardTitle>
                            <CardDescription>Customize how the dashboard looks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Theme</Label>
                                <div className="flex gap-4 mt-2">
                                    <Button
                                        type="button"
                                        variant={preferences.theme === 'light' ? 'default' : 'outline'}
                                        className="w-24"
                                        onClick={() => handleThemeChange('light')}
                                    >
                                        Light
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                                        className="w-24"
                                        onClick={() => handleThemeChange('dark')}
                                    >
                                        Dark
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={preferences.theme === 'system' ? 'default' : 'outline'}
                                        className="w-24"
                                        onClick={() => handleThemeChange('system')}
                                    >
                                        System
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Theme preferences are saved to your account and synced across devices
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
