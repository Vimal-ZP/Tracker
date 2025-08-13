'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts';
import { rolePermissions } from '@/types/user';
import {
    Home,
    Users,
    BarChart3,
    Settings,
    Shield,
    X
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const permissions = rolePermissions[user.role];

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: Home,
            show: true,
        },
        {
            name: 'Users',
            href: '/users',
            icon: Users,
            show: permissions.canViewAllUsers,
        },
        {
            name: 'Reports',
            href: '/reports',
            icon: BarChart3,
            show: permissions.canViewReports,
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            show: permissions.canManageSettings,
        },
    ].filter(item => item.show);

    return (
        <>
            {/* Mobile sidebar overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
                </div>
            )}

            {/* Sidebar */}
            <div className={clsx(
                'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Mobile header */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden flex-shrink-0">
                    <div className="flex items-center">
                        <Shield className="h-8 w-8 text-primary-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900">Tracker</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Desktop logo - hidden on mobile */}
                <div className="hidden lg:flex items-center h-16 px-6 border-b border-gray-200 flex-shrink-0">
                    <Shield className="h-8 w-8 text-primary-600" />
                    <span className="ml-2 text-xl font-bold text-gray-900">Tracker</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => onClose()}
                                        className={clsx(
                                            'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                                            isActive
                                                ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600 shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        )}
                                    >
                                        <item.icon
                                            className={clsx(
                                                'mr-3 h-5 w-5',
                                                isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User info at bottom */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary-700">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
