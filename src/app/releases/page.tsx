'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { Release, ReleaseStatus, ReleaseType, ReleaseFilters } from '@/types/release';
import { rolePermissions } from '@/types/user';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ReleasesPage() {
  const { user } = useAuth();
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReleaseFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

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
      if (!response.ok) throw new Error('Failed to fetch releases');

      const data = await response.json();
      setReleases(data.releases);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast.error('Failed to fetch releases');
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
    if (!confirm('Are you sure you want to delete this release?')) return;

    try {
      const response = await fetch(`/api/releases/${releaseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete release');

      toast.success('Release deleted successfully');
      fetchReleases();
    } catch (error) {
      console.error('Error deleting release:', error);
      toast.error('Failed to delete release');
    }
  };

  const getStatusIcon = (status: ReleaseStatus) => {
    switch (status) {
      case ReleaseStatus.DRAFT:
        return <Clock className="w-4 h-4 text-gray-500" />;
      case ReleaseStatus.BETA:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case ReleaseStatus.STABLE:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ReleaseStatus.DEPRECATED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ReleaseStatus) => {
    switch (status) {
      case ReleaseStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case ReleaseStatus.BETA:
        return 'bg-yellow-100 text-yellow-800';
      case ReleaseStatus.STABLE:
        return 'bg-green-100 text-green-800';
      case ReleaseStatus.DEPRECATED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: ReleaseType) => {
    switch (type) {
      case ReleaseType.MAJOR:
        return 'bg-purple-100 text-purple-800';
      case ReleaseType.MINOR:
        return 'bg-blue-100 text-blue-800';
      case ReleaseType.PATCH:
        return 'bg-green-100 text-green-800';
      case ReleaseType.HOTFIX:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) return null;

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Releases</h1>
        </div>
        {permissions?.canManageUsers && (
          <Link
            href="/releases/new"
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Release</span>
          </Link>
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
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {Object.values(ReleaseStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
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
                    {Object.values(ReleaseType).map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : releases.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No releases found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {permissions?.canManageUsers ? 'Get started by creating a new release.' : 'No releases available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {releases.map((release) => (
              <div key={release._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {release.title}
                        </h3>
                        <span className="flex items-center space-x-1">
                          <Tag className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-600">
                            v{release.version}
                          </span>
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {release.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(release.releaseDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{release.downloadCount} downloads</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>by {release.author.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                            {getStatusIcon(release.status)}
                            <span className="ml-1">{release.status}</span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(release.type)}`}>
                            {release.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/releases/${release._id}`}
                            className="btn btn-sm btn-secondary flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Link>
                          
                          {permissions?.canManageUsers && (
                            <>
                              <Link
                                href={`/releases/${release._id}/edit`}
                                className="btn btn-sm btn-secondary flex items-center space-x-1"
                              >
                                <Edit className="w-4 h-4" />
                                <span>Edit</span>
                              </Link>
                              
                              {user.role === 'super_admin' && (
                                <button
                                  onClick={() => handleDelete(release._id)}
                                  className="btn btn-sm btn-danger flex items-center space-x-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}
