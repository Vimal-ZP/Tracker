'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { Release, ReleaseStatus, ReleaseType, FeatureCategory } from '@/types/release';
import { rolePermissions } from '@/types/user';
import { 
  Package, 
  Calendar, 
  Download, 
  Edit,
  ArrowLeft,
  Tag,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Bug,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ReleaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);

  const permissions = user ? rolePermissions[user.role] : null;

  useEffect(() => {
    if (params.id) {
      fetchRelease();
    }
  }, [params.id]);

  const fetchRelease = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/releases/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Release not found');
          router.push('/releases');
          return;
        }
        throw new Error('Failed to fetch release');
      }

      const data = await response.json();
      setRelease(data);
    } catch (error) {
      console.error('Error fetching release:', error);
      toast.error('Failed to fetch release');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!release?.downloadUrl) return;

    try {
      // Increment download count
      await fetch(`/api/releases/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'increment_download' })
      });

      // Open download URL
      window.open(release.downloadUrl, '_blank');
      
      // Update local state
      setRelease(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error handling download:', error);
      toast.error('Failed to process download');
    }
  };

  const getStatusIcon = (status: ReleaseStatus) => {
    switch (status) {
      case ReleaseStatus.DRAFT:
        return <Clock className="w-5 h-5 text-gray-500" />;
      case ReleaseStatus.BETA:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case ReleaseStatus.STABLE:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case ReleaseStatus.DEPRECATED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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

  const getCategoryIcon = (category: FeatureCategory) => {
    switch (category) {
      case FeatureCategory.NEW:
        return <Star className="w-4 h-4 text-blue-500" />;
      case FeatureCategory.IMPROVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case FeatureCategory.SECURITY:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case FeatureCategory.PERFORMANCE:
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <Star className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Release not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The release you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/releases" className="mt-4 btn btn-primary">
          Back to Releases
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/releases"
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Releases</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{release.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="flex items-center space-x-1 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">v{release.version}</span>
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                  {getStatusIcon(release.status)}
                  <span className="ml-1">{release.status}</span>
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(release.type)}`}>
                  {release.type}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {release.downloadUrl && (
            <button
              onClick={handleDownload}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
          
          {permissions?.canManageUsers && (
            <Link
              href={`/releases/${release._id}/edit`}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
          )}
        </div>
      </div>

      {/* Release Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-700 whitespace-pre-wrap">{release.description}</p>
            </div>
          </div>

          {/* Features */}
          {release.features && release.features.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">New Features & Improvements</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {release.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {getCategoryIcon(feature.category)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {feature.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bug Fixes */}
          {release.bugFixes && release.bugFixes.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Bug className="w-5 h-5 text-green-600" />
                  <span>Bug Fixes</span>
                </h2>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {release.bugFixes.map((fix, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Breaking Changes */}
          {release.breakingChanges && release.breakingChanges.length > 0 && (
            <div className="card border-red-200">
              <div className="card-header bg-red-50">
                <h2 className="text-lg font-medium text-red-900 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Breaking Changes</span>
                </h2>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {release.breakingChanges.map((change, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Release Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Release Details</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Release Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(release.releaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Downloads</p>
                  <p className="text-sm text-gray-600">{release.downloadCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Author</p>
                  <p className="text-sm text-gray-600">{release.author.name}</p>
                </div>
              </div>

              {release.downloadUrl && (
                <div className="pt-4 border-t border-gray-200">
                  <a
                    href={release.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Download Link</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Publication Status */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Publication Status</h2>
            </div>
            <div className="card-body">
              <div className="flex items-center space-x-2">
                {release.isPublished ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Published</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Draft</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {release.isPublished 
                  ? 'This release is publicly available'
                  : 'This release is not yet published'
                }
              </p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Timestamps</h2>
            </div>
            <div className="card-body space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-600">
                  {new Date(release.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-600">
                  {new Date(release.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
