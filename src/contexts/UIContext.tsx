'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';
type SidebarState = 'open' | 'closed' | 'collapsed';

interface UIContextType {
    // Theme
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;

    // Sidebar
    sidebarState: SidebarState;
    isSidebarOpen: boolean;
    setSidebarState: (state: SidebarState) => void;
    toggleSidebar: () => void;
    closeSidebar: () => void;
    openSidebar: () => void;

    // Modals
    modals: Record<string, boolean>;
    openModal: (modalId: string) => void;
    closeModal: (modalId: string) => void;
    toggleModal: (modalId: string) => void;
    closeAllModals: () => void;

    // Loading states
    globalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;

    // Notifications
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;

    // Mobile detection
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    timestamp: Date;
    autoClose?: boolean;
    duration?: number;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
    children: React.ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
    const [sidebarState, setSidebarState] = useState<SidebarState>('closed');
    const [modals, setModals] = useState<Record<string, boolean>>({});
    const [globalLoading, setGlobalLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);

    // Theme management
    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Resolve theme based on system preference
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
        }

        const updateResolvedTheme = () => {
            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                setResolvedTheme(systemTheme);
            } else {
                setResolvedTheme(theme);
            }
        };

        updateResolvedTheme();

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', updateResolvedTheme);

        return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
    }, [theme]);

    // Apply theme to document
    useEffect(() => {
        if (typeof window === 'undefined') return;
        document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    }, [resolvedTheme]);

    // Responsive breakpoint detection
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const updateBreakpoints = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
            setIsDesktop(width >= 1024);
        };

        updateBreakpoints();
        window.addEventListener('resize', updateBreakpoints);

        return () => window.removeEventListener('resize', updateBreakpoints);
    }, []);

    // Sidebar management
    const isSidebarOpen = sidebarState === 'open';

    const toggleSidebar = () => {
        setSidebarState(prev => prev === 'open' ? 'closed' : 'open');
    };

    const closeSidebar = () => {
        setSidebarState('closed');
    };

    const openSidebar = () => {
        setSidebarState('open');
    };

    // Auto-close sidebar on mobile when clicking outside
    useEffect(() => {
        if (isMobile && sidebarState === 'open') {
            const handleClickOutside = (event: MouseEvent) => {
                const sidebar = document.getElementById('sidebar');
                if (sidebar && !sidebar.contains(event.target as Node)) {
                    closeSidebar();
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMobile, sidebarState]);

    // Modal management
    const openModal = (modalId: string) => {
        setModals(prev => ({ ...prev, [modalId]: true }));
    };

    const closeModal = (modalId: string) => {
        setModals(prev => ({ ...prev, [modalId]: false }));
    };

    const toggleModal = (modalId: string) => {
        setModals(prev => ({ ...prev, [modalId]: !prev[modalId] }));
    };

    const closeAllModals = () => {
        setModals({});
    };

    // Notification management
    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            autoClose: notification.autoClose ?? true,
            duration: notification.duration ?? 5000,
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Auto-remove notification
        if (newNotification.autoClose) {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, newNotification.duration);
        }
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Escape key closes modals
            if (event.key === 'Escape') {
                closeAllModals();
            }

            // Ctrl/Cmd + K opens search (if implemented)
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                openModal('search');
            }

            // Ctrl/Cmd + B toggles sidebar
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                toggleSidebar();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const value: UIContextType = {
        theme,
        resolvedTheme,
        setTheme,
        sidebarState,
        isSidebarOpen,
        setSidebarState,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        modals,
        openModal,
        closeModal,
        toggleModal,
        closeAllModals,
        globalLoading,
        setGlobalLoading,
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        isMobile,
        isTablet,
        isDesktop,
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}
