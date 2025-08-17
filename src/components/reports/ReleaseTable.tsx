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
  FileText,
  Filter,
  Search,
  Download,
  Eye,
  TrendingUp,
  Clock,
  Layers,
  BarChart3,
  RefreshCw,
  Zap
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

  const getApplicationColors = (applicationName: string) => {
    const colorMap: Record<string, { bg: string; text: string; icon: string; gradient: string }> = {
      'NRE': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: 'from-blue-500 to-blue-600',
        gradient: 'bg-gradient-to-br from-blue-500 to-blue-600'
      },
      'NVE': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: 'from-green-500 to-green-600',
        gradient: 'bg-gradient-to-br from-green-500 to-green-600'
      },
      'E-Vite': {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        icon: 'from-purple-500 to-purple-600',
        gradient: 'bg-gradient-to-br from-purple-500 to-purple-600'
      },
      'Portal Plus': {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: 'from-orange-500 to-orange-600',
        gradient: 'bg-gradient-to-br from-orange-500 to-orange-600'
      },
      'Fast 2.0': {
        bg: 'bg-pink-100',
        text: 'text-pink-800',
        icon: 'from-pink-500 to-pink-600',
        gradient: 'bg-gradient-to-br from-pink-500 to-pink-600'
      },
      'FMS': {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        icon: 'from-indigo-500 to-indigo-600',
        gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
      }
    };

    // Return specific colors for known applications, or default colors for unknown ones
    return colorMap[applicationName] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      icon: 'from-gray-500 to-gray-600',
      gradient: 'bg-gradient-to-br from-gray-500 to-gray-600'
    };
  };

  const clearFilters = () => {
    setFilterApplication('');
    setFilterType('');
    setFilterPublished('');
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Release Analytics</h2>
              <p className="text-gray-600">Comprehensive release data and insights</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sortedAndFilteredReleases.length}</div>
              <div className="text-sm text-gray-600">Total Releases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {sortedAndFilteredReleases.filter(r => r.isPublished).length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {applications.length}
              </div>
              <div className="text-sm text-gray-600">Applications</div>
              {/* Application color indicators */}
              <div className="flex justify-center space-x-1 mt-1">
                {applications.slice(0, 6).map((app) => {
                  const colors = getApplicationColors(app);
                  return (
                    <div
                      key={app}
                      className={`w-2 h-2 rounded-full ${colors.gradient}`}
                      title={app}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Color Legend */}
      {applications.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
                <Building className="w-3 h-3 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Application Color Guide</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {applications.map((app) => {
                const colors = getApplicationColors(app);
                return (
                  <div key={app} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${colors.gradient}`} />
                    <span className="text-xs font-medium text-gray-700">{app}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            </div>
            {(filterApplication || filterType || filterPublished) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear All
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Building className="w-4 h-4 inline mr-1" />
                Application
              </label>
              <select
                value={filterApplication}
                onChange={(e) => setFilterApplication(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Applications</option>
                {applications.map(app => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Package className="w-4 h-4 inline mr-1" />
                Release Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ReleaseType | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Types</option>
                <option value={ReleaseType.MAJOR}>Major</option>
                <option value={ReleaseType.MINOR}>Minor</option>
                <option value={ReleaseType.PATCH}>Patch</option>
                <option value={ReleaseType.HOTFIX}>Hotfix</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Publication Status
              </label>
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Table Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Release Data Table</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-blue-100 transition-colors group"
                  onClick={() => handleSort('title')}
                  style={{ width: '40%' }}
                >
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Release</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSortIcon('title')}
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-blue-100 transition-colors group"
                  onClick={() => handleSort('applicationName')}
                  style={{ width: '15%' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Application</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSortIcon('applicationName')}
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-blue-100 transition-colors group"
                  onClick={() => handleSort('version')}
                  style={{ width: '10%' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>Version</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSortIcon('version')}
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-blue-100 transition-colors group"
                  onClick={() => handleSort('type')}
                  style={{ width: '8%' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Type</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSortIcon('type')}
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-blue-100 transition-colors group"
                  onClick={() => handleSort('releaseDate')}
                  style={{ width: '18%' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Release Date</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSortIcon('releaseDate')}
                    </div>
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-blue-100 transition-colors group"
                  onClick={() => handleSort('isPublished')}
                  style={{ width: '9%' }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Status</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSortIcon('isPublished')}
                    </div>
                  </div>
                </th>


              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedAndFilteredReleases.map((release, index) => (
                <tr key={release._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {release.title}
                        </h3>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${release.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                          }`}>
                          {release.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        {release.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApplicationColors(release.applicationName).bg} ${getApplicationColors(release.applicationName).text}`}>
                      {release.applicationName}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-sm font-medium text-gray-900">
                      {release.version ? `v${release.version}` : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getReleaseTypeColor(release.type)}`}>
                      {release.type === 'major' && '🚀'}
                      {release.type === 'minor' && '✨'}
                      {release.type === 'patch' && '🔧'}
                      {release.type === 'hotfix' && '🔥'}
                      <span className="ml-1 capitalize">{release.type}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{new Date(release.releaseDate).toLocaleDateString()}</div>
                      {release.author?.name && (
                        <div className="text-xs text-gray-500">
                          {release.author.name}
                        </div>
                      )}
                    </div>
                  </td>



                </tr>
              ))}
            </tbody>
          </table>

          {sortedAndFilteredReleases.length === 0 && (
            <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No releases found</h3>
              <p className="text-gray-500 mb-4 max-w-sm mx-auto">
                No releases match your current filters. Try adjusting your search criteria or check back later.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        {sortedAndFilteredReleases.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span className="font-medium">
                    Showing {sortedAndFilteredReleases.length} of {releases.length} releases
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    Published: <span className="font-semibold text-green-600">
                      {sortedAndFilteredReleases.filter(r => r.isPublished).length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600">
                    Draft: <span className="font-semibold text-gray-600">
                      {sortedAndFilteredReleases.filter(r => !r.isPublished).length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">
                    Apps: <span className="font-semibold text-blue-600">{applications.length}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
