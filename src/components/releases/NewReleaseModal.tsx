'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Calendar, Package, FileText, Building, Tag, Settings } from 'lucide-react';
import { ReleaseType } from '@/types/release';
import { apiClient } from '@/lib/api';
import { Application } from '@/types/application';

interface NewReleaseFormData {
    releaseName: string;
    applicationName: string;
    version?: string;
    releaseDate: string;
    description: string;
    type: ReleaseType;
    isPublished: boolean;
}

interface NewReleaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: NewReleaseFormData) => void;
}

export default function NewReleaseModal({ isOpen, onClose, onSubmit }: NewReleaseModalProps) {
    const [formData, setFormData] = useState<NewReleaseFormData>({
        releaseName: '',
        applicationName: '',
        version: '',
        releaseDate: '',
        description: '',
        type: ReleaseType.MINOR,
        isPublished: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<NewReleaseFormData>>({});
    const [applications, setApplications] = useState<Application[]>([]);
    const [loadingApplications, setLoadingApplications] = useState(false);

    // Fetch applications when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchApplications();
        }
    }, [isOpen]);

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

    const handleInputChange = (field: keyof NewReleaseFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<NewReleaseFormData> = {};

        if (!formData.releaseName.trim()) {
            newErrors.releaseName = 'Release name is required';
        }

        if (!formData.applicationName.trim()) {
            newErrors.applicationName = 'Application name is required';
        }

        if (formData.version && formData.version.trim() && !/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(formData.version)) {
            newErrors.version = 'Version must follow semantic versioning format (e.g., 1.0.0)';
        }

        if (!formData.releaseDate) {
            newErrors.releaseDate = 'Release date is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        }



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(formData);
            // Reset form after successful submission
            setFormData({
                releaseName: '',
                applicationName: '',
                version: '',
                releaseDate: '',
                description: '',

                type: ReleaseType.MINOR,
                isPublished: false
            });
            setErrors({});
            onClose();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                releaseName: '',
                applicationName: '',
                version: '',
                releaseDate: '',
                description: '',

                type: ReleaseType.MINOR,
                isPublished: false
            });
            setErrors({});
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Release" maxWidth="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Release Name */}
                <div>
                    <label htmlFor="releaseName" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span>Release Name</span>
                            <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <input
                        type="text"
                        id="releaseName"
                        value={formData.releaseName}
                        onChange={(e) => handleInputChange('releaseName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.releaseName ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="e.g., Version 2.1.0 - Major Update"
                        disabled={isSubmitting}
                    />
                    {errors.releaseName && (
                        <p className="mt-1 text-sm text-red-600">{errors.releaseName}</p>
                    )}
                </div>

                {/* Application Name */}
                <div>
                    <label htmlFor="applicationName" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span>Application Name</span>
                            <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <select
                        id="applicationName"
                        value={formData.applicationName}
                        onChange={(e) => handleInputChange('applicationName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.applicationName ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={isSubmitting || loadingApplications}
                    >
                        <option value="">
                            {loadingApplications ? 'Loading applications...' : 'Select an application...'}
                        </option>
                        {applications.map((app) => (
                            <option key={app._id} value={app.name}>
                                {app.displayName}
                            </option>
                        ))}
                    </select>
                    {errors.applicationName && (
                        <p className="mt-1 text-sm text-red-600">{errors.applicationName}</p>
                    )}
                </div>

                {/* Version */}
                <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <span>Version</span>
                        </div>
                    </label>
                    <input
                        type="text"
                        id="version"
                        value={formData.version}
                        onChange={(e) => handleInputChange('version', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.version ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="e.g., 1.0.0, 2.1.3-beta.1"
                        disabled={isSubmitting}
                    />
                    {errors.version && (
                        <p className="mt-1 text-sm text-red-600">{errors.version}</p>
                    )}
                </div>

                {/* Release Date */}
                <div>
                    <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Release Date</span>
                            <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <input
                        type="date"
                        id="releaseDate"
                        value={formData.releaseDate}
                        onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.releaseDate ? 'border-red-500' : 'border-gray-300'
                            }`}
                        disabled={isSubmitting}
                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
                    />
                    {errors.releaseDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.releaseDate}</p>
                    )}
                </div>

                {/* Type */}
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span>Type</span>
                        </div>
                    </label>
                    <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value as ReleaseType)}
                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                        disabled={isSubmitting}
                    >
                        <option value={ReleaseType.MAJOR}>Major</option>
                        <option value={ReleaseType.MINOR}>Minor</option>
                        <option value={ReleaseType.PATCH}>Patch</option>
                        <option value={ReleaseType.HOTFIX}>Hotfix</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span>Description</span>
                            <span className="text-red-500">*</span>
                        </div>
                    </label>
                    <textarea
                        id="description"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Describe the key features, improvements, and changes in this release..."
                        disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center mt-1">
                        {errors.description ? (
                            <p className="text-sm text-red-600">{errors.description}</p>
                        ) : (
                            <p className="text-sm text-gray-500">
                                {formData.description.length}/500 characters
                            </p>
                        )}
                    </div>
                </div>

                {/* Published Status */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        disabled={isSubmitting}
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                        Published (make this release publicly available)
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <Package className="w-4 h-4" />
                                <span>Create Release</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal >
    );
}
