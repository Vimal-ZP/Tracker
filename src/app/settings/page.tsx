'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts';
import { rolePermissions, UserRole } from '@/types/user';
import { Shield, Settings as SettingsIcon, Database, Lock, Bell, Building } from 'lucide-react';
import ApplicationManagement from '@/components/settings/ApplicationManagement';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    if (!user) return null;

    const permissions = rolePermissions[user.role];

    if (!permissions.canManageSettings) {
        return (
            <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
                <p className="mt-1 text-sm text-gray-500">
                    You don't have permission to manage system settings.
                </p>
            </div>
        );
    }

    const tabs = [
        {
            id: 'general',
            name: 'General',
            icon: SettingsIcon,
            description: 'Basic system configuration'
        },
        {
            id: 'applications',
            name: 'Applications',
            icon: Building,
            description: 'Manage system applications',
            superAdminOnly: true
        },
        {
            id: 'database',
            name: 'Database',
            icon: Database,
            description: 'Database configuration'
        },
        {
            id: 'security',
            name: 'Security',
            icon: Lock,
            description: 'Security policies'
        },
        {
            id: 'notifications',
            name: 'Notifications',
            icon: Bell,
            description: 'Notification settings'
        }
    ];

    const visibleTabs = tabs.filter(tab => 
        !tab.superAdminOnly || user.role === UserRole.SUPER_ADMIN
    );

    const settingsCategories = [
        {
            title: 'General Settings',
            description: 'Basic system configuration and preferences',
            icon: SettingsIcon,
            color: 'bg-blue-500',
            items: ['System Name', 'Time Zone', 'Language', 'Theme'],
        },
        {
            title: 'Database Settings',
            description: 'Database configuration and maintenance',
            icon: Database,
            color: 'bg-green-500',
            items: ['Connection Pool', 'Backup Schedule', 'Indexing', 'Cleanup'],
        },
        {
            title: 'Security Settings',
            description: 'Security policies and authentication settings',
            icon: Lock,
            color: 'bg-red-500',
            items: ['Password Policy', 'Session Timeout', 'Two-Factor Auth', 'IP Restrictions'],
        },
        {
            title: 'Notifications',
            description: 'Email and system notification preferences',
            icon: Bell,
            color: 'bg-purple-500',
            items: ['Email Templates', 'Alert Rules', 'Delivery Settings', 'Schedules'],
        },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'applications':
                return <ApplicationManagement />;
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {settingsCategories.slice(0, 1).map((category) => (
                                <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                    <div className="p-6">
                                        <div className="flex items-start">
                                            <div className={`flex-shrink-0 w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                                                <category.icon className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {category.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {category.description}
                                                </p>
                                                <div className="mt-3">
                                                    <ul className="text-sm text-gray-600 space-y-1">
                                                        {category.items.map((item) => (
                                                            <li key={item} className="flex items-center">
                                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-medium text-gray-900">System Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Version</dt>
                                        <dd className="mt-1 text-sm text-gray-900">1.0.0</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Environment</dt>
                                        <dd className="mt-1 text-sm text-gray-900">Development</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{new Date().toLocaleDateString()}</dd>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'database':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settingsCategories.slice(1, 2).map((category) => (
                            <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                                            <category.icon className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {category.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {category.description}
                                            </p>
                                            <div className="mt-3">
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {category.items.map((item) => (
                                                        <li key={item} className="flex items-center">
                                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'security':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settingsCategories.slice(2, 3).map((category) => (
                            <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                                            <category.icon className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {category.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {category.description}
                                            </p>
                                            <div className="mt-3">
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {category.items.map((item) => (
                                                        <li key={item} className="flex items-center">
                                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'notifications':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settingsCategories.slice(3, 4).map((category) => (
                            <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                                            <category.icon className="w-6 h-6" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {category.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {category.description}
                                            </p>
                                            <div className="mt-3">
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {category.items.map((item) => (
                                                        <li key={item} className="flex items-center">
                                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon className={`mr-2 h-5 w-5 ${
                                activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                            }`} />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
}
