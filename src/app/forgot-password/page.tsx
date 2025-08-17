'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
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
                setError(data.error || 'An unexpected error occurred');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 text-center">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Email Sent!</h1>
                            <p className="text-green-100 mt-2">Check your inbox for reset instructions</p>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">Reset Link Sent</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    We've sent password reset instructions to <strong>{email}</strong>
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-medium text-blue-900 mb-2">What's next?</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Check your email inbox (and spam folder)</li>
                                    <li>• Click the reset link in the email</li>
                                    <li>• Create a new secure password</li>
                                    <li>• The link expires in 1 hour for security</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setSubmitted(false);
                                        setEmail('');
                                        setError('');
                                    }}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Send Another Email
                                </button>

                                <Link
                                    href="/login"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6 text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
                        <p className="text-blue-100 mt-2">No worries, we'll help you reset it</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter your email address"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <p className="text-sm text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Sending Reset Link...</span>
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-3">
                                    Remember your password?
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
