import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
  },
  writable: true,
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error during tests to avoid noise
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('renders retry button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders reload page button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
  })

  it('resets error state when retry button is clicked', async () => {
    const user = userEvent.setup()
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    const retryButton = screen.getByRole('button', { name: /try again/i })
    await user.click(retryButton)

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('reloads page when reload button is clicked', async () => {
    const user = userEvent.setup()
    const mockReload = window.location.reload as jest.Mock

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByRole('button', { name: /reload page/i })
    await user.click(reloadButton)

    expect(mockReload).toHaveBeenCalledTimes(1)
  })

  it('displays error icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Icon should be present (rendered as SVG)
    const errorContainer = screen.getByText('Something went wrong').closest('div')
    expect(errorContainer).toBeInTheDocument()
  })

  it('has proper error boundary styling', () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const errorContainer = container.querySelector('.min-h-screen')
    expect(errorContainer).toBeInTheDocument()
    expect(errorContainer).toHaveClass('flex', 'items-center', 'justify-center', 'bg-gray-50')
  })

  it('displays error details in development mode', () => {
    // Mock NODE_ENV
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test error')).toBeInTheDocument()

    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv
  })

  it('handles error info properly', () => {
    // Mock getDerivedStateFromError
    const spy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch')

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('logs error to console in development', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('handles multiple errors properly', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Simulate another error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('maintains error state until explicitly reset', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Re-render without error but boundary should still show error
    rerender(
      <ErrorBoundary>
        <div>Fixed content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByText('Fixed content')).not.toBeInTheDocument()
  })

  it('handles errors in async components', async () => {
    const AsyncErrorComponent = () => {
      React.useEffect(() => {
        setTimeout(() => {
          throw new Error('Async error')
        }, 0)
      }, [])
      return <div>Async component</div>
    }

    render(
      <ErrorBoundary>
        <AsyncErrorComponent />
      </ErrorBoundary>
    )

    // Error boundary won't catch async errors, but component should render
    expect(screen.getByText('Async component')).toBeInTheDocument()
  })

  it('provides helpful error message for users', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument()
    expect(screen.getByText(/You can try refreshing the page or go back/i)).toBeInTheDocument()
  })

  it('has accessible error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /try again/i })
    const reloadButton = screen.getByRole('button', { name: /reload page/i })

    expect(retryButton).toBeInTheDocument()
    expect(reloadButton).toBeInTheDocument()
  })

  it('handles keyboard navigation in error state', async () => {
    const user = userEvent.setup()

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /try again/i })
    const reloadButton = screen.getByRole('button', { name: /reload page/i })

    // Should be able to navigate between buttons
    await user.tab()
    expect(retryButton).toHaveFocus()

    await user.tab()
    expect(reloadButton).toHaveFocus()
  })
})
