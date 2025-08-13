'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types/user';
import { useAuth } from './AuthContext';

interface SystemSettings {
    siteName: string;
    siteDescription: string;
    allowRegistration: boolean;
    defaultUserRole: UserRole;
    sessionTimeout: number; // in minutes
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
    maintenanceMode: boolean;
    maintenanceMessage: string;
}

interface SecuritySettings {
    passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        preventReuse: number; // number of previous passwords to prevent reuse
    };
    sessionSettings: {
        timeout: number; // in minutes
        extendOnActivity: boolean;
        maxConcurrentSessions: number;
    };
    ipRestrictions: {
        enabled: boolean;
        allowedIPs: string[];
        blockedIPs: string[];
    };
    rateLimiting: {
        enabled: boolean;
        maxRequests: number;
        windowMs: number;
    };
}

interface NotificationSettings {
    emailNotifications: {
        enabled: boolean;
        newUserRegistration: boolean;
        userRoleChanged: boolean;
        securityAlerts: boolean;
        systemUpdates: boolean;
    };
    systemAlerts: {
        enabled: boolean;
        failedLogins: boolean;
        suspiciousActivity: boolean;
        systemErrors: boolean;
    };
}

interface SettingsContextType {
    systemSettings: SystemSettings;
    securitySettings: SecuritySettings;
    notificationSettings: NotificationSettings;
    loading: boolean;
    error: string | null;

    // Actions
    updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
    updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
    resetToDefaults: () => Promise<void>;
    exportSettings: () => string;
    importSettings: (settingsJson: string) => Promise<void>;
}

const defaultSystemSettings: SystemSettings = {
    siteName: 'Tracker',
    siteDescription: 'User Management System',
    allowRegistration: true,
    defaultUserRole: UserRole.BASIC,
    sessionTimeout: 60, // 1 hour
    maxLoginAttempts: 5,
    passwordMinLength: 6,
    requireEmailVerification: false,
    enableTwoFactor: false,
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please try again later.',
};

const defaultSecuritySettings: SecuritySettings = {
    passwordPolicy: {
        minLength: 6,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
        preventReuse: 3,
    },
    sessionSettings: {
        timeout: 60,
        extendOnActivity: true,
        maxConcurrentSessions: 3,
    },
    ipRestrictions: {
        enabled: false,
        allowedIPs: [],
        blockedIPs: [],
    },
    rateLimiting: {
        enabled: true,
        maxRequests: 100,
        windowMs: 15 * 60 * 1000, // 15 minutes
    },
};

