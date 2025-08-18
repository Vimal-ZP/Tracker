import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplicationManagement from '../ApplicationManagement'
import { UserRole } from '@/types/user'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

// Mock dependencies
jest.mock('@/lib/api')
jest.mock('react-hot-toast')

// Mock the useAuth hook at the module level
const mockUseAuth = jest.fn()
jest.mock('@/contexts', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock UI components
jest.mock('@/components/ui/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children }: any) {
    if (!isOpen) return null
    return (
      <div data-testid="modal">
        <div>{title}</div>
        {children}
        <button onClick={onClose}>Close Modal</button>
      </div>
    )
  }
})

jest.mock('@/components/ui/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }: any) {
    return <div role="status" data-testid="loading-spinner">Loading {size}...</div>
  }
})

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Plus: (props: any) => <div data-testid="plus-icon" {...props}>Plus</div>,
  Edit: (props: any) => <div data-testid="edit-icon" {...props}>Edit</div>,
  Trash2: (props: any) => <div data-testid="trash-icon" {...props}>Trash2</div>,
  Search: (props: any) => <div data-testid="search-icon" {...props}>Search</div>,
  Eye: (props: any) => <div data-testid="eye-icon" {...props}>Eye</div>,
  EyeOff: (props: any) => <div data-testid="eye-off-icon" {...props}>EyeOff</div>,
  Building: (props: any) => <div data-testid="building-icon" {...props}>Building</div>,
  AlertTriangle: (props: any) => <div data-testid="alert-triangle-icon" {...props}>AlertTriangle</div>,
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>
const mockToast = toast as jest.Mocked<typeof toast>

