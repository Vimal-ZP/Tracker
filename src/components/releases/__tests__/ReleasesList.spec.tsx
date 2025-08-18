import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReleasesList from '../ReleasesList'
import { Release, ReleaseType, WorkItemType } from '@/types/release'
import { UserRole } from '@/types/user'

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
  Eye: (props: any) => <div data-testid="eye-icon" {...props}>Eye</div>,
  Edit: (props: any) => <div data-testid="edit-icon" {...props}>Edit</div>,
  Trash2: (props: any) => <div data-testid="trash-icon" {...props}>Trash</div>,
  Tag: (props: any) => <div data-testid="tag-icon" {...props}>Tag</div>,
  Clock: (props: any) => <div data-testid="clock-icon" {...props}>Clock</div>,
  CheckCircle: (props: any) => <div data-testid="check-circle-icon" {...props}>CheckCircle</div>,
  AlertCircle: (props: any) => <div data-testid="alert-circle-icon" {...props}>AlertCircle</div>,
  XCircle: (props: any) => <div data-testid="x-circle-icon" {...props}>XCircle</div>,
  Package: (props: any) => <div data-testid="package-icon" {...props}>Package</div>,
  User: (props: any) => <div data-testid="user-icon" {...props}>User</div>,
  MoreVertical: (props: any) => <div data-testid="more-vertical-icon" {...props}>MoreVertical</div>,
  Layers: (props: any) => <div data-testid="layers-icon" {...props}>Layers</div>,
  Zap: (props: any) => <div data-testid="zap-icon" {...props}>Zap</div>,
  FileText: (props: any) => <div data-testid="file-text-icon" {...props}>FileText</div>,
  Bug: (props: any) => <div data-testid="bug-icon" {...props}>Bug</div>,
  Building: (props: any) => <div data-testid="building-icon" {...props}>Building</div>,
  AlertTriangle: (props: any) => <div data-testid="alert-triangle-icon" {...props}>AlertTriangle</div>,
}))

