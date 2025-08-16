'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { Release, ReleaseType, FeatureCategory } from '@/types/release';
import { Application } from '@/types/application';
import { rolePermissions } from '@/types/user';
import { apiClient } from '@/lib/api';
import {
    Package,
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface EditReleaseFormData {
    title: string;
    applicationName: string;
    description: string;
    releaseDate: string;

    type: ReleaseType;
    version?: string;
    isPublished: boolean;
    features: Array<{
        title: string;
        description: string;
        category: FeatureCategory;
    }>;
    bugFixes: string[];
    breakingChanges: string[];
}

export default function EditReleasePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [release, setRelease] = useState<Release | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [formData, setFormData] = useState<EditReleaseFormData>({
        title: '',
        applicationName: '',
        description: '',
        releaseDate: '',

        type: ReleaseType.MINOR,
        version: '',
        isPublished: false,
        features: [],
        bugFixes: [],
        breakingChanges: []
    });

    const permissions = user ? rolePermissions[user.role] : null;

    useEffect(() => {
        if (params.id) {
            fetchRelease();
            fetchApplications();
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

            // Populate form data
            setFormData({
                title: data.title || '',
                applicationName: data.applicationName || '',
                description: data.description || '',
                releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString().split('T')[0] : '',

                type: data.type || ReleaseType.MINOR,
                version: data.version || '',
                isPublished: data.isPublished || false,
                features: data.features || [],
                bugFixes: data.bugFixes || [],
                breakingChanges: data.breakingChanges || []
            });
        } catch (error) {
            console.error('Error fetching release:', error);
            toast.error('Failed to fetch release');
            router.push('/releases');
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoadingApplications(true);
            const data = await apiClient.getApplications({ isActive: true });
            setApplications(data.applications);
        } catch (error) {
            console.error('Error fetching applications:', error);
            // Fallback to hardcoded options if API fails
            setApplications([
                { _id: '1', name: 'NRE', displayName: 'Network Resource Engine', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                { _id: '2', name: 'NVE', displayName: 'Network Virtualization Engine', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                { _id: '3', name: 'E-Vite', displayName: 'E-Vite System', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                { _id: '4', name: 'Portal Plus', displayName: 'Portal Plus System', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                { _id: '5', name: 'Fast 2.0', displayName: 'Fast 2.0 System', isActive: true, createdAt: new Date(), updatedAt: new Date() },
                { _id: '6', name: 'FMS', displayName: 'Fleet Management System', isActive: true, createdAt: new Date(), updatedAt: new Date() }
            ]);
        } finally {
            setLoadingApplications(false);
        }
    };

    const handleInputChange = (field: keyof EditReleaseFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayAdd = (field: 'bugFixes' | 'breakingChanges', value: string) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }));
        }
    };

    const handleArrayRemove = (field: 'bugFixes' | 'breakingChanges', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleFeatureAdd = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, { title: '', description: '', category: FeatureCategory.NEW }]
        }));
    };

    const handleFeatureRemove = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleFeatureChange = (index: number, field: keyof typeof formData.features[0], value: any) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) =>
                i === index ? { ...feature, [field]: value } : feature
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!permissions?.canCreateUsers) {
            toast.error('You do not have permission to edit releases');
            return;
        }

        try {
            setSaving(true);

            const updateData = {
                ...formData,
                releaseDate: new Date(formData.releaseDate).toISOString()
            };

            const response = await fetch(`/api/releases/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update release');
            }

            toast.success('Release updated successfully!');
            router.push(`/releases/${params.id}`);
        } catch (error: any) {
            console.error('Error updating release:', error);
            toast.error(error.message || 'Failed to update release');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    if (!permissions?.canCreateUsers) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        You do not have permission to edit releases.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/releases"
                            className="btn btn-primary"
                        >
                            Back to Releases
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 w-8 h-8"></div>
            </div>
        );
    }

    if (!release) {
        return (
            <div className="h-full flex flex-col items-center justify-center">
                <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Release Not Found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        The release you're looking for doesn't exist.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/releases"
                            className="btn btn-primary"
                        >
                            Back to Releases
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Package className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Release</h1>
                        {release.version && (
                            <p className="text-sm text-gray-500">Version {release.version}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Link
                        href={`/releases/${release._id}`}
                        className="btn btn-secondary flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                </div>
            </div>

            {/* Edit Form */}
            <div className="flex-1 overflow-auto">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                    {/* Basic Information */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                        </div>
                        <div className="card-body space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Release Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="applicationName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Application Name *
                                    </label>
                                    <select
                                        id="applicationName"
                                        value={formData.applicationName}
                                        onChange={(e) => handleInputChange('applicationName', e.target.value)}
                                        className="input w-full"
                                        required
                                        disabled={saving || loadingApplications}
                                    >
                                        <option value="">
                                            {loadingApplications ? 'Loading applications...' : 'Select an application...'}
                                        </option>
                                        {applications.map((app) => (
                                            <option key={app._id} value={app.name}>
                                                {app.name} - {app.displayName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                                        Version
                                    </label>
                                    <input
                                        type="text"
                                        id="version"
                                        value={formData.version}
                                        onChange={(e) => handleInputChange('version', e.target.value)}
                                        className="input w-full"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Release Date *
                                    </label>
                                    <input
                                        type="date"
                                        id="releaseDate"
                                        value={formData.releaseDate}
                                        onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                                        className="input w-full"
                                        required
                                    />
                                </div>



                                <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => handleInputChange('type', e.target.value as ReleaseType)}
                                        className="input w-full"
                                    >
                                        <option value={ReleaseType.MAJOR}>Major</option>
                                        <option value={ReleaseType.MINOR}>Minor</option>
                                        <option value={ReleaseType.PATCH}>Patch</option>
                                        <option value={ReleaseType.HOTFIX}>Hotfix</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="input w-full"
                                    required
                                />
                            </div>



                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={formData.isPublished}
                                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                                    Published
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pb-6">
                        <Link
                            href={`/releases/${release._id}`}
                            className="btn btn-secondary flex items-center space-x-2"
                        >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
