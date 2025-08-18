import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReleaseTable from '../ReleaseTable'
import { Release, ReleaseType } from '@/types/release'

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronUp: (props: any) => <div data-testid="chevron-up-icon" {...props}>ChevronUp</div>,
  ChevronDown: (props: any) => <div data-testid="chevron-down-icon" {...props}>ChevronDown</div>,
  Calendar: (props: any) => <div data-testid="calendar-icon" {...props}>Calendar</div>,
  Package: (props: any) => <div data-testid="package-icon" {...props}>Package</div>,
  CheckCircle: (props: any) => <div data-testid="check-circle-icon" {...props}>CheckCircle</div>,
  XCircle: (props: any) => <div data-testid="x-circle-icon" {...props}>XCircle</div>,
  Building: (props: any) => <div data-testid="building-icon" {...props}>Building</div>,
  User: (props: any) => <div data-testid="user-icon" {...props}>User</div>,
  Tag: (props: any) => <div data-testid="tag-icon" {...props}>Tag</div>,
  FileText: (props: any) => <div data-testid="file-text-icon" {...props}>FileText</div>,
  Filter: (props: any) => <div data-testid="filter-icon" {...props}>Filter</div>,
  Search: (props: any) => <div data-testid="search-icon" {...props}>Search</div>,
  Download: (props: any) => <div data-testid="download-icon" {...props}>Download</div>,
  Eye: (props: any) => <div data-testid="eye-icon" {...props}>Eye</div>,
  TrendingUp: (props: any) => <div data-testid="trending-up-icon" {...props}>TrendingUp</div>,
  Clock: (props: any) => <div data-testid="clock-icon" {...props}>Clock</div>,
  Layers: (props: any) => <div data-testid="layers-icon" {...props}>Layers</div>,
  BarChart3: (props: any) => <div data-testid="bar-chart-icon" {...props}>BarChart3</div>,
  RefreshCw: (props: any) => <div data-testid="refresh-icon" {...props}>RefreshCw</div>,
  Zap: (props: any) => <div data-testid="zap-icon" {...props}>Zap</div>,
}))