describe('ReleasesList', () => {
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()
  const mockOnView = jest.fn()

  const mockWorkItems = [
    {
      _id: 'work-1',
      type: WorkItemType.EPIC,
      id: 'EPIC-001',
      title: 'Test Epic',
      flagName: 'epic-flag',
      remarks: 'Epic remarks',
      hyperlink: 'http://example.com/epic',
      parentId: '',
      children: []
    },
    {
      _id: 'work-2',
      type: WorkItemType.FEATURE,
      id: 'FEAT-001',
      title: 'Test Feature',
      flagName: 'feature-flag',
      remarks: 'Feature remarks',
      hyperlink: 'http://example.com/feature',
      parentId: 'work-1',
      children: []
    },
    {
      _id: 'work-3',
      type: WorkItemType.BUG,
      id: 'BUG-001',
      title: 'Test Bug',
      flagName: 'bug-flag',
      remarks: 'Bug remarks',
      hyperlink: 'http://example.com/bug',
      parentId: '',
      children: []
    }
  ]

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
      workItems: mockWorkItems,
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
      workItems: [mockWorkItems[0]],
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
    viewMode: 'card' as const,
    showActions: true,
    userRole: UserRole.ADMIN,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onView: mockOnView,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should render loading skeletons when loading is true', () => {
      render(<ReleasesList {...defaultProps} loading={true} />)

      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3)
      expect(screen.queryByText('Version 1.0.0 Release')).not.toBeInTheDocument()
    })

    it('should render different loading skeletons for different view modes', () => {
      const { rerender } = render(<ReleasesList {...defaultProps} loading={true} viewMode="card" />)
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3)

      rerender(<ReleasesList {...defaultProps} loading={true} viewMode="table" />)
      expect(screen.getByTestId('table-loading-skeleton')).toBeInTheDocument()

      rerender(<ReleasesList {...defaultProps} loading={true} viewMode="compact" />)
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3)
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no releases', () => {
      render(<ReleasesList {...defaultProps} releases={[]} />)

      expect(screen.getByTestId('package-icon')).toBeInTheDocument()
      expect(screen.getByText('No releases found')).toBeInTheDocument()
      expect(screen.getByText('Create your first release to get started')).toBeInTheDocument()
    })

    it('should render filtered empty state', () => {
      render(<ReleasesList {...defaultProps} releases={[]} />)

      expect(screen.getByText('No releases found')).toBeInTheDocument()
    })
  })

  describe('Card View Mode', () => {
    beforeEach(() => {
      render(<ReleasesList {...defaultProps} viewMode="card" />)
    })

    it('should render all releases in card format', () => {
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.1.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.1 Release')).toBeInTheDocument()
    })

    it('should display release descriptions', () => {
      expect(screen.getByText('Major release with new features')).toBeInTheDocument()
      expect(screen.getByText('Minor release with improvements')).toBeInTheDocument()
      expect(screen.getByText('Patch release with bug fixes')).toBeInTheDocument()
    })

    it('should display application names with proper colors', () => {
      const nreApp = screen.getByText('NRE')
      const nveApp = screen.getByText('NVE')
      const eviteApp = screen.getByText('E-Vite')

      expect(nreApp).toHaveClass('text-blue-800', 'bg-blue-100')
      expect(nveApp).toHaveClass('text-green-800', 'bg-green-100')
      expect(eviteApp).toHaveClass('text-purple-800', 'bg-purple-100')
    })

    it('should display version badges', () => {
      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      expect(screen.getByText('v1.1.0')).toBeInTheDocument()
      expect(screen.getByText('v1.0.1')).toBeInTheDocument()
    })

    it('should display release dates', () => {
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Feb 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument()
    })

    it('should display status badges with correct styling', () => {
      const stableStatus = screen.getByText('Published')
      const betaStatus = screen.getByText('Beta')
      const draftStatus = screen.getByText('Draft')

      expect(stableStatus).toHaveClass('bg-green-100', 'text-green-800')
      expect(betaStatus).toHaveClass('bg-yellow-100', 'text-yellow-800')
      expect(draftStatus).toHaveClass('bg-gray-100', 'text-gray-800')
    })

    it('should display release type badges with gradient colors', () => {
      const majorType = screen.getByText('MAJOR')
      const minorType = screen.getByText('MINOR')
      const patchType = screen.getByText('PATCH')

      expect(majorType).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-pink-600')
      expect(minorType).toHaveClass('bg-gradient-to-r', 'from-blue-500', 'to-indigo-600')
      expect(patchType).toHaveClass('bg-gradient-to-r', 'from-green-500', 'to-emerald-600')
    })

    it('should display work item counts', () => {
      // First release has 3 work items: 1 epic, 1 feature, 1 bug
      expect(screen.getByText('1')).toBeInTheDocument() // Epic count
      expect(screen.getByText('1')).toBeInTheDocument() // Feature count
      expect(screen.getByText('1')).toBeInTheDocument() // Bug count
    })

    it('should display work item icons', () => {
      expect(screen.getAllByTestId('layers-icon')).toHaveLength(2) // Epic icons
      expect(screen.getAllByTestId('zap-icon')).toHaveLength(2) // Feature icons
      expect(screen.getAllByTestId('bug-icon')).toHaveLength(2) // Bug icons
      expect(screen.getAllByTestId('file-text-icon')).toHaveLength(2) // User story icons
      expect(screen.getAllByTestId('alert-triangle-icon')).toHaveLength(2) // Incident icons
    })
  })

  describe('Table View Mode', () => {
    beforeEach(() => {
      render(<ReleasesList {...defaultProps} viewMode="table" />)
    })

    it('should render table headers', () => {
      expect(screen.getByText('Release')).toBeInTheDocument()
      expect(screen.getByText('Application')).toBeInTheDocument()
      expect(screen.getByText('Release Date')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Work Items')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('should render table rows with release data', () => {
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Major release with new features')).toBeInTheDocument()
    })

    it('should render application names in table cells', () => {
      expect(screen.getByText('NRE')).toBeInTheDocument()
      expect(screen.getByText('NVE')).toBeInTheDocument()
      expect(screen.getByText('E-Vite')).toBeInTheDocument()
    })

    it('should render action buttons in table', () => {
      expect(screen.getAllByTestId('eye-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('edit-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(3)
    })
  })

  describe('Compact View Mode', () => {
    beforeEach(() => {
      render(<ReleasesList {...defaultProps} viewMode="compact" />)
    })

    it('should render releases in compact format', () => {
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.1.0 Release')).toBeInTheDocument()
      expect(screen.getByText('Version 1.0.1 Release')).toBeInTheDocument()
    })

    it('should not display descriptions in compact mode', () => {
      expect(screen.queryByText('Major release with new features')).not.toBeInTheDocument()
    })

    it('should display essential information only', () => {
      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Published')).toBeInTheDocument()
    })
  })

  describe('Action Handlers', () => {
    beforeEach(() => {
      render(<ReleasesList {...defaultProps} viewMode="card" />)
    })

    it('should call onView when view button is clicked', async () => {
      const user = userEvent.setup()
      const viewButtons = screen.getAllByTestId('eye-icon')

      await user.click(viewButtons[0])

      expect(mockOnView).toHaveBeenCalledWith(mockReleases[0])
    })

    it('should call onEdit when edit button is clicked', async () => {
      const user = userEvent.setup()
      const editButtons = screen.getAllByTestId('edit-icon')

      await user.click(editButtons[0])

      expect(mockOnEdit).toHaveBeenCalledWith(mockReleases[0])
    })

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup()
      const deleteButtons = screen.getAllByTestId('trash-icon')

      await user.click(deleteButtons[0])

      expect(mockOnDelete).toHaveBeenCalledWith('release-1')
    })

    it('should not show actions when showActions is false', () => {
      render(<ReleasesList {...defaultProps} showActions={false} />)

      expect(screen.queryByTestId('eye-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument()
    })
  })

  describe('Role-based Permissions', () => {
    it('should show all actions for admin users', () => {
      render(<ReleasesList {...defaultProps} userRole={UserRole.ADMIN} />)

      expect(screen.getAllByTestId('eye-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('edit-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(3)
    })

    it('should show limited actions for basic users', () => {
      render(<ReleasesList {...defaultProps} userRole={UserRole.BASIC} />)

      expect(screen.getAllByTestId('eye-icon')).toHaveLength(3)
      expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument()
    })

    it('should show all actions for super admin users', () => {
      render(<ReleasesList {...defaultProps} userRole={UserRole.SUPER_ADMIN} />)

      expect(screen.getAllByTestId('eye-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('edit-icon')).toHaveLength(3)
      expect(screen.getAllByTestId('trash-icon')).toHaveLength(3)
    })
  })

  describe('Work Item Counting', () => {
    it('should count work items correctly', () => {
      render(<ReleasesList {...defaultProps} />)

      // First release has 1 epic, 1 feature, 1 bug
      const workItemsSection = screen.getAllByText('Work Items')[0]
      const parentElement = workItemsSection.closest('.space-y-1')
      
      expect(parentElement).toBeInTheDocument()
    })

    it('should handle releases with no work items', () => {
      const releasesWithoutWorkItems = [
        {
          ...mockReleases[0],
          workItems: []
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithoutWorkItems} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should display correct work item type icons', () => {
      render(<ReleasesList {...defaultProps} />)

      expect(screen.getAllByTestId('layers-icon')).toHaveLength(2) // Epic icons
      expect(screen.getAllByTestId('zap-icon')).toHaveLength(2) // Feature icons
      expect(screen.getAllByTestId('bug-icon')).toHaveLength(2) // Bug icons
    })
  })

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(<ReleasesList {...defaultProps} />)

      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Feb 15, 2024')).toBeInTheDocument()
      expect(screen.getByText('Mar 15, 2024')).toBeInTheDocument()
    })

    it('should handle invalid dates gracefully', () => {
      const releasesWithInvalidDate = [
        {
          ...mockReleases[0],
          releaseDate: new Date('invalid-date')
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithInvalidDate} />)

      // Should not crash, should render some date representation
      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })
  })

  describe('Release Links', () => {
    it('should render links to release detail pages in card view', () => {
      render(<ReleasesList {...defaultProps} viewMode="card" />)

      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/releases/release-1')
      expect(links[1]).toHaveAttribute('href', '/releases/release-2')
      expect(links[2]).toHaveAttribute('href', '/releases/release-3')
    })

    it('should render links to release detail pages in table view', () => {
      render(<ReleasesList {...defaultProps} viewMode="table" />)

      const releaseLinks = screen.getAllByText('Version 1.0.0 Release')
      expect(releaseLinks[0].closest('a')).toHaveAttribute('href', '/releases/release-1')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ReleasesList {...defaultProps} className="custom-class" />
      )

      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should apply default styling when no className provided', () => {
      const { container } = render(<ReleasesList {...defaultProps} />)

      expect(container.firstChild).toHaveClass('space-y-4')
    })
  })

  describe('Status Display', () => {
    it('should display correct status icons', () => {
      render(<ReleasesList {...defaultProps} />)

      expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(2) // Published status
      expect(screen.getAllByTestId('alert-circle-icon')).toHaveLength(2) // Beta status
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(2) // Draft status
    })

    it('should handle unknown status gracefully', () => {
      const releasesWithUnknownStatus = [
        {
          ...mockReleases[0],
          status: 'unknown' as any
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithUnknownStatus} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })
  })

  describe('Application Color Mapping', () => {
    it('should apply correct colors for known applications', () => {
      render(<ReleasesList {...defaultProps} />)

      const nreApp = screen.getByText('NRE')
      expect(nreApp).toHaveClass('bg-blue-100', 'text-blue-800')

      const nveApp = screen.getByText('NVE')
      expect(nveApp).toHaveClass('bg-green-100', 'text-green-800')

      const eviteApp = screen.getByText('E-Vite')
      expect(eviteApp).toHaveClass('bg-purple-100', 'text-purple-800')
    })

    it('should apply default colors for unknown applications', () => {
      const releasesWithUnknownApp = [
        {
          ...mockReleases[0],
          applicationName: 'Unknown App'
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithUnknownApp} />)

      const unknownApp = screen.getByText('Unknown App')
      expect(unknownApp).toHaveClass('bg-gray-100', 'text-gray-800')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for action buttons', () => {
      render(<ReleasesList {...defaultProps} />)

      const viewButtons = screen.getAllByLabelText(/View release/)
      const editButtons = screen.getAllByLabelText(/Edit release/)
      const deleteButtons = screen.getAllByLabelText(/Delete release/)

      expect(viewButtons).toHaveLength(3)
      expect(editButtons).toHaveLength(3)
      expect(deleteButtons).toHaveLength(3)
    })

    it('should have proper table structure in table view', () => {
      render(<ReleasesList {...defaultProps} viewMode="table" />)

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /Release/ })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /Application/ })).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      render(<ReleasesList {...defaultProps} />)

      const releaseHeadings = screen.getAllByRole('heading', { level: 3 })
      expect(releaseHeadings).toHaveLength(3)
    })
  })

  describe('Loading Skeleton Details', () => {
    it('should render correct number of loading skeletons for each view mode', () => {
      const { rerender } = render(<ReleasesList {...defaultProps} loading={true} viewMode="card" />)
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3)

      rerender(<ReleasesList {...defaultProps} loading={true} viewMode="compact" />)
      expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(3)

      rerender(<ReleasesList {...defaultProps} loading={true} viewMode="table" />)
      expect(screen.getByTestId('table-loading-skeleton')).toBeInTheDocument()
    })

    it('should have proper loading skeleton structure', () => {
      render(<ReleasesList {...defaultProps} loading={true} viewMode="card" />)
      
      const skeletons = screen.getAllByTestId('loading-skeleton')
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('animate-pulse')
      })
    })
  })

  describe('View Mode Specific Features', () => {
    it('should render table headers in correct order', () => {
      render(<ReleasesList {...defaultProps} viewMode="table" />)

      const headers = screen.getAllByRole('columnheader')
      expect(headers[0]).toHaveTextContent('Release')
      expect(headers[1]).toHaveTextContent('Application')
      expect(headers[2]).toHaveTextContent('Release Date')
      expect(headers[3]).toHaveTextContent('Status')
      expect(headers[4]).toHaveTextContent('Work Items')
      expect(headers[5]).toHaveTextContent('Actions')
    })

    it('should apply correct text alignment in table view', () => {
      render(<ReleasesList {...defaultProps} viewMode="table" />)

      const rows = screen.getAllByRole('row')
      const dataRow = rows[1] // Skip header row
      const cells = dataRow.querySelectorAll('td')

      expect(cells[0]).toHaveClass('text-left') // First column (Release)
      expect(cells[1]).toHaveClass('text-center') // Application
      expect(cells[2]).toHaveClass('text-center') // Release Date
      expect(cells[3]).toHaveClass('text-center') // Status
      expect(cells[4]).toHaveClass('text-center') // Work Items
      expect(cells[5]).toHaveClass('text-right') // Actions (last column)
    })

    it('should show compact view without descriptions', () => {
      render(<ReleasesList {...defaultProps} viewMode="compact" />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.queryByText('Major release with new features')).not.toBeInTheDocument()
    })
  })

  describe('Work Item Counting Edge Cases', () => {
    it('should handle work items with invalid types', () => {
      const releasesWithInvalidWorkItemType = [
        {
          ...mockReleases[0],
          workItems: [{
            ...mockWorkItems[0],
            type: 'invalid-type' as any
          }]
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithInvalidWorkItemType} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle work items without type property', () => {
      const releasesWithNoTypeWorkItems = [
        {
          ...mockReleases[0],
          workItems: [{
            ...mockWorkItems[0],
            type: undefined as any
          }]
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithNoTypeWorkItems} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })
  })

  describe('Application Color Edge Cases', () => {
    it('should handle unknown application names with default colors', () => {
      const releasesWithUnknownApp = [
        {
          ...mockReleases[0],
          applicationName: 'Unknown Application'
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithUnknownApp} />)

      const appElement = screen.getByText('Unknown Application')
      expect(appElement).toHaveClass('bg-gray-100', 'text-gray-800')
    })

    it('should handle all known application colors', () => {
      const knownApps = ['NRE', 'NVE', 'E-Vite', 'Portal Plus', 'Fast 2.0', 'FMS']
      const expectedColors = [
        ['bg-blue-100', 'text-blue-800'],
        ['bg-green-100', 'text-green-800'], 
        ['bg-purple-100', 'text-purple-800'],
        ['bg-orange-100', 'text-orange-800'],
        ['bg-pink-100', 'text-pink-800'],
        ['bg-indigo-100', 'text-indigo-800']
      ]

      knownApps.forEach((appName, index) => {
        const releaseWithApp = [{
          ...mockReleases[0],
          applicationName: appName
        }]

        const { unmount } = render(<ReleasesList {...defaultProps} releases={releaseWithApp} />)
        
        const appElement = screen.getByText(appName)
        expectedColors[index].forEach(colorClass => {
          expect(appElement).toHaveClass(colorClass)
        })

        unmount()
      })
    })
  })

  describe('Status Display Edge Cases', () => {
    it('should handle deprecated status', () => {
      const releasesWithDeprecatedStatus = [
        {
          ...mockReleases[0],
          status: 'deprecated' as any
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithDeprecatedStatus} />)

      expect(screen.getByText('Deprecated')).toBeInTheDocument()
      expect(screen.getByTestId('x-circle-icon')).toBeInTheDocument()
    })

    it('should handle all status types with correct icons', () => {
      const statusTypes = [
        { status: 'draft', icon: 'clock-icon', text: 'Draft' },
        { status: 'beta', icon: 'alert-circle-icon', text: 'Beta' },
        { status: 'stable', icon: 'check-circle-icon', text: 'Published' },
        { status: 'deprecated', icon: 'x-circle-icon', text: 'Deprecated' }
      ]

      statusTypes.forEach(({ status, icon, text }) => {
        const releaseWithStatus = [{
          ...mockReleases[0],
          status: status as any
        }]

        const { unmount } = render(<ReleasesList {...defaultProps} releases={releaseWithStatus} />)
        
        expect(screen.getByText(text)).toBeInTheDocument()
        expect(screen.getByTestId(icon)).toBeInTheDocument()

        unmount()
      })
    })
  })

  describe('Release Type Colors', () => {
    it('should display hotfix type with correct styling', () => {
      const releasesWithHotfix = [
        {
          ...mockReleases[0],
          type: 'hotfix' as any
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithHotfix} />)

      const hotfixType = screen.getByText('HOTFIX')
      expect(hotfixType).toHaveClass('bg-gradient-to-r', 'from-red-500', 'to-rose-600')
    })

    it('should handle unknown release types', () => {
      const releasesWithUnknownType = [
        {
          ...mockReleases[0],
          type: 'unknown' as any
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithUnknownType} />)

      const unknownType = screen.getByText('UNKNOWN')
      expect(unknownType).toHaveClass('bg-gradient-to-r', 'from-gray-500', 'to-gray-600')
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

      render(<ReleasesList {...defaultProps} releases={releasesWithoutVersion} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
      expect(screen.queryByText('v1.0.0')).not.toBeInTheDocument()
    })

    it('should handle releases without descriptions', () => {
      const releasesWithoutDescription = [
        {
          ...mockReleases[0],
          description: ''
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithoutDescription} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle empty work items array', () => {
      const releasesWithEmptyWorkItems = [
        {
          ...mockReleases[0],
          workItems: []
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithEmptyWorkItems} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle undefined work items', () => {
      const releasesWithUndefinedWorkItems = [
        {
          ...mockReleases[0],
          workItems: undefined as any
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithUndefinedWorkItems} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle releases with null/undefined dates', () => {
      const releasesWithNullDate = [
        {
          ...mockReleases[0],
          releaseDate: null as any
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithNullDate} />)

      expect(screen.getByText('Version 1.0.0 Release')).toBeInTheDocument()
    })

    it('should handle very long titles', () => {
      const releasesWithLongTitle = [
        {
          ...mockReleases[0],
          title: 'This is a very long release title that might cause layout issues if not handled properly by the UI components'
        }
      ]

      render(<ReleasesList {...defaultProps} releases={releasesWithLongTitle} />)

      expect(screen.getByText(/This is a very long release title/)).toBeInTheDocument()
    })
  })
})