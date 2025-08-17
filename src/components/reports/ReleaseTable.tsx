'use client';

import React, { useState, useMemo } from 'react';
import { Release, ReleaseType } from '@/types/release';
import { 
  ChevronUp, 
  ChevronDown, 
  Calendar, 
  Package, 
  CheckCircle, 
  XCircle,
  Building,
  User,
  Tag,
  FileText
} from 'lucide-react';

interface ReleaseTableProps {
  releases: Release[];
}

type SortField = 'title' | 'applicationName' | 'version' | 'releaseDate' | 'type' | 'isPublished';
type SortDirection = 'asc' | 'desc';

export default function ReleaseTable({ releases }: ReleaseTableProps) {
  const [sortField, setSortField] = useState<SortField>('releaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterApplication, setFilterApplication] = useState<string>('');
  const [filterType, setFilterType] = useState<ReleaseType | ''>('');
  const [filterPublished, setFilterPublished] = useState<string>('');

  // Get unique applications for filter
  const applications = useMemo(() => {
    return Array.from(new Set(releases.map(r => r.applicationName))).sort();
  }, [releases]);

  // Sort and filter releases
  const sortedAndFilteredReleases = useMemo(() => {
    let filtered = releases;

    // Apply filters
    if (filterApplication) {
      filtered = filtered.filter(r => r.applicationName === filterApplication);
    }
    if (filterType) {
      filtered = filtered.filter(r => r.type === filterType);
    }
    if (filterPublished) {
      const isPublished = filterPublished === 'published';
      filtered = filtered.filter(r => r.isPublished === isPublished);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date sorting
      if (sortField === 'releaseDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [releases, sortField, sortDirection, filterApplication, filterType, filterPublished]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  const getReleaseTypeColor = (type: ReleaseType) => {
    switch (type) {
      case ReleaseType.MAJOR:
        return 'bg-red-100 text-red-800';
      case ReleaseType.MINOR:
        return 'bg-yellow-100 text-yellow-800';
      case ReleaseType.PATCH:
        return 'bg-green-100 text-green-800';
      case ReleaseType.HOTFIX:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReleaseTypeName = (type: ReleaseType) => {
    switch (type) {
      case ReleaseType.MAJOR: return 'Major';
      case ReleaseType.MINOR: return 'Minor';
      case ReleaseType.PATCH: return 'Patch';
      case ReleaseType.HOTFIX: return 'Hotfix';
      default: return type;
    }
  };

  const clearFilters = () => {
    setFilterApplication('');
    setFilterType('');
    setFilterPublished('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900">Release Details</h3>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterApplication}
              onChange={(e) => setFilterApplication(e.target.value)}
              className="input text-sm"
            >
              <option value="">All Applications</option>
              {applications.map(app => (
                <option key={app} value={app}>{app}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ReleaseType | '')}
              className="input text-sm"
            >
              <option value="">All Types</option>
              <option value={ReleaseType.MAJOR}>Major</option>
              <option value={ReleaseType.MINOR}>Minor</option>
              <option value={ReleaseType.PATCH}>Patch</option>
              <option value={ReleaseType.HOTFIX}>Hotfix</option>
            </select>

            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="input text-sm"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>

            {(filterApplication || filterType || filterPublished) && (
              <button
                onClick={clearFilters}
                className="btn btn-secondary text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>Release</span>
                    {getSortIcon('title')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('applicationName')}
                >
                  <div className="flex items-center space-x-1">
                    <Building className="w-4 h-4" />
                    <span>Application</span>
                    {getSortIcon('applicationName')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('version')}
                >
                  <div className="flex items-center space-x-1">
                    <Tag className="w-4 h-4" />
                    <span>Version</span>
                    {getSortIcon('version')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center space-x-1">
                    <Package className="w-4 h-4" />
                    <span>Type</span>
                    {getSortIcon('type')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('releaseDate')}
                >
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Release Date</span>
                    {getSortIcon('releaseDate')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('isPublished')}
                >
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Status</span>
                    {getSortIcon('isPublished')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Author</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredReleases.map((release) => (
                <tr key={release._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {release.title}
                    </div>
                    {release.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {release.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {release.applicationName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {release.version || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReleaseTypeColor(release.type)}`}>
                      {getReleaseTypeName(release.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(release.releaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {release.isPublished ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Published</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Draft</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {release.author?.name || 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sortedAndFilteredReleases.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No releases found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or check back later.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      {sortedAndFilteredReleases.length > 0 && (
        <div className="card-footer bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {sortedAndFilteredReleases.length} of {releases.length} releases
            </span>
            <div className="flex space-x-4">
              <span>Published: {sortedAndFilteredReleases.filter(r => r.isPublished).length}</span>
              <span>Draft: {sortedAndFilteredReleases.filter(r => !r.isPublished).length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