describe('ReleaseTable', () => {
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
      description: 'Hotfix release',
      version: '1.0.2',
      applicationName: 'NRE',
      releaseDate: new Date('2024-04-15'),
      type: ReleaseType.HOTFIX,
      status: 'stable',
      isPublished: true,
      workItems: [],
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date('2024-04-01'),
      createdBy: 'user-1'
    }
  ]

  describe('Component Rendering', () => {
    it('should render table headers correctly', () => {
      render(<ReleaseTable releases={mockReleases} />)

      expect(screen.getByText('Release')).toBeInTheDocument()
      expect(screen.getByText('Application')).toBeInTheDocument()
      expect(screen.getByText('Version')).toBeInTheDocument()
      expect(screen.getByText('Release Date')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should render filter controls', () => {
      render(<ReleaseTable releases={mockReleases} />)

      expect(screen.getByDisplayValue('All Applications')).toBeInTheDocument()
      expect(screen.getByDisplayValue('All Types')).toBeInTheDocument()
      expect(screen.getByDisplayValue('All Status')).toBeInTheDocument()
    })

    it('should render all releases in the table', () => {
      render(<ReleaseTable releases={mockReleases} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.1.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.1 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.2 Release')).toBeInTheDocument()
    })

    it('should display release count', () => {
      render(<ReleaseTable releases={mockReleases} />)

      expect(screen.getByText('4')).toBeInTheDocument() // In the stats section
    })
  })

  describe('Sorting Functionality', () => {
    it('should sort by release date in descending order by default', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const rows = screen.getAllByRole('row')
      // Skip header row, check data rows
      expect(rows[1]).toHaveTextContent('Version 1.0.2 Release') // Most recent
      expect(rows[2]).toHaveTextContent('Version 1.0.1 Release')
      expect(rows[3]).toHaveTextContent('Version 1.1.0 Release')
      expect(rows[4]).toHaveTextContent('Version 1.0.0 Release') // Oldest
    })

    it('should change sort direction when clicking same column header', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const releaseDateHeader = screen.getByText('Release Date')
      
      // Click to change from desc to asc
      await user.click(releaseDateHeader)

      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Version 1.0.0 Release') // Oldest first
      expect(rows[4]).toHaveTextContent('Version 1.0.2 Release') // Most recent last
    })

    it('should sort by title when clicking title header', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const titleHeader = screen.getByText('Release')
      await user.click(titleHeader)

      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Version 1.0.0 Release') // Alphabetically first
    })

    it('should sort by application when clicking application header', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const applicationHeader = screen.getByText('Application')
      await user.click(applicationHeader)

      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('E-Vite') // Alphabetically first application
    })

    it('should sort by version when clicking version header', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const versionHeader = screen.getByText('Version')
      await user.click(versionHeader)

      // Should sort versions as strings
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('1.0.0')
    })

    it('should sort by type when clicking type header', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const typeHeader = screen.getByText('Type')
      await user.click(typeHeader)

      // Should sort types alphabetically
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Hotfix') // Alphabetically first
    })

    it('should display correct sort icons', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      // By default, Release Date should be sorted desc
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()

      // Click to change to asc
      const releaseDateHeader = screen.getByText('Release Date')
      await user.click(releaseDateHeader)

      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument()
    })
  })

  describe('Filtering Functionality', () => {
    it('should filter by application', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const applicationFilter = screen.getByDisplayValue('All Applications')
      await user.selectOptions(applicationFilter, 'NRE')

      // Should only show NRE releases
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.2 Release')).toBeInTheDocument()
      expect(screen.queryByText('Version 1.1.0 Release')).not.toBeInTheDocument()
      expect(screen.queryByText('Version 1.0.1 Release')).not.toBeInTheDocument()

      // Check filtered count in stats
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should filter by type', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const typeFilter = screen.getByDisplayValue('All Types')
      await user.selectOptions(typeFilter, ReleaseType.MAJOR)

      // Should only show major releases
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.queryByText('Version 1.1.0 Release')).not.toBeInTheDocument()
      expect(screen.queryByText('Version 1.0.1 Release')).not.toBeInTheDocument()
      expect(screen.queryByText('Version 1.0.2 Release')).not.toBeInTheDocument()

      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should filter by published status', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const publishedFilter = screen.getByDisplayValue('All Status')
      await user.selectOptions(publishedFilter, 'published')

      // Should only show published releases
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.2 Release')).toBeInTheDocument()
      expect(screen.queryByText('Version 1.1.0 Release')).not.toBeInTheDocument()
      expect(screen.queryByText('Version 1.0.1 Release')).not.toBeInTheDocument()

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should filter by unpublished status', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const publishedFilter = screen.getByDisplayValue('All Status')
      await user.selectOptions(publishedFilter, 'unpublished')

      // Should only show unpublished releases
      expect(screen.getByText('Version 1.1.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.1 Release')).toBeInTheDocument()
      expect(screen.queryByText('Version 1.0.0 Release')).not.toBeInTheDocument()
      expect(screen.queryByText('Version 1.0.2 Release')).not.toBeInTheDocument()

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should apply multiple filters simultaneously', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      const applicationFilter = screen.getByDisplayValue('All Applications')
      const publishedFilter = screen.getByDisplayValue('All Status')

      await user.selectOptions(applicationFilter, 'NRE')
      await user.selectOptions(publishedFilter, 'published')

      // Should only show published NRE releases
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.2 Release')).toBeInTheDocument()
      expect(screen.queryByText('Version 1.1.0 Release')).not.toBeInTheDocument()
      expect(screen.queryByText('Version 1.0.1 Release')).not.toBeInTheDocument()

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should reset filters when "All" is selected', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      // Apply filter first
      const applicationFilter = screen.getByDisplayValue('All Applications')
      await user.selectOptions(applicationFilter, 'NRE')
      expect(screen.getByText('2')).toBeInTheDocument()

      // Reset filter
      await user.selectOptions(applicationFilter, '')
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })

  describe('Application Colors', () => {
    it('should apply correct colors for known applications', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const nreElement = screen.getAllByText('NRE')[0]
      const nveElement = screen.getByText('NVE')
      const eviteElement = screen.getByText('E-Vite')

      expect(nreElement).toHaveClass('bg-blue-100', 'text-blue-800')
      expect(nveElement).toHaveClass('bg-green-100', 'text-green-800')
      expect(eviteElement).toHaveClass('bg-purple-100', 'text-purple-800')
    })

    it('should apply default colors for unknown applications', () => {
      const unknownAppReleases = [
        {
          ...mockReleases[0],
          applicationName: 'Unknown App'
        }
      ]

      render(<ReleaseTable releases={unknownAppReleases} />)

      const unknownElement = screen.getByText('Unknown App')
      expect(unknownElement).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Release Type Colors', () => {
    it('should apply correct colors for each release type', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const majorElement = screen.getByText('Major')
      const minorElement = screen.getByText('Minor')
      const patchElement = screen.getByText('Patch')
      const hotfixElement = screen.getByText('Hotfix')

      expect(majorElement).toHaveClass('bg-red-100', 'text-red-800')
      expect(minorElement).toHaveClass('bg-yellow-100', 'text-yellow-800')
      expect(patchElement).toHaveClass('bg-green-100', 'text-green-800')
      expect(hotfixElement).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('should handle unknown release types', () => {
      const unknownTypeReleases = [
        {
          ...mockReleases[0],
          type: 'unknown' as any
        }
      ]

      render(<ReleaseTable releases={unknownTypeReleases} />)

      const unknownTypeElement = screen.getByText('unknown')
      expect(unknownTypeElement).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Published Status Display', () => {
    it('should display correct published status indicators', () => {
      render(<ReleaseTable releases={mockReleases} />)

      // Check for published status
      const publishedElements = screen.getAllByText('Published')
      expect(publishedElements).toHaveLength(2) // 2 published releases

      // Check for draft status
      const draftElements = screen.getAllByText('Draft')
      expect(draftElements).toHaveLength(2) // 2 unpublished releases
    })

    it('should apply correct colors for published status', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const publishedElement = screen.getAllByText('Published')[0]
      const draftElement = screen.getAllByText('Draft')[0]

      expect(publishedElement).toHaveClass('bg-green-100', 'text-green-800')
      expect(draftElement).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(<ReleaseTable releases={mockReleases} />)

      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Feb 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Apr 15, 2024')).toBeInTheDocument()
    })

    it('should handle invalid dates gracefully', () => {
      const invalidDateReleases = [
        {
          ...mockReleases[0],
          releaseDate: new Date('invalid-date')
        }
      ]

      render(<ReleaseTable releases={invalidDateReleases} />)

      // Should render without crashing
      expect(screen.getByText('Release Title')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty releases array', () => {
      render(<ReleaseTable releases={[]} />)

      expect(screen.getByText('0')).toBeInTheDocument() // In stats section
      expect(screen.getByText('No releases yet')).toBeInTheDocument()
    })

    it('should handle single release', () => {
      const singleRelease = [mockReleases[0]]

      render(<ReleaseTable releases={singleRelease} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle releases without versions', () => {
      const noVersionReleases = [
        {
          ...mockReleases[0],
          version: undefined
        }
      ]

      render(<ReleaseTable releases={noVersionReleases} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      // Should show empty cell or fallback for version
    })

    it('should handle releases without descriptions', () => {
      const noDescReleases = [
        {
          ...mockReleases[0],
          description: ''
        }
      ]

      render(<ReleaseTable releases={noDescReleases} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle very long release titles', () => {
      const longTitleReleases = [
        {
          ...mockReleases[0],
          title: 'This is a very long release title that might cause layout issues if not handled properly'
        }
      ]

      render(<ReleaseTable releases={longTitleReleases} />)

      expect(screen.getByText(/This is a very long release title/)).toBeInTheDocument()
    })
  })

  describe('Filter Options Generation', () => {
    it('should generate application filter options from available releases', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const applicationFilter = screen.getByLabelText(/Application/)
      
      expect(applicationFilter).toHaveTextContent('All Applications')
      expect(applicationFilter).toHaveTextContent('E-Vite')
      expect(applicationFilter).toHaveTextContent('NRE')
      expect(applicationFilter).toHaveTextContent('NVE')
    })

    it('should sort application options alphabetically', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const applicationFilter = screen.getByLabelText(/Application/)
      const options = Array.from(applicationFilter.querySelectorAll('option'))
        .map(option => option.textContent)
        .filter(text => text !== 'All Applications')

      expect(options).toEqual(['E-Vite', 'NRE', 'NVE'])
    })

    it('should include all release types in type filter', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const typeFilter = screen.getByLabelText(/Type/)
      
      expect(typeFilter).toHaveTextContent('All Types')
      expect(typeFilter).toHaveTextContent('Major')
      expect(typeFilter).toHaveTextContent('Minor')
      expect(typeFilter).toHaveTextContent('Patch')
      expect(typeFilter).toHaveTextContent('Hotfix')
    })
  })

  describe('Table Layout and Styling', () => {
    it('should have fixed table layout for consistent column widths', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const table = screen.getByRole('table')
      expect(table).toHaveClass('table-fixed')
    })

    it('should have proper table structure', () => {
      render(<ReleaseTable releases={mockReleases} />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(6)
      expect(screen.getAllByRole('row')).toHaveLength(5) // 1 header + 4 data rows
    })

    it('should apply hover effects to table rows', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const dataRows = screen.getAllByRole('row').slice(1) // Skip header
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-gray-50')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper table accessibility attributes', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(6)

      const rowHeaders = screen.getAllByRole('row')
      expect(rowHeaders).toHaveLength(5) // 1 header + 4 data rows
    })

    it('should have proper form labels for filters', () => {
      render(<ReleaseTable releases={mockReleases} />)

      expect(screen.getByText('Application')).toBeInTheDocument()
      expect(screen.getByText('Release Type')).toBeInTheDocument()
      expect(screen.getByText('Publication Status')).toBeInTheDocument()
    })

    it('should have clickable column headers for sorting', () => {
      render(<ReleaseTable releases={mockReleases} />)

      const headers = screen.getAllByRole('columnheader')
      expect(headers).toHaveLength(6)
      
      // Check that headers are clickable by looking for the text content
      expect(screen.getByText('Release')).toBeInTheDocument()
      expect(screen.getByText('Application')).toBeInTheDocument()
      expect(screen.getByText('Version')).toBeInTheDocument()
      expect(screen.getByText('Release Date')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })

  describe('Performance with Large Datasets', () => {
    it('should handle large number of releases efficiently', () => {
      const largeDataset = Array.from({ length: 500 }, (_, index) => ({
        ...mockReleases[0],
        _id: `release-${index}`,
        title: `Release ${index}`,
        applicationName: `App-${index % 10}`,
        type: [ReleaseType.MAJOR, ReleaseType.MINOR, ReleaseType.PATCH, ReleaseType.HOTFIX][index % 4],
        isPublished: index % 2 === 0,
        releaseDate: new Date(2024, index % 12, 1)
      }))

      render(<ReleaseTable releases={largeDataset} />)

      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('Release 0')).toBeInTheDocument()
    })

    it('should maintain sorting performance with large datasets', async () => {
      const user = userEvent.setup()
      const largeDataset = Array.from({ length: 100 }, (_, index) => ({
        ...mockReleases[0],
        _id: `release-${index}`,
        title: `Release ${String(index).padStart(3, '0')}`,
        releaseDate: new Date(2024, 0, index + 1)
      }))

      render(<ReleaseTable releases={largeDataset} />)

      const titleHeader = screen.getByText('Release')
      await user.click(titleHeader)

      // Should sort without performance issues
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Release 000')
    })

    it('should maintain filtering performance with large datasets', async () => {
      const user = userEvent.setup()
      const largeDataset = Array.from({ length: 100 }, (_, index) => ({
        ...mockReleases[0],
        _id: `release-${index}`,
        applicationName: index < 50 ? 'TestApp' : 'OtherApp'
      }))

      render(<ReleaseTable releases={largeDataset} />)

      const applicationFilter = screen.getByDisplayValue('All Applications')
      await user.selectOptions(applicationFilter, 'TestApp')

      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  describe('Sorting Combinations', () => {
    it('should maintain filter state when sorting', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      // Apply filter first
      const applicationFilter = screen.getByDisplayValue('All Applications')
      await user.selectOptions(applicationFilter, 'NRE')
      expect(screen.getByText('2')).toBeInTheDocument()

      // Then sort
      const titleHeader = screen.getByText('Release')
      await user.click(titleHeader)

      // Filter should still be applied
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.2 Release')).toBeInTheDocument()
    })

    it('should maintain sort state when filtering', async () => {
      const user = userEvent.setup()
      render(<ReleaseTable releases={mockReleases} />)

      // Sort first (ascending by title)
      const titleHeader = screen.getByText('Release')
      await user.click(titleHeader)

      // Then filter
      const typeFilter = screen.getByDisplayValue('All Types')
      await user.selectOptions(typeFilter, ReleaseType.MAJOR)

      // Should maintain ascending sort order
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })
  })
})
