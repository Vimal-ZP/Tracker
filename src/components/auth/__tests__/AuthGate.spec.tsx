import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import AuthGate from '../AuthGate'
import { useAuth } from '@/contexts'

// Mock the dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('@/contexts', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/components/ui/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }: { size?: string }) {
    return <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  }
})

describe('AuthGate', () => {
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

  const mockRouter = {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }

  const mockUser = {
    _id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'basic' as const,
    isActive: true,
    assignedApplications: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue(mockRouter)
  })

  describe('Loading States', () => {
    it('should show loading spinner when auth is not initialized', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: false,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthGate>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGate>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg')
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should show loading spinner when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthGate>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGate>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })

    it('should show loading spinner until ready state is set', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthGate>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGate>
      )

      // Should eventually show content once ready state is set
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      })
    })

    it('should have proper loading container styling', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthGate>
          <div data-testid="protected-content">Protected Content</div>
        </AuthGate>
      )

      const loadingContainer = screen.getByTestId('loading-spinner').parentElement
      expect(loadingContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-white')
    })
  })

  describe('Authentication State Handling', () => {
    describe('Authenticated User', () => {
      beforeEach(() => {
        mockUseAuth.mockReturnValue({
          user: mockUser,
          loading: false,
          isInitialized: true,
        } as any)
      })

      it('should render children for authenticated user on protected page', async () => {
        mockUsePathname.mockReturnValue('/dashboard')

        render(
          <AuthGate>
            <div data-testid="protected-content">Protected Content</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(screen.getByTestId('protected-content')).toBeInTheDocument()
        })

        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
        expect(mockRouter.replace).not.toHaveBeenCalled()
      })

      it('should redirect authenticated user from login page to dashboard', async () => {
        mockUsePathname.mockReturnValue('/login')

        render(
          <AuthGate>
            <div data-testid="auth-content">Login Form</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
        })

        expect(screen.queryByTestId('auth-content')).not.toBeInTheDocument()
      })

      it('should redirect authenticated user from register page to dashboard', async () => {
        mockUsePathname.mockReturnValue('/register')

        render(
          <AuthGate>
            <div data-testid="auth-content">Register Form</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
        })
      })

      it('should redirect authenticated user from forgot-password page to dashboard', async () => {
        mockUsePathname.mockReturnValue('/forgot-password')

        render(
          <AuthGate>
            <div data-testid="auth-content">Forgot Password Form</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
        })
      })

      it('should redirect authenticated user from reset-password page to dashboard', async () => {
        mockUsePathname.mockReturnValue('/reset-password')

        render(
          <AuthGate>
            <div data-testid="auth-content">Reset Password Form</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
        })
      })

      it('should allow authenticated user access to various protected pages', async () => {
        const protectedPages = ['/dashboard', '/releases', '/users', '/settings', '/reports', '/activity']

        for (const page of protectedPages) {
          mockUsePathname.mockReturnValue(page)

          const { unmount } = render(
            <AuthGate>
              <div data-testid={`content-${page.slice(1)}`}>Content for {page}</div>
            </AuthGate>
          )

          await waitFor(() => {
            expect(screen.getByTestId(`content-${page.slice(1)}`)).toBeInTheDocument()
          })

          expect(mockRouter.replace).not.toHaveBeenCalled()
          unmount()
          jest.clearAllMocks()
        }
      })
    })

    describe('Unauthenticated User', () => {
      beforeEach(() => {
        mockUseAuth.mockReturnValue({
          user: null,
          loading: false,
          isInitialized: true,
        } as any)
      })

      it('should allow unauthenticated user access to login page', async () => {
        mockUsePathname.mockReturnValue('/login')

        render(
          <AuthGate>
            <div data-testid="login-content">Login Form</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(screen.getByTestId('login-content')).toBeInTheDocument()
        })

        expect(mockRouter.replace).not.toHaveBeenCalled()
      })

      it('should allow unauthenticated user access to register page', async () => {
        mockUsePathname.mockReturnValue('/register')

        render(
          <AuthGate>
            <div data-testid="register-content">Register Form</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(screen.getByTestId('register-content')).toBeInTheDocument()
        })

        expect(mockRouter.replace).not.toHaveBeenCalled()
      })

      it('should allow unauthenticated user access to forgot-password page', async () => {
        mockUsePathname.mockReturnValue('/forgot-password')

        render(
          <AuthGate>
            <div data-testid="forgot-password-content">Forgot Password Form</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(screen.getByTestId('forgot-password-content')).toBeInTheDocument()
        })

        expect(mockRouter.replace).not.toHaveBeenCalled()
      })

      it('should allow unauthenticated user access to reset-password page', async () => {
        mockUsePathname.mockReturnValue('/reset-password')

        render(
          <AuthGate>
            <div data-testid="reset-password-content">Reset Password Form</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(screen.getByTestId('reset-password-content')).toBeInTheDocument()
        })

        expect(mockRouter.replace).not.toHaveBeenCalled()
      })

      it('should redirect unauthenticated user from protected pages to login', async () => {
        const protectedPages = ['/dashboard', '/releases', '/users', '/settings', '/reports', '/activity']

        for (const page of protectedPages) {
          mockUsePathname.mockReturnValue(page)

          render(
            <AuthGate>
              <div data-testid={`content-${page.slice(1)}`}>Content for {page}</div>
            </AuthGate>
          )

          await waitFor(() => {
            expect(mockRouter.replace).toHaveBeenCalledWith('/login')
          })

          expect(screen.queryByTestId(`content-${page.slice(1)}`)).not.toBeInTheDocument()
          jest.clearAllMocks()
        }
      })

      it('should redirect unauthenticated user from root path to login', async () => {
        mockUsePathname.mockReturnValue('/')

        render(
          <AuthGate>
            <div data-testid="root-content">Root Content</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(mockRouter.replace).toHaveBeenCalledWith('/login')
        })
      })

      it('should redirect unauthenticated user from any unknown protected path to login', async () => {
        mockUsePathname.mockReturnValue('/some-unknown-path')

        render(
          <AuthGate>
            <div data-testid="unknown-content">Unknown Content</div>
          </AuthGate>
        )

        await waitFor(() => {
          expect(mockRouter.replace).toHaveBeenCalledWith('/login')
        })
      })
    })
  })

  describe('Auth Page Detection', () => {
    it('should correctly identify login page as auth page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/login')

      render(
        <AuthGate>
          <div data-testid="login-content">Login</div>
        </AuthGate>
      )

      // Should not redirect since it's an auth page
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should correctly identify register page as auth page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/register')

      render(
        <AuthGate>
          <div data-testid="register-content">Register</div>
        </AuthGate>
      )

      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should correctly identify forgot-password page as auth page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/forgot-password')

      render(
        <AuthGate>
          <div data-testid="forgot-password-content">Forgot Password</div>
        </AuthGate>
      )

      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should correctly identify reset-password page as auth page', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/reset-password')

      render(
        <AuthGate>
          <div data-testid="reset-password-content">Reset Password</div>
        </AuthGate>
      )

      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should not identify protected pages as auth pages', () => {
      const protectedPages = ['/dashboard', '/releases', '/users', '/settings', '/reports', '/activity', '/', '/some-path']

      protectedPages.forEach(page => {
        mockUseAuth.mockReturnValue({
          user: null,
          loading: false,
          isInitialized: true,
        } as any)
        mockUsePathname.mockReturnValue(page)

        render(
          <AuthGate>
            <div data-testid="content">Content</div>
          </AuthGate>
        )

        // Should redirect to login since these are not auth pages
        expect(mockRouter.replace).toHaveBeenCalledWith('/login')
        jest.clearAllMocks()
      })
    })
  })

  describe('State Transitions and Effects', () => {
    it('should handle auth state changes from unauthenticated to authenticated', async () => {
      const { rerender } = render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      // Initially unauthenticated on protected page
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/login')
      })

      jest.clearAllMocks()

      // Now authenticated
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should handle auth state changes from authenticated to unauthenticated', async () => {
      const { rerender } = render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      // Initially authenticated on protected page
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      jest.clearAllMocks()

      // Now unauthenticated (e.g., session expired)
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/login')
      })
    })

    it('should handle loading state changes', async () => {
      const { rerender } = render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      // Initially loading
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      // Loading finished, user authenticated
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    it('should handle initialization state changes', async () => {
      const { rerender } = render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      // Initially not initialized
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: false,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      // Now initialized with authenticated user
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  describe('Pathname Changes', () => {
    it('should handle navigation from auth page to protected page while authenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)

      const { rerender } = render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      // Start on login page (should redirect to dashboard)
      mockUsePathname.mockReturnValue('/login')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
      })

      jest.clearAllMocks()

      // Navigate to protected page
      mockUsePathname.mockReturnValue('/releases')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should handle navigation from protected page to auth page while unauthenticated', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)

      const { rerender } = render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      // Start on protected page (should redirect to login)
      mockUsePathname.mockReturnValue('/dashboard')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/login')
      })

      jest.clearAllMocks()

      // Navigate to login page
      mockUsePathname.mockReturnValue('/login')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(mockRouter.replace).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle undefined user gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: undefined,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/login')
      })
    })

    it('should handle null user gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/login')
      })
    })

    it('should handle empty pathname gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('')

      render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/login')
      })
    })

    it('should handle pathname with query parameters', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      // Note: usePathname() returns just the pathname without query parameters
      mockUsePathname.mockReturnValue('/login')

      render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should handle pathname with hash fragments', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      // Note: usePathname() returns just the pathname without hash fragments
      mockUsePathname.mockReturnValue('/login')

      render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    it('should handle case-sensitive pathname matching', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/LOGIN') // Uppercase

      render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      // Should treat as protected page since it's case-sensitive
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/login')
      })
    })

    it('should handle rapid state changes without race conditions', async () => {
      const { rerender } = render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      // Rapid state changes
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        isInitialized: false,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      // Quick change to initialized but still loading
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        isInitialized: true,
      } as any)

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      // Final state - authenticated
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)

      rerender(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  describe('Component Structure and Props', () => {
    it('should render children as fragment when ready', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthGate>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <span data-testid="child-3">Child 3</span>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument()
        expect(screen.getByTestId('child-2')).toBeInTheDocument()
        expect(screen.getByTestId('child-3')).toBeInTheDocument()
      })
    })

    it('should handle empty children', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      const { container } = render(<AuthGate>{null}</AuthGate>)

      await waitFor(() => {
        expect(container.firstChild).toBeNull()
      })
    })

    it('should handle complex children structures', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      render(
        <AuthGate>
          <div data-testid="parent">
            <div data-testid="nested-child">
              <span data-testid="deeply-nested">Deep content</span>
            </div>
            {['item1', 'item2'].map(item => (
              <div key={item} data-testid={`dynamic-${item}`}>
                {item}
              </div>
            ))}
          </div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('parent')).toBeInTheDocument()
        expect(screen.getByTestId('nested-child')).toBeInTheDocument()
        expect(screen.getByTestId('deeply-nested')).toBeInTheDocument()
        expect(screen.getByTestId('dynamic-item1')).toBeInTheDocument()
        expect(screen.getByTestId('dynamic-item2')).toBeInTheDocument()
      })
    })
  })

  describe('Performance and Optimization', () => {
    it('should not cause unnecessary re-renders when auth state is stable', async () => {
      const renderSpy = jest.fn()
      
      function TestChild() {
        renderSpy()
        return <div data-testid="test-child">Test Child</div>
      }

      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/dashboard')

      const { rerender } = render(
        <AuthGate>
          <TestChild />
        </AuthGate>
      )

      await waitFor(() => {
        expect(screen.getByTestId('test-child')).toBeInTheDocument()
      })

      const initialRenderCount = renderSpy.mock.calls.length
      renderSpy.mockClear()

      // Re-render with same auth state
      rerender(
        <AuthGate>
          <TestChild />
        </AuthGate>
      )

      // Should cause one additional render due to React's re-render behavior
      expect(renderSpy.mock.calls.length).toBe(1)
    })

    it('should handle multiple router.replace calls gracefully', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        isInitialized: true,
      } as any)
      mockUsePathname.mockReturnValue('/login')

      render(
        <AuthGate>
          <div data-testid="content">Content</div>
        </AuthGate>
      )

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
      })

      // Should only be called once
      expect(mockRouter.replace).toHaveBeenCalledTimes(1)
    })
  })
})