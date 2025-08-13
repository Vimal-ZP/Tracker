'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import { LoginCredentials } from '@/types/user';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Shield, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<LoginCredentials>>({});

    // Redirect if already logged in
    React.useEffect(() => {
        console.log('Login page - user state changed:', user);
        if (user) {
            console.log('User is logged in, redirecting to dashboard');
            router.push('/dashboard');
        }
    }, [user, router]);

    const validateForm = () => {
        const newErrors: Partial<LoginCredentials> = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            console.log('Attempting login...');
            await login(formData);
            console.log('Login successful, redirecting to dashboard');
            router.push('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            // Error is handled by the AuthContext
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof LoginCredentials]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center">
                        <Shield className="h-12 w-12 text-primary-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                            create a new account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className={`input pl-10 ${errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex justify-center py-3"
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" className="text-white" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
