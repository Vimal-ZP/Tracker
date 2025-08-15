'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { Release, ReleaseStatus, ReleaseType, ReleaseFilters, FeatureCategory } from '@/types/release';
import { rolePermissions } from '@/types/user';
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
    projectName: 'NRE',
    description: 'This release introduces several new features including advanced analytics, improved user interface, and enhanced security measures. We have also optimized performance across all modules.',
    releaseDate: new Date('2024-01-15'),
    status: ReleaseStatus.STABLE,
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
    projectName: 'Portal Plus',
    description: 'Important security update addressing vulnerabilities in user authentication and data validation. All users are strongly recommended to update immediately.',
    releaseDate: new Date('2024-01-08'),
    status: ReleaseStatus.STABLE,
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
    projectName: 'Fast 2.0',
    description: 'Beta release of the next major version featuring a completely redesigned architecture, new AI-powered features, and modern UI components.',
    releaseDate: new Date('2024-01-20'),
    status: ReleaseStatus.BETA,
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
    projectName: 'E-Vite',
    description: 'Focus on improving application performance and stability with various optimizations and bug fixes.',
    releaseDate: new Date('2023-12-20'),
    status: ReleaseStatus.STABLE,
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
    projectName: 'NVE',
    description: 'Release candidate for version 2.2.0 introducing new collaboration features and improved workflow management.',
    releaseDate: new Date('2024-01-25'),
    status: ReleaseStatus.BETA,
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
    projectName: 'FMS',
    description: 'Final update for the 1.x series with essential bug fixes and security patches for users not ready to upgrade to 2.x.',
    releaseDate: new Date('2023-11-15'),
    status: ReleaseStatus.DEPRECATED,
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
    projectName: 'NRE',
    description: 'Emergency hotfix addressing a critical issue discovered in version 2.1.0 that could cause data corruption in specific scenarios.',
    releaseDate: new Date('2024-01-16'),
    status: ReleaseStatus.STABLE,
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
    projectName: 'Portal Plus',
    description: 'Upcoming release focusing on mobile responsiveness and native mobile app support. Currently in development.',
    releaseDate: new Date('2024-02-15'),
    status: ReleaseStatus.DRAFT,
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

  useEffect(() => {
    fetchReleases();
  }, [currentPage, filters]);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom.toISOString() }),
        ...(filters.dateTo && { dateTo: filters.dateTo.toISOString() })
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
    projectName: string;
    version?: string;
    releaseDate: string;
    description: string;
    status: ReleaseStatus;
    type: ReleaseType;
    isPublished: boolean;
  }) => {
    try {
      // Prepare release data for API
      const releaseData = {
        version: formData.version,
        title: formData.releaseName,
        projectName: formData.projectName,
        description: formData.description,
        releaseDate: formData.releaseDate,
        status: formData.status,
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
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Releases</h1>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'card'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Grid className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {permissions?.canCreateUsers && (
          <button
            onClick={() => setShowNewReleaseModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Release</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search releases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    className="input w-full"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="beta">Beta</option>
                    <option value="stable">Stable</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                    className="input w-full"
                  >
                    <option value="">All Types</option>
                    <option value="major">Major</option>
                    <option value="minor">Minor</option>
                    <option value="patch">Patch</option>
                    <option value="hotfix">Hotfix</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
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
          onView={(release) => window.location.href = `/releases/${release._id}`}
          onEdit={(release) => window.location.href = `/releases/${release._id}/edit`}
          onDelete={handleDelete}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary disabled:opacity-50"
          >
            Next
          </button>
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
