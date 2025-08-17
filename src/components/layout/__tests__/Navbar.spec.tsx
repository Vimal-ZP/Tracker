import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from '../Navbar'
import { render as customRender, mockUser, mockSuperAdminUser, mockBasicUser } from '@/__tests__/utils/test-utils'

// Mock usePathname to control route-based behavior
const mockUsePathname = jest.fn()
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  usePathname: () => mockUsePathname(),
}))

describe('Navbar', () => {
  const mockOnToggleSidebar = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/dashboard')
  })

  it('does not render when user is not authenticated', () => {
    const { container } = customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: null }
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('renders logo and navigation when user is authenticated', () => {
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    expect(screen.getByText('Tracker')).toBeInTheDocument()
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
  })

  it('calls onToggleSidebar when menu button is clicked', async () => {
    const user = userEvent.setup()
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    const menuButton = screen.getByLabelText(/open sidebar/i)
    await user.click(menuButton)
    
    expect(mockOnToggleSidebar).toHaveBeenCalledTimes(1)
  })

  it('shows global search on releases page', () => {
    mockUsePathname.mockReturnValue('/releases')
    
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('shows global search on release detail page', () => {
    mockUsePathname.mockReturnValue('/releases/123')
    
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('hides global search on other pages', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    expect(screen.queryByRole('button', { name: /search/i })).not.toBeInTheDocument()
  })

  it('displays user role badge for admin', () => {
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('displays user role badge for super admin', () => {
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockSuperAdminUser }
    )
    
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
  })

  it('displays user role badge for basic user', () => {
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockBasicUser }
    )
    
    expect(screen.getByText('User')).toBeInTheDocument()
  })

  it('opens user dropdown when user avatar is clicked', async () => {
    const user = userEvent.setup()
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)
    
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('closes user dropdown when clicked outside', async () => {
    const user = userEvent.setup()
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    // Open dropdown
    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)
    
    expect(screen.getByText('Logout')).toBeInTheDocument()
    
    // Click outside
    fireEvent.mouseDown(document.body)
    
    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })

  it('calls logout function when logout is clicked', async () => {
    const user = userEvent.setup()
    const mockLogout = jest.fn()
    
    // We need to mock the auth context
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { 
        user: mockUser,
        initialAuthState: {
          user: mockUser,
          logout: mockLogout,
        }
      }
    )
    
    // Open dropdown
    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)
    
    // Click logout
    const logoutButton = screen.getByText('Logout')
    await user.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('shows correct role badge colors', () => {
    const { rerender } = customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockSuperAdminUser }
    )
    
    let badge = screen.getByText('Super Admin')
    expect(badge).toHaveClass('badge-purple')
    
    rerender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    badge = screen.getByText('Admin')
    expect(badge).toHaveClass('badge-blue')
    
    rerender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockBasicUser }
    )
    
    badge = screen.getByText('User')
    expect(badge).toHaveClass('badge-gray')
  })

  it('handles keyboard navigation in dropdown', async () => {
    const user = userEvent.setup()
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)
    
    const logoutButton = screen.getByText('Logout')
    expect(logoutButton).toBeInTheDocument()
    
    // Test keyboard navigation
    await user.keyboard('{ArrowDown}')
    expect(logoutButton).toHaveFocus()
  })

  it('closes dropdown on escape key', async () => {
    const user = userEvent.setup()
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    // Open dropdown
    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)
    
    expect(screen.getByText('Logout')).toBeInTheDocument()
    
    // Press Escape
    await user.keyboard('{Escape}')
    
    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })

  it('displays user initials in avatar', () => {
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    expect(screen.getByText('TU')).toBeInTheDocument() // Test User -> TU
  })

  it('handles single name for initials', () => {
    const singleNameUser = { ...mockUser, name: 'SingleName' }
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: singleNameUser }
    )
    
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('rotates chevron icon when dropdown is open', async () => {
    const user = userEvent.setup()
    customRender(
      <Navbar onToggleSidebar={mockOnToggleSidebar} />,
      { user: mockUser }
    )
    
    const userButton = screen.getByRole('button', { name: /user menu/i })
    const chevron = userButton.querySelector('svg')
    
    expect(chevron).not.toHaveClass('rotate-180')
    
    await user.click(userButton)
    
    expect(chevron).toHaveClass('rotate-180')
  })
})
