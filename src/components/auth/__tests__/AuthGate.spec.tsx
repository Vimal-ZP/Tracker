import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import AuthGate from '../AuthGate'
import { render, mockUser } from '@/__tests__/utils/test-utils'

// Mock the router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: jest.fn(() => '/dashboard'),
}))

describe('AuthGate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading spinner when auth is not initialized', () => {
    render(
      <AuthGate>
        <div>Protected Content</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: false,
          loading: false,
          user: null,
        },
      }
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading spinner when auth is loading', () => {
    render(
      <AuthGate>
        <div>Protected Content</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: true,
          user: null,
        },
      }
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children for authenticated user on protected page', async () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/dashboard')

    render(
      <AuthGate>
        <div>Protected Content</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: mockUser,
        },
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('redirects authenticated user from auth page to dashboard', async () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/login')

    render(
      <AuthGate>
        <div>Auth Page Content</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: mockUser,
        },
      }
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('allows unauthenticated user on auth pages', async () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/login')

    render(
      <AuthGate>
        <div>Login Page</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: null,
        },
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })

  it('redirects unauthenticated user from protected page to login', async () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/dashboard')

    render(
      <AuthGate>
        <div>Protected Content</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: null,
        },
      }
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })

  it('handles forgot-password page as auth page', async () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/forgot-password')

    render(
      <AuthGate>
        <div>Forgot Password Page</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: null,
        },
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Forgot Password Page')).toBeInTheDocument()
    })
  })

  it('handles reset-password page as auth page', async () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/reset-password')

    render(
      <AuthGate>
        <div>Reset Password Page</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: null,
        },
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Reset Password Page')).toBeInTheDocument()
    })
  })

  it('handles register page as auth page', async () => {
    const { usePathname } = require('next/navigation')
    usePathname.mockReturnValue('/register')

    render(
      <AuthGate>
        <div>Register Page</div>
      </AuthGate>,
      {
        initialAuthState: {
          isInitialized: true,
          loading: false,
          user: null,
        },
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Register Page')).toBeInTheDocument()
    })
  })
})
