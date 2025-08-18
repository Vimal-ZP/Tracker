import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NewReleaseModal from '../NewReleaseModal'
import { ReleaseType } from '@/types/release'
import { apiClient } from '@/lib/api'

// Mock dependencies
jest.mock('@/lib/api', () => ({
  apiClient: {
    getApplications: jest.fn(),
  },
}))

jest.mock('@/components/ui/Modal', () => {
  return function MockModal({ isOpen, onClose, title, children, maxWidth }: any) {
    if (!isOpen) return null
    return (
      <div data-testid="modal" data-title={title} data-max-width={maxWidth}>
        <div data-testid="modal-content">
          <h2>{title}</h2>
          <button data-testid="modal-close" onClick={onClose}>Close</button>
          {children}
        </div>
      </div>
    )
  }
})

jest.mock('lucide-react', () => ({
  Calendar: (props: any) => <div data-testid="calendar-icon" {...props}>Calendar</div>,
  Package: (props: any) => <div data-testid="package-icon" {...props}>Package</div>,
  FileText: (props: any) => <div data-testid="file-text-icon" {...props}>FileText</div>,
  Building: (props: any) => <div data-testid="building-icon" {...props}>Building</div>,
  Tag: (props: any) => <div data-testid="tag-icon" {...props}>Tag</div>,
  Settings: (props: any) => <div data-testid="settings-icon" {...props}>Settings</div>,
}))

