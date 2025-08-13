'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, CreateUserData, UserRole } from '@/types/user';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface UserContextType {
    users: User[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    searchTerm: string;
    roleFilter: string;
    selectedUser: User | null;

    // Actions
    fetchUsers: () => Promise<void>;
    createUser: (userData: CreateUserData) => Promise<void>;
    updateUser: (id: string, userData: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    toggleUserStatus: (id: string) => Promise<void>;
    setCurrentPage: (page: number) => void;
    setSearchTerm: (term: string) => void;
    setRoleFilter: (role: string) => void;
    setSelectedUser: (user: User | null) => void;
    clearUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = useCallback(async () => {
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
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, roleFilter]);

    const createUser = async (userData: CreateUserData) => {
        try {
            await apiClient.createUser(userData);
            toast.success('User created successfully');
            await fetchUsers(); // Refresh the list
        } catch (error: any) {
            toast.error(error.message || 'Failed to create user');
            throw error;
        }
    };

    const updateUser = async (id: string, userData: Partial<User>) => {
        try {
            await apiClient.updateUser(id, userData);
            toast.success('User updated successfully');
            await fetchUsers(); // Refresh the list

            // Update selected user if it's the one being updated
            if (selectedUser && selectedUser._id === id) {
                const updatedUser = { ...selectedUser, ...userData };
                setSelectedUser(updatedUser);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
            throw error;
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await apiClient.deleteUser(id);
            toast.success('User deleted successfully');
            await fetchUsers(); // Refresh the list

            // Clear selected user if it's the one being deleted
            if (selectedUser && selectedUser._id === id) {
                setSelectedUser(null);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
            throw error;
        }
    };

    const toggleUserStatus = async (id: string) => {
        try {
            const user = users.find(u => u._id === id);
            if (!user) return;

            await apiClient.updateUser(id, { isActive: !user.isActive });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            await fetchUsers(); // Refresh the list
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user status');
            throw error;
        }
    };

    const clearUsers = () => {
        setUsers([]);
        setCurrentPage(1);
        setTotalPages(1);
        setSearchTerm('');
        setRoleFilter('');
        setSelectedUser(null);
    };

    const value: UserContextType = {
        users,
        loading,
        currentPage,
        totalPages,
        searchTerm,
        roleFilter,
        selectedUser,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        setCurrentPage,
        setSearchTerm,
        setRoleFilter,
        setSelectedUser,
        clearUsers,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
