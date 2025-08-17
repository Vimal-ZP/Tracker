'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validatingToken, setValidatingToken] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        if (!token) {
            setError('Invalid reset link. Please request a new password reset.');
            setValidatingToken(false);
            return;
        }

        try {
            const response = await fetch(`/api/auth/reset-password?token=${token}`);
            const data = await response.json();

            if (response.ok) {
                setTokenValid(true);
                setUserEmail(data.email);
            } else {
                setError(data.error || 'Invalid or expired reset link');
                setTokenValid(false);
            }
        } catch (error) {
            console.error('Token validation error:', error);
            setError('Network error. Please check your connection and try again.');
            setTokenValid(false);
        } finally {
            setValidatingToken(false);
        }
    };

    const validatePassword = (password: string) => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || 'An unexpected error occurred');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Loading state while validating token
    if (validatingToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-gray-600">Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6 text-center">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Password Reset!</h1>
                            <p className="text-green-100 mt-2">Your password has been updated successfully</p>
                        </div>

                        <div className="p-8 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">All Set!</h2>
                            <p className="text-gray-600 mb-6">
                                Your password has been reset successfully. You can now log in with your new password.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Redirecting to login page in a few seconds...
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                            >
                                Go to Login
                                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-center">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Invalid Link</h1>
                            <p className="text-red-100 mt-2">This reset link is invalid or expired</p>
                        </div>

                        <div className="p-8 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Link Expired</h2>
                            <p className="text-gray-600 mb-6">
                                {error}
                            </p>
                            <div className="space-y-3">
                                <Link
                                    href="/forgot-password"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                                >
                                    Request New Reset Link
                                </Link>
                                <Link
                                    href="/login"
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
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

    // Reset password form
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6 text-center">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                        <p className="text-blue-100 mt-2">Create a new secure password</p>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {userEmail && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    Resetting password for: <strong>{userEmail}</strong>
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* New Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Enter new password"
                                        required
                                        disabled={loading}
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                                        placeholder="Confirm new password"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
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
                                disabled={loading || !formData.password || !formData.confirmPassword}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Resetting Password...</span>
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="text-center">
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