const defaultNotificationSettings: NotificationSettings = {
    emailNotifications: {
        enabled: true,
        newUserRegistration: true,
        userRoleChanged: true,
        securityAlerts: true,
        systemUpdates: false,
    },
    systemAlerts: {
        enabled: true,
        failedLogins: true,
        suspiciousActivity: true,
        systemErrors: true,
    },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
    children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const { user } = useAuth();
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(defaultSecuritySettings);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load settings from localStorage on mount
    useEffect(() => {
        loadSettingsFromStorage();
    }, []);

    const loadSettingsFromStorage = () => {
        try {
            const savedSystemSettings = localStorage.getItem('systemSettings');
            const savedSecuritySettings = localStorage.getItem('securitySettings');
            const savedNotificationSettings = localStorage.getItem('notificationSettings');

            if (savedSystemSettings) {
                setSystemSettings({ ...defaultSystemSettings, ...JSON.parse(savedSystemSettings) });
            }
            if (savedSecuritySettings) {
                setSecuritySettings({ ...defaultSecuritySettings, ...JSON.parse(savedSecuritySettings) });
            }
            if (savedNotificationSettings) {
                setNotificationSettings({ ...defaultNotificationSettings, ...JSON.parse(savedNotificationSettings) });
            }
        } catch (err) {
            console.error('Failed to load settings from storage:', err);
        }
    };

    const saveSettingsToStorage = (
        system?: SystemSettings,
        security?: SecuritySettings,
        notification?: NotificationSettings
    ) => {
        try {
            if (system) {
                localStorage.setItem('systemSettings', JSON.stringify(system));
            }
            if (security) {
                localStorage.setItem('securitySettings', JSON.stringify(security));
            }
            if (notification) {
                localStorage.setItem('notificationSettings', JSON.stringify(notification));
            }
        } catch (err) {
            console.error('Failed to save settings to storage:', err);
        }
    };

    const updateSystemSettings = async (newSettings: Partial<SystemSettings>) => {
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Insufficient permissions to update system settings');
        }

        try {
            setLoading(true);
            setError(null);

            const updatedSettings = { ...systemSettings, ...newSettings };
            setSystemSettings(updatedSettings);
            saveSettingsToStorage(updatedSettings);

            // In a real app, you would make an API call here
            // await apiClient.updateSystemSettings(updatedSettings);

        } catch (err: any) {
            setError(err.message || 'Failed to update system settings');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateSecuritySettings = async (newSettings: Partial<SecuritySettings>) => {
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Insufficient permissions to update security settings');
        }

        try {
            setLoading(true);
            setError(null);

            const updatedSettings = { ...securitySettings, ...newSettings };
            setSecuritySettings(updatedSettings);
            saveSettingsToStorage(undefined, updatedSettings);

            // In a real app, you would make an API call here
            // await apiClient.updateSecuritySettings(updatedSettings);

        } catch (err: any) {
            setError(err.message || 'Failed to update security settings');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateNotificationSettings = async (newSettings: Partial<NotificationSettings>) => {
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Insufficient permissions to update notification settings');
        }

        try {
            setLoading(true);
            setError(null);

            const updatedSettings = { ...notificationSettings, ...newSettings };
            setNotificationSettings(updatedSettings);
            saveSettingsToStorage(undefined, undefined, updatedSettings);

            // In a real app, you would make an API call here
            // await apiClient.updateNotificationSettings(updatedSettings);

        } catch (err: any) {
            setError(err.message || 'Failed to update notification settings');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const resetToDefaults = async () => {
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Insufficient permissions to reset settings');
        }

        try {
            setLoading(true);
            setError(null);

            setSystemSettings(defaultSystemSettings);
            setSecuritySettings(defaultSecuritySettings);
            setNotificationSettings(defaultNotificationSettings);

            // Clear localStorage
            localStorage.removeItem('systemSettings');
            localStorage.removeItem('securitySettings');
            localStorage.removeItem('notificationSettings');

            // In a real app, you would make an API call here
            // await apiClient.resetSettingsToDefaults();

        } catch (err: any) {
            setError(err.message || 'Failed to reset settings');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const exportSettings = (): string => {
        const allSettings = {
            system: systemSettings,
            security: securitySettings,
            notifications: notificationSettings,
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
        };

        return JSON.stringify(allSettings, null, 2);
    };

    const importSettings = async (settingsJson: string) => {
        if (!user || user.role !== UserRole.SUPER_ADMIN) {
            throw new Error('Insufficient permissions to import settings');
        }

        try {
            setLoading(true);
            setError(null);

            const importedSettings = JSON.parse(settingsJson);

            if (importedSettings.system) {
                const validatedSystemSettings = { ...defaultSystemSettings, ...importedSettings.system };
                setSystemSettings(validatedSystemSettings);
                saveSettingsToStorage(validatedSystemSettings);
            }

            if (importedSettings.security) {
                const validatedSecuritySettings = { ...defaultSecuritySettings, ...importedSettings.security };
                setSecuritySettings(validatedSecuritySettings);
                saveSettingsToStorage(undefined, validatedSecuritySettings);
            }

            if (importedSettings.notifications) {
                const validatedNotificationSettings = { ...defaultNotificationSettings, ...importedSettings.notifications };
                setNotificationSettings(validatedNotificationSettings);
                saveSettingsToStorage(undefined, undefined, validatedNotificationSettings);
            }

            // In a real app, you would make API calls here
            // await apiClient.importSettings(importedSettings);

        } catch (err: any) {
            setError(err.message || 'Failed to import settings');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value: SettingsContextType = {
        systemSettings,
        securitySettings,
        notificationSettings,
        loading,
        error,
        updateSystemSettings,
        updateSecuritySettings,
        updateNotificationSettings,
        resetToDefaults,
        exportSettings,
        importSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
