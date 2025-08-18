import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserForm from '../UserForm'
import UserList from '../UserList'
import { UserRole, AVAILABLE_APPLICATIONS } from '@/types/user'
import { render as customRender } from '@/__tests__/utils/test-utils'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

// Mock the AuthContext at the module level
let mockCurrentUser: any = {
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    assignedApplications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
}

const mockUseAuth = jest.fn(() => ({
    user: mockCurrentUser,
    loading: false,
    isInitialized: true,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
}))

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Helper function to change current user for tests
const setMockCurrentUser = (user: any) => {
    mockCurrentUser = user
}

// Mock dependencies
jest.mock('@/lib/api')
jest.mock('react-hot-toast')

// Mock Modal component
jest.mock('@/components/ui/Modal', () => {
    return function MockModal({ children, isOpen, title }: any) {
        if (!isOpen) return null
        return (
            <div data-testid="modal">
                <div>{title}</div>
                <div>{children}</div>
            </div>
        )
    }
})

// Mock react-dom portal
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (element: any) => element,
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    User: (props: any) => <div data-testid="user-icon" {...props}>User</div>,
    Mail: (props: any) => <div data-testid="mail-icon" {...props}>Mail</div>,
    Lock: (props: any) => <div data-testid="lock-icon" {...props}>Lock</div>,
    FolderOpen: (props: any) => <div data-testid="folder-open-icon" {...props}>FolderOpen</div>,
    ChevronDown: (props: any) => <div data-testid="chevron-down-icon" {...props}>ChevronDown</div>,
    X: (props: any) => <div data-testid="x-icon" {...props}>X</div>,
    Plus: (props: any) => <div data-testid="plus-icon" {...props}>Plus</div>,
    Search: (props: any) => <div data-testid="search-icon" {...props}>Search</div>,
    Edit: (props: any) => <div data-testid="edit-icon" {...props}>Edit</div>,
    Trash2: (props: any) => <div data-testid="trash-icon" {...props}>Trash2</div>,
    Filter: (props: any) => <div data-testid="filter-icon" {...props}>Filter</div>,
    MoreVertical: (props: any) => <div data-testid="more-icon" {...props}>MoreVertical</div>,
    CheckCircle: (props: any) => <div data-testid="check-circle-icon" {...props}>CheckCircle</div>,
    XCircle: (props: any) => <div data-testid="x-circle-icon" {...props}>XCircle</div>,
    Users: (props: any) => <div data-testid="users-icon" {...props}>Users</div>,
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>
const mockToast = toast as jest.Mocked<typeof toast>

