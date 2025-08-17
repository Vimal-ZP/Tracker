'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
    Search, 
    Package, 
    Sparkles, 
    BookOpen, 
    AlertCircle, 
    AlertTriangle,
    ExternalLink,
    Building,
    Filter,
    X
} from 'lucide-react';
import { WorkItemType } from '@/types/release';
import Link from 'next/link';

interface SearchResult {
    workItem: {
        _id: string;
        id?: string;
        type: WorkItemType;
        title: string;
        flagName?: string;
        remarks?: string;
        hyperlink?: string;
        parentId?: string;
        actualHours?: number;
    };
    release: {
        _id: string;
        title: string;
        applicationName: string;
        version?: string;
        isPublished: boolean;
        createdAt: string;
    };
    matchType: 'id' | 'title';
    matchText: string;
}

interface SearchResponse {
    results: SearchResult[];
    totalCount: number;
    query: string;
    hasMore: boolean;
    message?: string;
}

export default function SearchPage() {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [message, setMessage] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Perform search
    const performSearch = async (searchQuery: string, type?: string) => {
        if (searchQuery.trim().length < 2) {
            setResults([]);
            setTotalCount(0);
            setHasMore(false);
            setMessage('Enter at least 2 characters to search');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const params = new URLSearchParams({
                q: searchQuery.trim(),
                limit: '50'
            });
            
            if (type) {
                params.append('type', type);
            }

            const response = await fetch(`/api/search?${params}`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data: SearchResponse = await response.json();
            setResults(data.results);
            setTotalCount(data.totalCount);
            setHasMore(data.hasMore);
            setMessage(data.message || '');
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setTotalCount(0);
            setHasMore(false);
            setMessage('Search failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle search form submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query, typeFilter);
    };

    // Get work item type icon
    const getWorkItemIcon = (type: WorkItemType) => {
        switch (type) {
            case WorkItemType.EPIC:
                return <Package className="w-5 h-5 text-purple-600" />;
            case WorkItemType.FEATURE:
                return <Sparkles className="w-5 h-5 text-blue-600" />;
            case WorkItemType.USER_STORY:
                return <BookOpen className="w-5 h-5 text-green-600" />;
            case WorkItemType.BUG:
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            case WorkItemType.INCIDENT:
                return <AlertTriangle className="w-5 h-5 text-orange-600" />;
            default:
                return <Package className="w-5 h-5 text-gray-600" />;
        }
    };

    // Get work item type label
    const getWorkItemTypeLabel = (type: WorkItemType) => {
        switch (type) {
            case WorkItemType.EPIC:
                return 'Epic';
            case WorkItemType.FEATURE:
                return 'Feature';
            case WorkItemType.USER_STORY:
                return 'User Story';
            case WorkItemType.BUG:
                return 'Bug';
            case WorkItemType.INCIDENT:
                return 'Incident';
            default:
                return type;
        }
    };

    // Get application color
    const getApplicationColor = (applicationName: string) => {
        const colors: { [key: string]: string } = {
            'NRE': 'bg-blue-100 text-blue-800',
            'NVE': 'bg-green-100 text-green-800',
            'E-Vite': 'bg-purple-100 text-purple-800',
            'Portal Plus': 'bg-orange-100 text-orange-800',
            'Fast 2.0': 'bg-red-100 text-red-800',
            'FMS': 'bg-indigo-100 text-indigo-800'
        };
        return colors[applicationName] || 'bg-gray-100 text-gray-800';
    };

    // Highlight matching text
    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;
        
        const regex = new RegExp(`(${query.trim()})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
                    {part}
                </mark>
            ) : part
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Search className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
                    <p className="text-gray-600 mb-4">Please log in to access the search feature.</p>
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

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Global Search</h1>
                            <p className="text-sm text-gray-600">Find work items across all releases by ID or title</p>
                        </div>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by work item ID or title (Epic, Feature, User Story, Bug, Incident)..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white font-medium shadow-sm hover:shadow-md"
                                    />
                                    {query && (
                                        <button
                                            type="button"
                                            onClick={() => setQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Search Button */}
                            <button
                                type="submit"
                                disabled={loading || query.trim().length < 2}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        <span>Search</span>
                                    </>
                                )}
                            </button>

                            {/* Filter Toggle */}
                            <button
                                type="button"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-2 px-6 py-3.5 rounded-xl font-semibold border-2 transition-all duration-200 ${
                                    showFilters || typeFilter
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="w-5 h-5" />
                                <span>Filters</span>
                                {typeFilter && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">
                                        1
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Filters */}
                        {showFilters && (
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Work Item Type
                                        </label>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white font-medium"
                                        >
                                            <option value="">All Types</option>
                                            <option value={WorkItemType.EPIC}>📦 Epic</option>
                                            <option value={WorkItemType.FEATURE}>✨ Feature</option>
                                            <option value={WorkItemType.USER_STORY}>📖 User Story</option>
                                            <option value={WorkItemType.BUG}>🐛 Bug</option>
                                            <option value={WorkItemType.INCIDENT}>⚠️ Incident</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {typeFilter && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            Active filter: <span className="font-semibold">{getWorkItemTypeLabel(typeFilter as WorkItemType)}</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setTypeFilter('')}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                                        >
                                            Clear Filter
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1">
                {message && !loading && (
                    <div className="p-8 text-center text-gray-500">
                        {message}
                    </div>
                )}

                {results.length > 0 && (
                    <>
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Search Results
                                </h2>
                                <span className="text-sm text-gray-600">
                                    Found {totalCount} work item{totalCount !== 1 ? 's' : ''}
                                    {hasMore && ' (showing first 50)'}
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {results.map((result, index) => (
                                <Link
                                    key={`${result.release._id}-${result.workItem._id}-${index}`}
                                    href={`/releases/${result.release._id}`}
                                    className="block p-6 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getWorkItemIcon(result.workItem.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                                    {getWorkItemTypeLabel(result.workItem.type)}
                                                </span>
                                                {result.workItem.id && (
                                                    <span className="text-sm font-mono bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">
                                                        {highlightMatch(result.workItem.id, query)}
                                                    </span>
                                                )}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    result.release.isPublished 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {result.release.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                                {highlightMatch(result.workItem.title, query)}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-2">
                                                    <Building className="w-4 h-4" />
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationColor(result.release.applicationName)}`}>
                                                        {result.release.applicationName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Package className="w-4 h-4" />
                                                    <span>{result.release.title}</span>
                                                    {result.release.version && (
                                                        <span className="text-gray-400">v{result.release.version}</span>
                                                    )}
                                                </div>
                                                {result.workItem.hyperlink && (
                                                    <div className="flex items-center space-x-2">
                                                        <ExternalLink className="w-4 h-4" />
                                                        <span>External Link Available</span>
                                                    </div>
                                                )}
                                                {result.workItem.actualHours && (
                                                    <div className="flex items-center space-x-2">
                                                        <span>{result.workItem.actualHours}h logged</span>
                                                    </div>
                                                )}
                                            </div>
                                            {result.workItem.remarks && (
                                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                                    {result.workItem.remarks}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {results.length === 0 && query.trim().length >= 2 && !loading && !message && (
                    <div className="p-12 text-center">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No work items found</h3>
                        <p className="text-gray-500 mb-6">
                            Try searching with different keywords, work item IDs, or adjust your filters.
                        </p>
                        <div className="text-sm text-gray-400">
                            <p>Search tips:</p>
                            <ul className="mt-2 space-y-1">
                                <li>• Use work item IDs for exact matches</li>
                                <li>• Search by title keywords</li>
                                <li>• Try different work item types</li>
                                <li>• Check spelling and try partial matches</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
