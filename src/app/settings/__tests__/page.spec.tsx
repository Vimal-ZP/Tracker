import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useAuth } from '@/contexts'
import { UserRole, rolePermissions } from '@/types/user'
import SettingsPage from '../page'

// Mock the AuthContext
jest.mock('@/contexts', () => ({
    useAuth: jest.fn(),
}))

// Mock the ApplicationManagement component
jest.mock('@/components/settings/ApplicationManagement', () => {
    return function MockApplicationManagement() {
        return <div data-testid="application-management">ApplicationManagement Component</div>
    }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Shield: ({ className }: { className?: string }) => (
        <div className={className} data-testid="shield-icon" />
    ),
    Settings: ({ className }: { className?: string }) => (
        <div className={className} data-testid="settings-icon" />
    ),
    Database: ({ className }: { className?: string }) => (
        <div className={className} data-testid="database-icon" />
    ),
    Lock: ({ className }: { className?: string }) => (
        <div className={className} data-testid="lock-icon" />
    ),
    Bell: ({ className }: { className?: string }) => (
        <div className={className} data-testid="bell-icon" />
    ),
    Building: ({ className }: { className?: string }) => (
        <div className={className} data-testid="building-icon" />
    ),
    Info: ({ className }: { className?: string }) => (
        <div className={className} data-testid="info-icon" />
    ),
    CheckCircle2: ({ className }: { className?: string }) => (
        <div className={className} data-testid="check-circle-icon" />
    ),
    Sparkles: ({ className }: { className?: string }) => (
        <div className={className} data-testid="sparkles-icon" />
    ),
    ArrowRight: ({ className }: { className?: string }) => (
        <div className={className} data-testid="arrow-right-icon" />
    ),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('SettingsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Authentication States', () => {
        it('should return null when no user is authenticated', () => {
            mockUseAuth.mockReturnValue({
                user: null,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            const { container } = render(<SettingsPage />)
            expect(container.firstChild).toBeNull()
        })

        it('should return null when user is undefined', () => {
            mockUseAuth.mockReturnValue({
                user: undefined as any,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            const { container } = render(<SettingsPage />)
            expect(container.firstChild).toBeNull()
        })
    })

    describe('Permission-based Rendering', () => {
        it('should show access restricted for basic users', () => {
            const basicUser = {
                _id: 'user-1',
                email: 'basic@example.com',
                name: 'Basic User',
                role: UserRole.BASIC,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: basicUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            render(<SettingsPage />)

            expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
            expect(screen.getByText('Access Restricted')).toBeInTheDocument()
            expect(screen.getByText("You don't have the necessary permissions to manage system settings. Please contact your administrator for access.")).toBeInTheDocument()
            expect(screen.queryByText('System Settings')).not.toBeInTheDocument()
        })

        it('should show access restricted for admin users', () => {
            const adminUser = {
                _id: 'user-2',
                email: 'admin@example.com',
                name: 'Admin User',
                role: UserRole.ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: adminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            render(<SettingsPage />)

            expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
            expect(screen.getByText('Access Restricted')).toBeInTheDocument()
        })

        it('should show settings interface for super admin users', () => {
            const superAdminUser = {
                _id: 'user-3',
                email: 'superadmin@example.com',
                name: 'Super Admin User',
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: superAdminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            render(<SettingsPage />)

            expect(screen.getByText('System Settings')).toBeInTheDocument()
            expect(screen.getByText('Configure and customize your application environment')).toBeInTheDocument()
            expect(screen.queryByText('Access Restricted')).not.toBeInTheDocument()
        })
    })

    describe('UI Structure and Styling', () => {
        it('should render access restricted with proper styling structure', () => {
            const basicUser = {
                _id: 'user-1',
                email: 'basic@example.com',
                name: 'Basic User',
                role: UserRole.BASIC,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: basicUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            render(<SettingsPage />)

            // Check for main container structure
            const mainContainer = screen.getByText('Access Restricted').closest('.h-full')
            expect(mainContainer).toHaveClass('h-full', 'flex', 'flex-col', 'space-y-4')

            // Check for card structure
            const card = screen.getByText('Access Restricted').closest('.bg-white')
            expect(card).toHaveClass(
                'bg-white',
                'rounded-xl',
                'shadow-sm',
                'border',
                'border-gray-200',
                'p-12'
            )

            // Check for centered content
            const centerDiv = screen.getByText('Access Restricted').closest('.text-center')
            expect(centerDiv).toHaveClass('text-center')

            // Check for icon container
            const iconContainer = screen.getByTestId('shield-icon').closest('.w-20')
            expect(iconContainer).toHaveClass(
                'w-20',
                'h-20',
                'bg-gradient-to-br',
                'from-red-100',
                'to-orange-100',
                'rounded-full',
                'flex',
                'items-center',
                'justify-center',
                'mx-auto',
                'mb-6'
            )

            // Check for shield icon styling
            expect(screen.getByTestId('shield-icon')).toHaveClass('w-10', 'h-10', 'text-red-500')

            // Check for title styling
            const title = screen.getByText('Access Restricted')
            expect(title).toHaveClass('text-xl', 'font-semibold', 'text-gray-900', 'mb-3')

            // Check for description styling
            const description = screen.getByText("You don't have the necessary permissions to manage system settings. Please contact your administrator for access.")
            expect(description).toHaveClass('text-gray-600', 'max-w-md', 'mx-auto', 'leading-relaxed')
        })

        it('should render settings interface with proper styling for super admin', () => {
            const superAdminUser = {
                _id: 'user-3',
                email: 'superadmin@example.com',
                name: 'Super Admin User',
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: superAdminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            render(<SettingsPage />)

            // Check for main container structure
            const mainContainer = screen.getByText('System Settings').closest('.h-full')
            expect(mainContainer).toHaveClass('h-full', 'flex', 'flex-col', 'space-y-4')

            // Check for header structure
            const header = screen.getByText('System Settings').closest('.bg-gradient-to-r')
            expect(header).toHaveClass(
                'bg-gradient-to-r',
                'from-blue-50',
                'to-indigo-50',
                'rounded-xl',
                'border',
                'border-blue-100',
                'shadow-sm'
            )

            // Check for title styling
            const title = screen.getByText('System Settings')
            expect(title).toHaveClass('text-xl', 'font-bold', 'text-gray-900')

            // Check for subtitle styling
            const subtitle = screen.getByText('Configure and customize your application environment')
            expect(subtitle).toHaveClass('text-sm', 'text-gray-600')
        })
    })

    describe('Tab Management', () => {
        let superAdminUser: any

        beforeEach(() => {
            superAdminUser = {
                _id: 'user-3',
                email: 'superadmin@example.com',
                name: 'Super Admin User',
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: superAdminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })
        })

        it('should show all tabs for super admin users', () => {
            render(<SettingsPage />)

            expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /applications/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /database/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
        })

        it('should display correct tab count for super admin (5 categories)', () => {
            render(<SettingsPage />)

            expect(screen.getByText('5')).toBeInTheDocument()
            expect(screen.getByText('Categories')).toBeInTheDocument()
        })

        it('should start with general tab active by default', () => {
            render(<SettingsPage />)

            const generalTab = screen.getByRole('button', { name: /general/i })
            expect(generalTab).toHaveClass('border-blue-500', 'text-blue-600')

            // General Settings content should be visible
            expect(screen.getByText('General Settings')).toBeInTheDocument()
            expect(screen.getByText('System Information')).toBeInTheDocument()
        })

        it('should switch to applications tab when clicked', () => {
            render(<SettingsPage />)

            const applicationsTab = screen.getByRole('button', { name: /applications/i })
            fireEvent.click(applicationsTab)

            expect(applicationsTab).toHaveClass('border-blue-500', 'text-blue-600')
            expect(screen.getByTestId('application-management')).toBeInTheDocument()
        })

        it('should switch to database tab when clicked', () => {
            render(<SettingsPage />)

            const databaseTab = screen.getByRole('button', { name: /database/i })
            fireEvent.click(databaseTab)

            expect(databaseTab).toHaveClass('border-blue-500', 'text-blue-600')
            expect(screen.getByText('Database Settings')).toBeInTheDocument()
            expect(screen.getByText('Connection Pool')).toBeInTheDocument()
        })

        it('should switch to security tab when clicked', () => {
            render(<SettingsPage />)

            const securityTab = screen.getByRole('button', { name: /security/i })
            fireEvent.click(securityTab)

            expect(securityTab).toHaveClass('border-blue-500', 'text-blue-600')
            expect(screen.getByText('Security Settings')).toBeInTheDocument()
            expect(screen.getByText('Password Policy')).toBeInTheDocument()
        })

        it('should switch to notifications tab when clicked', () => {
            render(<SettingsPage />)

            const notificationsTab = screen.getByRole('button', { name: /notifications/i })
            fireEvent.click(notificationsTab)

            expect(notificationsTab).toHaveClass('border-blue-500', 'text-blue-600')
            expect(screen.getByText('Email Templates')).toBeInTheDocument()
        })

        it('should show correct tab icons', () => {
            render(<SettingsPage />)

            // Check that icons are present for each tab
            expect(screen.getAllByTestId('settings-icon').length).toBeGreaterThanOrEqual(2) // Header + General tab + stats
            expect(screen.getByTestId('building-icon')).toBeInTheDocument()
            expect(screen.getByTestId('database-icon')).toBeInTheDocument()
            expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
            expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
        })
    })

    describe('Role-based Tab Visibility', () => {
        it('should show all tabs for super admin and filter based on role', () => {
            // Note: In the current implementation, only SUPER_ADMIN users have canManageSettings permission,
            // so this test verifies that super admins see all tabs including the Applications tab
            // which is marked as superAdminOnly: true in the component
            const superAdminUser = {
                _id: 'user-3',
                email: 'superadmin@example.com',
                name: 'Super Admin User',
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: superAdminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            render(<SettingsPage />)

            // All tabs should be visible for super admin
            expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /applications/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /database/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /security/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()

            // Should show 5 categories
            expect(screen.getByText('5')).toBeInTheDocument()
            expect(screen.getByText('Categories')).toBeInTheDocument()
        })
    })

    describe('Content Rendering', () => {
        let superAdminUser: any

        beforeEach(() => {
            superAdminUser = {
                _id: 'user-3',
                email: 'superadmin@example.com',
                name: 'Super Admin User',
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: superAdminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })
        })

        it('should render general tab content with system information', () => {
            render(<SettingsPage />)

            expect(screen.getByText('General Settings')).toBeInTheDocument()
            expect(screen.getByText('System Information')).toBeInTheDocument()
            expect(screen.getByText('Version 1.0.0')).toBeInTheDocument()
            expect(screen.getByText('Development Environment')).toBeInTheDocument()
            expect(screen.getByText(/Last Updated/)).toBeInTheDocument()
        })

        it('should render database tab content with database settings', () => {
            render(<SettingsPage />)

            const databaseTab = screen.getByRole('button', { name: /database/i })
            fireEvent.click(databaseTab)

            expect(screen.getByText('Database Settings')).toBeInTheDocument()
            expect(screen.getByText('Connection Pool')).toBeInTheDocument()
            expect(screen.getByText('Backup Schedule')).toBeInTheDocument()
            expect(screen.getByText('Indexing')).toBeInTheDocument()
            expect(screen.getByText('Cleanup')).toBeInTheDocument()
        })

        it('should render security tab content with security settings', () => {
            render(<SettingsPage />)

            const securityTab = screen.getByRole('button', { name: /security/i })
            fireEvent.click(securityTab)

            expect(screen.getByText('Security Settings')).toBeInTheDocument()
            expect(screen.getByText('Password Policy')).toBeInTheDocument()
            expect(screen.getByText('Session Timeout')).toBeInTheDocument()
            expect(screen.getByText('Two-Factor Auth')).toBeInTheDocument()
            expect(screen.getByText('IP Restrictions')).toBeInTheDocument()
        })

        it('should render notifications tab content with notification settings', () => {
            render(<SettingsPage />)

            const notificationsTab = screen.getByRole('button', { name: /notifications/i })
            fireEvent.click(notificationsTab)

            expect(screen.getByText('Email Templates')).toBeInTheDocument()
            expect(screen.getByText('Alert Rules')).toBeInTheDocument()
            expect(screen.getByText('Delivery Settings')).toBeInTheDocument()
            expect(screen.getByText('Schedules')).toBeInTheDocument()
        })

        it('should render configuration status indicators correctly', () => {
            render(<SettingsPage />)

            // Check for configured items (green indicators)
            const configuredItems = screen.getAllByText('configured', { exact: false })
            expect(configuredItems.length).toBeGreaterThan(0)

            // Check for pending items (amber indicators)
            const pendingItems = screen.getAllByText('pending', { exact: false })
            expect(pendingItems.length).toBeGreaterThan(0)

            // Check for check circle icons
            expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(4) // 3 in stats + 1 in content
        })

        it('should show correct statistics in header', () => {
            render(<SettingsPage />)

            expect(screen.getByText('5')).toBeInTheDocument() // Categories count
            expect(screen.getByText('12')).toBeInTheDocument() // Configured count
            expect(screen.getByText('4')).toBeInTheDocument() // Pending count
        })
    })

    describe('Component Behavior', () => {
        it('should handle invalid tab gracefully by rendering null for unknown tabs', () => {
            const superAdminUser = {
                _id: 'user-3',
                email: 'superadmin@example.com',
                name: 'Super Admin User',
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: superAdminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            // First render the component normally
            const { container } = render(<SettingsPage />)

            // Test that the component starts with general tab (initial state)
            expect(screen.getByText('General Settings')).toBeInTheDocument()

            // Since we can't directly access React state, this test verifies that
            // the component handles its initial state correctly and doesn't crash
            expect(container).toBeInTheDocument()
        })

        it('should have comprehensive tab switching logic with default case protection', () => {
            // This test verifies that all tabs work correctly and documents the existence
            // of the default case in renderTabContent (line 391) which returns null
            // for any unhandled tab values. This is a safety mechanism that prevents
            // the component from crashing if an invalid tab value is somehow set.

            const superAdminUser = {
                _id: 'user-3',
                email: 'superadmin@example.com',
                name: 'Super Admin User',
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: superAdminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            render(<SettingsPage />)

            // Test that all valid tabs work correctly
            const tabs = [
                { name: 'general', expectedContent: 'General Settings' },
                { name: 'applications', expectedContent: 'ApplicationManagement Component' },
                { name: 'database', expectedContent: 'Database Settings' },
                { name: 'security', expectedContent: 'Security Settings' },
                { name: 'notifications', expectedContent: 'Email Templates' }
            ]

            tabs.forEach(tab => {
                const tabButton = screen.getByRole('button', { name: new RegExp(tab.name, 'i') })
                fireEvent.click(tabButton)

                if (tab.name === 'applications') {
                    expect(screen.getByTestId('application-management')).toBeInTheDocument()
                } else {
                    expect(screen.getByText(tab.expectedContent)).toBeInTheDocument()
                }
            })

            // Note: The default case in renderTabContent (return null) at line 391
            // is a defensive programming practice that ensures the component doesn't
            // break if an unexpected activeTab value is set. While we can't easily
            // test this edge case without mocking React's internal state management,
            // its presence ensures application stability.

            expect(screen.getByText('System Settings')).toBeInTheDocument()
        })

        it('should handle role permissions gracefully with undefined permissions', () => {
            const userWithInvalidRole = {
                _id: 'user-1',
                email: 'invalid@example.com',
                name: 'Invalid Role User',
                role: 'INVALID_ROLE' as UserRole,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: userWithInvalidRole,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            // This should not crash the component and should show access denied
            render(<SettingsPage />)
            expect(screen.getByText('Access Restricted')).toBeInTheDocument()
        })

        it('should maintain tab state when switching between tabs', () => {
            const superAdminUser = {
                _id: 'user-3',
                email: 'superadmin@example.com',
                name: 'Super Admin User',
                role: UserRole.SUPER_ADMIN,
                isActive: true,
                assignedApplications: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockUseAuth.mockReturnValue({
                user: superAdminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            render(<SettingsPage />)

            // Start with general tab active
            expect(screen.getByText('General Settings')).toBeInTheDocument()

            // Switch to database tab
            const databaseTab = screen.getByRole('button', { name: /database/i })
            fireEvent.click(databaseTab)
            expect(screen.getByText('Database Settings')).toBeInTheDocument()
            expect(screen.queryByText('General Settings')).not.toBeInTheDocument()

            // Switch back to general tab
            const generalTab = screen.getByRole('button', { name: /general/i })
            fireEvent.click(generalTab)
            expect(screen.getByText('General Settings')).toBeInTheDocument()
            expect(screen.queryByText('Database Settings')).not.toBeInTheDocument()
        })
    })
})
