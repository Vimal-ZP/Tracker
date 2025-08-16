'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import UserForm from './UserForm';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserList() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.getUsers({
                page: currentPage,
                limit: 10,
                search: searchTerm,
                role: roleFilter,
            });
            setUsers(response.users);
            setTotalPages(response.pagination.pages);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (userData: any) => {
        try {
            await apiClient.createUser(userData);
            toast.success('User created successfully');
            setShowCreateModal(false);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create user');
            throw error;
        }
    };

    const handleEditUser = async (userData: any) => {
        if (!selectedUser) return;

        try {
            await apiClient.updateUser(selectedUser._id, userData);
            toast.success('User updated successfully');
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
            throw error;
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;

        try {
            setActionLoading(user._id);
            await apiClient.deleteUser(user._id);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleUserStatus = async (user: User) => {
        try {
            setActionLoading(user._id);
            await apiClient.updateUser(user._id, { isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return 'badge-purple';
            case UserRole.ADMIN:
                return 'badge-blue';
            case UserRole.BASIC:
                return 'badge-green';
            default:
                return 'badge-gray';
        }
    };

    const getRoleDisplayName = (role: UserRole) => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return 'Super Admin';
            case UserRole.ADMIN:
                return 'Admin';
            case UserRole.BASIC:
                return 'Basic User';
            default:
                return role;
        }
    };

    const canEditUser = (user: User) => {
        if (currentUser?.role === UserRole.SUPER_ADMIN) return true;
        if (currentUser?.role === UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) return true;
        return false;
    };

    const canDeleteUser = (user: User) => {
        return currentUser?.role === UserRole.SUPER_ADMIN && user.role !== UserRole.SUPER_ADMIN;
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="card-body">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="input pl-10"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Filter className="h-5 w-5 text-gray-400" />
                                </div>
                                <select
                                    className="input pl-10"
                                    value={roleFilter}
                                    onChange={(e) => {
                                        setRoleFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option value="">All Roles</option>
                                    <option value={UserRole.BASIC}>Basic User</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Assigned Applications
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
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-primary-700">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleDisplayName(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.role === UserRole.SUPER_ADMIN ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    All Applications (Default)
                                                </span>
                                            ) : Array.isArray(user.assignedApplications) && user.assignedApplications.length > 0 ? (
                                                user.assignedApplications.map((application) => (
                                                    <span
                                                        key={application}
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {application}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">No applications assigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {user.isActive ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                            )}
                                            <span className={`text-sm ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            {canEditUser(user) && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-primary-600 hover:text-primary-900"
                                                    disabled={actionLoading === user._id}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                            )}

                                            {canEditUser(user) && (
                                                <button
                                                    onClick={() => handleToggleUserStatus(user)}
                                                    className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                                    disabled={actionLoading === user._id}
                                                >
                                                    {actionLoading === user._id ? (
                                                        <LoadingSpinner size="sm" />
                                                    ) : user.isActive ? (
                                                        <XCircle className="h-4 w-4" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}

                                            {canDeleteUser(user) && (
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-900"
                                                    disabled={actionLoading === user._id}
                                                >
                                                    {actionLoading === user._id ? (
                                                        <LoadingSpinner size="sm" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="btn-secondary"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="btn-secondary ml-3"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Page <span className="font-medium">{currentPage}</span> of{' '}
                                    <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="btn-secondary rounded-r-none"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="btn-secondary rounded-l-none"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create User Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New User"
                maxWidth="lg"
            >
                <UserForm
                    onSubmit={handleCreateUser}
                    onCancel={() => setShowCreateModal(false)}
                />
            </Modal>

            {/* Edit User Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                title="Edit User"
                maxWidth="lg"
            >
                {selectedUser && (
                    <UserForm
                        user={selectedUser}
                        onSubmit={handleEditUser}
                        onCancel={() => {
                            setShowEditModal(false);
                            setSelectedUser(null);
                        }}
                        isEditing
                    />
                )}
            </Modal>
        </div>
    );
}
