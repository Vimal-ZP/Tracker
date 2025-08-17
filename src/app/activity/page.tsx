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
    const [showFilters, setShowFilters] = useState(false);
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

    // Fetch data when user is authenticated and is Super Admin
    useEffect(() => {
        if (user && user.role === UserRole.SUPER_ADMIN) {
            fetchActivities(true);
            fetchStats();
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

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
                    <p className="text-gray-600 mb-4">Please log in to access the Activity Monitor.</p>
                    <a
                        href="/login"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-2">This page is only accessible to Super Administrators.</p>
                    <p className="text-sm text-gray-500 mb-4">Current role: {user.role}</p>
                    <a
                        href="/dashboard"
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        Go to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Compact Professional Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        {/* Left Section - Title */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <ActivityIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Activity Monitor</h1>
                                <p className="text-sm text-gray-600">System-wide user activity tracking & analytics</p>
                            </div>
                        </div>

                        {/* Right Section - Status and Action Button */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full border border-green-200">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-green-700">LIVE</span>
                            </div>
                            <button
                                onClick={refresh}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Compact Stats Cards */}
            {state.stats && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Total Activities</p>
                                <p className="text-lg font-bold text-gray-900">{state.stats.totalActivities.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Active Users</p>
                                <p className="text-lg font-bold text-gray-900">{state.stats.uniqueUsers}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Applications</p>
                                <p className="text-lg font-bold text-gray-900">{Object.keys(state.stats.activitiesByApplication || {}).length}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600">Last Activity</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {state.stats.recentActivities?.length > 0 
                                        ? formatRelativeTime(state.stats.recentActivities[0].timestamp)
                                        : 'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Professional Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Search Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Search & Filter Activities</h3>
                                <p className="text-sm text-gray-600">Find specific activities using advanced search and filters</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-blue-700">
                                    {state.pagination.totalCount.toLocaleString()} results
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Controls */}
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        {/* Enhanced Search Input */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Activities
                            </label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                                <input
                                    type="text"
                                    placeholder="Search by user name, action, resource, or activity details..."
                                    value={state.filters.search || ''}
                                    onChange={(e) => setState(prev => ({ ...prev, filters: { ...prev.filters, search: e.target.value } }))}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-gray-50 hover:bg-white font-medium shadow-sm hover:shadow-md"
                                />
                                {state.filters.search && (
                                    <button
                                        onClick={() => setState(prev => ({ ...prev, filters: { ...prev.filters, search: '' } }))}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Toggle Button */}
                        <div className="flex items-end">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-3 px-6 py-3.5 rounded-xl font-semibold border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                                    showFilters 
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-500 text-white shadow-blue-200' 
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <Filter className="w-5 h-5" />
                                <span>Advanced Filters</span>
                                {showFilters && (
                                    <span className="bg-white bg-opacity-20 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                        ON
                                    </span>
                                )}
                                {!showFilters && Object.values(state.filters).some(filter => filter !== 'all' && filter !== '7d' && filter !== '') && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                                        ACTIVE
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                                        <Filter className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">Advanced Filters</h4>
                                </div>
                                <button
                                    onClick={() => {
                                        setState(prev => ({
                                            ...prev,
                                            filters: {
                                                application: 'all',
                                                action: 'all',
                                                resource: 'all',
                                                dateRange: '7d',
                                                search: ''
                                            }
                                        }));
                                    }}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                >
                                    Clear All Filters
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Application Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2">
                                        <Package className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700">Application</span>
                                    </label>
                                    <select
                                        value={state.filters.application}
                                        onChange={(e) => handleFilterChange('application', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium shadow-sm hover:shadow-md"
                                    >
                                        <option value="all">All Applications</option>
                                        {AVAILABLE_APPLICATIONS.map(app => (
                                            <option key={app} value={app}>{app}</option>
                                        ))}
                                        <option value="System">System</option>
                                    </select>
                                </div>

                                {/* Action Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2">
                                        <Settings className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-semibold text-gray-700">Action</span>
                                    </label>
                                    <select
                                        value={state.filters.action}
                                        onChange={(e) => handleFilterChange('action', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium shadow-sm hover:shadow-md"
                                    >
                                        <option value="all">All Actions</option>
                                        <option value="login">🔐 Login</option>
                                        <option value="logout">🚪 Logout</option>
                                        <option value="user_created">👤 User Created</option>
                                        <option value="user_updated">✏️ User Updated</option>
                                        <option value="user_deleted">🗑️ User Deleted</option>
                                        <option value="prompt_created">📝 Prompt Created</option>
                                        <option value="prompt_used">🎯 Prompt Used</option>
                                        <option value="release_created">📦 Release Created</option>
                                        <option value="release_published">🚀 Release Published</option>
                                    </select>
                                </div>

                                {/* Resource Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm font-semibold text-gray-700">Resource</span>
                                    </label>
                                    <select
                                        value={state.filters.resource}
                                        onChange={(e) => handleFilterChange('resource', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium shadow-sm hover:shadow-md"
                                    >
                                        <option value="all">All Resources</option>
                                        <option value="auth">🔒 Authentication</option>
                                        <option value="user">👥 User</option>
                                        <option value="prompt">💬 Prompt</option>
                                        <option value="release">📋 Release</option>
                                        <option value="system">⚙️ System</option>
                                    </select>
                                </div>

                                {/* Date Range Filter */}
                                <div className="space-y-3">
                                    <label className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-semibold text-gray-700">Time Period</span>
                                    </label>
                                    <select
                                        value={state.filters.dateRange}
                                        onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium shadow-sm hover:shadow-md"
                                    >
                                        <option value="1d">📅 Last 24 Hours</option>
                                        <option value="7d">📊 Last 7 Days</option>
                                        <option value="30d">📈 Last 30 Days</option>
                                        <option value="90d">📉 Last 90 Days</option>
                                        <option value="all">🌐 All Time</option>
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {Object.values(state.filters).some(filter => filter !== 'all' && filter !== '7d' && filter !== '') && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-semibold text-blue-900">Active Filters:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {state.filters.application !== 'all' && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                        App: {state.filters.application}
                                                    </span>
                                                )}
                                                {state.filters.action !== 'all' && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                        Action: {state.filters.action.replace('_', ' ')}
                                                    </span>
                                                )}
                                                {state.filters.resource !== 'all' && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                                        Resource: {state.filters.resource}
                                                    </span>
                                                )}
                                                {state.filters.dateRange !== '7d' && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                                                        Period: {state.filters.dateRange === '1d' ? '24h' : state.filters.dateRange === '30d' ? '30d' : state.filters.dateRange === '90d' ? '90d' : 'All'}
                                                    </span>
                                                )}
                                                {state.filters.search && (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                                        Search: "{state.filters.search.substring(0, 20)}{state.filters.search.length > 20 ? '...' : ''}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setState(prev => ({
                                                    ...prev,
                                                    filters: {
                                                        application: 'all',
                                                        action: 'all',
                                                        resource: 'all',
                                                        dateRange: '7d',
                                                        search: ''
                                                    }
                                                }));
                                            }}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors duration-200"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Section */}
            {state.stats?.activitiesByApplication && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Application Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center">
                                <Package className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Activities by Application</h3>
                                <p className="text-xs text-gray-600">Distribution across platforms</p>
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-6 h-6 bg-emerald-100 rounded-md flex items-center justify-center">
                                <Users className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Most Active Users</h3>
                                <p className="text-xs text-gray-600">Top contributors this period</p>
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

            {/* Activities List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-slate-100 rounded-md flex items-center justify-center">
                                <ActivityIcon className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
                                <p className="text-xs text-gray-600">Real-time system activity feed</p>
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
                                <div key={activity._id} className="group relative p-4 hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0">
                                    <div className="grid grid-cols-12 gap-6 items-start">
                                        {/* Left Section - Icon & Activity Number */}
                                        <div className="col-span-1 flex flex-col items-center space-y-2">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActionColor(activity.action)}`}>
                                                {getActionIcon(activity.action)}
                                            </div>
                                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors duration-300">
                                                {index + 1}
                                            </div>
                                        </div>
                                        
                                        {/* Main Content Section */}
                                        <div className="col-span-7">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="font-bold text-gray-900 text-lg">{activity.userName}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                                    activity.userRole === 'super_admin' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                    activity.userRole === 'admin' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                    'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}>
                                                    {activity.userRole.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <p className="text-gray-800 mb-3 font-medium leading-relaxed">{activity.details}</p>
                                            
                                            <div className="flex items-center space-x-4 text-xs">
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
                                        </div>
                                        
                                        {/* Right Section - Metadata & Application */}
                                        <div className="col-span-4 space-y-3">
                                            {/* Application Badge */}
                                            {activity.application && (
                                                <div className="flex justify-end">
                                                    <span className="text-sm px-3 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg font-semibold border border-blue-200 shadow-sm">
                                                        📱 {activity.application}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {/* Time Information */}
                                            <div className="text-right space-y-1">
                                                <div className="text-sm font-medium text-gray-700">
                                                    {formatRelativeTime(activity.timestamp)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDate(activity.timestamp)}
                                                </div>
                                            </div>
                                            
                                            {/* Additional Metadata */}
                                            <div className="text-right space-y-2">
                                                {activity.ipAddress && (
                                                    <div className="text-xs text-gray-500">
                                                        <span className="font-medium">IP:</span> {activity.ipAddress}
                                                    </div>
                                                )}
                                                {activity.userAgent && (
                                                    <div className="text-xs text-gray-500 truncate" title={activity.userAgent}>
                                                        <span className="font-medium">Device:</span> {activity.userAgent.split(' ')[0]}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Activity Status Indicator */}
                                            <div className="flex justify-end">
                                                <div className="flex items-center space-x-2 text-xs">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-green-600 font-medium">LOGGED</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                {/* Load More */}
                {state.pagination.hasMore && (
                    <div className="p-4 border-t border-gray-200 text-center bg-gray-50">
                        <button
                            onClick={loadMore}
                            disabled={state.loading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 mx-auto"
                        >
                            {state.loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    <span>Load More</span>
                                </>
                            )}
                        </button>
                        <p className="text-xs text-gray-600 mt-2">
                            Showing {state.activities.length} of {state.pagination.totalCount.toLocaleString()} activities
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
