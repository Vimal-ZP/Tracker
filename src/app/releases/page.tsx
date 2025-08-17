'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { Release, ReleaseType, ReleaseFilters, FeatureCategory } from '@/types/release';
import { rolePermissions, getUserAccessibleApplications, AVAILABLE_APPLICATIONS } from '@/types/user';
import {
  Package,
  Plus,
  Search,
  Filter,
  List,
  Grid
} from 'lucide-react';
import { ReleasesList, NewReleaseModal } from '@/components/releases';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

// Dummy data for releases
const dummyReleases: Release[] = [
  {
    _id: '1',
    version: '2.1.0',
    title: 'Major Feature Update',
    applicationName: 'NRE',
    description: 'This release introduces several new features including advanced analytics, improved user interface, and enhanced security measures. We have also optimized performance across all modules.',
    releaseDate: new Date('2024-01-15'),

    type: ReleaseType.MINOR,
    features: [
      {
        title: 'Advanced Analytics Dashboard',
        description: 'New comprehensive analytics with real-time data visualization',
        category: FeatureCategory.NEW
      },
      {
        title: 'Enhanced Security',
        description: 'Improved authentication and authorization mechanisms',
        category: FeatureCategory.SECURITY
      },
      {
        title: 'Performance Optimization',
        description: 'Reduced load times by 40% across all pages',
        category: FeatureCategory.PERFORMANCE
      }
    ],
    bugFixes: [
      'Fixed memory leak in data processing module',
      'Resolved UI rendering issues on mobile devices',
      'Fixed authentication timeout errors'
    ],
    breakingChanges: [
      'API endpoint /api/v1/users has been deprecated, use /api/v2/users instead'
    ],
    author: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    downloadUrl: 'https://github.com/example/tracker/releases/tag/v2.1.0',
    workItems: [],
    isPublished: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    version: '2.0.5',
    title: 'Critical Security Patch',
    applicationName: 'Portal Plus',
    description: 'Important security update addressing vulnerabilities in user authentication and data validation. All users are strongly recommended to update immediately.',
    releaseDate: new Date('2024-01-08'),

    type: ReleaseType.PATCH,
    features: [
      {
        title: 'Security Hardening',
        description: 'Enhanced input validation and sanitization',
        category: FeatureCategory.SECURITY
      }
    ],
    bugFixes: [
      'Fixed SQL injection vulnerability in search functionality',
      'Patched XSS vulnerability in user profile section',
      'Resolved CSRF token validation issues'
    ],
    breakingChanges: [],
    workItems: [],
    author: {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    downloadUrl: 'https://github.com/example/tracker/releases/tag/v2.0.5',

    isPublished: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-08')
  },
  {
    _id: '3',
    version: '3.0.0-beta.1',
    title: 'Next Generation Beta',
    applicationName: 'Fast 2.0',
    description: 'Beta release of the next major version featuring a completely redesigned architecture, new AI-powered features, and modern UI components.',
    releaseDate: new Date('2024-01-20'),

    type: ReleaseType.MAJOR,
    features: [
      {
        title: 'AI-Powered Insights',
        description: 'Machine learning algorithms for predictive analytics',
        category: FeatureCategory.NEW
      },
      {
        title: 'Modern UI Framework',
        description: 'Complete redesign with improved accessibility',
        category: FeatureCategory.IMPROVED
      },
      {
        title: 'Microservices Architecture',
        description: 'Scalable and maintainable service-oriented design',
        category: FeatureCategory.IMPROVED
      }
    ],
    bugFixes: [
      'Improved error handling in async operations',
      'Fixed race conditions in data synchronization'
    ],
    breakingChanges: [
      'Complete API restructure - migration guide available',
      'Database schema changes require data migration',
      'Configuration file format has changed'
    ],
    author: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    downloadUrl: 'https://github.com/example/tracker/releases/tag/v3.0.0-beta.1',
    workItems: [],
    isPublished: true,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-20')
  },
  {
    _id: '4',
    version: '2.0.4',
    title: 'Performance and Stability Update',
    applicationName: 'E-Vite',
    description: 'Focus on improving application performance and stability with various optimizations and bug fixes.',
    releaseDate: new Date('2023-12-20'),

    type: ReleaseType.PATCH,
    features: [
      {
        title: 'Database Query Optimization',
        description: 'Improved query performance for large datasets',
        category: FeatureCategory.PERFORMANCE
      },
      {
        title: 'Caching Improvements',
        description: 'Enhanced caching strategy for better response times',
        category: FeatureCategory.PERFORMANCE
      }
    ],
    bugFixes: [
      'Fixed pagination issues in large data tables',
      'Resolved memory leaks in background processes',
      'Fixed timezone handling in date calculations',
      'Corrected sorting behavior in data grids'
    ],
    breakingChanges: [],
    workItems: [],
    author: {
      _id: 'user3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com'
    },
    downloadUrl: 'https://github.com/example/tracker/releases/tag/v2.0.4',

    isPublished: true,
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2023-12-20')
  },
  {
    _id: '5',
    version: '2.2.0-rc.1',
    title: 'Release Candidate - New Features',
    applicationName: 'NVE',
    description: 'Release candidate for version 2.2.0 introducing new collaboration features and improved workflow management.',
    releaseDate: new Date('2024-01-25'),

    type: ReleaseType.MINOR,
    features: [
      {
        title: 'Team Collaboration Tools',
        description: 'Real-time collaboration and commenting system',
        category: FeatureCategory.NEW
      },
      {
        title: 'Workflow Automation',
        description: 'Automated workflows for common tasks',
        category: FeatureCategory.NEW
      },
      {
        title: 'Enhanced Notifications',
        description: 'Improved notification system with customizable preferences',
        category: FeatureCategory.IMPROVED
      }
    ],
    bugFixes: [
      'Fixed issues with file upload in certain browsers',
      'Resolved conflicts in concurrent editing scenarios'
    ],
    breakingChanges: [],
    workItems: [],
    author: {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    downloadUrl: 'https://github.com/example/tracker/releases/tag/v2.2.0-rc.1',

    isPublished: true,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-25')
  },
  {
    _id: '6',
    version: '1.9.8',
    title: 'Legacy Support Update',
    applicationName: 'FMS',
    description: 'Final update for the 1.x series with essential bug fixes and security patches for users not ready to upgrade to 2.x.',
    releaseDate: new Date('2023-11-15'),

    type: ReleaseType.PATCH,
    features: [
      {
        title: 'Legacy Browser Support',
        description: 'Extended support for older browser versions',
        category: FeatureCategory.IMPROVED
      }
    ],
    bugFixes: [
      'Fixed compatibility issues with Internet Explorer 11',
      'Resolved date formatting issues in legacy systems',
      'Patched security vulnerabilities in old dependencies'
    ],
    breakingChanges: [],
    workItems: [],
    author: {
      _id: 'user3',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com'
    },
    downloadUrl: 'https://github.com/example/tracker/releases/tag/v1.9.8',

    isPublished: true,
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2023-11-15')
  },
  {
    _id: '7',
    version: '2.1.1-hotfix',
    title: 'Critical Hotfix',
    applicationName: 'NRE',
    description: 'Emergency hotfix addressing a critical issue discovered in version 2.1.0 that could cause data corruption in specific scenarios.',
    releaseDate: new Date('2024-01-16'),

    type: ReleaseType.HOTFIX,
    features: [],
    bugFixes: [
      'Fixed critical data corruption issue in batch processing',
      'Resolved race condition in concurrent database writes'
    ],
    breakingChanges: [],
    workItems: [],
    author: {
      _id: 'user1',
      name: 'John Doe',
      email: 'john.doe@example.com'
    },
    downloadUrl: 'https://github.com/example/tracker/releases/tag/v2.1.1-hotfix',

    isPublished: true,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    _id: '8',
    version: '2.3.0',
    title: 'Work in Progress - Mobile Support',
    applicationName: 'Portal Plus',
    description: 'Upcoming release focusing on mobile responsiveness and native mobile app support. Currently in development.',
    releaseDate: new Date('2024-02-15'),

    type: ReleaseType.MINOR,
    features: [
      {
        title: 'Mobile-First Design',
        description: 'Responsive design optimized for mobile devices',
        category: FeatureCategory.NEW
      },
      {
        title: 'Progressive Web App',
        description: 'PWA capabilities for offline functionality',
        category: FeatureCategory.NEW
      },
      {
        title: 'Touch Gestures',
        description: 'Native touch gesture support for mobile interactions',
        category: FeatureCategory.NEW
      }
    ],
    bugFixes: [],
    breakingChanges: [
      'CSS class names have been restructured for better mobile support'
    ],
    author: {
      _id: 'user2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com'
    },
    workItems: [],
    isPublished: false,
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30')
  }
];

export default function ReleasesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReleaseFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'compact'>('card');
  const [showNewReleaseModal, setShowNewReleaseModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [releaseToDelete, setReleaseToDelete] = useState<Release | null>(null);

  const permissions = user ? rolePermissions[user.role] : null;
  const accessibleApplications = user ? getUserAccessibleApplications(user) : [];

  useEffect(() => {
    fetchReleases();
  }, [currentPage, filters]);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',

        ...(filters.type && { type: filters.type }),
        ...(filters.applicationName && { applicationName: filters.applicationName }),
        ...(filters.search && { search: filters.search }),
        ...(filters.releaseDate && { releaseDate: filters.releaseDate.toISOString() })
      });

      const response = await fetch(`/api/releases?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReleases(data.releases || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Failed to fetch releases');
        toast.error('Failed to fetch releases');
        // Fallback to dummy data if API fails
        setReleases(dummyReleases.slice(0, 10));
        setTotalPages(Math.ceil(dummyReleases.length / 10));
      }
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast.error('Error fetching releases');
      // Fallback to dummy data if API fails
      setReleases(dummyReleases.slice(0, 10));
      setTotalPages(Math.ceil(dummyReleases.length / 10));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm });
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ReleaseFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleDelete = async (releaseId: string) => {
    const release = releases.find(r => r._id === releaseId);
    if (!release) return;

    setReleaseToDelete(release);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!releaseToDelete) return;

    try {
      const response = await fetch(`/api/releases/${releaseToDelete._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Release deleted successfully');
        fetchReleases();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete release');
      }
    } catch (error) {
      console.error('Error deleting release:', error);
      toast.error('Failed to delete release');
    } finally {
      setReleaseToDelete(null);
    }
  };

  const handleNewReleaseSubmit = async (formData: {
    releaseName: string;
    applicationName: string;
    version?: string;
    releaseDate: string;
    description: string;

    type: ReleaseType;
    isPublished: boolean;
  }) => {
    try {
      // Prepare release data for API
      const releaseData = {
        version: formData.version,
        title: formData.releaseName,
        applicationName: formData.applicationName,
        description: formData.description,
        releaseDate: formData.releaseDate,

        type: formData.type,
        features: [],
        bugFixes: [],
        breakingChanges: [],
        isPublished: formData.isPublished
      };

      // Submit to API
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(releaseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create release');
      }

      const result = await response.json();

      toast.success('Release created successfully!');

      // Refresh the releases list
      fetchReleases();

    } catch (error: any) {
      console.error('Error creating release:', error);
      toast.error(error.message || 'Failed to create release');
      throw error; // Re-throw to let the modal handle the error state
    }
  };

  if (!user) return null;

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Compact Professional Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
        <div className="p-4">
          <div className="flex justify-between items-center">
            {/* Left Section - Title and View Toggle */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Software Releases</h1>
                  <p className="text-sm text-gray-600">Manage and track your application releases</p>
                </div>
              </div>

              {/* Compact View Mode Toggle */}
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-white/50">
                <button
                  onClick={() => setViewMode('card')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'card'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'table'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                    }`}
                >
                  <List className="w-4 h-4" />
                  <span>Table</span>
                </button>
              </div>
            </div>

            {/* Right Section - Stats and Action Button */}
            <div className="flex items-center space-x-4">
              {/* Compact Stats */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                    <Package className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900">{releases.length}</span>
                  <span className="text-gray-600">Total</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                    <Package className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="font-semibold text-green-600">{releases.filter(r => r.isPublished).length}</span>
                  <span className="text-gray-600">Published</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                    <Package className="w-3 h-3 text-purple-600" />
                  </div>
                  <span className="font-semibold text-purple-600">{Array.from(new Set(releases.map(r => r.applicationName))).length}</span>
                  <span className="text-gray-600">Apps</span>
                </div>
              </div>

              {/* Action Button */}
              {permissions?.canCreateUsers && (
                <button
                  onClick={() => setShowNewReleaseModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Release</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search releases by name, version, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium border transition-all duration-200 ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters && <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full ml-1">On</span>}
              </button>
            </div>
          </form>

          {/* Compact Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Application</label>
                  <select
                    value={filters.applicationName || ''}
                    onChange={(e) => handleFilterChange('applicationName', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-sm"
                  >
                    <option value="">All Applications</option>
                    {accessibleApplications.map((application) => (
                      <option key={application} value={application}>
                        {application}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Release Type</label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="major">🚀 Major</option>
                    <option value="minor">✨ Minor</option>
                    <option value="patch">🔧 Patch</option>
                    <option value="hotfix">🔥 Hotfix</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Release Date</label>
                  <input
                    type="date"
                    value={filters.releaseDate ? filters.releaseDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFilterChange('releaseDate', e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium border border-gray-300 transition-all duration-200 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Compact Active Filters Display */}
              {(filters.applicationName || filters.type || filters.releaseDate) && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-blue-900">Active:</span>
                      <div className="flex flex-wrap gap-1">
                        {filters.applicationName && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {filters.applicationName}
                          </span>
                        )}
                        {filters.type && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {filters.type}
                          </span>
                        )}
                        {filters.releaseDate && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {filters.releaseDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={clearFilters}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Releases List */}
      <div className="flex-1 min-h-0">
        <ReleasesList
          releases={releases}
          loading={loading}
          viewMode={viewMode}
          userRole={user?.role}
          onView={(release) => router.push(`/releases/${release._id}`)}
          onEdit={(release) => router.push(`/releases/${release._id}/edit`)}
          onDelete={handleDelete}
        />
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-600">
              Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalPages}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Prev</span>
              </button>

              {/* Compact Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-md text-xs font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span>Next</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Release Modal */}
      <NewReleaseModal
        isOpen={showNewReleaseModal}
        onClose={() => setShowNewReleaseModal(false)}
        onSubmit={handleNewReleaseSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setReleaseToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Release"
        message={`Are you sure you want to delete "${releaseToDelete?.title}"?`}
        details={releaseToDelete?.workItems && releaseToDelete.workItems.length > 0
          ? `This release contains ${releaseToDelete.workItems.length} work item(s) that will also be deleted.\n\nThis action cannot be undone.`
          : 'This action cannot be undone.'
        }
        confirmText="Delete Release"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
