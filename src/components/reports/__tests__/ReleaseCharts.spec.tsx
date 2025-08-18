import React from 'react'
import { render, screen } from '@testing-library/react'
import ReleaseCharts from '../ReleaseCharts'
import { Release, ReleaseType } from '@/types/release'

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options, ...props }: any) => (
    <div 
      data-testid="bar-chart" 
      data-chart-type="bar"
      data-labels={JSON.stringify(data.labels)}
      data-datasets={JSON.stringify(data.datasets)}
      data-options={JSON.stringify(options)}
      {...props}
    >
      Bar Chart: {data.labels?.join(', ')}
    </div>
  ),
  Pie: ({ data, options, ...props }: any) => (
    <div 
      data-testid="pie-chart" 
      data-chart-type="pie"
      data-labels={JSON.stringify(data.labels)}
      data-datasets={JSON.stringify(data.datasets)}
      data-options={JSON.stringify(options)}
      {...props}
    >
      Pie Chart: {data.labels?.join(', ')}
    </div>
  ),
  Line: ({ data, options, ...props }: any) => (
    <div 
      data-testid="line-chart" 
      data-chart-type="line"
      data-labels={JSON.stringify(data.labels)}
      data-datasets={JSON.stringify(data.datasets)}
      data-options={JSON.stringify(options)}
      {...props}
    >
      Line Chart: {data.labels?.join(', ')}
    </div>
  ),
}))

// Mock Chart.js registration
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  ArcElement: {},
  PointElement: {},
  LineElement: {},
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  BarChart3: (props: any) => <div data-testid="bar-chart-icon" {...props}>BarChart3</div>,
  Package: (props: any) => <div data-testid="package-icon" {...props}>Package</div>,
  TrendingUp: (props: any) => <div data-testid="trending-up-icon" {...props}>TrendingUp</div>,
  CheckCircle: (props: any) => <div data-testid="check-circle-icon" {...props}>CheckCircle</div>,
}))

