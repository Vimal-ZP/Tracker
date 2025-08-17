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
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {settingsCategories.slice(0, 1).map((category) => (
                                <div key={category.title} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.bgGradient} border-2 ${category.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                    <div className="relative p-8">
                                        <div className="flex items-start space-x-6">
                                            <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                                <category.icon className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {category.title}
                                                </h3>
                                                <p className="text-gray-700 mb-6 leading-relaxed">
                                                    {category.description}
                                                </p>
                                                <div className="space-y-4">
                                                    {category.items.map((item) => (
                                                        <div key={item.name} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-200">
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`w-2 h-2 rounded-full ${item.status === 'configured' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">{item.name}</div>
                                                                    <div className="text-xs text-gray-600">{item.description}</div>
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
                                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
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
                        
                        {/* Enhanced System Information */}
                        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border-2 border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-100 to-gray-200 px-8 py-6 border-b border-slate-300">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">System Information</h2>
                                        <p className="text-gray-600">Current system status and configuration</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Version</dt>
                                        <dd className="text-2xl font-bold text-gray-900">1.0.0</dd>
                                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Latest
                                        </div>
                                    </div>
                                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Environment</dt>
                                        <dd className="text-2xl font-bold text-gray-900">Development</dd>
                                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Active
                                        </div>
                                    </div>
                                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Updated</dt>
                                        <dd className="text-2xl font-bold text-gray-900">{new Date().toLocaleDateString()}</dd>
                                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {settingsCategories.slice(1, 2).map((category) => (
                            <div key={category.title} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.bgGradient} border-2 ${category.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative p-8">
                                    <div className="flex items-start space-x-6">
                                        <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                            <category.icon className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-700 mb-6 leading-relaxed">
                                                {category.description}
                                            </p>
                                            <div className="space-y-4">
                                                {category.items.map((item) => (
                                                    <div key={item.name} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-200">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                item.status === 'configured' ? 'bg-green-500' : 'bg-amber-500'
                                                            }`}></div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{item.name}</div>
                                                                <div className="text-xs text-gray-600">{item.description}</div>
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
                                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {settingsCategories.slice(2, 3).map((category) => (
                            <div key={category.title} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.bgGradient} border-2 ${category.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative p-8">
                                    <div className="flex items-start space-x-6">
                                        <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                            <category.icon className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-700 mb-6 leading-relaxed">
                                                {category.description}
                                            </p>
                                            <div className="space-y-4">
                                                {category.items.map((item) => (
                                                    <div key={item.name} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-200">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                item.status === 'configured' ? 'bg-green-500' : 'bg-amber-500'
                                                            }`}></div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{item.name}</div>
                                                                <div className="text-xs text-gray-600">{item.description}</div>
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
                                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {settingsCategories.slice(3, 4).map((category) => (
                            <div key={category.title} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${category.bgGradient} border-2 ${category.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="relative p-8">
                                    <div className="flex items-start space-x-6">
                                        <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                                            <category.icon className="w-8 h-8" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {category.title}
                                            </h3>
                                            <p className="text-gray-700 mb-6 leading-relaxed">
                                                {category.description}
                                            </p>
                                            <div className="space-y-4">
                                                {category.items.map((item) => (
                                                    <div key={item.name} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/80 transition-all duration-200">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-2 h-2 rounded-full ${
                                                                item.status === 'configured' ? 'bg-green-500' : 'bg-amber-500'
                                                            }`}></div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900">{item.name}</div>
                                                                <div className="text-xs text-gray-600">{item.description}</div>
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
                                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
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
        <div className="h-full flex flex-col space-y-6">
            {/* Elegant Header */}
            <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="relative p-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/50 to-indigo-200/30 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-200/20 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <SettingsIcon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Configure and customize your application environment with precision and control
                            </p>
                        </div>
                        <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Professional</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Elegant Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-1">
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50">
                    <nav className="flex overflow-x-auto scrollbar-hide">
                        {visibleTabs.map((tab, index) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group relative flex items-center space-x-3 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'text-blue-600 bg-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                }`}>
                                    <tab.icon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">{tab.name}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{tab.description}</div>
                                </div>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Enhanced Tab Content */}
                <div className="p-8 flex-1 overflow-y-auto">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}
