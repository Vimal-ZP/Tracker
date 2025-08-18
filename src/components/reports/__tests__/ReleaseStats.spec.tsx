import React from 'react'
import { render, screen } from '@testing-library/react'
import ReleaseStats from '../ReleaseStats'
import { Release, ReleaseType } from '@/types/release'

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Package: (props: any) => <div data-testid="package-icon" {...props}>Package</div>,
  TrendingUp: (props: any) => <div data-testid="trending-up-icon" {...props}>TrendingUp</div>,
  Calendar: (props: any) => <div data-testid="calendar-icon" {...props}>Calendar</div>,
  CheckCircle: (props: any) => <div data-testid="check-circle-icon" {...props}>CheckCircle</div>,
  Building: (props: any) => <div data-testid="building-icon" {...props}>Building</div>,
  Tag: (props: any) => <div data-testid="tag-icon" {...props}>Tag</div>,
  Clock: (props: any) => <div data-testid="clock-icon" {...props}>Clock</div>,
  BarChart3: (props: any) => <div data-testid="bar-chart-icon" {...props}>BarChart3</div>,
}))

describe('ReleaseStats', () => {
  const mockReleases: Release[] = [
    {
      _id: 'release-1',
      title: 'Version 1.0.0 Release',
      description: 'Major release with new features',
      version: '1.0.0',
      applicationName: 'NRE',
      releaseDate: new Date('2024-06-01'), // Recent
      type: ReleaseType.MAJOR,
      status: 'stable',
      isPublished: true,
      workItems: [],
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date('2024-05-01'),
      createdBy: 'user-1'
    },
    {
      _id: 'release-2',
      title: 'Version 1.1.0 Release',
      description: 'Minor release with improvements',
      version: '1.1.0',
      applicationName: 'NVE',
      releaseDate: new Date('2024-05-15'), // Recent
      type: ReleaseType.MINOR,
      status: 'beta',
      isPublished: false,
      workItems: [],
      createdAt: new Date('2024-05-01'),
      updatedAt: new Date('2024-05-01'),
      createdBy: 'user-1'
    },
    {
      _id: 'release-3',
      title: 'Version 1.0.1 Release',
      description: 'Patch release with bug fixes',
      version: '1.0.1',
      applicationName: 'NRE',
      releaseDate: new Date('2024-04-15'), // Older
      type: ReleaseType.PATCH,
      status: 'draft',
      isPublished: true,
      workItems: [],
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-01'),
      createdBy: 'user-1'
    },
    {
      _id: 'release-4',
      title: 'Version 1.0.2 Release',
      description: 'Hotfix release',
      version: '1.0.2',
      applicationName: 'E-Vite',
      releaseDate: new Date('2024-06-10'), // Recent
      type: ReleaseType.HOTFIX,
      status: 'stable',
      isPublished: true,
      workItems: [],
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-06-01'),
      createdBy: 'user-1'
    }
  ]

  beforeEach(() => {
    // Mock current date to ensure consistent calculations
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('should render all main stats cards', () => {
      render(<ReleaseStats releases={mockReleases} />)

      expect(screen.getByText('Total Releases')).toBeInTheDocument()
      expect(screen.getByText('Published')).toBeInTheDocument()
      expect(screen.getByText('Applications')).toBeInTheDocument()
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('Monthly Average')).toBeInTheDocument()
      expect(screen.getByText('Major Releases')).toBeInTheDocument()
    })

    it('should render release type breakdown section', () => {
      render(<ReleaseStats releases={mockReleases} />)

      expect(screen.getByText('Release Type Breakdown')).toBeInTheDocument()
      expect(screen.getByText('Major')).toBeInTheDocument()
      expect(screen.getByText('Minor')).toBeInTheDocument()
      expect(screen.getByText('Patch')).toBeInTheDocument()
      expect(screen.getByText('Hotfix')).toBeInTheDocument()
    })

    it('should render top applications section', () => {
      render(<ReleaseStats releases={mockReleases} />)

      expect(screen.getByText('Top Applications')).toBeInTheDocument()
    })

    it('should render all expected icons', () => {
      render(<ReleaseStats releases={mockReleases} />)

      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
      expect(screen.getByTestId('building-icon')).toBeInTheDocument()
      expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
      expect(screen.getByTestId('tag-icon')).toBeInTheDocument()
    })
  })

  describe('Statistics Calculations', () => {
    it('should calculate total releases correctly', () => {
      render(<ReleaseStats releases={mockReleases} />)

      expect(screen.getByText('4')).toBeInTheDocument() // Total releases
    })

    it('should calculate published vs unpublished releases correctly', () => {
      render(<ReleaseStats releases={mockReleases} />)

      // 3 published, 1 unpublished
      const publishedCard = screen.getByText('Published').closest('.bg-white')
      expect(publishedCard).toHaveTextContent('3')
      expect(publishedCard).toHaveTextContent('1 in draft')
    })

    it('should calculate unique applications correctly', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const applicationsCard = screen.getByText('Applications').closest('.bg-white')
      expect(applicationsCard).toHaveTextContent('3') // NRE, NVE, E-Vite
    })

    it('should identify most active application', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const applicationsCard = screen.getByText('Applications').closest('.bg-white')
      expect(applicationsCard).toHaveTextContent('NRE leads') // NRE has 2 releases
    })

    it('should calculate recent activity (last 30 days)', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const recentCard = screen.getByText('Recent Activity').closest('.bg-white')
      expect(recentCard).toHaveTextContent('3') // 3 releases in last 30 days
    })

    it('should calculate monthly average correctly', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const monthlyCard = screen.getByText('Monthly Average').closest('.bg-white')
      // 4 releases over ~2 months = 2.0 per month (rounded)
      expect(monthlyCard).toHaveTextContent('2.7') // Should be calculated based on 6-month period
    })

    it('should count major releases correctly', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const majorCard = screen.getByText('Major Releases').closest('.bg-white')
      expect(majorCard).toHaveTextContent('1') // 1 major release
      expect(majorCard).toHaveTextContent('1 minor releases') // 1 minor release
    })
  })

  describe('Release Type Breakdown', () => {
    it('should display correct counts for each type', () => {
      render(<ReleaseStats releases={mockReleases} />)

      // Check type breakdown section
      const typeBreakdown = screen.getByText('Release Type Breakdown').closest('.bg-white')
      
      expect(typeBreakdown).toHaveTextContent('Major')
      expect(typeBreakdown).toHaveTextContent('Minor')
      expect(typeBreakdown).toHaveTextContent('Patch')
      expect(typeBreakdown).toHaveTextContent('Hotfix')
    })

    it('should calculate percentages correctly', () => {
      render(<ReleaseStats releases={mockReleases} />)

      // Each type has 1 release out of 4 total = 25% each
      const typeBreakdown = screen.getByText('Release Type Breakdown').closest('.bg-white')
      
      expect(typeBreakdown).toHaveTextContent('25%')
    })

    it('should apply correct colors for each type', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const majorSection = screen.getByText('Major').closest('.flex')
      const minorSection = screen.getByText('Minor').closest('.flex')
      const patchSection = screen.getByText('Patch').closest('.flex')
      const hotfixSection = screen.getByText('Hotfix').closest('.flex')

      expect(majorSection?.querySelector('.bg-red-500')).toBeInTheDocument()
      expect(minorSection?.querySelector('.bg-yellow-500')).toBeInTheDocument()
      expect(patchSection?.querySelector('.bg-green-500')).toBeInTheDocument()
      expect(hotfixSection?.querySelector('.bg-blue-500')).toBeInTheDocument()
    })
  })

  describe('Top Applications Section', () => {
    it('should list applications with release counts', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const topAppsSection = screen.getByText('Top Applications').closest('.bg-white')
      
      expect(topAppsSection).toHaveTextContent('NRE')
      expect(topAppsSection).toHaveTextContent('NVE')
      expect(topAppsSection).toHaveTextContent('E-Vite')
    })

    it('should sort applications by release count', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const topAppsSection = screen.getByText('Top Applications').closest('.bg-white')
      const appElements = topAppsSection?.querySelectorAll('.flex.items-center.justify-between')
      
      // NRE should be first with 2 releases, others with 1 each
      expect(appElements?.[0]).toHaveTextContent('NRE')
      expect(appElements?.[0]).toHaveTextContent('2')
    })

    it('should show "No releases yet" for empty applications', () => {
      render(<ReleaseStats releases={[]} />)

      const applicationsCard = screen.getByText('Applications').closest('.bg-white')
      expect(applicationsCard).toHaveTextContent('No releases yet')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty releases array', () => {
      render(<ReleaseStats releases={[]} />)

      expect(screen.getByText('0')).toBeInTheDocument() // Total releases
      
      const publishedCard = screen.getByText('Published').closest('.bg-white')
      expect(publishedCard).toHaveTextContent('0')
      expect(publishedCard).toHaveTextContent('0 in draft')
      
      const applicationsCard = screen.getByText('Applications').closest('.bg-white')
      expect(applicationsCard).toHaveTextContent('0')
      expect(applicationsCard).toHaveTextContent('No releases yet')
    })

    it('should handle single release', () => {
      const singleRelease = [mockReleases[0]]

      render(<ReleaseStats releases={singleRelease} />)

      expect(screen.getByText('1')).toBeInTheDocument() // Total releases
      
      const applicationsCard = screen.getByText('Applications').closest('.bg-white')
      expect(applicationsCard).toHaveTextContent('1')
      expect(applicationsCard).toHaveTextContent('NRE leads')
    })

    it('should handle all unpublished releases', () => {
      const unpublishedReleases = mockReleases.map(release => ({
        ...release,
        isPublished: false
      }))

      render(<ReleaseStats releases={unpublishedReleases} />)

      const publishedCard = screen.getByText('Published').closest('.bg-white')
      expect(publishedCard).toHaveTextContent('0')
      expect(publishedCard).toHaveTextContent('4 in draft')
    })

    it('should handle all published releases', () => {
      const publishedReleases = mockReleases.map(release => ({
        ...release,
        isPublished: true
      }))

      render(<ReleaseStats releases={publishedReleases} />)

      const publishedCard = screen.getByText('Published').closest('.bg-white')
      expect(publishedCard).toHaveTextContent('4')
      expect(publishedCard).toHaveTextContent('0 in draft')
    })

    it('should handle old releases outside recent window', () => {
      const oldReleases = mockReleases.map(release => ({
        ...release,
        releaseDate: new Date('2020-01-01') // Very old
      }))

      render(<ReleaseStats releases={oldReleases} />)

      const recentCard = screen.getByText('Recent Activity').closest('.bg-white')
      expect(recentCard).toHaveTextContent('0') // No recent activity
    })

    it('should handle releases with same application name', () => {
      const sameAppReleases = mockReleases.map(release => ({
        ...release,
        applicationName: 'TestApp'
      }))

      render(<ReleaseStats releases={sameAppReleases} />)

      const applicationsCard = screen.getByText('Applications').closest('.bg-white')
      expect(applicationsCard).toHaveTextContent('1') // Only one unique application
      expect(applicationsCard).toHaveTextContent('TestApp leads')
    })

    it('should handle releases with same type', () => {
      const sameTypeReleases = mockReleases.map(release => ({
        ...release,
        type: ReleaseType.MAJOR
      }))

      render(<ReleaseStats releases={sameTypeReleases} />)

      const typeBreakdown = screen.getByText('Release Type Breakdown').closest('.bg-white')
      expect(typeBreakdown).toHaveTextContent('100%') // All major releases
    })

    it('should handle invalid release dates', () => {
      const invalidDateReleases = [
        {
          ...mockReleases[0],
          releaseDate: new Date('invalid-date')
        }
      ]

      render(<ReleaseStats releases={invalidDateReleases} />)

      // Should render without crashing
      expect(screen.getByText('Total Releases')).toBeInTheDocument()
    })

    it('should handle null/undefined release dates', () => {
      const nullDateReleases = [
        {
          ...mockReleases[0],
          releaseDate: null as any
        }
      ]

      render(<ReleaseStats releases={nullDateReleases} />)

      // Should render without crashing
      expect(screen.getByText('Total Releases')).toBeInTheDocument()
    })
  })

  describe('Date Calculations', () => {
    it('should correctly identify releases in last 30 days', () => {
      // Current mocked date is 2024-06-15
      const mixedDateReleases = [
        {
          ...mockReleases[0],
          releaseDate: new Date('2024-06-10') // 5 days ago - recent
        },
        {
          ...mockReleases[1],
          releaseDate: new Date('2024-05-20') // 26 days ago - recent
        },
        {
          ...mockReleases[2],
          releaseDate: new Date('2024-05-10') // 36 days ago - not recent
        }
      ]

      render(<ReleaseStats releases={mixedDateReleases} />)

      const recentCard = screen.getByText('Recent Activity').closest('.bg-white')
      expect(recentCard).toHaveTextContent('2') // Only 2 recent releases
    })

    it('should correctly calculate 6-month average', () => {
      // Current mocked date is 2024-06-15, so 6 months ago is ~2024-01-15
      const sixMonthReleases = [
        {
          ...mockReleases[0],
          releaseDate: new Date('2024-06-01') // Within 6 months
        },
        {
          ...mockReleases[1],
          releaseDate: new Date('2024-03-01') // Within 6 months
        },
        {
          ...mockReleases[2],
          releaseDate: new Date('2023-12-01') // Outside 6 months
        }
      ]

      render(<ReleaseStats releases={sixMonthReleases} />)

      const monthlyCard = screen.getByText('Monthly Average').closest('.bg-white')
      // 2 releases in 6 months = 0.3 per month, rounded to 0.3
      expect(monthlyCard).toHaveTextContent('0.3')
    })
  })

  describe('Visual Design Elements', () => {
    it('should apply correct color classes to stat cards', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const totalCard = screen.getByText('Total Releases').closest('.bg-white')
      const publishedCard = screen.getByText('Published').closest('.bg-white')
      const appsCard = screen.getByText('Applications').closest('.bg-white')

      expect(totalCard?.querySelector('.bg-blue-500')).toBeInTheDocument()
      expect(publishedCard?.querySelector('.bg-green-500')).toBeInTheDocument()
      expect(appsCard?.querySelector('.bg-purple-500')).toBeInTheDocument()
    })

    it('should have hover effects on stat cards', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const statCards = screen.getAllByText(/Total Releases|Published|Applications|Recent Activity|Monthly Average|Major Releases/)
        .map(text => text.closest('.bg-white'))

      statCards.forEach(card => {
        expect(card).toHaveClass('hover:shadow-md')
      })
    })

    it('should have progress bars for type breakdown', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const typeBreakdown = screen.getByText('Release Type Breakdown').closest('.bg-white')
      const progressBars = typeBreakdown?.querySelectorAll('.h-2')

      expect(progressBars).toHaveLength(4) // One for each release type
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ReleaseStats releases={mockReleases} />)

      expect(screen.getByRole('heading', { level: 3, name: /Release Type Breakdown/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /Top Applications/ })).toBeInTheDocument()
    })

    it('should have descriptive text for statistics', () => {
      render(<ReleaseStats releases={mockReleases} />)

      expect(screen.getByText('All time releases')).toBeInTheDocument()
      expect(screen.getByText('Last 30 days')).toBeInTheDocument()
      expect(screen.getByText('Last 6 months')).toBeInTheDocument()
    })

    it('should have proper icon associations', () => {
      render(<ReleaseStats releases={mockReleases} />)

      const totalCard = screen.getByText('Total Releases').closest('.bg-white')
      expect(totalCard?.querySelector('[data-testid="package-icon"]')).toBeInTheDocument()

      const publishedCard = screen.getByText('Published').closest('.bg-white')
      expect(publishedCard?.querySelector('[data-testid="check-circle-icon"]')).toBeInTheDocument()
    })
  })

  describe('Performance with Large Datasets', () => {
    it('should handle large number of releases efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        ...mockReleases[0],
        _id: `release-${index}`,
        applicationName: `App-${index % 50}`, // 50 different apps
        type: [ReleaseType.MAJOR, ReleaseType.MINOR, ReleaseType.PATCH, ReleaseType.HOTFIX][index % 4],
        isPublished: index % 2 === 0,
        releaseDate: new Date(2024, 5, index % 30 + 1) // Spread across June
      }))

      render(<ReleaseStats releases={largeDataset} />)

      expect(screen.getByText('1000')).toBeInTheDocument() // Total releases
      expect(screen.getByText('500')).toBeInTheDocument() // Published (half)
      expect(screen.getByText('50')).toBeInTheDocument() // Applications
    })
  })
})
