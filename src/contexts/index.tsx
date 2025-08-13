'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';
import { UserProvider } from './UserContext';
import { DashboardProvider } from './DashboardContext';
import { UIProvider } from './UIContext';
import { SettingsProvider } from './SettingsContext';
import { ReportsProvider } from './ReportsContext';

interface AppProvidersProps {
    children: React.ReactNode;
}

/**
 * Combined provider component that wraps the entire application
 * with all necessary context providers in the correct order.
 * 
 * Provider hierarchy (outer to inner):
 * 1. UIProvider - Theme, sidebar, modals, notifications
 * 2. AuthProvider - Authentication state
 * 3. SettingsProvider - System settings (depends on auth)
 * 4. UserProvider - User management (depends on auth)
 * 5. DashboardProvider - Dashboard data (depends on auth)
 * 6. ReportsProvider - Reports and analytics (depends on auth)
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <UIProvider>
            <AuthProvider>
                <SettingsProvider>
                    <UserProvider>
                        <DashboardProvider>
                            <ReportsProvider>
                                {children}
                            </ReportsProvider>
                        </DashboardProvider>
                    </UserProvider>
                </SettingsProvider>
            </AuthProvider>
        </UIProvider>
    );
}

// Export individual providers for selective usage
export { AuthProvider } from './AuthContext';
export { UserProvider } from './UserContext';
export { DashboardProvider } from './DashboardContext';
export { UIProvider } from './UIContext';
export { SettingsProvider } from './SettingsContext';
export { ReportsProvider } from './ReportsContext';

// Export hooks for easy access
export { useAuth } from './AuthContext';
export { useUser } from './UserContext';
export { useDashboard } from './DashboardContext';
export { useUI } from './UIContext';
export { useSettings } from './SettingsContext';
export { useReports } from './ReportsContext';
