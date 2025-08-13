'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { UserRole, rolePermissions } from '@/types/user';
import {
    User,
    Settings,
    LogOut,
    Users,
    BarChart3,
    Shield,
    Menu
} from 'lucide-react';

interface NavbarProps {
    onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
    const router = useRouter();
    const { user, logout } = useAuth();

    if (!user) return null;

    const permissions = rolePermissions[user.role];

    const handleLogout = () => {
        console.log('Logout button clicked');
        logout();
        console.log('Logout completed, redirecting to login');
        router.push('/login');
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

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={onToggleSidebar}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <Link href="/dashboard" className="flex items-center lg:hidden">
                            <Shield className="h-8 w-8 text-primary-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">Tracker</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </Link>

                            {permissions.canViewAllUsers && (
                                <Link
                                    href="/users"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <Users className="h-4 w-4 mr-1" />
                                    Users
                                </Link>
                            )}

                            {permissions.canViewReports && (
                                <Link
                                    href="/reports"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <BarChart3 className="h-4 w-4 mr-1" />
                                    Reports
                                </Link>
                            )}

                            {permissions.canManageSettings && (
                                <Link
                                    href="/settings"
                                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                                >
                                    <Settings className="h-4 w-4 mr-1" />
                                    Settings
                                </Link>
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                </div>
                                <span className={`badge ${getRoleBadgeColor(user.role)}`}>
                                    {getRoleDisplayName(user.role)}
                                </span>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                <LogOut className="h-4 w-4 mr-1" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
