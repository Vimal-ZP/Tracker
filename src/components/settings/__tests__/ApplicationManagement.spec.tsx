import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplicationManagement from '../ApplicationManagement'
import { render as customRender, mockUser, mockApplication } from '@/__tests__/utils/test-utils'

const mockApplications = [
    {
        _id: '1',
        name: 'test-app',
        displayName: 'Test Application',
        description: 'A test application',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
    },
    {
        _id: '2',
        name: 'demo-app',
        displayName: 'Demo Application',
        description: 'A demo application',
        isActive: false,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
    },
]

describe('ApplicationManagement', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        global.fetch = jest.fn()
    })

    it('renders loading state initially', () => {
        global.fetch = jest.fn().mockImplementation(() =>
            new Promise(() => { }) // Never resolves
        )

        customRender(<ApplicationManagement />, { user: mockUser })

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('displays applications after loading', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            expect(screen.getByText('Test Application')).toBeInTheDocument()
            expect(screen.getByText('Demo Application')).toBeInTheDocument()
        })
    })

    it('shows Add Application button', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        expect(screen.getByRole('button', { name: /add application/i })).toBeInTheDocument()
    })

    it('opens add application form when button clicked', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        const addButton = screen.getByRole('button', { name: /add application/i })
        await user.click(addButton)

        expect(screen.getByText('Add New Application')).toBeInTheDocument()
        expect(screen.getByLabelText(/application name/i)).toBeInTheDocument()
    })

    it('validates required fields in add form', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        const addButton = screen.getByRole('button', { name: /add application/i })
        await user.click(addButton)

        const saveButton = screen.getByRole('button', { name: /save/i })
        await user.click(saveButton)

        expect(screen.getByText('Application name is required')).toBeInTheDocument()
        expect(screen.getByText('Display name is required')).toBeInTheDocument()
        expect(screen.getByText('Description is required')).toBeInTheDocument()
    })

    it('validates application name format', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        const addButton = screen.getByRole('button', { name: /add application/i })
        await user.click(addButton)

        const nameInput = screen.getByLabelText(/application name/i)
        await user.type(nameInput, 'Invalid Name!')

        const saveButton = screen.getByRole('button', { name: /save/i })
        await user.click(saveButton)

        expect(screen.getByText('Name must contain only lowercase letters, numbers, and hyphens')).toBeInTheDocument()
    })

    it('submits new application with valid data', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApplications),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    _id: '3',
                    name: 'new-app',
                    displayName: 'New Application',
                    description: 'A new application',
                    isActive: true,
                }),
            })

        customRender(<ApplicationManagement />, { user: mockUser })

        const addButton = screen.getByRole('button', { name: /add application/i })
        await user.click(addButton)

        await user.type(screen.getByLabelText(/application name/i), 'new-app')
        await user.type(screen.getByLabelText(/display name/i), 'New Application')
        await user.type(screen.getByLabelText(/description/i), 'A new application')

        const saveButton = screen.getByRole('button', { name: /save/i })
        await user.click(saveButton)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'new-app',
                    displayName: 'New Application',
                    description: 'A new application',
                    isActive: true,
                }),
            })
        })
    })

    it('opens edit form when edit button clicked', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            const editButtons = screen.getAllByLabelText(/edit application/i)
            expect(editButtons).toHaveLength(2)
        })

        const editButton = screen.getAllByLabelText(/edit application/i)[0]
        await user.click(editButton)

        expect(screen.getByText('Edit Application')).toBeInTheDocument()
        expect(screen.getByDisplayValue('test-app')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test Application')).toBeInTheDocument()
    })

    it('updates application with edited data', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApplications),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    ...mockApplications[0],
                    displayName: 'Updated Application',
                }),
            })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            const editButtons = screen.getAllByLabelText(/edit application/i)
            expect(editButtons).toHaveLength(2)
        })

        const editButton = screen.getAllByLabelText(/edit application/i)[0]
        await user.click(editButton)

        const displayNameInput = screen.getByDisplayValue('Test Application')
        await user.clear(displayNameInput)
        await user.type(displayNameInput, 'Updated Application')

        const saveButton = screen.getByRole('button', { name: /save/i })
        await user.click(saveButton)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/applications/1', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'test-app',
                    displayName: 'Updated Application',
                    description: 'A test application',
                    isActive: true,
                }),
            })
        })
    })

    it('deletes application when delete button clicked', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApplications),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ message: 'Application deleted' }),
            })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            const deleteButtons = screen.getAllByLabelText(/delete application/i)
            expect(deleteButtons).toHaveLength(2)
        })

        const deleteButton = screen.getAllByLabelText(/delete application/i)[0]
        await user.click(deleteButton)

        // Should show confirmation dialog
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument()

        const confirmButton = screen.getByRole('button', { name: /delete/i })
        await user.click(confirmButton)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/applications/1', {
                method: 'DELETE',
            })
        })
    })

    it('toggles application status', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApplications),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    ...mockApplications[0],
                    isActive: false,
                }),
            })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            const toggleButtons = screen.getAllByLabelText(/toggle application status/i)
            expect(toggleButtons).toHaveLength(2)
        })

        const toggleButton = screen.getAllByLabelText(/toggle application status/i)[0]
        await user.click(toggleButton)

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/applications/1', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: false }),
            })
        })
    })

    it('filters applications by search term', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            expect(screen.getByText('Test Application')).toBeInTheDocument()
            expect(screen.getByText('Demo Application')).toBeInTheDocument()
        })

        const searchInput = screen.getByPlaceholderText(/search applications/i)
        await user.type(searchInput, 'Test')

        expect(screen.getByText('Test Application')).toBeInTheDocument()
        expect(screen.queryByText('Demo Application')).not.toBeInTheDocument()
    })

    it('filters applications by status', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            expect(screen.getByText('Test Application')).toBeInTheDocument()
            expect(screen.getByText('Demo Application')).toBeInTheDocument()
        })

        const statusFilter = screen.getByDisplayValue('All Status')
        await user.selectOptions(statusFilter, 'active')

        expect(screen.getByText('Test Application')).toBeInTheDocument()
        expect(screen.queryByText('Demo Application')).not.toBeInTheDocument()
    })

    it('shows application status badges correctly', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            expect(screen.getByText('Active')).toBeInTheDocument()
            expect(screen.getByText('Inactive')).toBeInTheDocument()
        })
    })

    it('handles API errors gracefully', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            expect(screen.getByText(/failed to load applications/i)).toBeInTheDocument()
        })
    })

    it('shows empty state when no applications found', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            expect(screen.getByText(/no applications found/i)).toBeInTheDocument()
        })
    })

    it('cancels form when cancel button clicked', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        const addButton = screen.getByRole('button', { name: /add application/i })
        await user.click(addButton)

        expect(screen.getByText('Add New Application')).toBeInTheDocument()

        const cancelButton = screen.getByRole('button', { name: /cancel/i })
        await user.click(cancelButton)

        expect(screen.queryByText('Add New Application')).not.toBeInTheDocument()
    })

    it('shows loading state during form submission', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockApplications),
            })
            .mockImplementationOnce(() =>
                new Promise(resolve =>
                    setTimeout(() =>
                        resolve({
                            ok: true,
                            json: () => Promise.resolve({}),
                        }), 100
                    )
                )
            )

        customRender(<ApplicationManagement />, { user: mockUser })

        const addButton = screen.getByRole('button', { name: /add application/i })
        await user.click(addButton)

        await user.type(screen.getByLabelText(/application name/i), 'new-app')
        await user.type(screen.getByLabelText(/display name/i), 'New Application')
        await user.type(screen.getByLabelText(/description/i), 'A new application')

        const saveButton = screen.getByRole('button', { name: /save/i })
        await user.click(saveButton)

        expect(screen.getByText('Saving...')).toBeInTheDocument()
        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('refreshes application list when refresh button clicked', async () => {
        const user = userEvent.setup()
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1)
        })

        const refreshButton = screen.getByRole('button', { name: /refresh/i })
        await user.click(refreshButton)

        expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('has proper accessibility attributes', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockApplications),
        })

        customRender(<ApplicationManagement />, { user: mockUser })

        await waitFor(() => {
            const table = screen.getByRole('table')
            expect(table).toBeInTheDocument()

            const columnHeaders = screen.getAllByRole('columnheader')
            expect(columnHeaders.length).toBeGreaterThan(0)
        })
    })
})
