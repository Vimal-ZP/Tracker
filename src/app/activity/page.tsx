'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, AVAILABLE_APPLICATIONS } from '@/types/user';
import { Activity, ActivityAction, ActivityResource, ActivityStats } from '@/types/activity';
import { 
    Activity as ActivityIcon, 
    Users, 
    Calendar, 
    Filter, 
    Download, 
    Eye,
    User,
    FileText,
    Package,
    Settings,
    Shield,
    BarChart3,
    Clock,
    Search,
    ChevronDown,
    RefreshCw
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ActivityPageState {
    activities: Activity[];
    stats: ActivityStats | null;
    loading: boolean;
    error: string | null;
    filters: {
        application: string;
        action: string;
        resource: string;
        dateRange: string;
        search: string;
    };
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        hasMore: boolean;
    };
}

const getActionIcon = (action: string) => {
    switch (action) {
        case 'login':
        case 'logout':
            return <Shield className="w-4 h-4" />;
        case 'user_created':
        case 'user_updated':
        case 'user_deleted':
            return <Users className="w-4 h-4" />;
        case 'prompt_created':
        case 'prompt_updated':
        case 'prompt_used':
            return <FileText className="w-4 h-4" />;
        case 'release_created':
        case 'release_updated':
        case 'release_published':
            return <Package className="w-4 h-4" />;
        case 'settings_updated':
        case 'report_generated':
            return <Settings className="w-4 h-4" />;
        default:
            return <ActivityIcon className="w-4 h-4" />;
    }
};

