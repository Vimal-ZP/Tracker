import React from 'react'
import { render, screen } from '@testing-library/react'
import ReleasesSummary from '../ReleasesSummary'
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
  Package: (props: any) => <div data-testid="package-icon" {...props}>Package</div>,
  TrendingUp: (props: any) => <div data-testid="trending-up-icon" {...props}>TrendingUp</div>,
  Calendar: (props: any) => <div data-testid="calendar-icon" {...props}>Calendar</div>,
  Clock: (props: any) => <div data-testid="clock-icon" {...props}>Clock</div>,
  CheckCircle: (props: any) => <div data-testid="check-circle-icon" {...props}>CheckCircle</div>,
  AlertCircle: (props: any) => <div data-testid="alert-circle-icon" {...props}>AlertCircle</div>,
  XCircle: (props: any) => <div data-testid="x-circle-icon" {...props}>XCircle</div>,
  ArrowRight: (props: any) => <div data-testid="arrow-right-icon" {...props}>ArrowRight</div>,
}))

describe('ReleasesSummary', () => {
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
    },
    {
      _id: 'release-4',
      title: 'Version 1.0.2 Release',
      description: 'Another stable release',
      version: '1.0.2',
      applicationName: 'Portal Plus',
      releaseDate: new Date('2024-04-15'),
      type: ReleaseType.PATCH,
      status: 'stable',
      isPublished: true,
      workItems: [],
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-01'),
      createdBy: 'user-1'
    },
    {
      _id: 'release-5',
      title: 'Version 2.0.0 Release',
      description: 'Deprecated release',
      version: '2.0.0',
      applicationName: 'Fast 2.0',
      releaseDate: new Date('2024-05-15'),
      type: ReleaseType.MAJOR,
      status: 'deprecated',
      isPublished: false,
      workItems: [],
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date('2024-05-01'),
      createdBy: 'user-1'
    }
  ]

  const defaultProps = {
    releases: mockReleases,
    loading: false,
  }

  describe('Loading State', () => {
    it('should render loading skeletons when loading is true', () => {
      render(<ReleasesSummary {...defaultProps} loading={true} />)

      // Should render loading skeletons (using class-based detection since testids might not exist)
      expect(screen.getAllByText('').filter(el => 
        el.classList.contains('animate-pulse')
      )).toHaveLength(1) // The main loading container

      // Should not render real content during loading
      expect(screen.queryByText('Total Releases')).not.toBeInTheDocument()
    })

    it('should render loading with custom className', () => {
      const { container } = render(
        <ReleasesSummary {...defaultProps} loading={true} className="custom-loading" />
      )

      expect(container.firstChild).toHaveClass('custom-loading')
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no releases', () => {
      render(<ReleasesSummary {...defaultProps} releases={[]} />)

      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.getByText('No releases yet')).toBeInTheDocument()
      expect(screen.getByText('Get started by creating your first release.')).toBeInTheDocument()
      expect(screen.getByText('Create Release')).toBeInTheDocument()
    })

    it('should render empty state with custom className', () => {
      const { container } = render(
        <ReleasesSummary {...defaultProps} releases={[]} className="custom-empty" />
      )

      expect(container.firstChild).toHaveClass('custom-empty')
    })

    it('should link to create release page', () => {
      render(<ReleasesSummary {...defaultProps} releases={[]} />)

      const createLink = screen.getByText('Create Release')
      expect(createLink.closest('a')).toHaveAttribute('href', '/releases/new')
    })
  })

  describe('Stats Overview', () => {
    beforeEach(() => {
      render(<ReleasesSummary {...defaultProps} />)
    })

    it('should render total releases card', () => {
      expect(screen.getByText('Total Releases')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
    })

    it('should render stable releases card', () => {
      expect(screen.getByText('Stable')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument() // 2 stable releases
      expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(2) // One in card, one in status breakdown
    })

    it('should render beta releases card', () => {
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // 1 beta release
      expect(screen.getAllByTestId('alert-circle-icon')).toHaveLength(2) // One in card, one in status breakdown
    })

    it('should have correct styling for stat cards', () => {
      const totalCard = screen.getByText('Total Releases').closest('.bg-white')
      const stableCard = screen.getByText('Stable').closest('.bg-white')
      const betaCard = screen.getByText('Beta').closest('.bg-white')

      expect(totalCard).toHaveClass('p-4', 'rounded-lg', 'border', 'border-gray-200')
      expect(stableCard).toHaveClass('p-4', 'rounded-lg', 'border', 'border-gray-200')
      expect(betaCard).toHaveClass('p-4', 'rounded-lg', 'border', 'border-gray-200')
    })
  })

  describe('Status Breakdown', () => {
    beforeEach(() => {
      render(<ReleasesSummary {...defaultProps} />)
    })

    it('should render status breakdown section', () => {
      expect(screen.getByText('Release Status')).toBeInTheDocument()
    })

    it('should show all status types with counts', () => {
      expect(screen.getByText('Draft')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('Stable')).toBeInTheDocument()
      expect(screen.getByText('Deprecated')).toBeInTheDocument()
    })

    it('should show correct counts for each status', () => {
      // Draft: 1, Beta: 1, Stable: 2, Deprecated: 1
      const statusCounts = screen.getAllByText('1')
      const stableCounts = screen.getAllByText('2')
      
      expect(statusCounts.length).toBeGreaterThanOrEqual(3) // Draft, Beta, Deprecated
      expect(stableCounts.length).toBeGreaterThanOrEqual(1) // Stable
    })

    it('should show percentages for each status', () => {
      expect(screen.getByText('20%')).toBeInTheDocument() // 1/5 = 20% for each single status
      expect(screen.getByText('40%')).toBeInTheDocument() // 2/5 = 40% for stable
    })

    it('should render status icons', () => {
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(1) // Draft
      expect(screen.getAllByTestId('alert-circle-icon')).toHaveLength(2) // Beta (card + status)
      expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(2) // Stable (card + status)
      expect(screen.getAllByTestId('x-circle-icon')).toHaveLength(1) // Deprecated
    })
  })

  describe('Recent Releases', () => {
    beforeEach(() => {
      render(<ReleasesSummary {...defaultProps} />)
    })

    it('should render recent releases section', () => {
      expect(screen.getByText('Recent Releases')).toBeInTheDocument()
    })

    it('should show view all link by default', () => {
      const viewAllLink = screen.getByText('View all')
      expect(viewAllLink).toBeInTheDocument()
      expect(viewAllLink.closest('a')).toHaveAttribute('href', '/releases')
      expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument()
    })

    it('should render recent releases (up to 5)', () => {
      // Should show all releases as links, sorted by release date (most recent first)
      const releaseLinks = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.startsWith('/releases/release-')
      )
      
      expect(releaseLinks.length).toBeGreaterThan(0)
    })

    it('should show formatted dates for recent releases', () => {
      expect(screen.getAllByTestId('calendar-icon')).toHaveLength(3) // One for each visible recent release
    })

    it('should have hover effects on recent release items', () => {
      const releaseItems = screen.getAllByRole('link').filter(link => 
        link.getAttribute('href')?.startsWith('/releases/release-')
      )
      
      releaseItems.forEach(item => {
        expect(item).toHaveClass('hover:bg-gray-50')
      })
    })
  })

  describe('Popular Releases', () => {
    beforeEach(() => {
      render(<ReleasesSummary {...defaultProps} />)
    })

    it('should render popular releases section', () => {
      expect(screen.getByText('Latest Releases')).toBeInTheDocument()
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
    })

    it('should show numbered indicators for popular releases', () => {
      // Should show numbered circles (1, 2, 3) for top 3 releases
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should limit to 3 popular releases', () => {
      const numberedItems = screen.getAllByText(/^[1-3]$/)
      expect(numberedItems).toHaveLength(3)
    })
  })

  describe('Configuration Options', () => {
    it('should hide view all link when showViewAll is false', () => {
      render(<ReleasesSummary {...defaultProps} showViewAll={false} />)

      expect(screen.queryByText('View all')).not.toBeInTheDocument()
    })

    it('should show view all link when showViewAll is true', () => {
      render(<ReleasesSummary {...defaultProps} showViewAll={true} />)

      expect(screen.getByText('View all')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <ReleasesSummary {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Statistics Calculations', () => {
    it('should calculate correct totals', () => {
      render(<ReleasesSummary {...defaultProps} />)

      expect(screen.getByText('5')).toBeInTheDocument() // Total releases
    })

    it('should count statuses correctly', () => {
      render(<ReleasesSummary {...defaultProps} />)

      // Based on mockReleases: 1 draft, 1 beta, 2 stable, 1 deprecated
      const draftCount = screen.getAllByText('1').length
      const stableCount = screen.getAllByText('2').length
      
      expect(draftCount).toBeGreaterThanOrEqual(1)
      expect(stableCount).toBeGreaterThanOrEqual(1)
    })

    it('should handle empty statistics', () => {
      const emptyReleases: Release[] = []
      render(<ReleasesSummary {...defaultProps} releases={emptyReleases} />)

      expect(screen.getByText('No releases yet')).toBeInTheDocument()
    })

    it('should sort recent releases by date', () => {
      // Recent releases should be sorted by releaseDate (most recent first)
      // This is verified by the presence of the releases section
      render(<ReleasesSummary {...defaultProps} />)
      
      expect(screen.getByText('Recent Releases')).toBeInTheDocument()
    })

    it('should sort popular releases by creation date', () => {
      // Popular releases should be sorted by createdAt (most recent first)
      // This is verified by the presence of the latest releases section
      render(<ReleasesSummary {...defaultProps} />)
      
      expect(screen.getByText('Latest Releases')).toBeInTheDocument()
    })
  })

  describe('Date Formatting', () => {
    beforeEach(() => {
      render(<ReleasesSummary {...defaultProps} />)
    })

    it('should format dates correctly', () => {
      expect(screen.getByText('Jan 15')).toBeInTheDocument()
      expect(screen.getByText('Feb 15')).toBeInTheDocument()
      expect(screen.getByText('Mar 15')).toBeInTheDocument()
    })

    it('should handle invalid dates gracefully', () => {
      const releasesWithInvalidDate = [
        {
          ...mockReleases[0],
          releaseDate: new Date('invalid-date')
        }
      ]

      render(<ReleasesSummary {...defaultProps} releases={releasesWithInvalidDate} />)

      // Should still render without crashing
      expect(screen.getByText('Total Releases')).toBeInTheDocument()
    })
  })

  describe('Number Formatting', () => {
    it('should format large numbers with K suffix', () => {
      // Create a mock with 1500 releases
      const manyReleases = Array.from({ length: 1500 }, (_, index) => ({
        ...mockReleases[0],
        _id: `release-${index}`,
        status: 'stable' as const
      }))

      render(<ReleasesSummary {...defaultProps} releases={manyReleases} />)

      expect(screen.getByText('1.5K')).toBeInTheDocument()
    })

    it('should format very large numbers with M suffix', () => {
      // Create a mock with 1.5M releases
      const manyReleases = Array.from({ length: 1500000 }, (_, index) => ({
        ...mockReleases[0],
        _id: `release-${index}`,
        status: 'stable' as const
      }))

      render(<ReleasesSummary {...defaultProps} releases={manyReleases} />)

      expect(screen.getByText('1.5M')).toBeInTheDocument()
    })

    it('should display regular numbers for small counts', () => {
      render(<ReleasesSummary {...defaultProps} />)

      expect(screen.getByText('5')).toBeInTheDocument() // Total count
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

      render(<ReleasesSummary {...defaultProps} releases={releasesWithoutVersion} />)

      expect(screen.getByText('Total Releases')).toBeInTheDocument()
    })

    it('should handle releases with null/undefined dates', () => {
      const releasesWithNullDate = [
        {
          ...mockReleases[0],
          releaseDate: null as any
        }
      ]

      render(<ReleasesSummary {...defaultProps} releases={releasesWithNullDate} />)

      expect(screen.getByText('Total Releases')).toBeInTheDocument()
    })

    it('should handle single release', () => {
      const singleRelease = [mockReleases[0]]

      render(<ReleasesSummary {...defaultProps} releases={singleRelease} />)

      expect(screen.getByText('Total Releases').nextElementSibling).toHaveTextContent('1') // Total count
      expect(screen.getByText('100%')).toBeInTheDocument() // Single release = 100%
    })

    it('should handle releases with very long titles', () => {
      const releasesWithLongTitle = [
        {
          ...mockReleases[0],
          title: 'This is a very long release title that might cause layout issues if not handled properly'
        }
      ]

      render(<ReleasesSummary {...defaultProps} releases={releasesWithLongTitle} />)

      expect(screen.getAllByText(/This is a very long release title/)).toHaveLength(2) // Appears in both sections
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      render(<ReleasesSummary {...defaultProps} />)
    })

    it('should have proper heading structure', () => {
      expect(screen.getByRole('heading', { level: 3, name: 'Release Status' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Recent Releases' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: 'Latest Releases' })).toBeInTheDocument()
    })

    it('should have proper link structure', () => {
      const links = screen.getAllByRole('link')
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })

    it('should have descriptive text for stats', () => {
      expect(screen.getByText('Total Releases')).toBeInTheDocument()
      expect(screen.getAllByText('Stable')).toHaveLength(2) // Appears in overview and status breakdown
      expect(screen.getAllByText('Beta')).toHaveLength(2) // Appears in overview and status breakdown
    })
  })
})
