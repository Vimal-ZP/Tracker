import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewReleaseModal from '../NewReleaseModal'
import { mockFetch } from '@/__tests__/utils/test-utils'

describe('NewReleaseModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onReleaseCreated: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renders when open', () => {
    render(<NewReleaseModal {...defaultProps} />)

    expect(screen.getByText('Create New Release')).toBeInTheDocument()
    expect(screen.getByLabelText(/release name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/application/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/version/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/release date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<NewReleaseModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Create New Release')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<NewReleaseModal {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<NewReleaseModal {...defaultProps} />)

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    expect(screen.getByText('Release name is required')).toBeInTheDocument()
    expect(screen.getByText('Application name is required')).toBeInTheDocument()
    expect(screen.getByText('Version is required')).toBeInTheDocument()
    expect(screen.getByText('Release date is required')).toBeInTheDocument()
  })

  it('validates version format', async () => {
    const user = userEvent.setup()
    render(<NewReleaseModal {...defaultProps} />)

    const versionInput = screen.getByLabelText(/version/i)
    await user.type(versionInput, 'invalid-version')

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    expect(screen.getByText('Version must be in format x.y.z')).toBeInTheDocument()
  })

  it('validates future release date', async () => {
    const user = userEvent.setup()
    render(<NewReleaseModal {...defaultProps} />)

    const releaseDateInput = screen.getByLabelText(/release date/i)
    const pastDate = '2020-01-01'
    await user.type(releaseDateInput, pastDate)

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    expect(screen.getByText('Release date cannot be in the past')).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      _id: 'release-123',
      title: 'Test Release',
      applicationName: 'Test App',
      version: '1.0.0',
      releaseDate: '2024-12-31',
      description: 'Test description',
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    render(<NewReleaseModal {...defaultProps} />)

    // Fill in all required fields
    await user.type(screen.getByLabelText(/release name/i), 'Test Release')
    await user.type(screen.getByLabelText(/application/i), 'Test App')
    await user.type(screen.getByLabelText(/version/i), '1.0.0')
    await user.type(screen.getByLabelText(/release date/i), '2024-12-31')
    await user.type(screen.getByLabelText(/description/i), 'Test description')

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Release',
          applicationName: 'Test App',
          version: '1.0.0',
          releaseDate: '2024-12-31',
          description: 'Test description',
        }),
      })
    })

    expect(defaultProps.onReleaseCreated).toHaveBeenCalledWith(mockResponse)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()

    global.fetch = jest.fn().mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({}),
          }), 100
        )
      )
    )

    render(<NewReleaseModal {...defaultProps} />)

    // Fill in required fields
    await user.type(screen.getByLabelText(/release name/i), 'Test Release')
    await user.type(screen.getByLabelText(/application/i), 'Test App')
    await user.type(screen.getByLabelText(/version/i), '1.0.0')
    await user.type(screen.getByLabelText(/release date/i), '2024-12-31')

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    const user = userEvent.setup()

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Creation failed' }),
    })

    render(<NewReleaseModal {...defaultProps} />)

    // Fill in required fields
    await user.type(screen.getByLabelText(/release name/i), 'Test Release')
    await user.type(screen.getByLabelText(/application/i), 'Test App')
    await user.type(screen.getByLabelText(/version/i), '1.0.0')
    await user.type(screen.getByLabelText(/release date/i), '2024-12-31')

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Creation failed')).toBeInTheDocument()
    })

    expect(defaultProps.onReleaseCreated).not.toHaveBeenCalled()
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('handles network error gracefully', async () => {
    const user = userEvent.setup()

    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    render(<NewReleaseModal {...defaultProps} />)

    // Fill in required fields
    await user.type(screen.getByLabelText(/release name/i), 'Test Release')
    await user.type(screen.getByLabelText(/application/i), 'Test App')
    await user.type(screen.getByLabelText(/version/i), '1.0.0')
    await user.type(screen.getByLabelText(/release date/i), '2024-12-31')

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to create release')).toBeInTheDocument()
    })
  })

  it('resets form when modal is reopened', () => {
    const { rerender } = render(<NewReleaseModal {...defaultProps} isOpen={false} />)

    rerender(<NewReleaseModal {...defaultProps} isOpen={true} />)

    expect(screen.getByLabelText(/release name/i)).toHaveValue('')
    expect(screen.getByLabelText(/application/i)).toHaveValue('')
    expect(screen.getByLabelText(/version/i)).toHaveValue('')
    expect(screen.getByLabelText(/description/i)).toHaveValue('')
  })

  it('clears error messages when input changes', async () => {
    const user = userEvent.setup()
    render(<NewReleaseModal {...defaultProps} />)

    // Trigger validation error
    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    expect(screen.getByText('Release name is required')).toBeInTheDocument()

    // Start typing in the field
    const releaseNameInput = screen.getByLabelText(/release name/i)
    await user.type(releaseNameInput, 'T')

    expect(screen.queryByText('Release name is required')).not.toBeInTheDocument()
  })

  it('disables form inputs during submission', async () => {
    const user = userEvent.setup()

    global.fetch = jest.fn().mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({}),
          }), 100
        )
      )
    )

    render(<NewReleaseModal {...defaultProps} />)

    // Fill in required fields
    await user.type(screen.getByLabelText(/release name/i), 'Test Release')
    await user.type(screen.getByLabelText(/application/i), 'Test App')
    await user.type(screen.getByLabelText(/version/i), '1.0.0')
    await user.type(screen.getByLabelText(/release date/i), '2024-12-31')

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    expect(screen.getByLabelText(/release name/i)).toBeDisabled()
    expect(screen.getByLabelText(/application/i)).toBeDisabled()
    expect(screen.getByLabelText(/version/i)).toBeDisabled()
    expect(screen.getByLabelText(/release date/i)).toBeDisabled()
    expect(screen.getByLabelText(/description/i)).toBeDisabled()
  })

  it('validates minimum description length', async () => {
    const user = userEvent.setup()
    render(<NewReleaseModal {...defaultProps} />)

    const descriptionInput = screen.getByLabelText(/description/i)
    await user.type(descriptionInput, 'Short')

    const createButton = screen.getByRole('button', { name: /create release/i })
    await user.click(createButton)

    expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument()
  })

  it('handles keyboard navigation properly', async () => {
    const user = userEvent.setup()
    render(<NewReleaseModal {...defaultProps} />)

    // Should be able to tab through form fields
    await user.tab()
    expect(screen.getByLabelText(/release name/i)).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText(/application/i)).toHaveFocus()

    await user.tab()
    expect(screen.getByLabelText(/version/i)).toHaveFocus()
  })

  it('closes modal on Escape key', () => {
    render(<NewReleaseModal {...defaultProps} />)

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<NewReleaseModal {...defaultProps} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')

    // Form inputs should have proper labels
    expect(screen.getByLabelText(/release name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/application/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/version/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/release date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })
})
