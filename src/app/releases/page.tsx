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
  List,
  Grid
} from 'lucide-react';
import { ReleasesList } from '@/components/releases';
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
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

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
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Failed to fetch releases');
        toast.error('Failed to fetch releases');
      }
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast.error('Error fetching releases');
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
    if (!confirm('Are you sure you want to delete this release?')) {
      return;
    }

    try {
      const response = await fetch(`/api/releases/${releaseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Release deleted successfully');
        fetchReleases();
      } else {
        toast.error('Failed to delete release');
      }
    } catch (error) {
      console.error('Error deleting release:', error);
      toast.error('Failed to delete release');
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
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>
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
    </div>
  );
}
