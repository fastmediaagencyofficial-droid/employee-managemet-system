'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        // Get user role from localStorage
        const user = localStorage.getItem('user');

        if (user) {
            try {
                const userData = JSON.parse(user);
                const role = userData.role;

                // Redirect based on role
                switch (role) {
                    case 'ADMIN':
                        router.push('/dashboard/admin');
                        break;
                    case 'HR':
                        router.push('/dashboard/hr');
                        break;
                    case 'MANAGER':
                        router.push('/dashboard/manager');
                        break;
                    case 'EMPLOYEE':
                    default:
                        router.push('/dashboard/employee');
                        break;
                }
            } catch (error) {
                console.error('Failed to parse user data:', error);
                router.push('/dashboard/employee');
            }
        } else {
            // No user found, redirect to login
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
    );
}