describe('User Components Coverage Tests', () => {
    const mockUser = {
        _id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: UserRole.BASIC,
        assignedApplications: ['NRE', 'NVE'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    }

    const mockSuperAdminUser = {
        _id: 'super-admin-1',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: UserRole.SUPER_ADMIN,
        assignedApplications: [],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    }

    const mockAdminUser = {
        _id: 'admin-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        assignedApplications: ['NRE'],
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    }

    const mockProps = {
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        isEditing: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        setMockCurrentUser(mockSuperAdminUser)

        // Mock API responses
        mockApiClient.getUsers.mockResolvedValue({
            users: [mockUser],
            pagination: { pages: 1, page: 1, limit: 10, total: 1 }
        })
        mockApiClient.createUser.mockResolvedValue({} as any)
        mockApiClient.updateUser.mockResolvedValue({} as any)
        mockApiClient.deleteUser.mockResolvedValue({} as any)
        global.confirm = jest.fn().mockReturnValue(true)
    })

    describe('UserForm Additional Coverage', () => {
        it('should handle form submission validation errors', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            // Submit with empty form
            const submitButton = screen.getByText('Create User')
            await user.click(submitButton)

            // Check that validation prevents submission
            await waitFor(() => {
                expect(mockProps.onSubmit).not.toHaveBeenCalled()
            })
        })

        it('should handle role change for different permission levels', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const roleSelect = screen.getByLabelText('Role')
            await user.selectOptions(roleSelect, UserRole.ADMIN)

            expect(roleSelect).toHaveValue(UserRole.ADMIN)
        })

        it('should show applications section for admin and basic roles', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            // Should show applications section initially (role defaults to BASIC)
            expect(screen.getByText('Assigned Applications')).toBeInTheDocument()
        })

        it('should handle user with no assigned applications', () => {
            const userWithoutApps = { ...mockUser, assignedApplications: [] }
            customRender(<UserForm {...mockProps} user={userWithoutApps} isEditing={true} />)

            expect(screen.getByText('No applications assigned. User will have limited access.')).toBeInTheDocument()
        })

        it('should test all role display names', () => {
            const roles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BASIC]

            roles.forEach(role => {
                const userWithRole = { ...mockUser, role }
                customRender(<UserForm {...mockProps} user={userWithRole} isEditing={true} />)

                // Just verify component renders without error
                expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
            })
        })

        it('should handle application dropdown visibility based on user permissions', () => {
            // As super admin user, should see applications section
            customRender(<UserForm {...mockProps} />)
            expect(screen.getByText('Assigned Applications')).toBeInTheDocument()
        })

        it('should handle form data with different role values', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const nameField = screen.getByLabelText('Full Name')
            const emailField = screen.getByLabelText('Email Address')
            const passwordField = screen.getByLabelText('Password')
            const roleSelect = screen.getByLabelText('Role')

            await user.type(nameField, 'Test User')
            await user.type(emailField, 'test@example.com')
            await user.type(passwordField, 'password123')
            await user.selectOptions(roleSelect, UserRole.ADMIN)

            const submitButton = screen.getByText('Create User')
            await user.click(submitButton)

            await waitFor(() => {
                expect(mockProps.onSubmit).toHaveBeenCalledWith({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: UserRole.ADMIN,
                    assignedApplications: []
                })
            })
        })

        it('should handle non-super admin user context', () => {
            setMockCurrentUser(mockAdminUser)
            customRender(<UserForm {...mockProps} />)

            // Should not show applications section for non-super admin
            expect(screen.queryByText('Assigned Applications')).not.toBeInTheDocument()
        })

        it('should handle basic user context', () => {
            setMockCurrentUser({ ...mockUser, role: UserRole.BASIC })
            customRender(<UserForm {...mockProps} />)

            // Should not show role field for basic user
            expect(screen.queryByLabelText('Role')).not.toBeInTheDocument()
        })

        it('should test error field clearing on input change', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            // Submit empty form to trigger errors
            const submitButton = screen.getByText('Create User')
            await user.click(submitButton)

            // Start typing in fields to clear errors
            const nameField = screen.getByLabelText('Full Name')
            await user.type(nameField, 'T')

            // Error should be cleared (this tests the handleChange error clearing logic)
            expect(nameField).not.toHaveClass('input-error')
        })
    })

    describe('UserList Additional Coverage', () => {
        it('should handle search functionality', async () => {
            const user = userEvent.setup()
            customRender(<UserList />)

            const searchField = screen.getByPlaceholderText('Search users by name or email...')
            await user.type(searchField, 'john')

            await waitFor(() => {
                expect(mockApiClient.getUsers).toHaveBeenCalledWith({
                    page: 1,
                    limit: 10,
                    search: 'john',
                    role: '',
                })
            })
        })

        it('should handle role filtering', async () => {
            const user = userEvent.setup()
            customRender(<UserList />)

            const roleFilter = screen.getByDisplayValue('All Roles')
            await user.selectOptions(roleFilter, UserRole.ADMIN)

            await waitFor(() => {
                expect(mockApiClient.getUsers).toHaveBeenCalledWith({
                    page: 1,
                    limit: 10,
                    search: '',
                    role: UserRole.ADMIN,
                })
            })
        })

        it('should handle pagination navigation', async () => {
            const user = userEvent.setup()

            // Mock multiple pages
            mockApiClient.getUsers.mockResolvedValue({
                users: [mockUser],
                pagination: { pages: 3, page: 1, limit: 10, total: 30 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                const nextButton = screen.getByText('Next')
                expect(nextButton).toBeInTheDocument()
            })

            const nextButton = screen.getByText('Next')
            await user.click(nextButton)

            await waitFor(() => {
                expect(mockApiClient.getUsers).toHaveBeenCalledWith({
                    page: 2,
                    limit: 10,
                    search: '',
                    role: '',
                })
            })
        })

        it('should handle different user role badge colors', async () => {
            const usersWithDifferentRoles = [
                { ...mockUser, role: UserRole.BASIC },
                { ...mockUser, _id: 'user-2', role: UserRole.ADMIN },
                { ...mockUser, _id: 'user-3', role: UserRole.SUPER_ADMIN },
            ]

            mockApiClient.getUsers.mockResolvedValue({
                users: usersWithDifferentRoles,
                pagination: { pages: 1, page: 1, limit: 10, total: 3 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                expect(screen.getByText('Basic User')).toBeInTheDocument()
                expect(screen.getByText('Admin')).toBeInTheDocument()
                expect(screen.getByText('Super Admin')).toBeInTheDocument()
            })
        })

        it('should handle empty users list', async () => {
            mockApiClient.getUsers.mockResolvedValue({
                users: [],
                pagination: { pages: 1, page: 1, limit: 10, total: 0 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                // Should still show table headers
                expect(screen.getByText('User')).toBeInTheDocument()
                expect(screen.getByText('Role')).toBeInTheDocument()
            })
        })

        it('should handle API error states', async () => {
            mockApiClient.getUsers.mockRejectedValue(new Error('API Error'))

            customRender(<UserList />)

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith('API Error')
            })
        })

        it('should test permission-based action visibility', async () => {
            setMockCurrentUser(mockAdminUser)

            const users = [
                { ...mockUser, role: UserRole.BASIC },
                { ...mockUser, _id: 'user-2', role: UserRole.ADMIN },
                { ...mockUser, _id: 'user-3', role: UserRole.SUPER_ADMIN },
            ]

            mockApiClient.getUsers.mockResolvedValue({
                users,
                pagination: { pages: 1, page: 1, limit: 10, total: 3 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                // Admin should see some edit buttons but not all
                const editButtons = screen.queryAllByTestId('edit-icon')
                expect(editButtons.length).toBeGreaterThan(0)
                expect(editButtons.length).toBeLessThan(3) // Should not edit super admin
            })
        })

        it('should handle user status display correctly', async () => {
            const usersWithDifferentStatus = [
                { ...mockUser, isActive: true },
                { ...mockUser, _id: 'user-2', isActive: false },
            ]

            mockApiClient.getUsers.mockResolvedValue({
                users: usersWithDifferentStatus,
                pagination: { pages: 1, page: 1, limit: 10, total: 2 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                expect(screen.getByText('Active')).toBeInTheDocument()
                expect(screen.getByText('Inactive')).toBeInTheDocument()
            })
        })
    })

    describe('Integration Tests', () => {
        it('should handle create user flow', async () => {
            const user = userEvent.setup()
            customRender(<UserList />)

            // Click add user button
            const addButton = await screen.findByRole('button', { name: /add user/i })
            await user.click(addButton)

            // Modal should open
            expect(screen.getByTestId('modal')).toBeInTheDocument()
            expect(screen.getByText('Create New User')).toBeInTheDocument()
        })

        it('should handle error scenarios gracefully', async () => {
            const errorUser = userEvent.setup()
            customRender(<UserForm {...mockProps} onSubmit={jest.fn().mockRejectedValue(new Error('Submit failed'))} />)

            const nameField = screen.getByLabelText('Full Name')
            const emailField = screen.getByLabelText('Email Address')
            const passwordField = screen.getByLabelText('Password')

            await errorUser.type(nameField, 'Test User')
            await errorUser.type(emailField, 'test@example.com')
            await errorUser.type(passwordField, 'password123')

            const submitButton = screen.getByText('Create User')
            await errorUser.click(submitButton)

            // Should handle error gracefully without crashing
            expect(screen.getByText('Create User')).toBeInTheDocument()
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle malformed user data', () => {
            const malformedUser = {
                ...mockUser,
                assignedApplications: null as any
            }

            expect(() => {
                customRender(<UserForm {...mockProps} user={malformedUser} isEditing={true} />)
            }).not.toThrow()
        })

        it('should handle undefined user prop', () => {
            expect(() => {
                customRender(<UserForm {...mockProps} user={undefined} isEditing={true} />)
            }).not.toThrow()
        })

        it('should handle very long text values', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const nameField = screen.getByLabelText('Full Name')
            const veryLongName = 'A'.repeat(1000)

            await user.type(nameField, veryLongName)
            expect(nameField).toHaveValue(veryLongName)
        })

        it('should handle special characters in form inputs', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const nameField = screen.getByLabelText('Full Name')
            const emailField = screen.getByLabelText('Email Address')

            await user.type(nameField, 'José María O\'Connor')
            await user.type(emailField, 'jose.maria@example.com')

            expect(nameField).toHaveValue('José María O\'Connor')
            expect(emailField).toHaveValue('jose.maria@example.com')
        })
    })
})
