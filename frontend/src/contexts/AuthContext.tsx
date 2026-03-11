'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setupLogoutSync, setupSessionTimeout } from '@/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if user is authenticated on mount
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }

        // Setup multi-tab logout sync
        setupLogoutSync();

        // Setup session timeout
        const cleanupTimeout = setupSessionTimeout();

        // Cleanup on unmount
        return () => {
            cleanupTimeout();
        };
    }, []);

    const logout = async () => {
        try {
            // Call logout API
            const token = localStorage.getItem('accessToken');
            if (token) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL 
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
                    : 'http://localhost:5000/api';
                await fetch(`${apiUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            // Update state
            setIsAuthenticated(false);
            setUser(null);

            // Redirect to login
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
