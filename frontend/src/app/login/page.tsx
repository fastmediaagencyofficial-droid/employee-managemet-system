'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store token in localStorage and cookies (for middleware)
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                document.cookie = `token=${data.data.accessToken}; path=/; max-age=86400; SameSite=Lax`;

                // Redirect to dashboard
                router.push('/dashboard');
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to server. Please make sure the backend is running on port 5000.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-blue to-secondary-blue p-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-primary-navy">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                                placeholder="admin@company.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            <div className="mt-2 text-right">
                                <Link
                                    href="/forgot-password"
                                    className="font-semibold text-primary-gold hover:text-primary-gold/80"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-primary-blue px-4 py-3 font-semibold text-white transition hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
}
