'use client';

import { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import { MobileSidebar } from './MobileSidebar';

export function Header() {
    const router = useRouter();
    const [userName, setUserName] = useState('User');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                // Try to get name in order of preference: Employee Name -> User Name -> 'User'
                if (user.employee) {
                    setUserName(`${user.employee.firstName} ${user.employee.lastName}`);
                } else if (user.name) {
                    setUserName(user.name);
                }
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
    }, []);

    const handleLogout = async () => {
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user'); // Also remove user data
        localStorage.clear(); // Clear everything to be safe

        // Clear cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Call logout API
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.log('Logout API call failed, but continuing with logout');
        }

        // Force a hard redirect to login
        window.location.href = '/login';
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            {/* Search */}
            <div className="flex flex-1 items-center gap-4">
                <MobileSidebar />
                <div className="relative w-96 hidden md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search employees, departments..."
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <NotificationBell />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{userName}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
