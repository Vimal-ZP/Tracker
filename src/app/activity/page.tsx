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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Enhanced Header */}
            <div className="bg-white shadow-lg border-b border-gray-200/60 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl blur opacity-75"></div>
                                <div className="relative p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                                    <ActivityIcon className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Activity Monitor
                                </h1>
                                <p className="text-sm text-gray-600 font-medium">
                                    System-wide user activity tracking & analytics
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-green-700">Live Monitoring</span>
                            </div>
                            <button
                                onClick={refresh}
                                className="group relative flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                <span className="font-medium">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Enhanced Stats Cards */}
                {state.stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Activities</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{state.stats.totalActivities.toLocaleString()}</p>
                                    <div className="flex items-center mt-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                        <p className="text-xs text-gray-500">All time</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-75"></div>
                                    <div className="relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                        <BarChart3 className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Users</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{state.stats.uniqueUsers}</p>
                                    <div className="flex items-center mt-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <p className="text-xs text-gray-500">Unique users</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur opacity-75"></div>
                                    <div className="relative p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                        <Users className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Applications</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {Object.keys(state.stats.activitiesByApplication || {}).length}
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                        <p className="text-xs text-gray-500">Active apps</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl blur opacity-75"></div>
                                    <div className="relative p-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                                        <Package className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-white rounded-2xl shadow-lg border border-gray-200/60 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Last Activity</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {state.stats.recentActivities?.length > 0 
                                            ? formatRelativeTime(state.stats.recentActivities[0].timestamp)
                                            : 'N/A'
                                        }
                                    </p>
                                    <div className="flex items-center mt-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                                        <p className="text-xs text-gray-500">Most recent</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl blur opacity-75"></div>
                                    <div className="relative p-4 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl shadow-lg">
                                        <Clock className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-8 mb-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg shadow-lg">
                                <Filter className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Advanced Filters</h3>
                                <p className="text-sm text-gray-600">Customize your activity view</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-700">
                                {state.pagination.totalCount.toLocaleString()} results
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Application Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Application</label>
                            <select
                                value={state.filters.application}
                                onChange={(e) => handleFilterChange('application', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium"
                            >
                                <option value="all">All Applications</option>
                                {AVAILABLE_APPLICATIONS.map(app => (
                                    <option key={app} value={app}>{app}</option>
                                ))}
                                <option value="System">System</option>
                            </select>
                        </div>

                        {/* Action Filter */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Action</label>
                            <select
                                value={state.filters.action}
                                onChange={(e) => handleFilterChange('action', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium"
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
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Resource</label>
                            <select
                                value={state.filters.resource}
                                onChange={(e) => handleFilterChange('resource', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium"
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
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Time Period</label>
                            <select
                                value={state.filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium"
                            >
                                <option value="1d">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>

                        {/* Search */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Search</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search activities..."
                                    value={state.filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium placeholder-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Analytics Section */}
                {state.stats?.activitiesByApplication && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Application Breakdown */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-8 backdrop-blur-sm">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Activities by Application</h3>
                                    <p className="text-sm text-gray-600">Distribution across platforms</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Array.isArray(state.stats.activitiesByApplication) && state.stats.activitiesByApplication.map((app: any, index: number) => {
                                    const colors = [
                                        'from-blue-500 to-cyan-500',
                                        'from-purple-500 to-pink-500', 
                                        'from-green-500 to-emerald-500',
                                        'from-orange-500 to-red-500',
                                        'from-indigo-500 to-purple-500',
                                        'from-teal-500 to-blue-500'
                                    ];
                                    const colorClass = colors[index % colors.length];
                                    
                                    return (
                                        <div key={app.application} className="group relative p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-4 h-4 bg-gradient-to-r ${colorClass} rounded-full shadow-lg`}></div>
                                                    <div>
                                                        <span className="font-bold text-gray-900 text-lg">{app.application}</span>
                                                        <div className="flex items-center space-x-3 mt-1">
                                                            <span className="text-xs text-gray-500 font-medium">{app.uniqueUsers} users</span>
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-gray-500 font-medium">
                                                                {app.lastActivity ? formatRelativeTime(app.lastActivity) : 'No recent activity'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900">{app.count.toLocaleString()}</div>
                                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Activities</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) || <div className="text-center text-gray-500 py-4">No application data available</div>}
                            </div>
                        </div>

                        {/* Top Users */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 p-8 backdrop-blur-sm">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Most Active Users</h3>
                                    <p className="text-sm text-gray-600">Top contributors this period</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {state.stats.topUsers?.slice(0, 10).map((user: any, index: number) => (
                                    <div key={user._id} className="group relative p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                        #{index + 1}
                                                    </div>
                                                    {index < 3 && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                                            <span className="text-xs">🏆</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{user.userName}</div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                            user.userRole === 'super_admin' ? 'bg-red-100 text-red-700' :
                                                            user.userRole === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {user.userRole.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">{user.activityCount}</div>
                                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Activities</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Activities List */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/60 backdrop-blur-sm">
                    <div className="p-8 border-b border-gray-200/60">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg shadow-lg">
                                    <ActivityIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
                                    <p className="text-sm text-gray-600">Real-time system activity feed</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-slate-700">
                                        {state.pagination.totalCount.toLocaleString()} total
                                    </span>
                                </div>
                                {state.loading && (
                                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-medium text-blue-700">Loading...</span>
                                    </div>
                                )}
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
                        <div className="divide-y divide-gray-100">
                            {state.activities.map((activity, index) => (
                                <div key={activity._id} className="group relative p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-300">
                                    <div className="flex items-start space-x-4">
                                        <div className="relative">
                                            <div className={`p-3 rounded-xl shadow-lg ${getActionColor(activity.action)} group-hover:scale-110 transition-transform duration-300`}>
                                                {getActionIcon(activity.action)}
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-gray-200 rounded-full"></div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <span className="font-bold text-gray-900 text-lg">{activity.userName}</span>
                                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                                        activity.userRole === 'super_admin' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        activity.userRole === 'admin' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                        'bg-gray-100 text-gray-700 border border-gray-200'
                                                    }`}>
                                                        {activity.userRole.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                    {activity.application && (
                                                        <span className="text-xs px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full font-semibold border border-blue-200">
                                                            {activity.application}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="text-sm font-medium text-gray-600">
                                                        {formatRelativeTime(activity.timestamp)}
                                                    </div>
                                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-800 mb-3 font-medium leading-relaxed">{activity.details}</p>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-6 text-xs">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="font-semibold text-gray-600 uppercase tracking-wide">
                                                            {activity.action.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                        <span className="font-semibold text-gray-600 uppercase tracking-wide">
                                                            {activity.resource}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    {formatDate(activity.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Activity number indicator */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {index + 1}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Enhanced Load More */}
                    {state.pagination.hasMore && (
                        <div className="p-8 border-t border-gray-200/60 text-center bg-gradient-to-r from-gray-50 to-blue-50/30">
                            <button
                                onClick={loadMore}
                                disabled={state.loading}
                                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5 font-semibold"
                            >
                                <div className="flex items-center space-x-3">
                                    {state.loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading more activities...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-300" />
                                            <span>Load More Activities</span>
                                        </>
                                    )}
                                </div>
                            </button>
                            <p className="text-sm text-gray-600 mt-3 font-medium">
                                Showing {state.activities.length} of {state.pagination.totalCount.toLocaleString()} activities
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
