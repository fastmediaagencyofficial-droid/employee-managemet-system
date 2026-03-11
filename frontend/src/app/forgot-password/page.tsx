'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL 
                ? `${process.env.NEXT_PUBLIC_API_URL}/api`
                : 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Failed to send reset email');
            }
        } catch (err) {
            setError('Unable to connect to server. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-blue to-secondary-blue p-4">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl bg-white p-8 shadow-2xl">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <svg
                                    className="h-8 w-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h1 className="mb-2 text-2xl font-bold text-primary-navy">
                                Check Your Email
                            </h1>
                            <p className="text-gray-600">
                                We&apos;ve sent password reset instructions to{' '}
                                <span className="font-semibold">{email}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-center text-sm text-gray-600">
                                Didn&apos;t receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-primary-blue hover:underline"
                                >
                                    try again
                                </button>
                            </p>

                            <a
                                href="/login"
                                className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Back to Login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-blue to-secondary-blue p-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-primary-navy">
                            Forgot Password?
                        </h1>
                        <p className="text-gray-600">
                            Enter your email and we&apos;ll send you instructions to reset your password
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-primary-blue px-4 py-3 font-semibold text-white transition hover:bg-primary-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <a
                            href="/login"
                            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </a>
                    </form>
                </div>
            </div>
        </div>
    );
}
