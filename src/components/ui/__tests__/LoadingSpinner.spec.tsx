import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2', 'border-gray-300', 'border-t-primary-600')
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-4', 'h-4')
  })

  it('renders with medium size', () => {
    render(<LoadingSpinner size="md" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-6', 'h-6')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-8', 'h-8')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('custom-class')
  })

  it('combines size classes with custom className', () => {
    render(<LoadingSpinner size="lg" className="text-blue-500" />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-8', 'h-8', 'text-blue-500')
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('maintains consistent styling across different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2')

    rerender(<LoadingSpinner size="md" />)
    spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2')

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin', 'rounded-full', 'border-2')
  })
})
