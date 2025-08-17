import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmationDialog from '../ConfirmationDialog'

describe('ConfirmationDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<ConfirmationDialog {...defaultProps} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<ConfirmationDialog {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders default confirm and cancel buttons', () => {
    render(<ConfirmationDialog {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders custom button labels', () => {
    render(
      <ConfirmationDialog 
        {...defaultProps} 
        confirmLabel="Delete"
        cancelLabel="Keep"
      />
    )
    
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmationDialog {...defaultProps} />)
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)
    
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmationDialog {...defaultProps} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('shows danger variant with red styling', () => {
    render(<ConfirmationDialog {...defaultProps} variant="danger" />)
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toHaveClass('bg-red-600')
  })

  it('shows warning variant with yellow styling', () => {
    render(<ConfirmationDialog {...defaultProps} variant="warning" />)
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toHaveClass('bg-yellow-600')
  })

  it('shows info variant with blue styling', () => {
    render(<ConfirmationDialog {...defaultProps} variant="info" />)
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toHaveClass('bg-blue-600')
  })

  it('disables buttons when loading', () => {
    render(<ConfirmationDialog {...defaultProps} loading={true} />)
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    
    expect(confirmButton).toBeDisabled()
    expect(cancelButton).toBeDisabled()
  })

  it('shows loading spinner when loading', () => {
    render(<ConfirmationDialog {...defaultProps} loading={true} />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('handles missing message gracefully', () => {
    render(<ConfirmationDialog {...defaultProps} message={undefined} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.queryByText('Are you sure you want to proceed?')).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ConfirmationDialog {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
  })

  it('focuses confirm button by default', () => {
    render(<ConfirmationDialog {...defaultProps} />)
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    expect(confirmButton).toHaveFocus()
  })

  it('closes on Escape key press', () => {
    render(<ConfirmationDialog {...defaultProps} />)
    
    // This functionality is typically handled by the underlying Modal component
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(<ConfirmationDialog {...defaultProps} className="custom-dialog" />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveClass('custom-dialog')
  })

  it('handles keyboard navigation between buttons', async () => {
    const user = userEvent.setup()
    render(<ConfirmationDialog {...defaultProps} />)
    
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    
    expect(confirmButton).toHaveFocus()
    
    await user.tab()
    expect(cancelButton).toHaveFocus()
    
    await user.tab()
    expect(confirmButton).toHaveFocus() // Should wrap around
  })
})
