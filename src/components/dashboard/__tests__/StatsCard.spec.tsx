import React from 'react'
import { render, screen } from '@testing-library/react'
import { Package, TrendingUp, Users, Activity } from 'lucide-react'
import StatsCard from '../StatsCard'

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Releases',
    value: '25',
    icon: Package,
  }

  it('renders with basic props', () => {
    render(<StatsCard {...defaultProps} />)
    
    expect(screen.getByText('Total Releases')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })

  it('renders icon component', () => {
    render(<StatsCard {...defaultProps} />)
    
    // Check if icon container exists
    const iconContainer = screen.getByText('25').closest('.bg-white')
      ?.querySelector('.w-8.h-8')
    expect(iconContainer).toBeInTheDocument()
  })

  it('displays change value and type when provided', () => {
    const propsWithChange = {
      ...defaultProps,
      change: {
        value: '+12%',
        type: 'increase' as const,
      },
    }
    
    render(<StatsCard {...propsWithChange} />)
    
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('applies increase color class for positive change', () => {
    const propsWithIncrease = {
      ...defaultProps,
      change: {
        value: '+5%',
        type: 'increase' as const,
      },
    }
    
    render(<StatsCard {...propsWithIncrease} />)
    
    const changeElement = screen.getByText('+5%')
    expect(changeElement).toHaveClass('text-green-600')
  })

  it('applies decrease color class for negative change', () => {
    const propsWithDecrease = {
      ...defaultProps,
      change: {
        value: '-3%',
        type: 'decrease' as const,
      },
    }
    
    render(<StatsCard {...propsWithDecrease} />)
    
    const changeElement = screen.getByText('-3%')
    expect(changeElement).toHaveClass('text-red-600')
  })

  it('applies neutral color class for neutral change', () => {
    const propsWithNeutral = {
      ...defaultProps,
      change: {
        value: '0%',
        type: 'neutral' as const,
      },
    }
    
    render(<StatsCard {...propsWithNeutral} />)
    
    const changeElement = screen.getByText('0%')
    expect(changeElement).toHaveClass('text-gray-600')
  })

  it('renders with different color variants', () => {
    const colors = ['blue', 'green', 'purple', 'red', 'yellow'] as const
    
    colors.forEach(color => {
      const { unmount } = render(
        <StatsCard {...defaultProps} color={color} />
      )
      
      // Check if the component renders without errors
      expect(screen.getByText('Total Releases')).toBeInTheDocument()
      
      unmount()
    })
  })

  it('renders with blue color by default', () => {
    const { container } = render(<StatsCard {...defaultProps} />)
    
    const iconContainer = container.querySelector('.bg-blue-500')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders with green color when specified', () => {
    const { container } = render(
      <StatsCard {...defaultProps} color="green" />
    )
    
    const iconContainer = container.querySelector('.bg-green-500')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders with purple color when specified', () => {
    const { container } = render(
      <StatsCard {...defaultProps} color="purple" />
    )
    
    const iconContainer = container.querySelector('.bg-purple-500')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders with red color when specified', () => {
    const { container } = render(
      <StatsCard {...defaultProps} color="red" />
    )
    
    const iconContainer = container.querySelector('.bg-red-500')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders with yellow color when specified', () => {
    const { container } = render(
      <StatsCard {...defaultProps} color="yellow" />
    )
    
    const iconContainer = container.querySelector('.bg-yellow-500')
    expect(iconContainer).toBeInTheDocument()
  })

  it('renders without change when not provided', () => {
    render(<StatsCard {...defaultProps} />)
    
    // Should only show title and value, no change indicator
    expect(screen.getByText('Total Releases')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.queryByText(/\+.*%/)).not.toBeInTheDocument()
    expect(screen.queryByText(/-.*%/)).not.toBeInTheDocument()
  })

  it('has proper layout and spacing', () => {
    const { container } = render(<StatsCard {...defaultProps} />)
    
    const mainContainer = container.firstChild
    expect(mainContainer).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-200', 'p-4')
  })

  it('renders with different icons', () => {
    const icons = [Package, TrendingUp, Users, Activity]
    
    icons.forEach((IconComponent, index) => {
      const { unmount } = render(
        <StatsCard 
          {...defaultProps} 
          title={`Test ${index}`}
          icon={IconComponent} 
        />
      )
      
      expect(screen.getByText(`Test ${index}`)).toBeInTheDocument()
      
      unmount()
    })
  })

  it('handles long titles properly', () => {
    const longTitle = 'This is a very long title that should be handled properly'
    
    render(
      <StatsCard 
        {...defaultProps} 
        title={longTitle}
      />
    )
    
    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('handles large values properly', () => {
    const largeValue = '1,234,567'
    
    render(
      <StatsCard 
        {...defaultProps} 
        value={largeValue}
      />
    )
    
    expect(screen.getByText(largeValue)).toBeInTheDocument()
  })

  it('maintains accessibility with proper semantic markup', () => {
    render(<StatsCard {...defaultProps} />)
    
    // Check for proper heading structure
    const title = screen.getByText('Total Releases')
    expect(title).toHaveClass('text-xs', 'font-medium', 'text-gray-600')
    
    const value = screen.getByText('25')
    expect(value).toHaveClass('text-lg', 'font-semibold', 'text-gray-900')
  })
})
