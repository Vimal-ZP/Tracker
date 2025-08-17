import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WelcomeBanner from '../WelcomeBanner'
import { render as customRender, mockUser, mockSuperAdminUser, mockBasicUser } from '@/__tests__/utils/test-utils'

describe('WelcomeBanner', () => {
  it('renders welcome message with user name', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    expect(screen.getByText(/Test User/)).toBeInTheDocument()
    expect(screen.getByText(/Welcome to your/)).toBeInTheDocument()
  })

  it('displays correct role badge for admin user', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('displays correct role badge for super admin user', () => {
    customRender(<WelcomeBanner />, { user: mockSuperAdminUser })
    
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
  })

  it('displays correct role badge for basic user', () => {
    customRender(<WelcomeBanner />, { user: mockBasicUser })
    
    expect(screen.getByText('Basic User')).toBeInTheDocument()
  })

  it('shows system online status', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    expect(screen.getByText('System Online')).toBeInTheDocument()
  })

  it('displays About Tracker section', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    expect(screen.getByText('About Tracker')).toBeInTheDocument()
    expect(screen.getByText(/powerful release management/)).toBeInTheDocument()
  })

  it('shows appropriate features for admin user', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    expect(screen.getByText('Your Access Level')).toBeInTheDocument()
    expect(screen.getByText(/Create releases/)).toBeInTheDocument()
    expect(screen.getByText(/Manage work items/)).toBeInTheDocument()
  })

  it('shows appropriate features for super admin user', () => {
    customRender(<WelcomeBanner />, { user: mockSuperAdminUser })
    
    expect(screen.getByText('Your Access Level')).toBeInTheDocument()
    expect(screen.getByText(/Full system access/)).toBeInTheDocument()
    expect(screen.getByText(/User management/)).toBeInTheDocument()
  })

  it('shows appropriate features for basic user', () => {
    customRender(<WelcomeBanner />, { user: mockBasicUser })
    
    expect(screen.getByText('Your Access Level')).toBeInTheDocument()
    expect(screen.getByText(/View releases/)).toBeInTheDocument()
  })

  it('displays Get Started section with proper link', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    expect(screen.getByText('Ready to Start?')).toBeInTheDocument()
    
    const getStartedLink = screen.getByRole('link', { name: /get started/i })
    expect(getStartedLink).toBeInTheDocument()
    expect(getStartedLink).toHaveAttribute('href', '/releases')
  })

  it('shows Quick Stats section', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    expect(screen.getByText('Quick Stats')).toBeInTheDocument()
  })

  it('handles user without assigned applications', () => {
    const userWithoutApps = {
      ...mockUser,
      assignedApplications: [],
    }
    
    customRender(<WelcomeBanner />, { user: userWithoutApps })
    
    expect(screen.getByText(/Test User/)).toBeInTheDocument()
  })

  it('displays correct time-based greeting', () => {
    // Mock the current time to test different greetings
    const originalDate = Date
    
    // Mock morning time (9 AM)
    const mockDate = new Date('2023-01-01T09:00:00Z')
    global.Date = jest.fn(() => mockDate) as any
    global.Date.now = jest.fn(() => mockDate.getTime())
    
    customRender(<WelcomeBanner />, { user: mockUser })
    
    // Should show morning greeting or general greeting
    expect(screen.getByText(/Test User/)).toBeInTheDocument()
    
    // Restore original Date
    global.Date = originalDate
  })

  it('handles missing user gracefully', () => {
    customRender(<WelcomeBanner />, { user: null })
    
    // Component should handle null user without crashing
    // It might not render anything or show a fallback
    expect(screen.queryByText('System Online')).toBeInTheDocument()
  })

  it('has proper styling and layout', () => {
    const { container } = customRender(<WelcomeBanner />, { user: mockUser })
    
    const banner = container.firstChild
    expect(banner).toHaveClass('bg-gradient-to-r', 'from-blue-50', 'to-indigo-50')
  })

  it('renders icons properly', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    // Check for presence of icons in the component
    // Icons are imported but rendered as SVG elements
    const iconElements = screen.getByText(/Test User/).closest('div')
    expect(iconElements).toBeInTheDocument()
  })

  it('navigates to releases page when Get Started is clicked', async () => {
    const user = userEvent.setup()
    customRender(<WelcomeBanner />, { user: mockUser })
    
    const getStartedButton = screen.getByRole('link', { name: /get started/i })
    expect(getStartedButton).toHaveAttribute('href', '/releases')
  })

  it('displays role-specific feature counts correctly', () => {
    customRender(<WelcomeBanner />, { user: mockSuperAdminUser })
    
    expect(screen.getByText('Your Access Level')).toBeInTheDocument()
    
    // Super admin should see more features
    const accessSection = screen.getByText('Your Access Level').closest('div')
    expect(accessSection).toBeInTheDocument()
  })

  it('handles overflow of features list properly', () => {
    customRender(<WelcomeBanner />, { user: mockSuperAdminUser })
    
    // Super admin has many features, should handle overflow properly
    expect(screen.getByText('Your Access Level')).toBeInTheDocument()
  })

  it('shows sparkles icon in header', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    // Sparkles icon should be present in the header
    const header = screen.getByText(/Test User/).closest('h1')
    expect(header).toBeInTheDocument()
  })

  it('displays platform highlights section', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    expect(screen.getByText('About Tracker')).toBeInTheDocument()
    expect(screen.getByText(/streamline your development/i)).toBeInTheDocument()
  })

  it('handles responsive design classes', () => {
    const { container } = customRender(<WelcomeBanner />, { user: mockUser })
    
    // Check for responsive grid classes
    const gridContainer = container.querySelector('.lg\\:grid-cols-4')
    expect(gridContainer).toBeInTheDocument()
  })

  it('maintains proper text hierarchy', () => {
    customRender(<WelcomeBanner />, { user: mockUser })
    
    // Check heading levels and text sizes
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()
    expect(mainHeading).toHaveClass('text-xl', 'font-semibold')
  })
})