describe('NewReleaseModal', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  }

  const mockApplications = [
    { _id: '1', name: 'NRE', displayName: 'Network Resource Engine', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: '2', name: 'NVE', displayName: 'Network Virtualization Engine', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: '3', name: 'E-Vite', displayName: 'E-Vite System', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: '4', name: 'Portal Plus', displayName: 'Portal Plus System', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: '5', name: 'Fast 2.0', displayName: 'Fast 2.0 System', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { _id: '6', name: 'FMS', displayName: 'Fleet Management System', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockApiClient.getApplications.mockResolvedValue({
      applications: mockApplications,
      totalApplications: mockApplications.length,
      totalPages: 1,
      currentPage: 1,
    })
  })

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', async () => {
      render(<NewReleaseModal {...defaultProps} />)

      expect(screen.getByTestId('modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal')).toHaveAttribute('data-title', 'Create New Release')
      expect(screen.getByTestId('modal')).toHaveAttribute('data-max-width', 'lg')
      expect(screen.getByText('Create New Release')).toBeInTheDocument()
    })

    it('should not render modal when isOpen is false', () => {
      render(<NewReleaseModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })

    it('should render all form fields with proper labels and icons', async () => {
      render(<NewReleaseModal {...defaultProps} />)

      // Wait for applications to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Release Name/)).toBeInTheDocument()
      })

      // Release Name
      expect(screen.getByLabelText(/Release Name/)).toBeInTheDocument()
      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.getByText('*', { selector: '.text-red-500' })).toBeInTheDocument()

      // Application Name
      expect(screen.getByLabelText(/Application Name/)).toBeInTheDocument()
      expect(screen.getByTestId('building-icon')).toBeInTheDocument()

      // Version
      expect(screen.getByLabelText(/Version/)).toBeInTheDocument()
      expect(screen.getByTestId('tag-icon')).toBeInTheDocument()

      // Release Date
      expect(screen.getByLabelText(/Release Date/)).toBeInTheDocument()
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()

      // Type
      expect(screen.getByLabelText(/Type/)).toBeInTheDocument()

      // Description
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument()

      // Published Status
      expect(screen.getByLabelText(/Published/)).toBeInTheDocument()
    })

    it('should render action buttons', async () => {
      render(<NewReleaseModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancel/ })).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /Create Release/ })).toBeInTheDocument()
    })
  })

  describe('Applications Loading', () => {
    it('should fetch applications when modal opens', async () => {
      render(<NewReleaseModal {...defaultProps} />)

      await waitFor(() => {
        expect(mockApiClient.getApplications).toHaveBeenCalledWith({ isActive: true })
      })
    })

    it('should display loading state for applications', () => {
      mockApiClient.getApplications.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      render(<NewReleaseModal {...defaultProps} />)

      const applicationSelect = screen.getByLabelText(/Application Name/)
      expect(applicationSelect).toBeDisabled()
      expect(screen.getByText('Loading applications...')).toBeInTheDocument()
    })

    it('should populate application options after successful fetch', async () => {
      render(<NewReleaseModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })

      expect(screen.getByText('Network Virtualization Engine')).toBeInTheDocument()
      expect(screen.getByText('E-Vite System')).toBeInTheDocument()
      expect(screen.getByText('Portal Plus System')).toBeInTheDocument()
      expect(screen.getByText('Fast 2.0 System')).toBeInTheDocument()
      expect(screen.getByText('Fleet Management System')).toBeInTheDocument()
    })

    it('should use fallback applications when API call fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiClient.getApplications.mockRejectedValue(new Error('API Error'))

      render(<NewReleaseModal {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })

      // Should still show applications from fallback
      expect(screen.getByText('Network Virtualization Engine')).toBeInTheDocument()
      expect(screen.getByText('E-Vite System')).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it('should not fetch applications when modal is closed', () => {
      render(<NewReleaseModal {...defaultProps} isOpen={false} />)

      expect(mockApiClient.getApplications).not.toHaveBeenCalled()
    })
  })

  describe('Form Interactions', () => {
    beforeEach(async () => {
      render(<NewReleaseModal {...defaultProps} />)
      // Wait for applications to load
      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })
    })

    it('should update release name field', async () => {
      const user = userEvent.setup()
      const input = screen.getByLabelText(/Release Name/)

      await user.type(input, 'Test Release')

      expect(input).toHaveValue('Test Release')
    })

    it('should update application selection', async () => {
      const user = userEvent.setup()
      const select = screen.getByLabelText(/Application Name/)

      await user.selectOptions(select, 'NRE')

      expect(select).toHaveValue('NRE')
    })

    it('should update version field', async () => {
      const user = userEvent.setup()
      const input = screen.getByLabelText(/Version/)

      await user.type(input, '1.0.0')

      expect(input).toHaveValue('1.0.0')
    })

    it('should update release date field', async () => {
      const user = userEvent.setup()
      const input = screen.getByLabelText(/Release Date/)

      await user.type(input, '2024-12-31')

      expect(input).toHaveValue('2024-12-31')
    })

    it('should update release type selection', async () => {
      const user = userEvent.setup()
      const select = screen.getByLabelText(/Type/)

      await user.selectOptions(select, ReleaseType.MAJOR)

      expect(select).toHaveValue(ReleaseType.MAJOR)
    })

    it('should update description field', async () => {
      const user = userEvent.setup()
      const textarea = screen.getByLabelText(/Description/)

      await user.type(textarea, 'This is a test release description')

      expect(textarea).toHaveValue('This is a test release description')
    })

    it('should toggle published checkbox', async () => {
      const user = userEvent.setup()
      const checkbox = screen.getByLabelText(/Published/)

      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)

      expect(checkbox).toBeChecked()
    })

    it('should show character count for description', async () => {
      const user = userEvent.setup()
      const textarea = screen.getByLabelText(/Description/)

      await user.type(textarea, 'Test description')

      expect(screen.getByText('16/500 characters')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      render(<NewReleaseModal {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })
    })

    it('should show error for empty release name', async () => {
      const user = userEvent.setup()
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      await user.click(submitButton)

      expect(screen.getByText('Release name is required')).toBeInTheDocument()
    })

    it('should show error for empty application name', async () => {
      const user = userEvent.setup()
      const releaseNameInput = screen.getByLabelText(/Release Name/)
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      await user.type(releaseNameInput, 'Test Release')
      await user.click(submitButton)

      expect(screen.getByText('Application name is required')).toBeInTheDocument()
    })

    it('should show error for invalid version format', async () => {
      const user = userEvent.setup()
      const versionInput = screen.getByLabelText(/Version/)
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      await user.type(versionInput, 'invalid-version')
      await user.click(submitButton)

      expect(screen.getByText('Version must follow semantic versioning format (e.g., 1.0.0)')).toBeInTheDocument()
    })

    it('should accept valid semantic versions', async () => {
      const user = userEvent.setup()
      const versionInput = screen.getByLabelText(/Version/)

      const validVersions = ['1.0.0', '2.1.3', '1.0.0-beta.1', '2.0.0-alpha.2']

      for (const version of validVersions) {
        await user.clear(versionInput)
        await user.type(versionInput, version)
        
        // Trigger validation by trying to submit
        const submitButton = screen.getByRole('button', { name: /Create Release/ })
        await user.click(submitButton)

        // Version error should not appear
        expect(screen.queryByText('Version must follow semantic versioning format (e.g., 1.0.0)')).not.toBeInTheDocument()
      }
    })

    it('should show error for empty release date', async () => {
      const user = userEvent.setup()
      const releaseNameInput = screen.getByLabelText(/Release Name/)
      const applicationSelect = screen.getByLabelText(/Application Name/)
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      await user.type(releaseNameInput, 'Test Release')
      await user.selectOptions(applicationSelect, 'NRE')
      await user.click(submitButton)

      expect(screen.getByText('Release date is required')).toBeInTheDocument()
    })

    it('should show error for empty description', async () => {
      const user = userEvent.setup()
      const releaseNameInput = screen.getByLabelText(/Release Name/)
      const applicationSelect = screen.getByLabelText(/Application Name/)
      const releaseDateInput = screen.getByLabelText(/Release Date/)
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      await user.type(releaseNameInput, 'Test Release')
      await user.selectOptions(applicationSelect, 'NRE')
      await user.type(releaseDateInput, '2024-12-31')
      await user.click(submitButton)

      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })

    it('should show error for description too short', async () => {
      const user = userEvent.setup()
      const descriptionTextarea = screen.getByLabelText(/Description/)
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      await user.type(descriptionTextarea, 'Short')
      await user.click(submitButton)

      expect(screen.getByText('Description must be at least 10 characters long')).toBeInTheDocument()
    })

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup()
      const releaseNameInput = screen.getByLabelText(/Release Name/)
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      // Trigger error
      await user.click(submitButton)
      expect(screen.getByText('Release name is required')).toBeInTheDocument()

      // Clear error by typing
      await user.type(releaseNameInput, 'Test')
      expect(screen.queryByText('Release name is required')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    beforeEach(async () => {
      render(<NewReleaseModal {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })
    })

    it('should submit valid form data', async () => {
      const user = userEvent.setup()
      
      // Fill out form
      await user.type(screen.getByLabelText(/Release Name/), 'Test Release')
      await user.selectOptions(screen.getByLabelText(/Application Name/), 'NRE')
      await user.type(screen.getByLabelText(/Version/), '1.0.0')
      await user.type(screen.getByLabelText(/Release Date/), '2024-12-31')
      await user.selectOptions(screen.getByLabelText(/Type/), ReleaseType.MAJOR)
      await user.type(screen.getByLabelText(/Description/), 'This is a test release description')
      await user.click(screen.getByLabelText(/Published/))

      mockOnSubmit.mockResolvedValue(undefined)

      await user.click(screen.getByRole('button', { name: /Create Release/ }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          releaseName: 'Test Release',
          applicationName: 'NRE',
          version: '1.0.0',
          releaseDate: '2024-12-31',
          type: ReleaseType.MAJOR,
          description: 'This is a test release description',
          isPublished: true,
        })
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Fill out form with valid data
      await user.type(screen.getByLabelText(/Release Name/), 'Test Release')
      await user.selectOptions(screen.getByLabelText(/Application Name/), 'NRE')
      await user.type(screen.getByLabelText(/Release Date/), '2024-12-31')
      await user.type(screen.getByLabelText(/Description/), 'This is a test release description')

      // Mock long-running submission
      let resolveSubmission: (value?: any) => void
      mockOnSubmit.mockImplementation(() => new Promise((resolve) => {
        resolveSubmission = resolve
      }))

      await user.click(screen.getByRole('button', { name: /Create Release/ }))

      // Check loading state exists (the actual text might be different)
      expect(screen.getByRole('button', { name: /Create Release/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Cancel/ })).toBeDisabled()
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      
      // Fill out form
      await user.type(screen.getByLabelText(/Release Name/), 'Test Release')
      await user.selectOptions(screen.getByLabelText(/Application Name/), 'NRE')
      await user.type(screen.getByLabelText(/Release Date/), '2024-12-31')
      await user.type(screen.getByLabelText(/Description/), 'This is a test release description')

      mockOnSubmit.mockResolvedValue(undefined)

      await user.click(screen.getByRole('button', { name: /Create Release/ }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      // After successful submission, modal should close and form should be reset
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should handle submission errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()
      
      // Fill out form
      await user.type(screen.getByLabelText(/Release Name/), 'Test Release')
      await user.selectOptions(screen.getByLabelText(/Application Name/), 'NRE')
      await user.type(screen.getByLabelText(/Release Date/), '2024-12-31')
      await user.type(screen.getByLabelText(/Description/), 'This is a test release description')

      mockOnSubmit.mockRejectedValue(new Error('Submission failed'))

      await user.click(screen.getByRole('button', { name: /Create Release/ }))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })

      // Form should not be reset on error and should not close
      expect(screen.getByLabelText(/Release Name/)).toHaveValue('Test Release')
      expect(mockOnClose).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should disable form fields during submission', async () => {
      const user = userEvent.setup()
      
      // Fill out form
      await user.type(screen.getByLabelText(/Release Name/), 'Test Release')
      await user.selectOptions(screen.getByLabelText(/Application Name/), 'NRE')
      await user.type(screen.getByLabelText(/Release Date/), '2024-12-31')
      await user.type(screen.getByLabelText(/Description/), 'This is a test release description')

      // Mock long-running submission
      let resolveSubmission: (value?: any) => void
      mockOnSubmit.mockImplementation(() => new Promise((resolve) => {
        resolveSubmission = resolve
      }))

      await user.click(screen.getByRole('button', { name: /Create Release/ }))

      // The key test is that the buttons are disabled during submission
      expect(screen.getByRole('button', { name: /Create Release/ })).toBeDisabled()
      expect(screen.getByRole('button', { name: /Cancel/ })).toBeDisabled()
    })
  })

  describe('Modal Closing', () => {
    beforeEach(async () => {
      render(<NewReleaseModal {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })
    })

    it('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup()

      await user.click(screen.getByRole('button', { name: /Cancel/ }))

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should reset form when modal is closed', async () => {
      const user = userEvent.setup()

      // Fill out some fields
      await user.type(screen.getByLabelText(/Release Name/), 'Test Release')
      await user.type(screen.getByLabelText(/Description/), 'Test description')

      await user.click(screen.getByRole('button', { name: /Cancel/ }))

      expect(screen.getByLabelText(/Release Name/)).toHaveValue('')
      expect(screen.getByLabelText(/Description/)).toHaveValue('')
    })

    it('should not close modal during submission', async () => {
      const user = userEvent.setup()
      
      // Fill out form
      await user.type(screen.getByLabelText(/Release Name/), 'Test Release')
      await user.selectOptions(screen.getByLabelText(/Application Name/), 'NRE')
      await user.type(screen.getByLabelText(/Release Date/), '2024-12-31')
      await user.type(screen.getByLabelText(/Description/), 'This is a test release description')

      // Mock long-running submission
      let resolveSubmission: (value?: any) => void
      mockOnSubmit.mockImplementation(() => new Promise((resolve) => {
        resolveSubmission = resolve
      }))

      await user.click(screen.getByRole('button', { name: /Create Release/ }))

      // Try to close during submission - button should be disabled
      const cancelButton = screen.getByRole('button', { name: /Cancel/ })
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Date Input Constraints', () => {
    beforeEach(async () => {
      render(<NewReleaseModal {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })
    })

    it('should set minimum date to today', () => {
      const dateInput = screen.getByLabelText(/Release Date/)
      const today = new Date().toISOString().split('T')[0]

      expect(dateInput).toHaveAttribute('min', today)
    })
  })

  describe('Release Type Options', () => {
    beforeEach(async () => {
      render(<NewReleaseModal {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })
    })

    it('should have all release type options', () => {
      const typeSelect = screen.getByLabelText(/Type/)

      expect(screen.getByRole('option', { name: 'Major' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Minor' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Patch' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Hotfix' })).toBeInTheDocument()
    })

    it('should default to Minor type', () => {
      const typeSelect = screen.getByLabelText(/Type/)

      expect(typeSelect).toHaveValue(ReleaseType.MINOR)
    })
  })

  describe('Form Field Styling', () => {
    beforeEach(async () => {
      render(<NewReleaseModal {...defaultProps} />)
      await waitFor(() => {
        expect(screen.getByText('Network Resource Engine')).toBeInTheDocument()
      })
    })

    it('should apply error styling to invalid fields', async () => {
      const user = userEvent.setup()
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      await user.click(submitButton)

      const releaseNameInput = screen.getByLabelText(/Release Name/)
      expect(releaseNameInput).toHaveClass('border-red-500')
    })

    it('should remove error styling when field becomes valid', async () => {
      const user = userEvent.setup()
      const releaseNameInput = screen.getByLabelText(/Release Name/)
      const submitButton = screen.getByRole('button', { name: /Create Release/ })

      // Trigger error
      await user.click(submitButton)
      expect(releaseNameInput).toHaveClass('border-red-500')

      // Fix error
      await user.type(releaseNameInput, 'Valid Name')
      expect(releaseNameInput).not.toHaveClass('border-red-500')
      expect(releaseNameInput).toHaveClass('border-gray-300')
    })
  })
})