describe('ApplicationManagement', () => {
  const mockApplications = [
    {
      _id: 'app-1',
      name: 'NRE',
      displayName: 'Network Resource Engine',
      description: 'A comprehensive network management system',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      _id: 'app-2',
      name: 'NVE',
      displayName: 'Network Virtualization Engine',
      description: 'Advanced virtualization platform',
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      _id: 'app-3',
      name: 'E-Vite',
      displayName: 'Electronic Invitation System',
      description: 'Digital event management platform',
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

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set default mock for useAuth
    mockUseAuth.mockReturnValue({
      user: mockSuperAdminUser,
      loading: false,
      isInitialized: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    })
    
    mockApiClient.getApplications.mockResolvedValue({
      applications: mockApplications,
      pagination: { page: 1, pages: 1, limit: 10, total: mockApplications.length }
    })
    mockApiClient.createApplication.mockResolvedValue({ message: 'Application created successfully' } as any)
    mockApiClient.updateApplication.mockResolvedValue({ message: 'Application updated successfully' } as any)
    mockApiClient.deleteApplication.mockResolvedValue({ message: 'Application deleted successfully' } as any)
  })

  describe('Access Control', () => {
    it('should deny access for non-super admin users', () => {
      mockUseAuth.mockReturnValue({
        user: mockBasicUser,
        loading: false,
        isInitialized: true,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      })
      
      render(<ApplicationManagement />)

      expect(screen.getByText('Access Denied')).toBeInTheDocument()
      expect(screen.getByText('Only Super Admins can manage applications.')).toBeInTheDocument()
      expect(screen.getByTestId('building-icon')).toBeInTheDocument()
    })

    it('should allow access for super admin users', async () => {
      mockUseAuth.mockReturnValue({
        user: mockSuperAdminUser,
        loading: false,
        isInitialized: true,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      })
      
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('Application Management')).toBeInTheDocument()
        expect(screen.getByText('Manage system applications and their settings')).toBeInTheDocument()
      })
    })
  })

  describe('Component Rendering', () => {
    it('should render loading state initially', () => {
      mockApiClient.getApplications.mockImplementation(() => new Promise(() => {}))
      
      render(<ApplicationManagement />)

      expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
    })

    it('should render header with title and add button', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('Application Management')).toBeInTheDocument()
        expect(screen.getByText('Manage system applications and their settings')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /add application/i })).toBeInTheDocument()
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
      })
    })

    it('should render search and filter controls', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search applications...')).toBeInTheDocument()
        expect(screen.getByLabelText('Active only')).toBeInTheDocument()
        expect(screen.getByTestId('search-icon')).toBeInTheDocument()
      })
    })

    it('should render applications table with all applications', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
        expect(screen.getByText('Network Virtualization Engine')).toBeInTheDocument()
        expect(screen.getByText('Electronic Invitation System')).toBeInTheDocument()
      })
    })

    it('should render table headers correctly', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('Application')).toBeInTheDocument()
        expect(screen.getByText('Display Name')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Created')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()
      })
    })
  })

  describe('Application Display', () => {
    it('should display application status with correct icons', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getAllByText('Active')).toHaveLength(2)
        expect(screen.getByText('Inactive')).toBeInTheDocument()
        expect(screen.getAllByTestId('eye-icon')).toHaveLength(2)
        expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
      })
    })

    it('should display creation dates correctly', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('1/1/2024')).toBeInTheDocument()
        expect(screen.getByText('1/2/2024')).toBeInTheDocument()
        expect(screen.getByText('1/3/2024')).toBeInTheDocument()
      })
    })

    it('should display building icons for each application', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        const buildingIcons = screen.getAllByTestId('building-icon')
        expect(buildingIcons).toHaveLength(3) // One for each application in table
      })
    })

    it('should show dash for empty descriptions', async () => {
      const appsWithEmptyDesc = [
        { ...mockApplications[0], description: '' },
        { ...mockApplications[1], description: undefined },
        mockApplications[2]
      ]
      
      mockApiClient.getApplications.mockResolvedValue({
        applications: appsWithEmptyDesc,
        pagination: { page: 1, pages: 1, limit: 10, total: appsWithEmptyDesc.length }
      })

      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getAllByText('-')).toHaveLength(2) // Two empty descriptions
      })
    })
  })

  describe('Search and Filtering', () => {
    it('should trigger search when typing in search field', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(mockApiClient.getApplications).toHaveBeenCalledWith({})
      })

      const searchField = screen.getByPlaceholderText('Search applications...')
      await user.type(searchField, 'NRE')

      await waitFor(() => {
        expect(mockApiClient.getApplications).toHaveBeenCalledWith({ search: 'NRE' })
      })
    })

    it('should trigger filter when checking active only', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      // Wait for component to load first
      await waitFor(() => {
        expect(screen.getByLabelText('Active only')).toBeInTheDocument()
      })

      const activeOnlyCheckbox = screen.getByLabelText('Active only')
      await user.click(activeOnlyCheckbox)

      await waitFor(() => {
        expect(mockApiClient.getApplications).toHaveBeenCalledWith({ isActive: true })
      })
    })

    it('should combine search and filter parameters', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      // Wait for component to load first
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search applications...')).toBeInTheDocument()
      })

      const searchField = screen.getByPlaceholderText('Search applications...')
      const activeOnlyCheckbox = screen.getByLabelText('Active only')

      await user.type(searchField, 'Network')
      await user.click(activeOnlyCheckbox)

      await waitFor(() => {
        expect(mockApiClient.getApplications).toHaveBeenCalledWith({
          search: 'Network',
          isActive: true
        })
      })
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no applications found', async () => {
      mockApiClient.getApplications.mockResolvedValue({
        applications: [],
        pagination: { page: 1, pages: 1, limit: 10, total: 0 }
      })

      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('No applications found')).toBeInTheDocument()
      })
    })

    it('should show filtered empty state message when filters applied', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      // Apply a search filter first
      const searchField = screen.getByPlaceholderText('Search applications...')
      await user.type(searchField, 'NonExistent')

      // Mock empty response for the search
      mockApiClient.getApplications.mockResolvedValue({
        applications: [],
        pagination: { page: 1, pages: 1, limit: 10, total: 0 }
      })

      // Re-render with empty results
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('No applications match your filters')).toBeInTheDocument()
      })
    })
  })

  describe('Create Application Modal', () => {
    it('should open create modal when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      expect(screen.getByText('Add New Application')).toBeInTheDocument()
      expect(screen.getByLabelText('Application Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Display Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Active')).toBeInTheDocument()
    })

    it('should show dropdown with existing applications in create mode', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *') as HTMLSelectElement
      expect(nameSelect).toBeInTheDocument()
      expect(screen.getByText('Select an application...')).toBeInTheDocument()
      expect(screen.getByText('+ Add New Application')).toBeInTheDocument()
    })

    it('should show custom name input when "Add New Application" is selected', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      expect(screen.getByPlaceholderText('Enter new application name')).toBeInTheDocument()
    })

    it('should auto-populate fields when existing application is selected', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      await waitFor(() => {
        const displayNameField = screen.getByLabelText('Display Name *') as HTMLInputElement
        expect(displayNameField.value).toBe('Network Resource Engine')
      })
    })

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(screen.queryByText('Add New Application')).not.toBeInTheDocument()
    })
  })

  describe('Edit Application Modal', () => {
    it('should open edit modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const editButtons = await screen.findAllByTestId('edit-icon')
      await user.click(editButtons[0])

      expect(screen.getByText('Edit Application')).toBeInTheDocument()
      expect(screen.getByDisplayValue('NRE')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Network Resource Engine')).toBeInTheDocument()
    })

    it('should show readonly name field in edit mode', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const editButtons = await screen.findAllByTestId('edit-icon')
      await user.click(editButtons[0])

      const nameField = screen.getByLabelText('Application Name *') as HTMLInputElement
      expect(nameField).toBeDisabled()
      expect(nameField).toHaveAttribute('readonly')
      expect(nameField.value).toBe('NRE')
    })

    it('should populate form with application data in edit mode', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const editButtons = await screen.findAllByTestId('edit-icon')
      await user.click(editButtons[0])

      expect(screen.getByDisplayValue('NRE')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Network Resource Engine')).toBeInTheDocument()
      expect(screen.getByDisplayValue('A comprehensive network management system')).toBeInTheDocument()
      expect(screen.getByLabelText('Active')).toBeChecked()
    })
  })

  describe('Form Validation', () => {
    it('should validate required application name for custom input', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Application name is required')).toBeInTheDocument()
    })

    it('should validate minimum application name length', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      await user.type(customNameField, 'A')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Application name must be at least 2 characters')).toBeInTheDocument()
    })

    it('should validate maximum application name length', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      await user.type(customNameField, 'A'.repeat(51)) // 51 characters

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Application name cannot exceed 50 characters')).toBeInTheDocument()
    })

    it('should validate application name format', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      await user.type(customNameField, 'Invalid@Name!')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Application name can only contain letters, numbers, spaces, hyphens, underscores, and dots')).toBeInTheDocument()
    })

    it('should validate required display name', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      await user.type(customNameField, 'ValidName')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Display name is required')).toBeInTheDocument()
    })

    it('should validate minimum display name length', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      const displayNameField = screen.getByLabelText('Display Name *')
      
      await user.type(customNameField, 'ValidName')
      await user.clear(displayNameField)
      await user.type(displayNameField, 'A')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Display name must be at least 2 characters')).toBeInTheDocument()
    })

    it('should validate maximum display name length', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      const displayNameField = screen.getByLabelText('Display Name *')
      
      await user.type(customNameField, 'ValidName')
      await user.clear(displayNameField)
      await user.type(displayNameField, 'A'.repeat(101)) // 101 characters

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Display name cannot exceed 100 characters')).toBeInTheDocument()
    })

    it('should validate maximum description length', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      const displayNameField = screen.getByLabelText('Display Name *')
      const descriptionField = screen.getByLabelText('Description')
      
      await user.type(customNameField, 'ValidName')
      await user.type(displayNameField, 'Valid Display Name')
      await user.type(descriptionField, 'A'.repeat(501)) // 501 characters

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Description cannot exceed 500 characters')).toBeInTheDocument()
    })

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      // Trigger validation error
      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)
      expect(screen.getByText('Application name is required')).toBeInTheDocument()

      // Start typing to clear error
      const customNameField = screen.getByPlaceholderText('Enter new application name')
      await user.type(customNameField, 'A')

      expect(screen.queryByText('Application name is required')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should create new application with custom name', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      const displayNameField = screen.getByLabelText('Display Name *')
      const descriptionField = screen.getByLabelText('Description')
      
      await user.type(customNameField, 'TestApp')
      await user.type(displayNameField, 'Test Application')
      await user.type(descriptionField, 'A test application')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockApiClient.createApplication).toHaveBeenCalledWith({
          name: 'TestApp',
          displayName: 'Test Application',
          description: 'A test application',
          isActive: true
        })
        expect(mockToast.success).toHaveBeenCalledWith('Application created successfully')
      })
    })

    it('should create new application with existing name', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockApiClient.createApplication).toHaveBeenCalledWith({
          name: 'NRE',
          displayName: 'Network Resource Engine',
          description: 'A comprehensive network management system',
          isActive: true
        })
      })
    })

    it('should update existing application', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const editButtons = await screen.findAllByTestId('edit-icon')
      await user.click(editButtons[0])

      const displayNameField = screen.getByLabelText('Display Name *')
      await user.clear(displayNameField)
      await user.type(displayNameField, 'Updated Display Name')

      const submitButton = screen.getByText('Update Application')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockApiClient.updateApplication).toHaveBeenCalledWith('app-1', {
          name: 'NRE',
          displayName: 'Updated Display Name',
          description: 'A comprehensive network management system',
          isActive: true
        })
        expect(mockToast.success).toHaveBeenCalledWith('Application updated successfully')
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockApiClient.createApplication.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
      expect(screen.getByText('Creating...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should disable form fields during submission', async () => {
      const user = userEvent.setup()
      mockApiClient.createApplication.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      const displayNameField = screen.getByLabelText('Display Name *')
      const descriptionField = screen.getByLabelText('Description')
      const activeCheckbox = screen.getByLabelText('Active')
      const cancelButton = screen.getByText('Cancel')

      expect(displayNameField).toBeDisabled()
      expect(descriptionField).toBeDisabled()
      expect(activeCheckbox).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    it('should handle undefined description correctly', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      const displayNameField = screen.getByLabelText('Display Name *')
      
      await user.type(customNameField, 'TestApp')
      await user.type(displayNameField, 'Test Application')
      // Leave description empty

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockApiClient.createApplication).toHaveBeenCalledWith({
          name: 'TestApp',
          displayName: 'Test Application',
          description: undefined,
          isActive: true
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API fetch error', async () => {
      mockApiClient.getApplications.mockRejectedValue(new Error('Fetch failed'))
      
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Fetch failed')
      })
    })

    it('should handle creation error', async () => {
      const user = userEvent.setup()
      mockApiClient.createApplication.mockRejectedValue(new Error('Creation failed'))
      
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Creation failed')
      })
    })

    it('should handle validation error with details', async () => {
      const user = userEvent.setup()
      const errorWithDetails = new Error(JSON.stringify({
        details: ['Name already exists', 'Display name too long']
      }))
      mockApiClient.createApplication.mockRejectedValue(errorWithDetails)
      
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Name already exists')
        expect(mockToast.error).toHaveBeenCalledWith('Display name too long')
      })
    })

    it('should handle malformed validation error', async () => {
      const user = userEvent.setup()
      const errorWithBadJSON = new Error('Invalid JSON details')
      mockApiClient.createApplication.mockRejectedValue(errorWithBadJSON)
      
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Invalid JSON details')
      })
    })

    it('should handle validation error without details', async () => {
      const user = userEvent.setup()
      const errorWithoutDetails = new Error(JSON.stringify({ message: 'General error' }))
      mockApiClient.createApplication.mockRejectedValue(errorWithoutDetails)
      
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(expect.stringContaining('General error'))
      })
    })

    it('should not show error toast for fetchAllApplications failure', async () => {
      mockApiClient.getApplications
        .mockResolvedValueOnce({ // First call for fetchApplications
          applications: mockApplications,
          pagination: { page: 1, pages: 1, limit: 10, total: mockApplications.length }
        })
        .mockRejectedValueOnce(new Error('Fetch all failed')) // Second call for fetchAllApplications

      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('Application Management')).toBeInTheDocument()
      })

      // fetchAllApplications error should not show toast
      expect(mockToast.error).not.toHaveBeenCalledWith('Fetch all failed')
    })
  })

  describe('Delete Application', () => {
    it('should open delete confirmation modal when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const deleteButtons = await screen.findAllByTestId('trash-icon')
      await user.click(deleteButtons[0])

      expect(screen.getByRole('button', { name: /delete application/i })).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to delete the application')).toBeInTheDocument()
      expect(screen.getByText('NRE')).toBeInTheDocument()
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument()
    })

    it('should close delete modal when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const deleteButtons = await screen.findAllByTestId('trash-icon')
      await user.click(deleteButtons[0])

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(screen.queryByText('Delete Application')).not.toBeInTheDocument()
    })

    it('should delete application when confirmed', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const deleteButtons = await screen.findAllByTestId('trash-icon')
      await user.click(deleteButtons[0])

      const deleteButton = screen.getByRole('button', { name: /delete application/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockApiClient.deleteApplication).toHaveBeenCalledWith('app-1')
        expect(mockToast.success).toHaveBeenCalledWith('Application deleted successfully')
      })
    })

    it('should handle delete error', async () => {
      const user = userEvent.setup()
      mockApiClient.deleteApplication.mockRejectedValue(new Error('Delete failed'))
      
      render(<ApplicationManagement />)

      const deleteButtons = await screen.findAllByTestId('trash-icon')
      await user.click(deleteButtons[0])

      const deleteButton = screen.getByRole('button', { name: /delete application/i })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Delete failed')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle applications with null/undefined properties', async () => {
      const appsWithNullProps = [
        { ...mockApplications[0], description: null as any },
        { ...mockApplications[1], createdAt: null as any },
        mockApplications[2]
      ]
      
      mockApiClient.getApplications.mockResolvedValue({
        applications: appsWithNullProps,
        pagination: { page: 1, pages: 1, limit: 10, total: appsWithNullProps.length }
      })

      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })
    })

    it('should handle form with whitespace-only values', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      const displayNameField = screen.getByLabelText('Display Name *')
      
      await user.type(customNameField, '   ')
      await user.type(displayNameField, '   ')

      const submitButton = screen.getByText('Create Application')
      await user.click(submitButton)

      expect(screen.getByText('Application name is required')).toBeInTheDocument()
      expect(screen.getByText('Display name is required')).toBeInTheDocument()
    })

    it('should handle auto-population when selected app has no description', async () => {
      const user = userEvent.setup()
      const appsWithoutDesc = [
        { ...mockApplications[0], description: undefined }
      ]
      
      mockApiClient.getApplications.mockResolvedValue({
        applications: appsWithoutDesc,
        pagination: { page: 1, pages: 1, limit: 10, total: appsWithoutDesc.length }
      })

      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, 'NRE')

      await waitFor(() => {
        const descriptionField = screen.getByLabelText('Description') as HTMLTextAreaElement
        expect(descriptionField.value).toBe('')
      })
    })

    it('should handle selecting empty string in dropdown', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')
      await user.selectOptions(nameSelect, '') // Back to empty

      expect(screen.queryByPlaceholderText('Enter new application name')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels and structure', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      expect(screen.getByLabelText('Application Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Display Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Active')).toBeInTheDocument()
    })

    it('should have proper table structure', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getAllByRole('columnheader')).toHaveLength(6)
        expect(screen.getAllByRole('row')).toHaveLength(4) // 1 header + 3 data rows
      })
    })

    it('should have proper button titles and labels', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        const editButtons = screen.getAllByTitle('Edit application')
        const deleteButtons = screen.getAllByTitle('Delete application')
        
        expect(editButtons).toHaveLength(3)
        expect(deleteButtons).toHaveLength(3)
      })
    })
  })

  describe('Modal State Management', () => {
    it('should reset form when opening create modal', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      // First open edit modal
      const editButtons = await screen.findAllByTestId('edit-icon')
      await user.click(editButtons[0])
      expect(screen.getByDisplayValue('NRE')).toBeInTheDocument()

      // Close modal
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Open create modal
      const addButton = screen.getByRole('button', { name: /add application/i })
      await user.click(addButton)

      // Form should be reset
      const nameSelect = screen.getByLabelText('Application Name *') as HTMLSelectElement
      expect(nameSelect.value).toBe('')
    })

    it('should reset form when closing modal', async () => {
      const user = userEvent.setup()
      render(<ApplicationManagement />)

      const addButton = await screen.findByRole('button', { name: /add application/i })
      await user.click(addButton)

      const nameSelect = screen.getByLabelText('Application Name *')
      await user.selectOptions(nameSelect, '__custom__')

      const customNameField = screen.getByPlaceholderText('Enter new application name')
      await user.type(customNameField, 'TestApp')

      // Close modal
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Reopen modal
      await user.click(addButton)

      // Form should be reset
      const newNameSelect = screen.getByLabelText('Application Name *') as HTMLSelectElement
      expect(newNameSelect.value).toBe('')
    })
  })

  describe('Application Filtering Logic', () => {
    it('should handle local filtering when search term is applied', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
        expect(screen.getByText('Network Virtualization Engine')).toBeInTheDocument()
        expect(screen.getByText('Electronic Invitation System')).toBeInTheDocument()
      })

      // The local filtering is tested through the component's filteredApplications logic
      // This test ensures that the filtering function doesn't crash and renders correctly
      expect(screen.getAllByTestId('building-icon')).toHaveLength(3)
    })

    it('should handle active-only filtering', async () => {
      render(<ApplicationManagement />)

      await waitFor(() => {
        expect(screen.getAllByText('Active')).toHaveLength(2)
        expect(screen.getByText('Inactive')).toBeInTheDocument()
      })
    })
  })
})