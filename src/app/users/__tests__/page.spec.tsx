import React from 'react'
import { render, screen } from '@testing-library/react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/user'
import UsersPage from '../page'

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}))

// Mock the UserList component
jest.mock('@/components/users/UserList', () => {
    return function MockUserList() {
        return <div data-testid="user-list">UserList Component</div>
    }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    Shield: ({ className }: { className?: string }) => (
        <div className={className} data-testid="shield-icon">Shield</div>
    ),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('UsersPage', () => {
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

            const { container } = render(<UsersPage />)
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

            const { container } = render(<UsersPage />)
            expect(container.firstChild).toBeNull()
        })
    })

    describe('Permission-based Rendering', () => {
        it('should show access denied for basic users', () => {
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

            render(<UsersPage />)

            expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
            expect(screen.getByText('Access Denied')).toBeInTheDocument()
            expect(screen.getByText("You don't have permission to view this page.")).toBeInTheDocument()
            expect(screen.queryByTestId('user-list')).not.toBeInTheDocument()
        })

        it('should show UserList for admin users', () => {
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

            render(<UsersPage />)

            expect(screen.getByTestId('user-list')).toBeInTheDocument()
            expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
        })

        it('should show UserList for super admin users', () => {
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

            render(<UsersPage />)

            expect(screen.getByTestId('user-list')).toBeInTheDocument()
            expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
        })
    })

    describe('UI Structure and Styling', () => {
        it('should render access denied with proper styling structure', () => {
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

            render(<UsersPage />)

            // Check for main container structure
            const mainContainer = screen.getByText('Access Denied').closest('.h-full')
            expect(mainContainer).toHaveClass('h-full', 'flex', 'flex-col', 'space-y-4')

            // Check for card structure
            const card = screen.getByText('Access Denied').closest('.bg-white')
            expect(card).toHaveClass(
                'bg-white',
                'rounded-xl',
                'shadow-sm',
                'border',
                'border-gray-200',
                'p-12'
            )

            // Check for centered content
            const centerDiv = screen.getByText('Access Denied').closest('.text-center')
            expect(centerDiv).toHaveClass('text-center')

            // Check for icon container
            const iconContainer = screen.getByTestId('shield-icon').closest('.w-16')
            expect(iconContainer).toHaveClass(
                'w-16',
                'h-16',
                'bg-gray-100',
                'rounded-full',
                'flex',
                'items-center',
                'justify-center',
                'mx-auto',
                'mb-4'
            )

            // Check for icon styling
            expect(screen.getByTestId('shield-icon')).toHaveClass('w-8', 'h-8', 'text-gray-400')

            // Check for title styling
            const title = screen.getByText('Access Denied')
            expect(title).toHaveClass('text-lg', 'font-medium', 'text-gray-900', 'mb-2')

            // Check for description styling
            const description = screen.getByText("You don't have permission to view this page.")
            expect(description).toHaveClass('text-sm', 'text-gray-500')
        })

        it('should render UserList with proper container styling', () => {
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

            render(<UsersPage />)

            // Check for main container structure
            const mainContainer = screen.getByTestId('user-list').closest('.h-full')
            expect(mainContainer).toHaveClass('h-full', 'flex', 'flex-col')
        })
    })

    describe('Role Permissions Integration', () => {
        it('should correctly check rolePermissions for canViewAllUsers', () => {
            // Test that the component properly uses rolePermissions from types
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

            render(<UsersPage />)

            // Basic users should not have canViewAllUsers permission
            expect(screen.getByText('Access Denied')).toBeInTheDocument()
        })

        it('should handle edge case of invalid role gracefully', () => {
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

            // This should not crash the component
            render(<UsersPage />)

            // The component should handle the invalid role gracefully
            // Since rolePermissions[invalidRole] would be undefined, 
            // permissions.canViewAllUsers would be undefined (falsy)
            expect(screen.getByText('Access Denied')).toBeInTheDocument()
        })
    })

    describe('Component Behavior', () => {
        it('should not re-render unnecessarily when user permissions allow access', () => {
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

            const { rerender } = render(<UsersPage />)

            expect(screen.getByTestId('user-list')).toBeInTheDocument()

            // Re-render with same props
            rerender(<UsersPage />)

            expect(screen.getByTestId('user-list')).toBeInTheDocument()
        })

        it('should properly switch between access denied and allowed states', () => {
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

            // Start with basic user (access denied)
            mockUseAuth.mockReturnValue({
                user: basicUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            const { rerender } = render(<UsersPage />)
            expect(screen.getByText('Access Denied')).toBeInTheDocument()
            expect(screen.queryByTestId('user-list')).not.toBeInTheDocument()

            // Switch to admin user (access allowed)
            mockUseAuth.mockReturnValue({
                user: adminUser,
                loading: false,
                isInitialized: true,
                login: jest.fn(),
                logout: jest.fn(),
                refreshUser: jest.fn(),
            })

            rerender(<UsersPage />)
            expect(screen.queryByText('Access Denied')).not.toBeInTheDocument()
            expect(screen.getByTestId('user-list')).toBeInTheDocument()
        })
    })
})