describe('ReleaseCharts', () => {
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
      applicationName: 'NRE',
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
      applicationName: 'E-Vite',
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
    it('should render all chart sections', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      expect(screen.getByText('Release Analytics')).toBeInTheDocument()
      expect(screen.getByText('Releases by Application')).toBeInTheDocument()
      expect(screen.getByText('Releases by Type')).toBeInTheDocument()
      expect(screen.getByText('Release Timeline')).toBeInTheDocument()
    })

    it('should render all three chart types', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should render chart icons', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      expect(screen.getAllByTestId('bar-chart-icon')).toHaveLength(2) // Application and Timeline charts
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
    })
  })

  describe('Application Chart Data', () => {
    it('should group releases by application correctly', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const barChart = screen.getByTestId('bar-chart')
      const labels = JSON.parse(barChart.getAttribute('data-labels') || '[]')
      const datasets = JSON.parse(barChart.getAttribute('data-datasets') || '[]')

      expect(labels).toContain('NRE')
      expect(labels).toContain('NVE') 
      expect(labels).toContain('E-Vite')
      expect(datasets[0].label).toBe('Number of Releases')
      expect(datasets[0].data).toEqual([2, 1, 1]) // NRE: 2, NVE: 1, E-Vite: 1
    })

    it('should apply correct colors for application chart', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const barChart = screen.getByTestId('bar-chart')
      const datasets = JSON.parse(barChart.getAttribute('data-datasets') || '[]')

      expect(datasets[0].backgroundColor).toEqual([
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ])
    })

    it('should handle empty releases for application chart', () => {
      render(<ReleaseCharts releases={[]} />)

      const barChart = screen.getByTestId('bar-chart')
      const labels = JSON.parse(barChart.getAttribute('data-labels') || '[]')
      const datasets = JSON.parse(barChart.getAttribute('data-datasets') || '[]')

      expect(labels).toEqual([])
      expect(datasets[0].data).toEqual([])
    })
  })

  describe('Type Chart Data', () => {
    it('should group releases by type correctly', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const pieChart = screen.getByTestId('pie-chart')
      const labels = JSON.parse(pieChart.getAttribute('data-labels') || '[]')
      const datasets = JSON.parse(pieChart.getAttribute('data-datasets') || '[]')

      expect(labels).toContain('Major')
      expect(labels).toContain('Minor')
      expect(labels).toContain('Patch')
      expect(labels).toContain('Hotfix')
      expect(datasets[0].data).toEqual([1, 1, 1, 1]) // One of each type
    })

    it('should apply correct colors for type chart', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const pieChart = screen.getByTestId('pie-chart')
      const datasets = JSON.parse(pieChart.getAttribute('data-datasets') || '[]')

      expect(datasets[0].backgroundColor).toEqual([
        'rgba(239, 68, 68, 0.8)',   // Major - Red
        'rgba(245, 158, 11, 0.8)',  // Minor - Orange
        'rgba(16, 185, 129, 0.8)',  // Patch - Green
        'rgba(59, 130, 246, 0.8)',  // Hotfix - Blue
      ])
    })

    it('should map release types to readable labels', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const pieChart = screen.getByTestId('pie-chart')
      const labels = JSON.parse(pieChart.getAttribute('data-labels') || '[]')

      expect(labels).toEqual(['Major', 'Minor', 'Patch', 'Hotfix'])
    })

    it('should handle unknown release types', () => {
      const releasesWithUnknownType = [
        {
          ...mockReleases[0],
          type: 'unknown' as any
        }
      ]

      render(<ReleaseCharts releases={releasesWithUnknownType} />)

      const pieChart = screen.getByTestId('pie-chart')
      const labels = JSON.parse(pieChart.getAttribute('data-labels') || '[]')

      expect(labels).toContain('unknown')
    })
  })

  describe('Timeline Chart Data', () => {
    beforeEach(() => {
      // Mock current date to ensure consistent timeline generation
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-06-15'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should generate 6 months of timeline data', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const lineChart = screen.getByTestId('line-chart')
      const labels = JSON.parse(lineChart.getAttribute('data-labels') || '[]')
      const datasets = JSON.parse(lineChart.getAttribute('data-datasets') || '[]')

      expect(labels).toHaveLength(6)
      expect(labels[0]).toMatch(/Jan 2024/)
      expect(labels[5]).toMatch(/Jun 2024/)
      expect(datasets[0].label).toBe('Releases')
    })

    it('should correctly count releases per month', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const lineChart = screen.getByTestId('line-chart')
      const datasets = JSON.parse(lineChart.getAttribute('data-datasets') || '[]')

      // Based on mock dates: Jan(1), Feb(1), Mar(1), Apr(1), May(0), Jun(0)
      expect(datasets[0].data).toEqual([1, 1, 1, 1, 0, 0])
    })

    it('should apply correct styling for timeline chart', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const lineChart = screen.getByTestId('line-chart')
      const datasets = JSON.parse(lineChart.getAttribute('data-datasets') || '[]')

      expect(datasets[0].borderColor).toBe('rgba(59, 130, 246, 1)')
      expect(datasets[0].backgroundColor).toBe('rgba(59, 130, 246, 0.1)')
      expect(datasets[0].tension).toBe(0.1)
    })

    it('should handle releases outside the 6-month window', () => {
      const oldReleases = [
        {
          ...mockReleases[0],
          releaseDate: new Date('2020-01-15') // Very old release
        }
      ]

      render(<ReleaseCharts releases={oldReleases} />)

      const lineChart = screen.getByTestId('line-chart')
      const datasets = JSON.parse(lineChart.getAttribute('data-datasets') || '[]')

      // Should be all zeros since release is outside the window
      expect(datasets[0].data).toEqual([0, 0, 0, 0, 0, 0])
    })
  })

  describe('Chart Options', () => {
    it('should apply responsive chart options', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const barChart = screen.getByTestId('bar-chart')
      const options = JSON.parse(barChart.getAttribute('data-options') || '{}')

      expect(options.responsive).toBe(true)
      expect(options.plugins.legend.position).toBe('top')
    })

    it('should apply same options to all charts', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const barChart = screen.getByTestId('bar-chart')
      const pieChart = screen.getByTestId('pie-chart')
      const lineChart = screen.getByTestId('line-chart')

      const barOptions = JSON.parse(barChart.getAttribute('data-options') || '{}')
      const pieOptions = JSON.parse(pieChart.getAttribute('data-options') || '{}')
      const lineOptions = JSON.parse(lineChart.getAttribute('data-options') || '{}')

      expect(barOptions.responsive).toBe(true)
      expect(pieOptions.responsive).toBe(true)
      expect(lineOptions.responsive).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty releases array', () => {
      render(<ReleaseCharts releases={[]} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle single release', () => {
      const singleRelease = [mockReleases[0]]

      render(<ReleaseCharts releases={singleRelease} />)

      const barChart = screen.getByTestId('bar-chart')
      const pieChart = screen.getByTestId('pie-chart')

      const barLabels = JSON.parse(barChart.getAttribute('data-labels') || '[]')
      const pieLabels = JSON.parse(pieChart.getAttribute('data-labels') || '[]')

      expect(barLabels).toEqual(['NRE'])
      expect(pieLabels).toEqual(['Major'])
    })

    it('should handle releases with same application', () => {
      const sameAppReleases = mockReleases.map(release => ({
        ...release,
        applicationName: 'NRE'
      }))

      render(<ReleaseCharts releases={sameAppReleases} />)

      const barChart = screen.getByTestId('bar-chart')
      const labels = JSON.parse(barChart.getAttribute('data-labels') || '[]')
      const datasets = JSON.parse(barChart.getAttribute('data-datasets') || '[]')

      expect(labels).toEqual(['NRE'])
      expect(datasets[0].data).toEqual([4])
    })

    it('should handle releases with same type', () => {
      const sameTypeReleases = mockReleases.map(release => ({
        ...release,
        type: ReleaseType.MAJOR
      }))

      render(<ReleaseCharts releases={sameTypeReleases} />)

      const pieChart = screen.getByTestId('pie-chart')
      const labels = JSON.parse(pieChart.getAttribute('data-labels') || '[]')
      const datasets = JSON.parse(pieChart.getAttribute('data-datasets') || '[]')

      expect(labels).toEqual(['Major'])
      expect(datasets[0].data).toEqual([4])
    })

    it('should handle invalid release dates', () => {
      const invalidDateReleases = [
        {
          ...mockReleases[0],
          releaseDate: new Date('invalid-date')
        }
      ]

      render(<ReleaseCharts releases={invalidDateReleases} />)

      // Should render without crashing
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle releases with null/undefined dates', () => {
      const nullDateReleases = [
        {
          ...mockReleases[0],
          releaseDate: null as any
        }
      ]

      render(<ReleaseCharts releases={nullDateReleases} />)

      // Should render without crashing
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('Chart Accessibility', () => {
    it('should have descriptive headings for each chart section', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      expect(screen.getByRole('heading', { level: 2, name: /Release Analytics/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /Releases by Application/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /Releases by Type/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /Release Timeline/ })).toBeInTheDocument()
    })

    it('should have proper chart container structure', () => {
      render(<ReleaseCharts releases={mockReleases} />)

      const chartContainers = screen.getAllByTestId(/chart/)
      chartContainers.forEach(container => {
        expect(container).toBeInTheDocument()
      })
    })
  })

  describe('Data Aggregation Logic', () => {
    it('should correctly aggregate multiple releases per application', () => {
      const multipleNREReleases = [
        ...mockReleases,
        {
          ...mockReleases[0],
          _id: 'release-5',
          title: 'Another NRE Release',
          applicationName: 'NRE'
        }
      ]

      render(<ReleaseCharts releases={multipleNREReleases} />)

      const barChart = screen.getByTestId('bar-chart')
      const datasets = JSON.parse(barChart.getAttribute('data-datasets') || '[]')

      // NRE should now have 3 releases, others remain 1 each
      expect(datasets[0].data).toEqual([3, 1, 1])
    })

    it('should correctly aggregate multiple releases per type', () => {
      const multipleMajorReleases = [
        ...mockReleases,
        {
          ...mockReleases[0],
          _id: 'release-5',
          title: 'Another Major Release',
          type: ReleaseType.MAJOR
        }
      ]

      render(<ReleaseCharts releases={multipleMajorReleases} />)

      const pieChart = screen.getByTestId('pie-chart')
      const datasets = JSON.parse(pieChart.getAttribute('data-datasets') || '[]')

      // Major should now have 2 releases, others remain 1 each
      expect(datasets[0].data).toEqual([2, 1, 1, 1])
    })
  })

  describe('Performance Considerations', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
        ...mockReleases[0],
        _id: `release-${index}`,
        applicationName: `App-${index % 10}`, // 10 different apps
        type: [ReleaseType.MAJOR, ReleaseType.MINOR, ReleaseType.PATCH, ReleaseType.HOTFIX][index % 4],
        releaseDate: new Date(2024, index % 12, 1) // Spread across months
      }))

      render(<ReleaseCharts releases={largeDataset} />)

      // Should render without performance issues
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
