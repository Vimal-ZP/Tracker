import React from 'react'
import { render, screen } from '@testing-library/react'
import ReleasesListSimple from '../ReleasesListSimple'
import { Release, ReleaseType } from '@/types/release'

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, className, ...props }: any) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    )
  }
})

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Calendar: (props: any) => <div data-testid="calendar-icon" {...props}>Calendar</div>,
  Package: (props: any) => <div data-testid="package-icon" {...props}>Package</div>,
  Tag: (props: any) => <div data-testid="tag-icon" {...props}>Tag</div>,
  Clock: (props: any) => <div data-testid="clock-icon" {...props}>Clock</div>,
  CheckCircle: (props: any) => <div data-testid="check-circle-icon" {...props}>CheckCircle</div>,
  AlertCircle: (props: any) => <div data-testid="alert-circle-icon" {...props}>AlertCircle</div>,
  XCircle: (props: any) => <div data-testid="x-circle-icon" {...props}>XCircle</div>,
}))

describe('ReleasesListSimple', () => {
  const mockReleases: Release[] = [
    {
      _id: 'release-1',
      title: 'Version 1.0.0 Release',
      description: 'Major release with new features',
      version: '1.0.0',
      applicationName: 'NRE',
      releaseDate: new Date('2024-01-15'),
      type: ReleaseType.MAJOR,
      status: 'stable',
      isPublished: true,
      workItems: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'user-1'
    },
    {
      _id: 'release-2',
      title: 'Version 1.1.0 Release',
      description: 'Minor release with improvements',
      version: '1.1.0',
      applicationName: 'NVE',
      releaseDate: new Date('2024-02-15'),
      type: ReleaseType.MINOR,
      status: 'beta',
      isPublished: false,
      workItems: [],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
      createdBy: 'user-1'
    },
    {
      _id: 'release-3',
      title: 'Version 1.0.1 Release',
      description: 'Patch release with bug fixes',
      version: '1.0.1',
      applicationName: 'E-Vite',
      releaseDate: new Date('2024-03-15'),
      type: ReleaseType.PATCH,
      status: 'draft',
      isPublished: false,
      workItems: [],
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
      createdBy: 'user-1'
    }
  ]

  const defaultProps = {
    releases: mockReleases,
    loading: false,
  }

  describe('Loading State', () => {
    it('should render loading skeletons when loading is true', () => {
      render(<ReleasesListSimple {...defaultProps} loading={true} />)

      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3)
      expect(screen.queryByText('Version 1.0.0 Release')).not.toBeInTheDocument()
    })

    it('should render loading with custom className', () => {
      const { container } = render(
        <ReleasesListSimple {...defaultProps} loading={true} className="custom-loading" />
      )

      expect(container.firstChild).toHaveClass('custom-loading')
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no releases', () => {
      render(<ReleasesListSimple {...defaultProps} releases={[]} />)

      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.getByText('No releases found')).toBeInTheDocument()
    })

    it('should render empty state with custom className', () => {
      const { container } = render(
        <ReleasesListSimple {...defaultProps} releases={[]} className="custom-empty" />
      )

      expect(container.firstChild).toHaveClass('custom-empty')
    })
  })

  describe('Releases Rendering', () => {
    beforeEach(() => {
      render(<ReleasesListSimple {...defaultProps} />)
    })

    it('should render all releases', () => {
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.1.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.1 Release')).toBeInTheDocument()
    })

    it('should render version badges when versions exist', () => {
      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      expect(screen.getByText('v1.1.0')).toBeInTheDocument()
      expect(screen.getByText('v1.0.1')).toBeInTheDocument()

      expect(screen.getAllByTestId('tag-icon')).toHaveLength(3)
    })

    it('should render descriptions by default', () => {
      expect(screen.getByText('Major release with new features')).toBeInTheDocument()
      expect(screen.getByText('Minor release with improvements')).toBeInTheDocument()
      expect(screen.getByText('Patch release with bug fixes')).toBeInTheDocument()
    })

    it('should render links to release detail pages', () => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/releases/release-1')
      expect(links[1]).toHaveAttribute('href', '/releases/release-2')
      expect(links[2]).toHaveAttribute('href', '/releases/release-3')
    })
  })

  describe('Status Display', () => {
    beforeEach(() => {
      render(<ReleasesListSimple {...defaultProps} />)
    })

    it('should render status badges with correct styling', () => {
      const stableStatus = screen.getByText('Stable')
      const betaStatus = screen.getByText('Beta')
      const draftStatus = screen.getByText('Draft')

      expect(stableStatus).toHaveClass('text-green-600', 'bg-green-100')
      expect(betaStatus).toHaveClass('text-yellow-600', 'bg-yellow-100')
      expect(draftStatus).toHaveClass('text-gray-600', 'bg-gray-100')
    })

    it('should render status icons', () => {
      expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(1) // Stable
      expect(screen.getAllByTestId('alert-circle-icon')).toHaveLength(1) // Beta
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(1) // Draft
    })

    it('should handle unknown status gracefully', () => {
      const releasesWithUnknownStatus = [
        {
          ...mockReleases[0],
          status: 'unknown' as any
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesWithUnknownStatus} />)

      expect(screen.getByText('Unknown')).toBeInTheDocument()
      expect(screen.getByText('Unknown')).toHaveClass('text-gray-600', 'bg-gray-100')
    })
  })

  describe('Type Display', () => {
    beforeEach(() => {
      render(<ReleasesListSimple {...defaultProps} />)
    })

    it('should render type badges with correct colors', () => {
      const majorType = screen.getByText('major')
      const minorType = screen.getByText('minor')
      const patchType = screen.getByText('patch')

      expect(majorType).toHaveClass('text-purple-600', 'bg-purple-100')
      expect(minorType).toHaveClass('text-blue-600', 'bg-blue-100')
      expect(patchType).toHaveClass('text-green-600', 'bg-green-100')
    })

    it('should handle unknown type gracefully', () => {
      const releasesWithUnknownType = [
        {
          ...mockReleases[0],
          type: 'unknown' as any
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesWithUnknownType} />)

      const unknownType = screen.getByText('unknown')
      expect(unknownType).toHaveClass('text-gray-600', 'bg-gray-100')
    })
  })

  describe('Date Display', () => {
    beforeEach(() => {
      render(<ReleasesListSimple {...defaultProps} />)
    })

    it('should render formatted dates', () => {
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Feb 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument()
    })

    it('should render calendar icons', () => {
      expect(screen.getAllByTestId('calendar-icon')).toHaveLength(3)
    })

    it('should render relative time', () => {
      // Check that relative time is displayed (exact text depends on current date)
      const relativeTimes = screen.getAllByText(/ago|Today|Yesterday/)
      expect(relativeTimes.length).toBeGreaterThan(0)
    })

    it('should handle invalid dates gracefully', () => {
      const releasesWithInvalidDate = [
        {
          ...mockReleases[0],
          releaseDate: new Date('invalid-date')
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesWithInvalidDate} />)

      // Should still render the release
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })
  })

  describe('Configuration Options', () => {
    it('should hide descriptions when showDescription is false', () => {
      render(<ReleasesListSimple {...defaultProps} showDescription={false} />)

      expect(screen.queryByText('Major release with new features')).not.toBeInTheDocument()
      expect(screen.queryByText('Minor release with improvements')).not.toBeInTheDocument()
      expect(screen.queryByText('Patch release with bug fixes')).not.toBeInTheDocument()
    })

    it('should show descriptions when showDescription is true', () => {
      render(<ReleasesListSimple {...defaultProps} showDescription={true} />)

      expect(screen.getByText('Major release with new features')).toBeInTheDocument()
      expect(screen.getByText('Minor release with improvements')).toBeInTheDocument()
      expect(screen.getByText('Patch release with bug fixes')).toBeInTheDocument()
    })

    it('should limit items when maxItems is specified', () => {
      render(<ReleasesListSimple {...defaultProps} maxItems={2} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.1.0 Release')).toBeInTheDocument()
      expect(screen.queryByText('Version 1.0.1 Release')).not.toBeInTheDocument()
    })

    it('should show "View all" link when maxItems is less than total releases', () => {
      render(<ReleasesListSimple {...defaultProps} maxItems={2} />)

      const viewAllLink = screen.getByText('View all 3 releases →')
      expect(viewAllLink).toBeInTheDocument()
      expect(viewAllLink.closest('a')).toHaveAttribute('href', '/releases')
    })

    it('should not show "View all" link when maxItems is greater than or equal to total releases', () => {
      render(<ReleasesListSimple {...defaultProps} maxItems={5} />)

      expect(screen.queryByText(/View all/)).not.toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <ReleasesListSimple {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Edge Cases', () => {
    it('should handle releases without versions', () => {
      const releasesWithoutVersion = [
        {
          ...mockReleases[0],
          version: undefined
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesWithoutVersion} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.queryByTestId('tag-icon')).not.toBeInTheDocument()
    })

    it('should handle releases without descriptions', () => {
      const releasesWithoutDescription = [
        {
          ...mockReleases[0],
          description: undefined
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesWithoutDescription} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle empty descriptions', () => {
      const releasesWithEmptyDescription = [
        {
          ...mockReleases[0],
          description: ''
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesWithEmptyDescription} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle long descriptions', () => {
      const releasesWithLongDescription = [
        {
          ...mockReleases[0],
          description: 'This is a very long description that should be truncated with line-clamp-2 CSS class to ensure it does not take up too much space in the UI.'
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesWithLongDescription} />)

      const description = screen.getByText(/This is a very long description/)
      expect(description).toHaveClass('line-clamp-2')
    })
  })

  describe('Hover Effects', () => {
    beforeEach(() => {
      render(<ReleasesListSimple {...defaultProps} />)
    })

    it('should have hover effects on release cards', () => {
      const links = screen.getAllByRole('link')
      
      links.forEach(link => {
        expect(link).toHaveClass('hover:shadow-md', 'hover:border-gray-300')
      })
    })

    it('should have hover effects on titles', () => {
      const title = screen.getByText('Version 1.0.0 Release')
      expect(title).toHaveClass('group-hover:text-blue-600')
    })

    it('should show arrow indicators on hover', () => {
      const arrowIndicators = screen.getAllByRole('link').map(link => 
        link.querySelector('svg')
      )
      
      arrowIndicators.forEach(arrow => {
        expect(arrow?.parentElement).toHaveClass('group-hover:opacity-100')
      })
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      render(<ReleasesListSimple {...defaultProps} />)
    })

    it('should have proper link structure', () => {
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(3)
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })

    it('should have proper heading structure', () => {
      const titles = screen.getAllByRole('heading', { level: 3 })
      expect(titles).toHaveLength(3)
    })

    it('should have descriptive link content', () => {
      const links = screen.getAllByRole('link')
      
      expect(links[0]).toHaveTextContent('Version 1.0.0 Release')
      expect(links[1]).toHaveTextContent('Version 1.1.0 Release')
      expect(links[2]).toHaveTextContent('Version 1.0.1 Release')
    })
  })

  describe('Package Icon', () => {
    beforeEach(() => {
      render(<ReleasesListSimple {...defaultProps} />)
    })

    it('should render package icons for each release', () => {
      expect(screen.getAllByTestId('package-icon')).toHaveLength(3)
    })

    it('should render package icon in empty state', () => {
      render(<ReleasesListSimple {...defaultProps} releases={[]} />)
      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
    })
  })

  describe('Relative Time Calculations', () => {
    it('should show "Today" for releases from today', () => {
      const today = new Date()
      const releasesToday = [
        {
          ...mockReleases[0],
          releaseDate: today
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesToday} />)

      expect(screen.getByText('(Today)')).toBeInTheDocument()
    })

    it('should show "Yesterday" for releases from yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const releasesYesterday = [
        {
          ...mockReleases[0],
          releaseDate: yesterday
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesYesterday} />)

      expect(screen.getByText('(Yesterday)')).toBeInTheDocument()
    })

    it('should show days ago for releases within a week', () => {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      
      const releasesThreeDaysAgo = [
        {
          ...mockReleases[0],
          releaseDate: threeDaysAgo
        }
      ]

      render(<ReleasesListSimple {...defaultProps} releases={releasesThreeDaysAgo} />)

      expect(screen.getByText('(3d ago)')).toBeInTheDocument()
    })
  })
})
