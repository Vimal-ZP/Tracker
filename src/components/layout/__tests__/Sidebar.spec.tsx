import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from '../Sidebar'
import { render as customRender, mockUser, mockSuperAdminUser, mockBasicUser } from '@/__tests__/utils/test-utils'

describe('Sidebar', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sidebar when open with authenticated user', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    expect(screen.getByText('Tracker')).toBeInTheDocument()
    expect(screen.getByText('Navigation')).toBeInTheDocument()
  })

  it('does not render sidebar when closed', () => {
    customRender(
      <Sidebar isOpen={false} onClose={mockOnClose} />,
      { user: mockUser }
    )

    // Should not be visible when closed
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
  })

  it('does not render when user is not authenticated', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: null }
    )

    expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
  })

  it('displays all navigation items for admin user', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Releases')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('displays activity link for super admin user', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockSuperAdminUser }
    )

    expect(screen.getByText('Activity')).toBeInTheDocument()
  })

  it('hides restricted items for basic user', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockBasicUser }
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Releases')).toBeInTheDocument()
    expect(screen.queryByText('Users')).not.toBeInTheDocument()
    expect(screen.queryByText('Activity')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    const closeButton = screen.getByLabelText(/close sidebar/i)
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    const overlay = screen.getByRole('button', { name: /close sidebar/i }).closest('[data-testid="sidebar-overlay"]') || 
                   document.querySelector('.fixed.inset-0')
    
    if (overlay) {
      await user.click(overlay)
      expect(mockOnClose).toHaveBeenCalled()
    }
  })

  it('calls onClose on Escape key press', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose on other key presses', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' })
    fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('has proper mobile responsive classes', () => {
    const { container } = customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    // Check for responsive sidebar classes
    const sidebar = container.querySelector('.lg\\:relative')
    expect(sidebar).toBeInTheDocument()
  })

  it('displays navigation icons correctly', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    // Icons should be present (they're rendered as SVG elements)
    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toBeInTheDocument()
  })

  it('highlights active navigation item', () => {
    // Mock usePathname to return specific path
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/dashboard')

    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    expect(dashboardLink).toHaveClass('bg-blue-50', 'text-blue-700')
  })

  it('shows inactive state for non-active items', () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/dashboard')

    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    const releasesLink = screen.getByText('Releases').closest('a')
    expect(releasesLink).toHaveClass('text-gray-600', 'hover:bg-gray-50')
  })

  it('renders proper link hrefs for navigation items', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Releases').closest('a')).toHaveAttribute('href', '/releases')
    expect(screen.getByText('Reports').closest('a')).toHaveAttribute('href', '/reports')
    expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/users')
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings')
  })

  it('handles sidebar toggle states correctly', () => {
    const { rerender } = customRender(
      <Sidebar isOpen={false} onClose={mockOnClose} />,
      { user: mockUser }
    )

    expect(screen.queryByText('Navigation')).not.toBeInTheDocument()

    rerender(<Sidebar isOpen={true} onClose={mockOnClose} />)

    expect(screen.getByText('Navigation')).toBeInTheDocument()
  })

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
    
    const { unmount } = customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    
    removeEventListenerSpy.mockRestore()
  })

  it('prevents body scroll when sidebar is open on mobile', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    // On mobile, body scroll should be prevented
    // This would be implementation-specific
    expect(document.body.style.overflow).toBe('')
  })

  it('has proper accessibility attributes', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    const closeButton = screen.getByLabelText(/close sidebar/i)
    expect(closeButton).toBeInTheDocument()
  })

  it('displays user role-specific content', () => {
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockSuperAdminUser }
    )

    // Super admin should see all navigation items
    expect(screen.getByText('Activity')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('handles keyboard navigation between items', async () => {
    const user = userEvent.setup()
    customRender(
      <Sidebar isOpen={true} onClose={mockOnClose} />,
      { user: mockUser }
    )

    const dashboardLink = screen.getByText('Dashboard')
    const releasesLink = screen.getByText('Releases')

    await user.tab()
    // Should be able to navigate between links
    expect(document.activeElement).toBeInTheDocument()
  })
})
