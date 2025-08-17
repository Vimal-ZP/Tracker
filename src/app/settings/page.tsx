'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts';
import { rolePermissions, UserRole } from '@/types/user';
import { Shield, Settings as SettingsIcon, Database, Lock, Bell, Building, Info, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import ApplicationManagement from '@/components/settings/ApplicationManagement';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    if (!user) return null;

    const permissions = rolePermissions[user.role];

    if (!permissions.canManageSettings) {
        return (
            <div className="h-full flex flex-col space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Access Restricted</h3>
                        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                            You don't have the necessary permissions to manage system settings. Please contact your administrator for access.
                        </p>
                    </div>
                </div>
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
            description: 'Configure basic system preferences and appearance',
            icon: SettingsIcon,
            gradient: 'from-blue-500 to-indigo-600',
            bgGradient: 'from-blue-50 to-indigo-50',
            borderColor: 'border-blue-200',
            items: [
                { name: 'System Name', status: 'configured', description: 'Application display name' },
                { name: 'Time Zone', status: 'configured', description: 'Default timezone settings' },
                { name: 'Language', status: 'pending', description: 'Localization preferences' },
                { name: 'Theme', status: 'configured', description: 'UI appearance settings' }
            ],
        },
        {
            title: 'Database Settings',
            description: 'Manage database connections and performance',
            icon: Database,
            gradient: 'from-emerald-500 to-green-600',
            bgGradient: 'from-emerald-50 to-green-50',
            borderColor: 'border-emerald-200',
            items: [
                { name: 'Connection Pool', status: 'configured', description: 'Database connection management' },
                { name: 'Backup Schedule', status: 'configured', description: 'Automated backup configuration' },
                { name: 'Indexing', status: 'pending', description: 'Database index optimization' },
                { name: 'Cleanup', status: 'configured', description: 'Data retention policies' }
            ],
        },
        {
            title: 'Security Settings',
            description: 'Configure authentication and access controls',
            icon: Lock,
            gradient: 'from-red-500 to-rose-600',
            bgGradient: 'from-red-50 to-rose-50',
            borderColor: 'border-red-200',
            items: [
                { name: 'Password Policy', status: 'configured', description: 'Password strength requirements' },
                { name: 'Session Timeout', status: 'configured', description: 'User session management' },
                { name: 'Two-Factor Auth', status: 'pending', description: 'Enhanced security authentication' },
                { name: 'IP Restrictions', status: 'configured', description: 'Network access controls' }
            ],
        },
        {
            title: 'Notifications',
            description: 'Manage system alerts and communication',
            icon: Bell,
            gradient: 'from-purple-500 to-violet-600',
            bgGradient: 'from-purple-50 to-violet-50',
            borderColor: 'border-purple-200',
            items: [
                { name: 'Email Templates', status: 'configured', description: 'Notification message templates' },
                { name: 'Alert Rules', status: 'configured', description: 'System monitoring alerts' },
                { name: 'Delivery Settings', status: 'pending', description: 'Notification delivery preferences' },
                { name: 'Schedules', status: 'configured', description: 'Automated notification timing' }
            ],
        },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'applications':
                return <ApplicationManagement />;
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {settingsCategories.slice(0, 1).map((category) => (
                                <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                    <div className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                                                <category.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {category.title}
                                                </h3>
                                                <p className="text-gray-600 mb-4 leading-relaxed">
                                                    {category.description}
                                                </p>
                                                <div className="space-y-3">
                                                    {category.items.map((item) => (
                                                        <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`w-2 h-2 rounded-full ${item.status === 'configured' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                                    <div className="text-xs text-gray-500">{item.description}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {item.status === 'configured' ? (
                                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                                ) : (
                                                                    <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                                                                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* System Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                        <Info className="w-4 h-4 text-gray-600" />
                                    </div>
                                    System Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Version</dt>
                                        <dd className="text-xl font-bold text-gray-900">1.0.0</dd>
                                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Latest
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Environment</dt>
                                        <dd className="text-xl font-bold text-gray-900">Development</dd>
                                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Active
                                        </div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Last Updated</dt>
                                        <dd className="text-xl font-bold text-gray-900">{new Date().toLocaleDateString()}</dd>
                                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Today
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'database':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {settingsCategories.slice(1, 2).map((category) => (
                            <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                                            <category.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 leading-relaxed">
                                                {category.description}
                                            </p>
                                            <div className="space-y-3">
                                                {category.items.map((item) => (
                                                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                item.status === 'configured' ? 'bg-green-500' : 'bg-amber-500'
                                                            }`}></div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                                <div className="text-xs text-gray-500">{item.description}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {item.status === 'configured' ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                                                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {settingsCategories.slice(2, 3).map((category) => (
                            <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                                            <category.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 leading-relaxed">
                                                {category.description}
                                            </p>
                                            <div className="space-y-3">
                                                {category.items.map((item) => (
                                                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                item.status === 'configured' ? 'bg-green-500' : 'bg-amber-500'
                                                            }`}></div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                                <div className="text-xs text-gray-500">{item.description}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {item.status === 'configured' ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                                                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {settingsCategories.slice(3, 4).map((category) => (
                            <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                                <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${category.gradient} rounded-lg flex items-center justify-center text-white shadow-sm`}>
                                            <category.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-600 mb-4 leading-relaxed">
                                                {category.description}
                                            </p>
                                            <div className="space-y-3">
                                                {category.items.map((item) => (
                                                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                item.status === 'configured' ? 'bg-green-500' : 'bg-amber-500'
                                                            }`}></div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                                <div className="text-xs text-gray-500">{item.description}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {item.status === 'configured' ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                                                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
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
        <div className="h-full flex flex-col space-y-4">
            {/* Professional Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        {/* Left Section - Title and Icon */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                <SettingsIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
                                <p className="text-sm text-gray-600">Configure and customize your application environment</p>
                            </div>
                        </div>

                        {/* Right Section - Stats */}
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1.5">
                                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                                    <SettingsIcon className="w-3 h-3 text-blue-600" />
                                </div>
                                <span className="font-semibold text-gray-900">{visibleTabs.length}</span>
                                <span className="text-gray-600">Categories</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="font-semibold text-green-600">12</span>
                                <span className="text-gray-600">Configured</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                </div>
                                <span className="font-semibold text-amber-600">4</span>
                                <span className="text-gray-600">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        {visibleTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}
