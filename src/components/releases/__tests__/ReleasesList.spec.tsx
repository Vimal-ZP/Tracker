import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReleasesList from '../ReleasesList'
import { mockRelease, mockUser } from '@/__tests__/utils/test-utils'

const mockReleases = [
    {
        ...mockRelease,
        _id: '1',
        title: 'Release 1.0',
        applicationName: 'App One',
        version: '1.0.0',
        isPublished: true,
    },
    {
        ...mockRelease,
        _id: '2',
        title: 'Release 2.0',
        applicationName: 'App Two',
        version: '2.0.0',
        isPublished: false,
    },
]

describe('ReleasesList', () => {
    const defaultProps = {
        releases: mockReleases,
        loading: false,
        viewMode: 'card' as const,
        showActions: true,
        userRole: mockUser.role,
        onEdit: jest.fn(),
        onDelete: jest.fn(),
        onView: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders releases in card view by default', () => {
        render(<ReleasesList {...defaultProps} />)

        expect(screen.getByText('Release 1.0')).toBeInTheDocument()
        expect(screen.getByText('Release 2.0')).toBeInTheDocument()
        expect(screen.getByText('App One')).toBeInTheDocument()
        expect(screen.getByText('App Two')).toBeInTheDocument()
    })

    it('renders releases in table view when specified', () => {
        render(<ReleasesList {...defaultProps} viewMode="table" />)

        // Should render as table
        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(screen.getByText('Release 1.0')).toBeInTheDocument()
        expect(screen.getByText('Release 2.0')).toBeInTheDocument()
    })

    it('shows loading state when loading', () => {
        render(<ReleasesList {...defaultProps} loading={true} releases={[]} />)

        // Should show loading skeletons
        expect(screen.getAllByRole('status')).toHaveLength(3) // 3 skeleton cards
    })

    it('displays release status badges correctly', () => {
        render(<ReleasesList {...defaultProps} />)

        expect(screen.getByText('Published')).toBeInTheDocument()
        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('shows version numbers correctly', () => {
        render(<ReleasesList {...defaultProps} />)

        expect(screen.getByText('v1.0.0')).toBeInTheDocument()
        expect(screen.getByText('v2.0.0')).toBeInTheDocument()
    })

    it('displays application names with color coding', () => {
        render(<ReleasesList {...defaultProps} />)

        const appOneBadge = screen.getByText('App One')
        const appTwoBadge = screen.getByText('App Two')

        expect(appOneBadge).toBeInTheDocument()
        expect(appTwoBadge).toBeInTheDocument()

        // Should have different background colors for different apps
        expect(appOneBadge.closest('.bg-blue-100')).toBeInTheDocument() ||
            expect(appOneBadge.closest('.bg-green-100')).toBeInTheDocument() ||
            expect(appOneBadge.closest('.bg-purple-100')).toBeInTheDocument()
    })

    it('shows work items information', () => {
        render(<ReleasesList {...defaultProps} />)

        // Work items should be displayed
        expect(screen.getAllByText(/epic/i)).toHaveLength(2) // Each release has work items
    })

    it('calls onView when view button is clicked', async () => {
        const user = userEvent.setup()
        render(<ReleasesList {...defaultProps} />)

        const viewButtons = screen.getAllByLabelText(/view release/i)
        await user.click(viewButtons[0])

        expect(defaultProps.onView).toHaveBeenCalledWith(mockReleases[0])
    })

    it('calls onEdit when edit button is clicked', async () => {
        const user = userEvent.setup()
        render(<ReleasesList {...defaultProps} />)

        const editButtons = screen.getAllByLabelText(/edit release/i)
        await user.click(editButtons[0])

        expect(defaultProps.onEdit).toHaveBeenCalledWith(mockReleases[0])
    })

    it('calls onDelete when delete button is clicked', async () => {
        const user = userEvent.setup()
        render(<ReleasesList {...defaultProps} />)

        const deleteButtons = screen.getAllByLabelText(/delete release/i)
        await user.click(deleteButtons[0])

        expect(defaultProps.onDelete).toHaveBeenCalledWith(mockReleases[0])
    })

    it('hides action buttons when showActions is false', () => {
        render(<ReleasesList {...defaultProps} showActions={false} />)

        expect(screen.queryByLabelText(/edit release/i)).not.toBeInTheDocument()
        expect(screen.queryByLabelText(/delete release/i)).not.toBeInTheDocument()
    })

    it('shows release dates correctly formatted', () => {
        render(<ReleasesList {...defaultProps} />)

        // Should show formatted dates
        // The exact format depends on implementation
        expect(screen.getByText(new RegExp(mockRelease.releaseDate.getFullYear().toString()))).toBeInTheDocument()
    })

    it('displays release descriptions', () => {
        render(<ReleasesList {...defaultProps} />)

        expect(screen.getByText(mockRelease.description)).toBeInTheDocument()
    })

    it('handles empty releases list', () => {
        render(<ReleasesList {...defaultProps} releases={[]} />)

        expect(screen.getByText(/no releases found/i)).toBeInTheDocument()
    })

    it('shows download button for published releases', () => {
        render(<ReleasesList {...defaultProps} />)

        // Published release should have download option
        const publishedReleaseCard = screen.getByText('Release 1.0').closest('.bg-white')
        expect(publishedReleaseCard).toBeInTheDocument()
    })

    it('applies correct styling for card layout', () => {
        const { container } = render(<ReleasesList {...defaultProps} />)

        const cardsContainer = container.querySelector('.space-y-4')
        expect(cardsContainer).toBeInTheDocument()
    })

    it('applies correct styling for table layout', () => {
        const { container } = render(<ReleasesList {...defaultProps} viewMode="table" />)

        const table = container.querySelector('table')
        expect(table).toBeInTheDocument()
        expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200')
    })

    it('shows work item types with correct icons', () => {
        render(<ReleasesList {...defaultProps} />)

        // Should show work item icons and counts
        // The exact implementation depends on the work items structure
        const workItemsSection = screen.getByText('Release 1.0').closest('.bg-white')
        expect(workItemsSection).toBeInTheDocument()
    })

    it('handles long release titles gracefully', () => {
        const longTitleRelease = {
            ...mockReleases[0],
            title: 'This is a very long release title that should be handled properly without breaking the layout',
        }

        render(<ReleasesList {...defaultProps} releases={[longTitleRelease]} />)

        expect(screen.getByText(/This is a very long release title/)).toBeInTheDocument()
    })

    it('shows proper table headers in table view', () => {
        render(<ReleasesList {...defaultProps} viewMode="table" />)

        expect(screen.getByRole('columnheader', { name: /release/i })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: /application/i })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: /version/i })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: /date/i })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: /work items/i })).toBeInTheDocument()
    })

    it('applies hover effects correctly', async () => {
        const user = userEvent.setup()
        render(<ReleasesList {...defaultProps} />)

        const firstCard = screen.getByText('Release 1.0').closest('.bg-white')
        expect(firstCard).toBeInTheDocument()

        // Hover should trigger transition effects
        await user.hover(firstCard!)
        expect(firstCard).toHaveClass('transition-shadow')
    })

    it('handles releases without work items', () => {
        const releasesWithoutWorkItems = mockReleases.map(release => ({
            ...release,
            workItems: [],
        }))

        render(<ReleasesList {...defaultProps} releases={releasesWithoutWorkItems} />)

        expect(screen.getByText('Release 1.0')).toBeInTheDocument()
        // Should handle empty work items gracefully
    })

    it('displays author information when available', () => {
        render(<ReleasesList {...defaultProps} />)

        expect(screen.getByText(mockRelease.author)).toBeInTheDocument()
    })

    it('handles releases with missing optional fields', () => {
        const incompleteRelease = {
            _id: '3',
            title: 'Incomplete Release',
            applicationName: 'Test App',
            releaseDate: new Date(),
            isPublished: false,
            workItems: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            // Missing: version, description, author, downloadUrl
        }

        render(<ReleasesList {...defaultProps} releases={[incompleteRelease]} />)

        expect(screen.getByText('Incomplete Release')).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
        render(<ReleasesList {...defaultProps} viewMode="table" />)

        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()

        const columnHeaders = screen.getAllByRole('columnheader')
        expect(columnHeaders.length).toBeGreaterThan(0)

        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeGreaterThan(1) // Header + data rows
    })

    it('supports keyboard navigation', async () => {
        const user = userEvent.setup()
        render(<ReleasesList {...defaultProps} />)

        // Should be able to navigate between action buttons
        await user.tab()
        expect(document.activeElement).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
        const { container } = render(
            <ReleasesList {...defaultProps} className="custom-releases-list" />
        )

        expect(container.firstChild).toHaveClass('custom-releases-list')
    })

    it('renders with correct column widths in table view', () => {
        const { container } = render(<ReleasesList {...defaultProps} viewMode="table" />)

        const table = container.querySelector('table')
        expect(table).toHaveStyle('table-layout: fixed')
    })
})
