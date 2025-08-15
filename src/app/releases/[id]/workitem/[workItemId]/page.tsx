'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { Release, WorkItem, WorkItemType } from '@/types/release';
import { rolePermissions } from '@/types/user';
import {
    Package,
    ArrowLeft,
    Star,
    Bug,
    AlertTriangle,
    ExternalLink,
    Edit,
    Clock,
    User,
    Tag,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function WorkItemDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [release, setRelease] = useState<Release | null>(null);
    const [workItem, setWorkItem] = useState<WorkItem | null>(null);
    const [loading, setLoading] = useState(true);

    const permissions = user ? rolePermissions[user.role] : null;

    useEffect(() => {
        if (params.id && params.workItemId) {
            fetchReleaseAndWorkItem();
        }
    }, [params.id, params.workItemId]);

    const fetchReleaseAndWorkItem = async () => {
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

            const releaseData = await response.json();
            setRelease(releaseData);

            // Find the work item within the release
            const foundWorkItem = releaseData.workItems?.find(
                (item: WorkItem) => item._id === params.workItemId
            );

            if (!foundWorkItem) {
                toast.error('Work item not found');
                router.push(`/releases/${params.id}`);
                return;
            }

            setWorkItem(foundWorkItem);
        } catch (error) {
            console.error('Error fetching release and work item:', error);
            toast.error('Failed to fetch work item');
            router.push('/releases');
        } finally {
            setLoading(false);
        }
    };

    const getWorkItemTypeIcon = (type: WorkItemType) => {
        switch (type) {
            case WorkItemType.EPIC:
                return <Star className="w-5 h-5 text-purple-600" />;
            case WorkItemType.FEATURE:
                return <Package className="w-5 h-5 text-blue-600" />;
            case WorkItemType.USER_STORY:
                return <User className="w-5 h-5 text-green-600" />;
            case WorkItemType.BUG:
                return <Bug className="w-5 h-5 text-red-600" />;
            default:
                return <AlertTriangle className="w-5 h-5 text-gray-600" />;
        }
    };

    const getWorkItemTypeColor = (type: WorkItemType) => {
        switch (type) {
            case WorkItemType.EPIC:
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case WorkItemType.FEATURE:
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case WorkItemType.USER_STORY:
                return 'bg-green-100 text-green-800 border-green-200';
            case WorkItemType.BUG:
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getParentWorkItem = () => {
        if (!workItem?.parentId || !release?.workItems) return null;
        return release.workItems.find(item => item._id === workItem.parentId);
    };

    const getChildWorkItems = () => {
        if (!workItem?._id || !release?.workItems) return [];
        return release.workItems.filter(item => item.parentId === workItem._id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!release || !workItem) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Work Item Not Found</h1>
                    <p className="text-gray-600 mb-6">The work item you're looking for doesn't exist.</p>
                    <Link
                        href="/releases"
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Releases</span>
                    </Link>
                </div>
            </div>
        );
    }

    const parentWorkItem = getParentWorkItem();
    const childWorkItems = getChildWorkItems();

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {getWorkItemTypeIcon(workItem.type)}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{workItem.title}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getWorkItemTypeColor(workItem.type)}`}>
                                {workItem.type.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-500">
                                ID: {workItem._id ? workItem._id.slice(-8) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Link
                        href={`/releases/${params.id}`}
                        className="btn btn-secondary flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Release</span>
                    </Link>

                    {permissions?.canEditReleases && (
                        <button
                            onClick={() => router.push(`/releases/${params.id}?editWorkItem=${workItem._id}`)}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Work Item Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">


                    {/* Child Work Items */}
                    {childWorkItems.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Child Items ({childWorkItems.length})
                                </h2>
                            </div>
                            <div className="card-body">
                                <div className="space-y-3">
                                    {childWorkItems.map((child) => (
                                        <Link
                                            key={child._id}
                                            href={`/releases/${params.id}/workitem/${child._id}`}
                                            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {getWorkItemTypeIcon(child.type)}
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{child.title}</h3>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getWorkItemTypeColor(child.type)}`}>
                                                    {child.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Release Info */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-lg font-medium text-gray-900">Release</h2>
                        </div>
                        <div className="card-body">
                            <Link
                                href={`/releases/${params.id}`}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <Package className="w-4 h-4" />
                                <span>{release.title}</span>
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                            {release.version && (
                                <p className="text-sm text-gray-600 mt-2">Version: {release.version}</p>
                            )}
                        </div>
                    </div>

                    {/* Parent Work Item */}
                    {parentWorkItem && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-medium text-gray-900">Parent Item</h2>
                            </div>
                            <div className="card-body">
                                <Link
                                    href={`/releases/${params.id}/workitem/${parentWorkItem._id}`}
                                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {getWorkItemTypeIcon(parentWorkItem.type)}
                                    <span>{parentWorkItem.title}</span>
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-2 ${getWorkItemTypeColor(parentWorkItem.type)}`}>
                                    {parentWorkItem.type.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Work Item Details */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-lg font-medium text-gray-900">Details</h2>
                        </div>
                        <div className="card-body space-y-4">
                            {workItem.flagName && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Flag Name
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Tag className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-900">{workItem.flagName}</span>
                                    </div>
                                </div>
                            )}

                            {workItem.remarks && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remarks
                                    </label>
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{workItem.remarks}</p>
                                </div>
                            )}

                            {workItem.hyperlink && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hyperlink
                                    </label>
                                    <a
                                        href={workItem.hyperlink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-2"
                                    >
                                        <span className="text-sm break-all">{workItem.hyperlink}</span>
                                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                    </a>
                                </div>
                            )}

                            {workItem.actualHours && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Actual Hours
                                    </label>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Clock className="w-4 h-4 text-green-500" />
                                        <span>{workItem.actualHours}h</span>
                                    </div>
                                </div>
                            )}

                            {workItem.createdAt && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Created
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(workItem.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}

                            {workItem.updatedAt && workItem.updatedAt !== workItem.createdAt && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Updated
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(workItem.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
