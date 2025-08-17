'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import { UserRole } from '@/types/user';
import {
    Rocket,
    Shield,
    Users,
    BarChart3,
    Package,
    Settings,
    CheckCircle,
    ArrowRight,
    Sparkles,
    Target,
    Zap
} from 'lucide-react';

export default function WelcomeBanner() {
    const { user } = useAuth();

    if (!user) return null;

    const getRoleDisplayName = (role: UserRole) => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return 'Super Administrator';
            case UserRole.ADMIN:
                return 'Administrator';
            case UserRole.BASIC:
                return 'Basic User';
            default:
                return role;
        }
    };

    const getWelcomeMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const getRoleFeatures = () => {
        switch (user.role) {
            case UserRole.SUPER_ADMIN:
                return [
                    { icon: Shield, text: 'Full system administration', color: 'text-red-600' },
                    { icon: Users, text: 'User management & permissions', color: 'text-blue-600' },
                    { icon: BarChart3, text: 'Advanced analytics & reports', color: 'text-green-600' },
                    { icon: Settings, text: 'System configuration', color: 'text-purple-600' }
                ];
            case UserRole.ADMIN:
                return [
                    { icon: Package, text: 'Release management', color: 'text-blue-600' },
                    { icon: Users, text: 'Team collaboration', color: 'text-green-600' },
                    { icon: BarChart3, text: 'Project analytics', color: 'text-orange-600' }
                ];
            case UserRole.BASIC:
                return [
                    { icon: Package, text: 'View releases & updates', color: 'text-blue-600' },
                    { icon: CheckCircle, text: 'Track project progress', color: 'text-green-600' },
                    { icon: Target, text: 'Access assigned tasks', color: 'text-purple-600' }
                ];
            default:
                return [];
        }
    };

    const features = getRoleFeatures();

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
            <div className="p-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                {getWelcomeMessage()}, {user.name}!
                                <Sparkles className="w-5 h-5 text-yellow-500 ml-2" />
                            </h1>
                            <p className="text-gray-600 text-sm flex items-center flex-wrap">
                                Welcome to your
                                <span className="mx-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {getRoleDisplayName(user.role)}
                                </span>
                                dashboard
                            </p>
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-green-700">System Online</span>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* About Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900">About Tracker</h2>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                <strong>Tracker</strong> is a comprehensive project management platform designed to streamline your development workflow and manage application releases effectively.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Release Management
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Team Collaboration
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Analytics
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    User Management
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Your Access Level */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 h-full">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-green-600" />
                                </div>
                                <h2 className="text-sm font-semibold text-gray-900">Your Access</h2>
                            </div>
                            <div className="space-y-2">
                                {features.slice(0, 3).map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                            <feature.icon className={`w-3 h-3 ${feature.color}`} />
                                        </div>
                                        <span className="text-xs text-gray-700 font-medium truncate">{feature.text}</span>
                                    </div>
                                ))}
                                {features.length > 3 && (
                                    <div className="text-xs text-gray-500 mt-2">
                                        +{features.length - 3} more capabilities
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Start */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 h-full flex flex-col justify-center">
                            <div className="text-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Ready to Start?</h3>
                                <Link
                                    href="/releases"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center group"
                                >
                                    Get Started
                                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-lg font-bold text-blue-600">5+</div>
                        <div className="text-xs text-gray-600 font-medium">Applications</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-lg font-bold text-green-600">24/7</div>
                        <div className="text-xs text-gray-600 font-medium">Monitoring</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-lg font-bold text-purple-600">Live</div>
                        <div className="text-xs text-gray-600 font-medium">Updates</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                        <div className="text-lg font-bold text-orange-600">Secure</div>
                        <div className="text-xs text-gray-600 font-medium">Platform</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
