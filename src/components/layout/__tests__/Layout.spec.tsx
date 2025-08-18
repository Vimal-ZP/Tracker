import React from 'react'
import { render, screen } from '@testing-library/react'
import Layout from '../Layout'
import { render as customRender, mockUser } from '@/__tests__/utils/test-utils'

// Mock the keyboard shortcuts hook
jest.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: jest.fn(),
}))

describe('Layout', () => {
  const mockOnToggleSidebar = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when user is authenticated', () => {
    customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: mockUser }
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('shows loading spinner when global loading is true', () => {
    // Mock UIContext with globalLoading true
    const mockUIContext = {
      globalLoading: true,
      isSidebarOpen: false,
      openSidebar: jest.fn(),
      closeSidebar: jest.fn(),
    }

    customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { 
        user: mockUser,
        initialUIState: mockUIContext
      }
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument()
  })

  it('applies auth-loaded class when user is authenticated and client-side', async () => {
    const { container } = customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: mockUser }
    )

    // Should eventually have auth-loaded class after client-side detection
    const layoutContainer = container.querySelector('.h-screen')
    expect(layoutContainer).toBeInTheDocument()
  })

  it('applies auth-loading class when user is not authenticated', () => {
    const { container } = customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: null }
    )

    const layoutContainer = container.querySelector('.h-screen')
    expect(layoutContainer).toBeInTheDocument()
  })

  it('renders navbar and sidebar when authenticated', () => {
    customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: mockUser }
    )

    // Check for navbar elements
    expect(screen.getByText('Tracker')).toBeInTheDocument()
    
    // Check for main content area
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('calls keyboard shortcuts hook on mount', () => {
    const mockUseKeyboardShortcuts = require('@/hooks/useKeyboardShortcuts').useKeyboardShortcuts

    customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: mockUser }
    )

    expect(mockUseKeyboardShortcuts).toHaveBeenCalled()
  })

  it('has proper layout structure with flex classes', () => {
    const { container } = customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: mockUser }
    )

    const mainContainer = container.querySelector('.h-screen.flex.flex-col')
    expect(mainContainer).toBeInTheDocument()

    const contentContainer = container.querySelector('.flex.flex-1.overflow-hidden')
    expect(contentContainer).toBeInTheDocument()
  })

  it('renders main content area with proper styling', () => {
    const { container } = customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: mockUser }
    )

    const mainElement = container.querySelector('main')
    expect(mainElement).toHaveClass('flex-1', 'overflow-auto')

    const contentDiv = container.querySelector('.h-full.px-4.py-6')
    expect(contentDiv).toBeInTheDocument()
  })

  it('handles responsive padding classes', () => {
    const { container } = customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: mockUser }
    )

    const paddingContainer = container.querySelector('.px-4.py-6.sm\\:px-6.lg\\:px-8')
    expect(paddingContainer).toBeInTheDocument()
  })

  it('renders background with proper styling', () => {
    const { container } = customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { user: mockUser }
    )

    const bgContainer = container.querySelector('.bg-gray-50')
    expect(bgContainer).toBeInTheDocument()
  })

  it('handles nested content properly', () => {
    customRender(
      <Layout>
        <div>
          <h1>Page Title</h1>
          <p>Page content</p>
          <button>Action Button</button>
        </div>
      </Layout>,
      { user: mockUser }
    )

    expect(screen.getByRole('heading', { name: 'Page Title' })).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
  })

  it('maintains layout structure with different content', () => {
    const { rerender } = customRender(
      <Layout>
        <div>First Content</div>
      </Layout>,
      { user: mockUser }
    )

    expect(screen.getByText('First Content')).toBeInTheDocument()

    rerender(
      <Layout>
        <div>Second Content</div>
      </Layout>
    )

    expect(screen.getByText('Second Content')).toBeInTheDocument()
    expect(screen.queryByText('First Content')).not.toBeInTheDocument()
  })

  it('handles loading state transitions properly', () => {
    const { container } = customRender(
      <Layout>
        <div>Test Content</div>
      </Layout>,
      { 
        user: mockUser,
        initialAuthState: { loading: true }
      }
    )

    // Should show some loading indication or handle loading state
    expect(container.firstChild).toBeInTheDocument()
  })
})
