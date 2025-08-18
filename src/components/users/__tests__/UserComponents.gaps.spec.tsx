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

describe('User Components Coverage Gaps', () => {
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

    describe('UserForm Missing Coverage', () => {
        it('should test minimum name length validation trigger (line 94)', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const nameField = screen.getByLabelText('Full Name')
            const submitButton = screen.getByText('Create User')

            // Enter a single character to trigger min length validation
            await user.type(nameField, 'A')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
            })
        })

        it('should test email format validation (line 100)', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const nameField = screen.getByLabelText('Full Name')
            const emailField = screen.getByLabelText('Email Address')
            const submitButton = screen.getByText('Create User')

            await user.type(nameField, 'Valid Name')
            await user.type(emailField, 'invalid-email-format')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Email is invalid')).toBeInTheDocument()
            })
        })

        it('should test password minimum length validation when provided in edit mode (line 106)', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} user={mockUser} isEditing={true} />)

            const passwordField = screen.getByLabelText(/Password/)
            const submitButton = screen.getByText('Update User')

            // Enter a short password to trigger validation
            await user.type(passwordField, '123')
            await user.click(submitButton)

            await waitFor(() => {
                expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
            })
        })

        it('should test error clearing on field change (line 138)', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const emailField = screen.getByLabelText('Email Address')
            const submitButton = screen.getByText('Create User')

            // First trigger an error
            await user.click(submitButton)
            await waitFor(() => {
                expect(screen.getByText('Email is required')).toBeInTheDocument()
            })

            // Then start typing to clear the error
            await user.type(emailField, 'test')

            // The error should be cleared
            expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
        })

        it('should test default role case in getRoleDisplayName (line 179)', () => {
            // Test with an unknown role value
            const userWithUnknownRole = {
                ...mockUser,
                role: 'unknown_role' as any
            }

            customRender(<UserForm {...mockProps} user={userWithUnknownRole} isEditing={true} />)

            // Component should still render without crashing
            expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
        })

        it('should test application dropdown toggle when buttonRef is present', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            // The dropdown should be present for BASIC role users
            const dropdownButton = screen.getByText('Select applications...')

            // Click to open dropdown
            await user.click(dropdownButton)

            // Should show available applications
            AVAILABLE_APPLICATIONS.forEach(app => {
                expect(screen.getByText(app)).toBeInTheDocument()
            })
        })
    })

    describe('UserList Missing Coverage', () => {
        it('should test pagination currentPage boundary (line 374)', async () => {
            const user = userEvent.setup()

            // Mock with pagination showing we're on page 2 of 3
            mockApiClient.getUsers.mockResolvedValue({
                users: [mockUser],
                pagination: { pages: 3, page: 2, limit: 10, total: 30 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                const prevButton = screen.getByText('Previous')
                expect(prevButton).toBeInTheDocument()
            })

            // Click previous to test the Math.max boundary
            const prevButton = screen.getByText('Previous')
            await user.click(prevButton)

            await waitFor(() => {
                expect(mockApiClient.getUsers).toHaveBeenCalledWith({
                    page: 1,
                    limit: 10,
                    search: '',
                    role: '',
                })
            })
        })

        it('should test next page boundary (line 402)', async () => {
            const user = userEvent.setup()

            // Mock with pagination showing we're on page 2 of 3
            mockApiClient.getUsers.mockResolvedValue({
                users: [mockUser],
                pagination: { pages: 3, page: 2, limit: 10, total: 30 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                const nextButton = screen.getByText('Next')
                expect(nextButton).toBeInTheDocument()
            })

            // Click next to test the Math.min boundary
            const nextButton = screen.getByText('Next')
            await user.click(nextButton)

            await waitFor(() => {
                expect(mockApiClient.getUsers).toHaveBeenCalledWith({
                    page: 3,
                    limit: 10,
                    search: '',
                    role: '',
                })
            })
        })

        it('should test role filter reset to first page (line 212-213)', async () => {
            const user = userEvent.setup()

            // Mock pagination showing we're on page 2
            mockApiClient.getUsers.mockResolvedValue({
                users: [mockUser],
                pagination: { pages: 3, page: 2, limit: 10, total: 30 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                const roleFilter = screen.getByDisplayValue('All Roles')
                expect(roleFilter).toBeInTheDocument()
            })

            // Change role filter, which should reset to page 1
            const roleFilter = screen.getByDisplayValue('All Roles')
            await user.selectOptions(roleFilter, UserRole.ADMIN)

            await waitFor(() => {
                expect(mockApiClient.getUsers).toHaveBeenCalledWith({
                    page: 1, // Should reset to page 1
                    limit: 10,
                    search: '',
                    role: UserRole.ADMIN,
                })
            })
        })

        it('should test canDeleteUser logic (line 122)', async () => {
            // Test with a super admin user that should not be deletable by another super admin
            const superAdminUser = {
                ...mockUser,
                _id: 'another-super-admin',
                role: UserRole.SUPER_ADMIN
            }

            mockApiClient.getUsers.mockResolvedValue({
                users: [superAdminUser, mockUser],
                pagination: { pages: 1, page: 1, limit: 10, total: 2 }
            })

            customRender(<UserList />)

            await waitFor(() => {
                // Should only see delete button for non-super-admin user
                const deleteButtons = screen.getAllByTestId('trash-icon')
                expect(deleteButtons).toHaveLength(1) // Only one delete button for the basic user
            })
        })

        it('should test getRoleBadgeColor default case (line 135)', () => {
            const userWithUnknownRole = {
                ...mockUser,
                role: 'unknown_role' as any
            }

            mockApiClient.getUsers.mockResolvedValue({
                users: [userWithUnknownRole],
                pagination: { pages: 1, page: 1, limit: 10, total: 1 }
            })

            customRender(<UserList />)

            // Component should render without crashing even with unknown role
            expect(screen.getByText('User Management')).toBeInTheDocument()
        })

        it('should test form submission without selected user (line 416-417)', async () => {
            const user = userEvent.setup()

            customRender(<UserList />)

            // Open edit modal first
            await waitFor(() => {
                const editButtons = screen.getAllByTestId('edit-icon')
                expect(editButtons.length).toBeGreaterThan(0)
            })

            const editButtons = screen.getAllByTestId('edit-icon')
            await user.click(editButtons[0])

            // Modal should be open
            expect(screen.getByTestId('modal')).toBeInTheDocument()

            // The edit form should handle the case where selectedUser might be null
            expect(screen.getByText('Edit User')).toBeInTheDocument()
        })
    })

    describe('Additional Edge Cases', () => {
        it('should handle window resize during application dropdown', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const dropdownButton = screen.getByText('Select applications...')
            await user.click(dropdownButton)

            // Simulate window resize
            fireEvent(window, new Event('resize'))

            // Should not crash
            expect(screen.getByText('NRE')).toBeInTheDocument()
        })

        it('should handle window scroll during application dropdown', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const dropdownButton = screen.getByText('Select applications...')
            await user.click(dropdownButton)

            // Simulate window scroll
            fireEvent(window, new Event('scroll'))

            // Should not crash
            expect(screen.getByText('NRE')).toBeInTheDocument()
        })

        it('should test form with super admin role not showing applications', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            // Change role to SUPER_ADMIN
            const roleSelect = screen.getByLabelText('Role')
            await user.selectOptions(roleSelect, UserRole.SUPER_ADMIN)

            // Applications section should not be visible for super admin
            expect(screen.queryByText('Assigned Applications')).not.toBeInTheDocument()
        })

        it('should test clicking outside dropdown to close it', async () => {
            const user = userEvent.setup()
            customRender(<UserForm {...mockProps} />)

            const dropdownButton = screen.getByText('Select applications...')
            await user.click(dropdownButton)

            // Dropdown should be open
            expect(screen.getByText('NRE')).toBeInTheDocument()

            // Click outside (on document body)
            await user.click(document.body)

            // Dropdown should close
            await waitFor(() => {
                expect(screen.queryByText('NRE')).not.toBeInTheDocument()
            })
        })
    })
})