const getActionColor = (action: string) => {
    switch (action) {
        case 'login':
            return 'text-green-600 bg-green-100';
        case 'logout':
            return 'text-gray-600 bg-gray-100';
        case 'login_failed':
            return 'text-red-600 bg-red-100';
        case 'user_created':
        case 'prompt_created':
        case 'release_created':
            return 'text-blue-600 bg-blue-100';
        case 'user_updated':
        case 'prompt_updated':
        case 'release_updated':
            return 'text-yellow-600 bg-yellow-100';
        case 'user_deleted':
        case 'prompt_deleted':
        case 'release_deleted':
            return 'text-red-600 bg-red-100';
        case 'release_published':
            return 'text-green-600 bg-green-100';
        case 'prompt_used':
            return 'text-purple-600 bg-purple-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
};

const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export default function ActivityPage() {
    const { user } = useAuth();
    const [state, setState] = useState<ActivityPageState>({
        activities: [],
        stats: null,
        loading: true,
        error: null,
        filters: {
            application: 'all',
            action: 'all',
            resource: 'all',
            dateRange: '7d',
            search: ''
        },
        pagination: {
            page: 1,
            limit: 50,
            totalCount: 0,
            hasMore: false
        }
    });

    // Redirect if not Super Admin
    useEffect(() => {
        if (user && user.role !== UserRole.SUPER_ADMIN) {
            window.location.href = '/dashboard';
        }
    }, [user]);

    const fetchActivities = async (resetPagination = true) => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const params = new URLSearchParams();
            
            if (state.filters.application !== 'all') {
                params.append('application', state.filters.application);
            }
            if (state.filters.action !== 'all') {
                params.append('action', state.filters.action);
            }
            if (state.filters.resource !== 'all') {
                params.append('resource', state.filters.resource);
            }
            
            // Date range
            if (state.filters.dateRange !== 'all') {
                const now = new Date();
                let startDate: Date;
                
                switch (state.filters.dateRange) {
                    case '1d':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case '90d':
                        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                }
                
                params.append('startDate', startDate.toISOString());
                params.append('endDate', now.toISOString());
            }

            const page = resetPagination ? 1 : state.pagination.page;
            const skip = (page - 1) * state.pagination.limit;
            
            params.append('limit', state.pagination.limit.toString());
            params.append('skip', skip.toString());

            const response = await fetch(`/api/activities?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();
            
            setState(prev => ({
                ...prev,
                activities: resetPagination ? data.activities : [...prev.activities, ...data.activities],
                pagination: {
                    ...prev.pagination,
                    page,
                    totalCount: data.totalCount,
                    hasMore: data.hasMore
                },
                loading: false
            }));

        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to fetch activities',
                loading: false
            }));
        }
    };

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams();
            
            if (state.filters.application !== 'all') {
                params.append('application', state.filters.application);
            }
            
            // Date range for stats
            if (state.filters.dateRange !== 'all') {
                const now = new Date();
                let startDate: Date;
                
                switch (state.filters.dateRange) {
                    case '1d':
                        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case '7d':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case '90d':
                        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                }
                
                params.append('startDate', startDate.toISOString());
                params.append('endDate', now.toISOString());
            }

            const response = await fetch(`/api/activities/stats?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch activity stats');
            }

            const stats = await response.json();
            setState(prev => ({ ...prev, stats }));

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        if (user?.role === UserRole.SUPER_ADMIN) {
            fetchActivities(true);
            fetchStats();
        }
    }, [user, state.filters]);

    const handleFilterChange = (key: string, value: string) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
            pagination: { ...prev.pagination, page: 1 }
        }));
    };

    const loadMore = () => {
        setState(prev => ({
            ...prev,
            pagination: { ...prev.pagination, page: prev.pagination.page + 1 }
        }));
        fetchActivities(false);
    };

    const refresh = () => {
        fetchActivities(true);
        fetchStats();
    };

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">This page is only accessible to Super Administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                                <ActivityIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Activity Monitor</h1>
                                <p className="text-sm text-gray-500">System-wide user activity tracking</p>
                            </div>
                        </div>
                        <button
                            onClick={refresh}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                {state.stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Activities</p>
                                    <p className="text-2xl font-bold text-gray-900">{state.stats.totalActivities.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <BarChart3 className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-gray-900">{state.stats.uniqueUsers}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Applications</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {Object.keys(state.stats.activitiesByApplication || {}).length}
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Package className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Last Activity</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {state.stats.recentActivities?.length > 0 
                                            ? formatRelativeTime(state.stats.recentActivities[0].timestamp)
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center space-x-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Application Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Application</label>
                            <select
                                value={state.filters.application}
                                onChange={(e) => handleFilterChange('application', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Applications</option>
                                {AVAILABLE_APPLICATIONS.map(app => (
                                    <option key={app} value={app}>{app}</option>
                                ))}
                                <option value="System">System</option>
                            </select>
                        </div>

                        {/* Action Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                            <select
                                value={state.filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Actions</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                                <option value="user_created">User Created</option>
                                <option value="user_updated">User Updated</option>
                                <option value="user_deleted">User Deleted</option>
                                <option value="prompt_created">Prompt Created</option>
                                <option value="prompt_used">Prompt Used</option>
                                <option value="release_created">Release Created</option>
                                <option value="release_published">Release Published</option>
                            </select>
                        </div>

                        {/* Resource Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
                            <select
                                value={state.filters.resource}
                                onChange={(e) => handleFilterChange('resource', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Resources</option>
                                <option value="auth">Authentication</option>
                                <option value="user">User</option>
                                <option value="prompt">Prompt</option>
                                <option value="release">Release</option>
                                <option value="system">System</option>
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                            <select
                                value={state.filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="1d">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search activities..."
                                    value={state.filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activities by Application */}
                {state.stats?.activitiesByApplication && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Application Breakdown */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Activities by Application</h3>
                            <div className="space-y-3">
                                {state.stats.activitiesByApplication.map((app: any) => (
                                    <div key={app.application} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="font-medium text-gray-900">{app.application}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900">{app.count.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">{app.uniqueUsers} users</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Users */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Users</h3>
                            <div className="space-y-3">
                                {state.stats.topUsers?.slice(0, 10).map((user: any, index: number) => (
                                    <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.userName}</div>
                                                <div className="text-xs text-gray-500">{user.userRole}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900">{user.activityCount}</div>
                                            <div className="text-xs text-gray-500">activities</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Activities List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                            <div className="text-sm text-gray-500">
                                {state.pagination.totalCount.toLocaleString()} total activities
                            </div>
                        </div>
                    </div>

                    {state.loading && state.activities.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : state.error ? (
                        <div className="text-center py-12">
                            <div className="text-red-600 mb-2">{state.error}</div>
                            <button
                                onClick={refresh}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Try again
                            </button>
                        </div>
                    ) : state.activities.length === 0 ? (
                        <div className="text-center py-12">
                            <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No activities found for the selected filters.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {state.activities.map((activity) => (
                                <div key={activity._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-2 rounded-lg ${getActionColor(activity.action)}`}>
                                            {getActionIcon(activity.action)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-gray-900">{activity.userName}</span>
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                        {activity.userRole}
                                                    </span>
                                                    {activity.application && (
                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                                                            {activity.application}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatRelativeTime(activity.timestamp)}
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-700 mb-2">{activity.details}</p>
                                            
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span>Action: {activity.action.replace('_', ' ')}</span>
                                                <span>Resource: {activity.resource}</span>
                                                <span>{formatDate(activity.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Load More */}
                    {state.pagination.hasMore && (
                        <div className="p-6 border-t border-gray-200 text-center">
                            <button
                                onClick={loadMore}
                                disabled={state.loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {state.loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
