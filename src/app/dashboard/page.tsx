'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { UserRole, rolePermissions } from '@/types/user';
import { Release } from '@/types/release';
import DashboardStats from '@/components/dashboard/DashboardStats';
import {
    Calendar,
    Clock,
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

    // Function to get project color based on project name
    const getProjectColor = (projectName: string) => {
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

        // Create a simple hash from project name to ensure consistent colors
        let hash = 0;
        for (let i = 0; i < projectName.length; i++) {
            const char = projectName.charCodeAt(i);
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
            <div className="h-full flex flex-col space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-sm flex-shrink-0">
                    <div className="px-6 py-8 text-white">
                        <h1 className="text-3xl font-bold">
                            Welcome to Tracker Dashboard!
                        </h1>
                        <p className="mt-2 text-blue-100">
                            Demo mode - Please login to access full features.
                        </p>
                        <div className="mt-4">
                            <a
                                href="/login"
                                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                                Go to Login
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600 mt-2">--</p>
                        <p className="text-sm text-gray-500 mt-1">Login to view data</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">--</p>
                        <p className="text-sm text-gray-500 mt-1">Login to view data</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">System Status</h3>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">Demo</p>
                        <p className="text-sm text-gray-500 mt-1">Login for real status</p>
                    </div>
                </div>
            </div>
        );
    }

    const permissions = rolePermissions[user.role];

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

    const quickActions = [
        {
            title: 'Manage Releases',
            description: 'Create, edit, and manage software releases',
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
        <div className="h-full flex flex-col space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-sm flex-shrink-0">
                <div className="px-6 py-8 text-white">
                    <h1 className="text-3xl font-bold">
                        {getWelcomeMessage()}, {user.name}!
                    </h1>
                    <p className="mt-2 text-primary-100">
                        Welcome to your dashboard. You are logged in as {getRoleDisplayName(user.role)}.
                    </p>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-primary-100">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date().toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                {/* Recent Releases */}
                <div className="lg:col-span-1 flex flex-col">
                    <div className="card flex-1 flex flex-col">
                        <div className="card-header flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                                    Recent Releases
                                </h2>
                                <a
                                    href="/releases"
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    View All
                                </a>
                            </div>
                        </div>
                        <div className="card-body flex-1 overflow-y-auto">
                            {releasesLoading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-6 h-6"></div>
                                </div>
                            ) : releases.length > 0 ? (
                                <div className="space-y-4">
                                    {releases.map((release) => (
                                        <div key={release._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="text-sm font-medium text-gray-900 truncate">
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
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getProjectColor(release.projectName).bg} ${getProjectColor(release.projectName).text}`}>
                                                                <span className={`w-2 h-2 rounded-full ${getProjectColor(release.projectName).dot} mr-1`}></span>
                                                                {release.projectName}
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
                                                <a
                                                    href={`/releases/${release._id}`}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                    title="View release details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 flex-1 flex flex-col justify-center">
                                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No releases yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by creating your first release.
                                    </p>
                                    <div className="mt-4">
                                        <a
                                            href="/releases"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            <Package className="w-4 h-4 mr-2" />
                                            Create Release
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1 flex flex-col">
                    <div className="card flex-1 flex flex-col">
                        <div className="card-header flex-shrink-0">
                            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="card-body flex-1 overflow-y-auto">
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
            <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="flex flex-col">
                    <div className="card flex-1 flex flex-col">
                        <div className="card-header flex-shrink-0">
                            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                        </div>
                        <div className="card-body flex-1">
                            {quickActions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                                    {quickActions.map((action) => (
                                        <a
                                            key={action.title}
                                            href={action.href}
                                            className="group relative rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center"
                                        >
                                            <div className="flex items-center w-full">
                                                <div className={`flex-shrink-0 w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                                                    <action.icon className="w-5 h-5" />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                                                        {action.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {action.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 flex-1 flex flex-col justify-center">
                                    <Shield className="mx-auto h-10 w-10 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No actions available</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your current role doesn't have access to administrative actions.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User Statistics */}
                <div className="flex flex-col">
                    <DashboardStats />
                </div>
            </div>
        </div>
    );
}
