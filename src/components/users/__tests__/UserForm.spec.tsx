import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserForm from '../UserForm'
import { mockUser } from '@/__tests__/utils/test-utils'

describe('UserForm', () => {
    const defaultProps = {
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        isEditing: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders create user form when not editing', () => {
        render(<UserForm {...defaultProps} />)

        expect(screen.getByText('Create User')).toBeInTheDocument()
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    })

    it('renders edit user form when editing', () => {
        render(<UserForm {...defaultProps} user={mockUser} isEditing={true} />)

        expect(screen.getByText('Edit User')).toBeInTheDocument()
        expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument()
        expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument()
        expect(screen.getByDisplayValue(mockUser.role)).toBeInTheDocument()
    })

    it('validates required fields on submit', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(screen.getByText('Name is required')).toBeInTheDocument()
        expect(screen.getByText('Email is required')).toBeInTheDocument()
        expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    it('validates email format', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        const emailInput = screen.getByLabelText(/email/i)
        await user.type(emailInput, 'invalid-email')

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    it('validates password length', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        const passwordInput = screen.getByLabelText(/password/i)
        await user.type(passwordInput, '123')

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })

    it('submits form with valid data', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        await user.type(screen.getByLabelText(/full name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')
        await user.selectOptions(screen.getByLabelText(/role/i), 'admin')

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            role: 'admin',
            assignedApplications: [],
            isActive: true,
        })
    })

    it('calls onCancel when cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        await user.click(cancelButton)

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    })

    it('shows loading state during submission', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn().mockImplementation(() =>
            new Promise(resolve => setTimeout(resolve, 100))
        )

        render(<UserForm {...defaultProps} onSubmit={onSubmit} />)

        await user.type(screen.getByLabelText(/full name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(screen.getByText('Creating...')).toBeInTheDocument()
        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('disables form during submission', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn().mockImplementation(() =>
            new Promise(resolve => setTimeout(resolve, 100))
        )

        render(<UserForm {...defaultProps} onSubmit={onSubmit} />)

        await user.type(screen.getByLabelText(/full name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(screen.getByLabelText(/full name/i)).toBeDisabled()
        expect(screen.getByLabelText(/email/i)).toBeDisabled()
        expect(screen.getByLabelText(/password/i)).toBeDisabled()
        expect(screen.getByLabelText(/role/i)).toBeDisabled()
    })

    it('handles application assignment', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        // Open application dropdown
        const appDropdown = screen.getByText('Select Applications')
        await user.click(appDropdown)

        // Select applications
        const app1 = screen.getByText('App 1')
        await user.click(app1)

        const app2 = screen.getByText('App 2')
        await user.click(app2)

        await user.type(screen.getByLabelText(/full name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                assignedApplications: ['App 1', 'App 2'],
            })
        )
    })

    it('toggles user active status', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        const activeToggle = screen.getByRole('checkbox', { name: /active/i })
        expect(activeToggle).toBeChecked()

        await user.click(activeToggle)
        expect(activeToggle).not.toBeChecked()

        await user.type(screen.getByLabelText(/full name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'john@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                isActive: false,
            })
        )
    })

    it('clears validation errors when input changes', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        // Trigger validation error
        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        expect(screen.getByText('Name is required')).toBeInTheDocument()

        // Start typing to clear error
        const nameInput = screen.getByLabelText(/full name/i)
        await user.type(nameInput, 'J')

        expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
    })

    it('handles password visibility toggle', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        const passwordInput = screen.getByLabelText(/password/i)
        expect(passwordInput).toHaveAttribute('type', 'password')

        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i })
        await user.click(toggleButton)

        expect(passwordInput).toHaveAttribute('type', 'text')

        await user.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('does not require password when editing user', () => {
        render(<UserForm {...defaultProps} user={mockUser} isEditing={true} />)

        const passwordInput = screen.getByLabelText(/password/i)
        expect(passwordInput).toHaveAttribute('placeholder', 'Enter new password (optional)')
    })

    it('validates unique email addresses', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn().mockRejectedValue(
            new Error('Email already exists')
        )

        render(<UserForm {...defaultProps} onSubmit={onSubmit} />)

        await user.type(screen.getByLabelText(/full name/i), 'John Doe')
        await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
        await user.type(screen.getByLabelText(/password/i), 'password123')

        const submitButton = screen.getByRole('button', { name: /create user/i })
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Email already exists')).toBeInTheDocument()
        })
    })

    it('has proper accessibility attributes', () => {
        render(<UserForm {...defaultProps} />)

        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument()

        // Form should have proper structure
        const form = screen.getByRole('form') || screen.getByLabelText(/full name/i).closest('form')
        expect(form).toBeInTheDocument()
    })

    it('handles keyboard navigation properly', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        // Should be able to tab through form fields
        await user.tab()
        expect(screen.getByLabelText(/full name/i)).toHaveFocus()

        await user.tab()
        expect(screen.getByLabelText(/email/i)).toHaveFocus()

        await user.tab()
        expect(screen.getByLabelText(/password/i)).toHaveFocus()

        await user.tab()
        expect(screen.getByLabelText(/role/i)).toHaveFocus()
    })

    it('populates form with user data when editing', () => {
        const userToEdit = {
            ...mockUser,
            assignedApplications: ['App 1', 'App 2'],
            isActive: false,
        }

        render(<UserForm {...defaultProps} user={userToEdit} isEditing={true} />)

        expect(screen.getByDisplayValue(userToEdit.name)).toBeInTheDocument()
        expect(screen.getByDisplayValue(userToEdit.email)).toBeInTheDocument()
        expect(screen.getByDisplayValue(userToEdit.role)).toBeInTheDocument()

        const activeToggle = screen.getByRole('checkbox', { name: /active/i })
        expect(activeToggle).not.toBeChecked()
    })

    it('handles role selection correctly', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        const roleSelect = screen.getByLabelText(/role/i)
        await user.selectOptions(roleSelect, 'super_admin')

        expect(screen.getByDisplayValue('super_admin')).toBeInTheDocument()
    })

    it('validates form on blur events', async () => {
        const user = userEvent.setup()
        render(<UserForm {...defaultProps} />)

        const emailInput = screen.getByLabelText(/email/i)
        await user.type(emailInput, 'invalid-email')
        await user.tab() // Trigger blur

        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
})
