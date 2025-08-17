'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
    Search, 
    X, 
    Package, 
    Sparkles, 
    BookOpen, 
    AlertCircle, 
    AlertTriangle,
    ExternalLink,
    Clock,
    Building
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

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [message, setMessage] = useState('');

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    // Close search when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Debounced search function
    const performSearch = async (searchQuery: string) => {
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
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=10`);
            
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

    // Handle input change with debouncing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new debounce
        debounceRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    // Get work item type icon
    const getWorkItemIcon = (type: WorkItemType) => {
        switch (type) {
            case WorkItemType.EPIC:
                return <Package className="w-4 h-4 text-purple-600" />;
            case WorkItemType.FEATURE:
                return <Sparkles className="w-4 h-4 text-blue-600" />;
            case WorkItemType.USER_STORY:
                return <BookOpen className="w-4 h-4 text-green-600" />;
            case WorkItemType.BUG:
                return <AlertCircle className="w-4 h-4 text-red-600" />;
            case WorkItemType.INCIDENT:
                return <AlertTriangle className="w-4 h-4 text-orange-600" />;
            default:
                return <Package className="w-4 h-4 text-gray-600" />;
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

    return (
        <div className="relative" ref={searchRef}>
            {/* Search Input */}
            <div className="relative">
                <button
                    data-global-search-trigger
                    onClick={() => {
                        setIsOpen(true);
                        setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                    className="group flex items-center space-x-3 px-4 py-3 text-sm bg-white border-2 border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-300 w-full shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <div className="flex items-center space-x-3 flex-1">
                        <div className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                            <Search className="w-full h-full" />
                        </div>
                        <span className="text-gray-500 group-hover:text-gray-700 font-medium">
                            Search work items by ID or title...
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400">
                            <span>Press</span>
                            <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                                ⌘K
                            </kbd>
                        </div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>
                </button>

                {/* Search Modal */}
                {isOpen && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-full max-w-3xl">
                        {/* Enhanced Search Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                    <Search className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Global Search</h3>
                                    <p className="text-sm text-gray-600">Find work items across all releases</p>
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200">
                                    <Search className="w-full h-full" />
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search by ID (e.g., EPIC-001) or title keywords..."
                                    value={query}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white font-medium shadow-sm hover:shadow-md text-lg"
                                />
                                {query && (
                                    <button
                                        onClick={() => {
                                            setQuery('');
                                            setResults([]);
                                            setMessage('');
                                        }}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 rounded-full p-1"
                                    >
                                        <X className="w-full h-full" />
                                    </button>
                                )}
                                <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-focus-within:ring-blue-200 transition-all duration-200 pointer-events-none"></div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <span>Epic</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>Feature</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>User Story</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span>Bug</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span>Incident</span>
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {loading ? 'Searching...' : `${results.length} results`}
                                </span>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading && (
                                <div className="p-4 text-center">
                                    <div className="inline-flex items-center space-x-2 text-gray-500">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Searching...</span>
                                    </div>
                                </div>
                            )}

                            {message && !loading && (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    {message}
                                </div>
                            )}

                            {results.length > 0 && !loading && (
                                <>
                                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                Found {totalCount} work item{totalCount !== 1 ? 's' : ''}
                                            </span>
                                            {hasMore && (
                                                <span className="text-blue-600">
                                                    Showing first 10 results
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {results.map((result, index) => (
                                            <Link
                                                key={`${result.release._id}-${result.workItem._id}-${index}`}
                                                href={`/releases/${result.release._id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="block p-4 hover:bg-gray-50 transition-colors duration-200"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {getWorkItemIcon(result.workItem.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                                {getWorkItemTypeLabel(result.workItem.type)}
                                                            </span>
                                                            {result.workItem.id && (
                                                                <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                                                    {highlightMatch(result.workItem.id, query)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                                            {highlightMatch(result.workItem.title, query)}
                                                        </h4>
                                                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                            <div className="flex items-center space-x-1">
                                                                <Building className="w-3 h-3" />
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getApplicationColor(result.release.applicationName)}`}>
                                                                    {result.release.applicationName}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Package className="w-3 h-3" />
                                                                <span>{result.release.title}</span>
                                                                {result.release.version && (
                                                                    <span className="text-gray-400">v{result.release.version}</span>
                                                                )}
                                                            </div>
                                                            {result.workItem.hyperlink && (
                                                                <div className="flex items-center space-x-1">
                                                                    <ExternalLink className="w-3 h-3" />
                                                                    <span>Has Link</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            result.release.isPublished 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {result.release.isPublished ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}

                            {results.length === 0 && query.trim().length >= 2 && !loading && !message && (
                                <div className="p-8 text-center">
                                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No work items found</h3>
                                    <p className="text-gray-500">
                                        Try searching with different keywords or work item IDs.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Search Footer */}
                        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                            <div className="flex items-center justify-between">
                                <span>Search across all work items in releases</span>
                                <div className="flex items-center space-x-2">
                                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↵</kbd>
                                    <span>to select</span>
                                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">esc</kbd>
                                    <span>to close</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Keyboard shortcut handler */}
            {typeof window !== 'undefined' && (
                <div
                    onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                            e.preventDefault();
                            setIsOpen(true);
                            setTimeout(() => inputRef.current?.focus(), 100);
                        }
                        if (e.key === 'Escape') {
                            setIsOpen(false);
                        }
                    }}
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}
                />
            )}
        </div>
    );
}
