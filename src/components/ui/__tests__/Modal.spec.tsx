import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<Modal {...defaultProps} />)
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(<Modal {...defaultProps} />)
    
    const overlay = screen.getByTestId('modal-overlay')
    await user.click(overlay)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when modal content is clicked', async () => {
    const user = userEvent.setup()
    render(<Modal {...defaultProps} />)
    
    const modalContent = screen.getByText('Modal content')
    await user.click(modalContent)
    
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<Modal {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when other keys are pressed', () => {
    render(<Modal {...defaultProps} />)
    
    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' })
    fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' })
    
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })

  it('renders without title', () => {
    render(<Modal {...defaultProps} title={undefined} />)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('applies correct ARIA attributes', () => {
    render(<Modal {...defaultProps} />)
    
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
  })

  it('has proper z-index for overlay', () => {
    render(<Modal {...defaultProps} />)
    
    const overlay = screen.getByTestId('modal-overlay')
    expect(overlay).toHaveClass('z-50')
  })

  it('has proper backdrop styling', () => {
    render(<Modal {...defaultProps} />)
    
    const overlay = screen.getByTestId('modal-overlay')
    expect(overlay).toHaveClass('bg-black', 'bg-opacity-50')
  })

  it('centers modal content', () => {
    render(<Modal {...defaultProps} />)
    
    const overlay = screen.getByTestId('modal-overlay')
    expect(overlay).toHaveClass('flex', 'items-center', 'justify-center')
  })

  it('handles custom size classes', () => {
    render(<Modal {...defaultProps} />)
    
    const modalContent = screen.getByRole('dialog')
    expect(modalContent).toHaveClass('max-w-md')
  })

  it('prevents body scroll when open', () => {
    const { unmount } = render(<Modal {...defaultProps} />)
    
    // Check if body scroll is prevented (implementation may vary)
    expect(document.body.style.overflow).toBe('hidden')
    
    unmount()
    
    // Check if body scroll is restored
    expect(document.body.style.overflow).toBe('')
  })

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
    const { unmount } = render(<Modal {...defaultProps} />)
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })
})
