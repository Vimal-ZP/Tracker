'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import { UserRole, rolePermissions } from '@/types/user';
import { Release } from '@/types/release';
import DashboardStats from '@/components/dashboard/DashboardStats';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import {
    Calendar,
    Users,
    Settings,
    BarChart3,
    Shield,
    CheckCircle,
    AlertCircle,
    Package,
    Tag,
    TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const [releases, setReleases] = useState<Release[]>([]);
    const [releasesLoading, setReleasesLoading] = useState(true);

    // Fetch recent releases
    useEffect(() => {
        if (user) {
            fetchRecentReleases();
        }
    }, [user]);

    const fetchRecentReleases = async () => {
        try {
            setReleasesLoading(true);
            const response = await fetch('/api/releases?limit=5&page=1');
            if (response.ok) {
                const data = await response.json();
                setReleases(data.releases || []);
            }
        } catch (error) {
            console.error('Failed to fetch releases:', error);
        } finally {
            setReleasesLoading(false);
        }
    };

    // Function to get application color based on application name
    const getApplicationColor = (applicationName: string) => {
        const colors = [
            { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
            { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
            { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
            { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
            { bg: 'bg-pink-100', text: 'text-pink-800', dot: 'bg-pink-500' },
            { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
            { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
            { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
        ];

        // Create a simple hash from application name to ensure consistent colors
        let hash = 0;
        for (let i = 0; i < applicationName.length; i++) {
            const char = applicationName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        const colorIndex = Math.abs(hash) % colors.length;
        return colors[colorIndex];
    };

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 w-8 h-8"></div>
            </div>
        );
    }

    // Show demo dashboard if no user (for testing purposes)
    if (!user) {
        return (
            <div className="h-full flex flex-col space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                    <div className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <BarChart3 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Welcome to Tracker Dashboard!
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Demo mode - Please login to access full features.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Total Users</p>
                                <p className="text-lg font-semibold text-gray-900">--</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Login to view data</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Active Sessions</p>
                                <p className="text-lg font-semibold text-gray-900">--</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Login to view data</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-md flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">System Status</p>
                                <p className="text-lg font-semibold text-gray-900">Demo</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Login for real status</p>
                    </div>
                </div>
            </div>
        );
    }

    const permissions = rolePermissions[user.role];



    const quickActions = [
        {
            title: 'Manage Releases',
            description: 'Create, edit, and manage application releases',
            icon: Package,
            href: '/releases',
            color: 'bg-blue-500',
            show: true, // All users can view releases
        },
        {
            title: 'Manage Users',
            description: 'Add, edit, or remove users from the system',
            icon: Users,
            href: '/users',
            color: 'bg-green-500',
            show: permissions.canViewAllUsers,
        },
        {
            title: 'View Reports',
            description: 'Access system reports and analytics',
            icon: BarChart3,
            href: '/reports',
            color: 'bg-orange-500',
            show: permissions.canViewReports,
        },
        {
            title: 'System Settings',
            description: 'Configure system settings and preferences',
            icon: Settings,
            href: '/settings',
            color: 'bg-purple-500',
            show: permissions.canManageSettings,
        },
    ].filter(action => action.show);

    const recentActivities = [
        {
            id: 1,
            type: 'user_created',
            message: 'New user account created',
            time: '2 hours ago',
            icon: Users,
            color: 'text-green-600',
        },
        {
            id: 2,
            type: 'login',
            message: 'User logged in successfully',
            time: '4 hours ago',
            icon: CheckCircle,
            color: 'text-blue-600',
        },
        {
            id: 3,
            type: 'security',
            message: 'Security settings updated',
            time: '1 day ago',
            icon: Shield,
            color: 'text-purple-600',
        },
        {
            id: 4,
            type: 'alert',
            message: 'System maintenance scheduled',
            time: '2 days ago',
            icon: AlertCircle,
            color: 'text-yellow-600',
        },
    ];

    return (
        <div className="h-full flex flex-col space-y-4" data-testid="dashboard">
            {/* Professional Welcome Banner */}
            <WelcomeBanner />

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Releases */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                                        <Package className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Recent Releases
                                </h2>
                                <Link
                                    href="/releases"
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    View All
                                </Link>
                            </div>
                        </div>
                        <div className="p-4 h-80 overflow-y-auto">
                            {releasesLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-6 h-6"></div>
                                </div>
                            ) : releases.length > 0 ? (
                                <div className="space-y-3">
                                    {releases.map((release) => (
                                        <div key={release._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-200">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                            {release.title}
                                                        </h3>
                                                        {release.version && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                <Tag className="w-3 h-3 mr-1" />
                                                                v{release.version}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {new Date(release.releaseDate).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getApplicationColor(release.applicationName).bg} ${getApplicationColor(release.applicationName).text}`}>
                                                                <span className={`w-2 h-2 rounded-full ${getApplicationColor(release.applicationName).dot} mr-1`}></span>
                                                                {release.applicationName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {release.workItems && release.workItems.length > 0 && (
                                                        <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                                                            <span className="flex items-center">
                                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                                {release.workItems.length} work items
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Link
                                                    href={`/releases/${release._id}`}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                    title="View release details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 flex-1 flex flex-col justify-center">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No releases yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating your first release.
                                    </p>
                                    <div className="mt-4">
                                        <Link
                                            href="/releases"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
                                        >
                                            <Package className="w-4 h-4 mr-2" />
                                            Create Release
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-3">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                Recent Activity
                            </h2>
                        </div>
                        <div className="p-4 h-80 overflow-y-auto">
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {recentActivities.map((activity, activityIdx) => (
                                        <li key={activity.id}>
                                            <div className="relative pb-8">
                                                {activityIdx !== recentActivities.length - 1 ? (
                                                    <span
                                                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                        aria-hidden="true"
                                                    />
                                                ) : null}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100`}>
                                                            <activity.icon className={`h-4 w-4 ${activity.color}`} />
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-900">
                                                                {activity.message}
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                            {activity.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Quick Actions */}
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-3">
                                    <Settings className="w-4 h-4 text-purple-600" />
                                </div>
                                Quick Actions
                            </h2>
                        </div>
                        <div className="p-4">
                            {quickActions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {quickActions.map((action) => (
                                        <Link
                                            key={action.title}
                                            href={action.href}
                                            className="group relative rounded-lg p-3 bg-gray-50 hover:bg-white hover:shadow-sm border border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center"
                                        >
                                            <div className="flex items-center w-full">
                                                <div className={`flex-shrink-0 w-8 h-8 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                                                    <action.icon className="w-4 h-4" />
                                                </div>
                                                <div className="ml-3 flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                        {action.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Shield className="mx-auto h-10 w-10 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No actions available</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your current role doesn't have access to administrative actions.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Statistics */}
                <div>
                    <DashboardStats />
                </div>
            </div>
        </div>
    );
}
