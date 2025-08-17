'use client';

import React from 'react';
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
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="relative p-6">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-blue-300/20 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Rocket className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {getWelcomeMessage()}, {user.name}! 
                                    <Sparkles className="inline w-6 h-6 text-yellow-500 ml-2" />
                                </h1>
                                <p className="text-gray-600 flex items-center">
                                    Welcome to your 
                                    <span className="mx-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {getRoleDisplayName(user.role)}
                                    </span>
                                    dashboard
                                </p>
                            </div>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-700">System Online</span>
                        </div>
                    </div>

                    {/* Application Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* About Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">About Tracker</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    <strong>Tracker</strong> is a comprehensive project management and release tracking platform designed to streamline your development workflow. 
                                    Our powerful suite of tools helps teams collaborate effectively, manage software releases, and maintain visibility across all project phases.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Release Management
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Team Collaboration
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Analytics & Reports
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        User Management
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Your Access Level */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50 h-full">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h2 className="text-lg font-semibold text-gray-900">Your Access</h2>
                                </div>
                                <div className="space-y-3">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                                                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                                            </div>
                                            <span className="text-sm text-gray-700 font-medium">{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Quick Start Button */}
                                <div className="mt-5 pt-4 border-t border-gray-200">
                                    <a
                                        href="/releases"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center group"
                                    >
                                        Get Started
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/50 text-center">
                            <div className="text-2xl font-bold text-blue-600">5+</div>
                            <div className="text-sm text-gray-600 font-medium">Applications</div>
                        </div>
                        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/50 text-center">
                            <div className="text-2xl font-bold text-green-600">24/7</div>
                            <div className="text-sm text-gray-600 font-medium">Monitoring</div>
                        </div>
                        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/50 text-center">
                            <div className="text-2xl font-bold text-purple-600">Real-time</div>
                            <div className="text-sm text-gray-600 font-medium">Updates</div>
                        </div>
                        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-4 border border-white/50 text-center">
                            <div className="text-2xl font-bold text-orange-600">Secure</div>
                            <div className="text-sm text-gray-600 font-medium">Platform</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
