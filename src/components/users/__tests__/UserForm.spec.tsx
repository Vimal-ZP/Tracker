import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserForm from '../UserForm'
import { UserRole, AVAILABLE_APPLICATIONS } from '@/types/user'
import { render as customRender } from '@/__tests__/utils/test-utils'

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
}))

describe('UserForm', () => {
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
  })

  describe('Component Rendering', () => {
    it('should render create user form with all fields', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Role')).toBeInTheDocument()
      expect(screen.getByText('Create User')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should render edit user form with populated fields', () => {
      customRender(
        <UserForm {...mockProps} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('Update User')).toBeInTheDocument()
      expect(screen.getByText('(leave blank to keep current)')).toBeInTheDocument()
    })

    it('should render icons in form fields', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      expect(screen.getByTestId('user-icon')).toBeInTheDocument()
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
    })

    it('should show applications section for super admin', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      expect(screen.getByText('Assigned Applications')).toBeInTheDocument()
      expect(screen.getByTestId('folder-open-icon')).toBeInTheDocument()
    })

    it('should not show applications section for non-super admin', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockAdminUser
      })

      expect(screen.queryByText('Assigned Applications')).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate required name field', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(mockProps.onSubmit).not.toHaveBeenCalled()
    })

    it('should validate minimum name length', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const nameField = screen.getByLabelText('Full Name')
      await user.type(nameField, 'A')

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument()
    })

    it('should validate required email field', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const nameField = screen.getByLabelText('Full Name')
      await user.type(nameField, 'John Doe')

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const nameField = screen.getByLabelText('Full Name')
      const emailField = screen.getByLabelText('Email Address')

      await user.type(nameField, 'John Doe')
      await user.type(emailField, 'invalid-email')

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      expect(screen.getByText('Email is invalid')).toBeInTheDocument()
    })

    it('should validate required password for new user', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const nameField = screen.getByLabelText('Full Name')
      const emailField = screen.getByLabelText('Email Address')

      await user.type(nameField, 'John Doe')
      await user.type(emailField, 'john@example.com')

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('should validate minimum password length', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const nameField = screen.getByLabelText('Full Name')
      const emailField = screen.getByLabelText('Email Address')
      const passwordField = screen.getByLabelText('Password')

      await user.type(nameField, 'John Doe')
      await user.type(emailField, 'john@example.com')
      await user.type(passwordField, '123')

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    it('should not require password for editing user', async () => {
      const user = userEvent.setup()
      customRender(
        <UserForm {...mockProps} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      const submitButton = screen.getByText('Update User')
      await user.click(submitButton)

      expect(screen.queryByText('Password is required')).not.toBeInTheDocument()
      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalled()
      })
    })

    it('should validate password length when provided in edit mode', async () => {
      const user = userEvent.setup()
      customRender(
        <UserForm {...mockProps} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      const passwordField = screen.getByLabelText(/Password/)
      await user.type(passwordField, '123')

      const submitButton = screen.getByText('Update User')
      await user.click(submitButton)

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  describe('Error Handling and Clearing', () => {
    it('should clear error when user starts typing in name field', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      // Trigger validation error
      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)
      expect(screen.getByText('Name is required')).toBeInTheDocument()

      // Start typing to clear error
      const nameField = screen.getByLabelText('Full Name')
      await user.type(nameField, 'J')

      expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })

    it('should clear error when user starts typing in email field', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const nameField = screen.getByLabelText('Full Name')
      await user.type(nameField, 'John Doe')

      // Trigger validation error
      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)
      expect(screen.getByText('Email is required')).toBeInTheDocument()

      // Start typing to clear error
      const emailField = screen.getByLabelText('Email Address')
      await user.type(emailField, 'j')

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })

    it('should apply error styling to invalid fields', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      const nameField = screen.getByLabelText('Full Name')
      const emailField = screen.getByLabelText('Email Address')
      const passwordField = screen.getByLabelText('Password')

      expect(nameField).toHaveClass('input-error')
      expect(emailField).toHaveClass('input-error')
      expect(passwordField).toHaveClass('input-error')
    })
  })

  describe('Role Management', () => {
    it('should show role dropdown for super admin', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      expect(screen.getByLabelText('Role')).toBeInTheDocument()
      expect(screen.getByText('Basic User')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Super Admin')).toBeInTheDocument()
    })

    it('should show limited role options for admin', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockAdminUser
      })

      expect(screen.getByLabelText('Role')).toBeInTheDocument()
      expect(screen.getByText('Basic User')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.queryByText('Super Admin')).not.toBeInTheDocument()
    })

    it('should not show role dropdown for basic user', () => {
      customRender(<UserForm {...mockProps} />, {
        user: { ...mockUser, role: UserRole.BASIC }
      })

      expect(screen.queryByLabelText('Role')).not.toBeInTheDocument()
    })

    it('should prevent admin from creating super admin', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockAdminUser
      })

      const roleSelect = screen.getByLabelText('Role')
      expect(roleSelect).toBeInTheDocument()
      
      // Should not have Super Admin option
      expect(screen.queryByText('Super Admin')).not.toBeInTheDocument()
    })

    it('should handle role change', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const roleSelect = screen.getByLabelText('Role')
      await user.selectOptions(roleSelect, UserRole.ADMIN)

      expect(roleSelect).toHaveValue(UserRole.ADMIN)
    })
  })

  describe('Application Management', () => {
    it('should show application dropdown for super admin when role is ADMIN or BASIC', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      expect(screen.getByText('Assigned Applications')).toBeInTheDocument()
      expect(screen.getByText('Select applications...')).toBeInTheDocument()
    })

    it('should not show application dropdown for SUPER_ADMIN role', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const roleSelect = screen.getByLabelText('Role')
      await user.selectOptions(roleSelect, UserRole.SUPER_ADMIN)

      expect(screen.queryByText('Assigned Applications')).not.toBeInTheDocument()
    })

    it('should open application dropdown when clicked', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const dropdownButton = screen.getByText('Select applications...')
      await user.click(dropdownButton)

      // Should show available applications
      AVAILABLE_APPLICATIONS.forEach(app => {
        expect(screen.getByText(app)).toBeInTheDocument()
      })
    })

    it('should toggle application selection', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const dropdownButton = screen.getByText('Select applications...')
      await user.click(dropdownButton)

      const nreOption = screen.getByText('NRE')
      await user.click(nreOption)

      // Should show selected application
      expect(screen.getByText('1 application selected')).toBeInTheDocument()
      expect(screen.getByText('NRE')).toBeInTheDocument()
    })

    it('should remove application when X is clicked', async () => {
      const user = userEvent.setup()
      customRender(
        <UserForm {...mockProps} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      // User already has NRE and NVE assigned
      expect(screen.getByText('NRE')).toBeInTheDocument()
      expect(screen.getByText('NVE')).toBeInTheDocument()

      // Find and click the X button for NRE
      const nreTag = screen.getByText('NRE').closest('span')
      const removeButton = nreTag?.querySelector('[data-testid="x-icon"]')?.closest('button')
      
      if (removeButton) {
        await user.click(removeButton)
      }

      expect(screen.queryByText('NRE')).not.toBeInTheDocument()
      expect(screen.getByText('NVE')).toBeInTheDocument() // NVE should still be there
    })

    it('should show warning when no applications assigned', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      expect(screen.getByText('No applications assigned. User will have limited access.')).toBeInTheDocument()
    })

    it('should update dropdown text when applications selected', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const dropdownButton = screen.getByText('Select applications...')
      await user.click(dropdownButton)

      const nreOption = screen.getByText('NRE')
      await user.click(nreOption)

      expect(screen.getByText('1 application selected')).toBeInTheDocument()

      const nveOption = screen.getByText('NVE')
      await user.click(nveOption)

      expect(screen.getByText('2 applications selected')).toBeInTheDocument()
    })

    it('should show checkmark for selected applications', async () => {
      const user = userEvent.setup()
      customRender(
        <UserForm {...mockProps} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      const dropdownButton = screen.getByText('2 applications selected')
      await user.click(dropdownButton)

      // Should show checkmarks for selected apps
      const nreOption = screen.getByText('NRE').closest('div')
      const nveOption = screen.getByText('NVE').closest('div')

      expect(nreOption).toHaveClass('text-blue-900', 'bg-blue-50')
      expect(nveOption).toHaveClass('text-blue-900', 'bg-blue-50')
    })
  })

  describe('Form Submission', () => {
    it('should submit valid form data for new user', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const nameField = screen.getByLabelText('Full Name')
      const emailField = screen.getByLabelText('Email Address')
      const passwordField = screen.getByLabelText('Password')

      await user.type(nameField, 'John Doe')
      await user.type(emailField, 'john@example.com')
      await user.type(passwordField, 'password123')

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: UserRole.BASIC,
          assignedApplications: []
        })
      })
    })

    it('should submit valid form data for editing user', async () => {
      const user = userEvent.setup()
      customRender(
        <UserForm {...mockProps} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      const submitButton = screen.getByText('Update User')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: undefined,
          role: UserRole.BASIC,
          assignedApplications: ['NRE', 'NVE']
        })
      })
    })

    it('should include password in edit mode when provided', async () => {
      const user = userEvent.setup()
      customRender(
        <UserForm {...mockProps} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      const passwordField = screen.getByLabelText(/Password/)
      await user.type(passwordField, 'newpassword123')

      const submitButton = screen.getByText('Update User')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockProps.onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'newpassword123',
          role: UserRole.BASIC,
          assignedApplications: ['NRE', 'NVE']
        })
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      const slowSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      customRender(
        <UserForm {...mockProps} onSubmit={slowSubmit} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      const submitButton = screen.getByText('Update User')
      await user.click(submitButton)

      expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      })
    })

    it('should disable form during submission', async () => {
      const user = userEvent.setup()
      const slowSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      customRender(
        <UserForm {...mockProps} onSubmit={slowSubmit} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      const submitButton = screen.getByText('Update User')
      const cancelButton = screen.getByText('Cancel')
      
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Form Actions', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockProps.onCancel).toHaveBeenCalled()
    })

    it('should prevent default form submission', async () => {
      const user = userEvent.setup()
      const preventDefault = jest.fn()
      
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const form = screen.getByRole('form') || screen.getByText('Create User').closest('form')!
      
      // Mock the event
      const mockEvent = { preventDefault } as any
      fireEvent.submit(form, mockEvent)

      expect(preventDefault).toHaveBeenCalled()
    })
  })

  describe('Dropdown Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const dropdownButton = screen.getByText('Select applications...')
      await user.click(dropdownButton)

      // Dropdown should be open
      expect(screen.getByText('NRE')).toBeInTheDocument()

      // Click outside
      await user.click(document.body)

      // Dropdown should be closed (applications not visible)
      expect(screen.queryByText('NRE')).not.toBeInTheDocument()
    })

    it('should update dropdown position on resize', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const dropdownButton = screen.getByText('Select applications...')
      await user.click(dropdownButton)

      // Simulate resize event
      fireEvent.resize(window)
      
      // Should not crash and dropdown should still be functional
      expect(screen.getByText('NRE')).toBeInTheDocument()
    })

    it('should update dropdown position on scroll', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const dropdownButton = screen.getByText('Select applications...')
      await user.click(dropdownButton)

      // Simulate scroll event
      fireEvent.scroll(window)
      
      // Should not crash and dropdown should still be functional
      expect(screen.getByText('NRE')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle user with undefined assignedApplications', () => {
      const userWithoutApps = {
        ...mockUser,
        assignedApplications: undefined as any
      }

      customRender(
        <UserForm {...mockProps} user={userWithoutApps} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      expect(screen.getByText('Select applications...')).toBeInTheDocument()
      expect(screen.getByText('No applications assigned. User will have limited access.')).toBeInTheDocument()
    })

    it('should handle user with non-array assignedApplications', () => {
      const userWithInvalidApps = {
        ...mockUser,
        assignedApplications: 'invalid' as any
      }

      customRender(
        <UserForm {...mockProps} user={userWithInvalidApps} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      expect(screen.getByText('Select applications...')).toBeInTheDocument()
    })

    it('should handle form submission error gracefully', async () => {
      const user = userEvent.setup()
      const errorSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'))
      
      customRender(
        <UserForm {...mockProps} onSubmit={errorSubmit} user={mockUser} isEditing={true} />,
        { user: mockSuperAdminUser }
      )

      const submitButton = screen.getByText('Update User')
      await user.click(submitButton)

      await waitFor(() => {
        expect(errorSubmit).toHaveBeenCalled()
        // Form should return to normal state after error
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should handle missing refs gracefully', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      // Simulate clicking without refs being set
      const dropdownButton = screen.getByText('Select applications...')
      
      // Should not crash
      expect(dropdownButton).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Role')).toBeInTheDocument()
    })

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const submitButton = screen.getByText('Create User')
      await user.click(submitButton)

      const nameField = screen.getByLabelText('Full Name')
      const nameError = screen.getByText('Name is required')

      expect(nameField).toHaveClass('input-error')
      expect(nameError).toBeInTheDocument()
    })

    it('should have proper button roles and text', () => {
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const submitButton = screen.getByRole('button', { name: 'Create User' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })

      expect(submitButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      customRender(<UserForm {...mockProps} />, {
        user: mockSuperAdminUser
      })

      const nameField = screen.getByLabelText('Full Name')
      const emailField = screen.getByLabelText('Email Address')

      await user.tab()
      expect(nameField).toHaveFocus()

      await user.tab()
      expect(emailField).toHaveFocus()
    })
  })
})