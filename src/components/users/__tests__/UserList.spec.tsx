import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserList from '../UserList'
import { UserRole } from '@/types/user'
import { render as customRender } from '@/__tests__/utils/test-utils'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

// Mock the AuthContext at the module level - with dynamic user switching
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
jest.mock('../UserForm', () => {
  return function MockUserForm({ onSubmit, onCancel, user, isEditing }: any) {
    return (
      <div data-testid="user-form">
        <div>UserForm - {isEditing ? 'Edit' : 'Create'}</div>
        {user && <div>Editing: {user.name}</div>}
        <button onClick={() => onSubmit({ name: 'Test User', email: 'test@test.com' })}>
          Submit
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    )
  }
})

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

// Mock Lucide icons
jest.mock('lucide-react', () => ({
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

describe('UserList', () => {
  const mockUsers = [
    {
      _id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: UserRole.BASIC,
      assignedApplications: ['NRE', 'NVE'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: UserRole.ADMIN,
      assignedApplications: ['NRE'],
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      _id: 'user-3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: UserRole.SUPER_ADMIN,
      assignedApplications: [],
      isActive: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    }
  ]

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

  const mockBasicUser = {
    _id: 'basic-1',
    name: 'Basic User',
    email: 'basic@example.com',
    role: UserRole.BASIC,
    assignedApplications: ['NRE'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }

  const mockPagination = {
    pages: 1,
    page: 1,
    limit: 10,
    total: mockUsers.length
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockApiClient.getUsers.mockResolvedValue({
      users: mockUsers,
      pagination: mockPagination
    })
    mockApiClient.createUser.mockResolvedValue({} as any)
    mockApiClient.updateUser.mockResolvedValue({} as any)
    mockApiClient.deleteUser.mockResolvedValue({} as any)

    // Reset to super admin user
    setMockCurrentUser(mockSuperAdminUser)

    // Mock window.confirm
    global.confirm = jest.fn().mockReturnValue(true)
  })

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      mockApiClient.getUsers.mockImplementation(() => new Promise(() => { }))

      customRender(<UserList />)

      expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
    })

    it('should render header with title and add button', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument()
        expect(screen.getByText('Manage system users and their permissions')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument()
        expect(screen.getByTestId('users-icon')).toBeInTheDocument()
      })
    })

    it('should render search and filter controls', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search users by name or email...')).toBeInTheDocument()
        expect(screen.getByDisplayValue('All Roles')).toBeInTheDocument()
        expect(screen.getByTestId('search-icon')).toBeInTheDocument()
        expect(screen.getByTestId('filter-icon')).toBeInTheDocument()
      })
    })

    it('should render users table with all users', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
        expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
      })
    })

    it('should render table headers correctly', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByText('User')).toBeInTheDocument()
        expect(screen.getByText('Role')).toBeInTheDocument()
        expect(screen.getByText('Assigned Applications')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Created')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()
      })
    })
  })

  describe('User Display', () => {
    it('should display user avatars with initials', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByText('J')).toBeInTheDocument() // John Doe
        expect(screen.getByText('J')).toBeInTheDocument() // Jane Smith (should be 2 J's)
        expect(screen.getByText('B')).toBeInTheDocument() // Bob Wilson
      })
    })

    it('should display role badges with correct colors', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByText('Basic User')).toBeInTheDocument()
        expect(screen.getByText('Admin')).toBeInTheDocument()
        expect(screen.getByText('Super Admin')).toBeInTheDocument()
      })
    })

    it('should display assigned applications', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByText('NRE')).toBeInTheDocument()
        expect(screen.getByText('NVE')).toBeInTheDocument()
        expect(screen.getByText('All Applications (Default)')).toBeInTheDocument()
      })
    })

    it('should display user status with icons', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getAllByText('Active')).toHaveLength(2)
        expect(screen.getByText('Inactive')).toBeInTheDocument()
        expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(3) // 2 active status + 1 action button
        expect(screen.getAllByTestId('x-circle-icon')).toHaveLength(2) // 1 inactive status + 1 action button
      })
    })

    it('should display creation dates', async () => {
      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByText('1/1/2024')).toBeInTheDocument()
        expect(screen.getByText('1/2/2024')).toBeInTheDocument()
        expect(screen.getByText('1/3/2024')).toBeInTheDocument()
      })
    })

    it('should show "No applications assigned" for users without apps', async () => {
      const usersWithoutApps = [{
        ...mockUsers[0],
        assignedApplications: []
      }]

      mockApiClient.getUsers.mockResolvedValue({
        users: usersWithoutApps,
        pagination: mockPagination
      })

      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByText('No applications assigned')).toBeInTheDocument()
      })
    })
  })

  describe('Search and Filtering', () => {
    it('should trigger search when typing in search field', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        expect(mockApiClient.getUsers).toHaveBeenCalledWith({
          page: 1,
          limit: 10,
          search: '',
          role: '',
        })
      })

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

    it('should trigger filter when selecting role', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

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

    it('should reset page to 1 when searching', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      // Simulate being on page 2
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)

      const searchField = screen.getByPlaceholderText('Search users by name or email...')
      await user.type(searchField, 'search')

      await waitFor(() => {
        expect(mockApiClient.getUsers).toHaveBeenLastCalledWith({
          page: 1, // Should reset to page 1
          limit: 10,
          search: 'search',
          role: '',
        })
      })
    })

    it('should reset page to 1 when filtering', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      const roleFilter = screen.getByDisplayValue('All Roles')
      await user.selectOptions(roleFilter, UserRole.BASIC)

      await waitFor(() => {
        expect(mockApiClient.getUsers).toHaveBeenLastCalledWith({
          page: 1, // Should reset to page 1
          limit: 10,
          search: '',
          role: UserRole.BASIC,
        })
      })
    })
  })

  describe('Pagination', () => {
    it('should show pagination when there are multiple pages', async () => {
      mockApiClient.getUsers.mockResolvedValue({
        users: mockUsers,
        pagination: { ...mockPagination, pages: 3, page: 1 }
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
        expect(screen.getByText('Previous')).toBeInTheDocument()
        expect(screen.getByText('Next')).toBeInTheDocument()
      })
    })

    it('should not show pagination for single page', async () => {
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        expect(screen.queryByText('Previous')).not.toBeInTheDocument()
        expect(screen.queryByText('Next')).not.toBeInTheDocument()
      })
    })

    it('should handle next page click', async () => {
      const user = userEvent.setup()
      mockApiClient.getUsers.mockResolvedValue({
        users: mockUsers,
        pagination: { ...mockPagination, pages: 3, page: 1 }
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      const nextButton = await screen.findByText('Next')
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

    it('should handle previous page click', async () => {
      const user = userEvent.setup()
      mockApiClient.getUsers.mockResolvedValue({
        users: mockUsers,
        pagination: { ...mockPagination, pages: 3, page: 2 }
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      const prevButton = await screen.findByText('Previous')
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

    it('should disable previous button on first page', async () => {
      mockApiClient.getUsers.mockResolvedValue({
        users: mockUsers,
        pagination: { ...mockPagination, pages: 3, page: 1 }
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const prevButton = screen.getByText('Previous')
        expect(prevButton).toBeDisabled()
      })
    })

    it('should disable next button on last page', async () => {
      mockApiClient.getUsers.mockResolvedValue({
        users: mockUsers,
        pagination: { ...mockPagination, pages: 3, page: 3 }
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const nextButton = screen.getByText('Next')
        expect(nextButton).toBeDisabled()
      })
    })
  })

  describe('User Actions', () => {
    it('should show edit button for editable users', async () => {
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const editButtons = screen.getAllByTestId('edit-icon')
        expect(editButtons).toHaveLength(3) // All users editable by super admin
      })
    })

    it('should show delete button only for deletable users', async () => {
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('trash-icon')
        expect(deleteButtons).toHaveLength(2) // Super admin can't delete other super admins
      })
    })

    it('should limit admin actions appropriately', async () => {
      setMockCurrentUser(mockAdminUser)
      customRender(<UserList />)

      await waitFor(() => {
        const editButtons = screen.getAllByTestId('edit-icon')
        expect(editButtons).toHaveLength(2) // Admin can't edit super admin

        const deleteButtons = screen.queryAllByTestId('trash-icon')
        expect(deleteButtons).toHaveLength(0) // Admin can't delete anyone
      })
    })

    it('should open edit modal when edit button clicked', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const editButtons = screen.getAllByTestId('edit-icon')
        expect(editButtons[0]).toBeInTheDocument()
      })

      const editButtons = screen.getAllByTestId('edit-icon')
      await user.click(editButtons[0])

      expect(screen.getByText('Edit User')).toBeInTheDocument()
      expect(screen.getByText('Editing: John Doe')).toBeInTheDocument()
    })

    it('should handle user status toggle', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const statusButtons = screen.getAllByTestId('x-circle-icon')
        expect(statusButtons[1]).toBeInTheDocument() // First is for inactive user display
      })

      const statusButtons = screen.getAllByTestId('x-circle-icon')
      await user.click(statusButtons[1]) // Click the action button

      await waitFor(() => {
        expect(mockApiClient.updateUser).toHaveBeenCalledWith('user-1', { isActive: false })
        expect(mockToast.success).toHaveBeenCalledWith('User deactivated successfully')
      })
    })

    it('should handle user deletion with confirmation', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('trash-icon')
        expect(deleteButtons[0]).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByTestId('trash-icon')
      await user.click(deleteButtons[0])

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete John Doe?')

      await waitFor(() => {
        expect(mockApiClient.deleteUser).toHaveBeenCalledWith('user-1')
        expect(mockToast.success).toHaveBeenCalledWith('User deleted successfully')
      })
    })

    it('should cancel deletion when user rejects confirmation', async () => {
      const user = userEvent.setup()
      global.confirm = jest.fn().mockReturnValue(false)

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const deleteButtons = screen.getAllByTestId('trash-icon')
        expect(deleteButtons[0]).toBeInTheDocument()
      })

      const deleteButtons = screen.getAllByTestId('trash-icon')
      await user.click(deleteButtons[0])

      expect(global.confirm).toHaveBeenCalled()
      expect(mockApiClient.deleteUser).not.toHaveBeenCalled()
    })
  })

  describe('Modal Management', () => {
    it('should open create user modal when add button clicked', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      const addButton = await screen.findByRole('button', { name: /add user/i })
      await user.click(addButton)

      expect(screen.getByText('Create New User')).toBeInTheDocument()
      expect(screen.getByText('UserForm - Create')).toBeInTheDocument()
    })

    it('should close create modal when cancelled', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      const addButton = await screen.findByRole('button', { name: /add user/i })
      await user.click(addButton)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(screen.queryByText('Create New User')).not.toBeInTheDocument()
    })

    it('should close edit modal when cancelled', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      const editButtons = await screen.findAllByTestId('edit-icon')
      await user.click(editButtons[0])

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(screen.queryByText('Edit User')).not.toBeInTheDocument()
    })
  })

  describe('User Creation', () => {
    it('should handle successful user creation', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      const addButton = await screen.findByRole('button', { name: /add user/i })
      await user.click(addButton)

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockApiClient.createUser).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@test.com'
        })
        expect(mockToast.success).toHaveBeenCalledWith('User created successfully')
        expect(screen.queryByText('Create New User')).not.toBeInTheDocument()
      })
    })

    it('should handle user creation error', async () => {
      const user = userEvent.setup()
      mockApiClient.createUser.mockRejectedValue(new Error('Creation failed'))

      customRender(<UserList />, { user: mockSuperAdminUser })

      const addButton = await screen.findByRole('button', { name: /add user/i })
      await user.click(addButton)

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockApiClient.createUser).toHaveBeenCalled()
        expect(mockToast.error).toHaveBeenCalledWith('Creation failed')
      })
    })
  })

  describe('User Editing', () => {
    it('should handle successful user update', async () => {
      const user = userEvent.setup()
      customRender(<UserList />, { user: mockSuperAdminUser })

      const editButtons = await screen.findAllByTestId('edit-icon')
      await user.click(editButtons[0])

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockApiClient.updateUser).toHaveBeenCalledWith('user-1', {
          name: 'Test User',
          email: 'test@test.com'
        })
        expect(mockToast.success).toHaveBeenCalledWith('User updated successfully')
        expect(screen.queryByText('Edit User')).not.toBeInTheDocument()
      })
    })

    it('should handle user update error', async () => {
      const user = userEvent.setup()
      mockApiClient.updateUser.mockRejectedValue(new Error('Update failed'))

      customRender(<UserList />, { user: mockSuperAdminUser })

      const editButtons = await screen.findAllByTestId('edit-icon')
      await user.click(editButtons[0])

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockApiClient.updateUser).toHaveBeenCalled()
        expect(mockToast.error).toHaveBeenCalledWith('Update failed')
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner during action', async () => {
      const user = userEvent.setup()
      mockApiClient.deleteUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      customRender(<UserList />, { user: mockSuperAdminUser })

      const deleteButtons = await screen.findAllByTestId('trash-icon')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner for the action
      })
    })

    it('should disable actions during loading', async () => {
      const user = userEvent.setup()
      mockApiClient.updateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      customRender(<UserList />, { user: mockSuperAdminUser })

      const statusButtons = await screen.findAllByTestId('x-circle-icon')
      await user.click(statusButtons[1])

      // Other action buttons for the same user should be disabled
      const editButtons = screen.getAllByTestId('edit-icon')
      expect(editButtons[0]).toHaveAttribute('disabled')
    })
  })

  describe('Error Handling', () => {
    it('should handle API fetch error', async () => {
      mockApiClient.getUsers.mockRejectedValue(new Error('Fetch failed'))

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Fetch failed')
      })
    })

    it('should handle delete error', async () => {
      const user = userEvent.setup()
      mockApiClient.deleteUser.mockRejectedValue(new Error('Delete failed'))

      customRender(<UserList />, { user: mockSuperAdminUser })

      const deleteButtons = await screen.findAllByTestId('trash-icon')
      await user.click(deleteButtons[0])

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Delete failed')
      })
    })

    it('should handle status toggle error', async () => {
      const user = userEvent.setup()
      mockApiClient.updateUser.mockRejectedValue(new Error('Update failed'))

      customRender(<UserList />, { user: mockSuperAdminUser })

      const statusButtons = await screen.findAllByTestId('x-circle-icon')
      await user.click(statusButtons[1])

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Update failed')
      })
    })
  })

  describe('Permission-Based Rendering', () => {
    it('should show appropriate actions for super admin', async () => {
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        // Super admin can edit all users except other super admins (for deletion)
        const editButtons = screen.getAllByTestId('edit-icon')
        expect(editButtons).toHaveLength(3)

        // Super admin can delete all users except other super admins
        const deleteButtons = screen.getAllByTestId('trash-icon')
        expect(deleteButtons).toHaveLength(2)
      })
    })

    it('should show limited actions for admin', async () => {
      setMockCurrentUser(mockAdminUser)
      customRender(<UserList />)

      await waitFor(() => {
        // Admin can edit basic users and other admins, but not super admins
        const editButtons = screen.getAllByTestId('edit-icon')
        expect(editButtons).toHaveLength(2)

        // Admin cannot delete anyone
        const deleteButtons = screen.queryAllByTestId('trash-icon')
        expect(deleteButtons).toHaveLength(0)
      })
    })

    it('should show no actions for basic user', async () => {
      setMockCurrentUser(mockBasicUser)
      customRender(<UserList />)

      await waitFor(() => {
        // Basic user cannot perform any actions
        const editButtons = screen.queryAllByTestId('edit-icon')
        expect(editButtons).toHaveLength(0)

        const deleteButtons = screen.queryAllByTestId('trash-icon')
        expect(deleteButtons).toHaveLength(0)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle users with null assigned applications', async () => {
      const usersWithNullApps = [{
        ...mockUsers[0],
        assignedApplications: null as any
      }]

      mockApiClient.getUsers.mockResolvedValue({
        users: usersWithNullApps,
        pagination: mockPagination
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        expect(screen.getByText('No applications assigned')).toBeInTheDocument()
      })
    })

    it('should handle users with undefined assigned applications', async () => {
      const usersWithUndefinedApps = [{
        ...mockUsers[0],
        assignedApplications: undefined as any
      }]

      mockApiClient.getUsers.mockResolvedValue({
        users: usersWithUndefinedApps,
        pagination: mockPagination
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        expect(screen.getByText('No applications assigned')).toBeInTheDocument()
      })
    })

    it('should handle empty user list', async () => {
      mockApiClient.getUsers.mockResolvedValue({
        users: [],
        pagination: { ...mockPagination, total: 0 }
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        // Should still render table structure
        expect(screen.getByText('User')).toBeInTheDocument()
        expect(screen.getByText('Role')).toBeInTheDocument()
      })
    })

    it('should handle very long user names gracefully', async () => {
      const usersWithLongNames = [{
        ...mockUsers[0],
        name: 'This is a very long user name that might cause layout issues if not handled properly'
      }]

      mockApiClient.getUsers.mockResolvedValue({
        users: usersWithLongNames,
        pagination: mockPagination
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        expect(screen.getByText(/This is a very long user name/)).toBeInTheDocument()
      })
    })

    it('should handle invalid date formats gracefully', async () => {
      const usersWithInvalidDates = [{
        ...mockUsers[0],
        createdAt: 'invalid-date' as any
      }]

      mockApiClient.getUsers.mockResolvedValue({
        users: usersWithInvalidDates,
        pagination: mockPagination
      })

      customRender(<UserList />, { user: mockSuperAdminUser })

      // Should render without crashing
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper table structure', async () => {
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getAllByRole('columnheader')).toHaveLength(6)
        expect(screen.getAllByRole('row')).toHaveLength(4) // 1 header + 3 data rows
      })
    })

    it('should have accessible form controls', async () => {
      customRender(<UserList />, { user: mockSuperAdminUser })

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search users by name or email...')
        const roleSelect = screen.getByDisplayValue('All Roles')

        expect(searchInput).toBeInTheDocument()
        expect(roleSelect).toBeInTheDocument()
      })
    })

    it('should have accessible buttons with proper labels', async () => {
      // Set up multiple pages to show pagination buttons
      mockApiClient.getUsers.mockResolvedValue({
        users: mockUsers,
        pagination: { ...mockPagination, pages: 3, page: 1 }
      })

      customRender(<UserList />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
      })
    })
  })
})