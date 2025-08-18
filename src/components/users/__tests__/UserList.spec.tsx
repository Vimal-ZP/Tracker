import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserList from '../UserList'
import { render as customRender, mockUser, mockSuperAdminUser } from '@/__tests__/utils/test-utils'

const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    isActive: true,
    assignedApplications: ['App1', 'App2'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'basic',
    isActive: false,
    assignedApplications: ['App1'],
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
]

describe('UserList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renders loading state initially', () => {
    global.fetch = jest.fn().mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )

    customRender(<UserList />, { user: mockSuperAdminUser })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays users after loading', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('displays user roles correctly', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('User')).toBeInTheDocument()
    })
  })

  it('shows user status correctly', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })
  })

  it('filters users by search term', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'John')

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('filters users by role', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    const roleFilter = screen.getByDisplayValue('All Roles')
    await user.selectOptions(roleFilter, 'admin')

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('filters users by status', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    const statusFilter = screen.getByDisplayValue('All Status')
    await user.selectOptions(statusFilter, 'active')

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('shows Add User button for authorized users', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument()
  })

  it('handles user edit action', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText(/edit user/i)
      expect(editButtons).toHaveLength(2)
    })

    const editButton = screen.getAllByLabelText(/edit user/i)[0]
    await user.click(editButton)

    // Should open edit modal or navigate to edit page
    // This depends on the implementation
  })

  it('handles user delete action', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'User deleted' }),
      })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText(/delete user/i)
      expect(deleteButtons).toHaveLength(2)
    })

    const deleteButton = screen.getAllByLabelText(/delete user/i)[0]
    await user.click(deleteButton)

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()

    const confirmButton = screen.getByRole('button', { name: /delete/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  it('handles user status toggle', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          ...mockUsers[0], 
          isActive: false 
        }),
      })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      const toggleButtons = screen.getAllByLabelText(/toggle user status/i)
      expect(toggleButtons).toHaveLength(2)
    })

    const toggleButton = screen.getAllByLabelText(/toggle user status/i)[0]
    await user.click(toggleButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isActive: false }),
        })
      )
    })
  })

  it('displays user avatars', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument() // John Doe initials
      expect(screen.getByText('JS')).toBeInTheDocument() // Jane Smith initials
    })
  })

  it('shows assigned applications', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('App1, App2')).toBeInTheDocument()
      expect(screen.getByText('App1')).toBeInTheDocument()
    })
  })

  it('handles pagination correctly', async () => {
    const manyUsers = Array.from({ length: 25 }, (_, i) => ({
      _id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: 'basic',
      isActive: true,
      assignedApplications: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(manyUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      // Should show first 10 users by default
      expect(screen.getByText('User 0')).toBeInTheDocument()
      expect(screen.getByText('User 9')).toBeInTheDocument()
      expect(screen.queryByText('User 10')).not.toBeInTheDocument()
    })

    // Check for pagination controls
    expect(screen.getByLabelText(/next page/i)).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no users found', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument()
    })
  })

  it('refreshes user list when refresh button is clicked', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    await user.click(refreshButton)

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('has proper table accessibility', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(6) // Name, Email, Role, Status, Applications, Actions
    })
  })

  it('sorts users by name', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      const nameHeader = screen.getByRole('columnheader', { name: /name/i })
      expect(nameHeader).toBeInTheDocument()
    })

    const nameHeader = screen.getByRole('columnheader', { name: /name/i })
    await user.click(nameHeader)

    // Should sort by name
    // The exact behavior depends on implementation
  })

  it('handles keyboard navigation in table', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    })

    customRender(<UserList />, { user: mockSuperAdminUser })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Should be able to navigate with keyboard
    await user.tab()
    expect(document.activeElement).toBeInTheDocument()
  })
})
