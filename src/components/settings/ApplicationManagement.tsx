'use client';

import React, { useState, useEffect } from 'react';
import { Application, CreateApplicationData, UpdateApplicationData } from '@/types/application';
import { UserRole } from '@/types/user';
import { useAuth } from '@/contexts';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Eye, 
    EyeOff,
    Building,
    AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ApplicationFormData extends CreateApplicationData {
    _id?: string;
}

export default function ApplicationManagement() {
    const { user } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showActiveOnly, setShowActiveOnly] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<Application | null>(null);

    const [formData, setFormData] = useState<ApplicationFormData>({
        name: '',
        displayName: '',
        description: '',
        isActive: true
    });

    const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});

    // Check if user is super admin
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

    useEffect(() => {
        fetchApplications();
    }, [searchTerm, showActiveOnly]);

    const fetchApplications = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (showActiveOnly) params.append('isActive', 'true');

            const response = await fetch(`/api/applications?${params}`);
            const data = await response.json();

            if (response.ok) {
                setApplications(data.applications);
            } else {
                toast.error(data.error || 'Failed to fetch applications');
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            toast.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (application?: Application) => {
        if (application) {
            setEditingApplication(application);
            setFormData({
                _id: application._id,
                name: application.name,
                displayName: application.displayName,
                description: application.description || '',
                isActive: application.isActive
            });
        } else {
            setEditingApplication(null);
            setFormData({
                name: '',
                displayName: '',
                description: '',
                isActive: true
            });
        }
        setErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingApplication(null);
        setFormData({
            name: '',
            displayName: '',
            description: '',
            isActive: true
        });
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<ApplicationFormData> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Application name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Application name must be at least 2 characters';
        } else if (formData.name.length > 50) {
            newErrors.name = 'Application name cannot exceed 50 characters';
        } else if (!/^[a-zA-Z0-9\s\-_.]+$/.test(formData.name)) {
            newErrors.name = 'Application name can only contain letters, numbers, spaces, hyphens, underscores, and dots';
        }

        if (!formData.displayName?.trim()) {
            newErrors.displayName = 'Display name is required';
        } else if (formData.displayName.length < 2) {
            newErrors.displayName = 'Display name must be at least 2 characters';
        } else if (formData.displayName.length > 100) {
            newErrors.displayName = 'Display name cannot exceed 100 characters';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const url = editingApplication 
                ? `/api/applications/${editingApplication._id}`
                : '/api/applications';
            
            const method = editingApplication ? 'PUT' : 'POST';
            
            const payload: CreateApplicationData | UpdateApplicationData = {
                name: formData.name?.trim(),
                displayName: formData.displayName?.trim(),
                description: formData.description?.trim() || undefined,
                isActive: formData.isActive
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                handleCloseModal();
                fetchApplications();
            } else {
                if (data.details) {
                    // Handle validation errors
                    data.details.forEach((detail: string) => toast.error(detail));
                } else {
                    toast.error(data.error || 'Failed to save application');
                }
            }
        } catch (error) {
            console.error('Error saving application:', error);
            toast.error('Failed to save application');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (application: Application) => {
        try {
            const response = await fetch(`/api/applications/${application._id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                setDeleteConfirm(null);
                fetchApplications();
            } else {
                toast.error(data.error || 'Failed to delete application');
            }
        } catch (error) {
            console.error('Error deleting application:', error);
            toast.error('Failed to delete application');
        }
    };

    const handleInputChange = (field: keyof ApplicationFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = !searchTerm || 
            app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = !showActiveOnly || app.isActive;
        
        return matchesSearch && matchesStatus;
    });

    if (!isSuperAdmin) {
        return (
            <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Only Super Admins can manage applications.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium text-gray-900">Application Management</h2>
                    <p className="text-sm text-gray-500">Manage system applications and their settings</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Application</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="activeOnly"
                        checked={showActiveOnly}
                        onChange={(e) => setShowActiveOnly(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="activeOnly" className="text-sm text-gray-700">
                        Active only
                    </label>
                </div>
            </div>

            {/* Applications Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Application
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Display Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        {searchTerm || showActiveOnly ? 'No applications match your filters' : 'No applications found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((application) => (
                                    <tr key={application._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Building className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {application.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{application.displayName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate" title={application.description}>
                                                {application.description || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                application.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {application.isActive ? (
                                                    <>
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3 h-3 mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(application.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(application)}
                                                    className="text-primary-600 hover:text-primary-900 p-1"
                                                    title="Edit application"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(application)}
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Delete application"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Application Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingApplication ? 'Edit Application' : 'Add New Application'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Application Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="e.g., NRE, Portal Plus"
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                            Display Name *
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            value={formData.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                            className={`input w-full ${errors.displayName ? 'border-red-500' : ''}`}
                            placeholder="e.g., Network Resource Engine, Portal Plus System"
                            disabled={isSubmitting}
                        />
                        {errors.displayName && (
                            <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className={`input w-full ${errors.description ? 'border-red-500' : ''}`}
                            rows={3}
                            placeholder="Brief description of the application..."
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="btn btn-secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    <span className="ml-2">
                                        {editingApplication ? 'Updating...' : 'Creating...'}
                                    </span>
                                </>
                            ) : (
                                editingApplication ? 'Update Application' : 'Create Application'
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Application"
            >
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-900">
                                Are you sure you want to delete the application <strong>{deleteConfirm?.name}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                This action cannot be undone. This may affect releases and user access.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                            className="btn btn-danger"
                        >
                            Delete Application
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
