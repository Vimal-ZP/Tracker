import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import AuthInitializer from '../AuthInitializer'
import { render, mockUser } from '@/__tests__/utils/test-utils'

// Mock document.documentElement.classList
const mockClassList = {
  add: jest.fn(),
  remove: jest.fn(),
  contains: jest.fn(),
  toggle: jest.fn(),
}

Object.defineProperty(document, 'documentElement', {
  value: {
    classList: mockClassList,
  },
  writable: true,
})

describe('AuthInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading when not initialized', () => {
    render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: false,
          loading: false,
          user: null,
        },
      }
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('App Content')).not.toBeInTheDocument()
  })

  it('shows loading when still on server side (isClient = false)', () => {
    render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: mockUser,
        },
      }
    )

    // Initially should show loading until client-side hydration
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders children when initialized and on client side', async () => {
    render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: mockUser,
        },
      }
    )

    // Wait for useEffect to set isClient to true
    await waitFor(() => {
      expect(screen.getByText('App Content')).toBeInTheDocument()
    })
  })

  it('adds react-ready class to document element on mount', async () => {
    render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: mockUser,
        },
      }
    )

    await waitFor(() => {
      expect(mockClassList.add).toHaveBeenCalledWith('react-ready')
    })
  })

  it('renders with auth-container wrapper', () => {
    const { container } = render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: false,
          loading: false,
          user: null,
        },
      }
    )

    expect(container.querySelector('.auth-container')).toBeInTheDocument()
  })

  it('shows auth-initializing class when loading', () => {
    const { container } = render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: false,
          loading: false,
          user: null,
        },
      }
    )

    expect(container.querySelector('.auth-initializing')).toBeInTheDocument()
  })

  it('shows auth-ready class when ready', async () => {
    const { container } = render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: mockUser,
        },
      }
    )

    await waitFor(() => {
      expect(container.querySelector('.auth-ready')).toBeInTheDocument()
    })
  })

  it('handles loading state properly', () => {
    render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: true,
          user: null,
        },
      }
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('App Content')).not.toBeInTheDocument()
  })

  it('works without user when initialized', async () => {
    render(
      <AuthInitializer>
        <div>App Content</div>
      </AuthInitializer>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: null,
        },
      }
    )

    await waitFor(() => {
      expect(screen.getByText('App Content')).toBeInTheDocument()
    })
  })
})
