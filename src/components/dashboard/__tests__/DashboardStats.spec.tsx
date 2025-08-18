import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import DashboardStats from '../DashboardStats'
import { useAuth } from '@/contexts'
import { UserRole } from '@/types/user'
import { apiClient } from '@/lib/api'

// Mock the contexts and dependencies
jest.mock('@/contexts', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
  apiClient: {
    getUsers: jest.fn(),
  },
}))

jest.mock('../StatsCard', () => {
  return function MockStatsCard({ title, value, icon: Icon, trend }: any) {
    return (
      <div data-testid="stats-card">
        <div data-testid="stats-title">{title}</div>
        <div data-testid="stats-value">{value}</div>
        {Icon && <Icon data-testid="stats-icon" />}
        {trend && <div data-testid="stats-trend">{trend}</div>}
      </div>
    )
  }
})

jest.mock('@/components/ui/LoadingSpinner', () => {
  return function MockLoadingSpinner({ size }: { size?: string }) {
    return <div data-testid="loading-spinner" data-size={size}>Loading...</div>
  }
})

jest.mock('lucide-react', () => ({
  Users: (props: any) => <div data-testid="users-icon" {...props}>Users</div>,
  Shield: (props: any) => <div data-testid="shield-icon" {...props}>Shield</div>,
  Activity: (props: any) => <div data-testid="activity-icon" {...props}>Activity</div>,
  TrendingUp: (props: any) => <div data-testid="trending-up-icon" {...props}>TrendingUp</div>,
}))

describe('DashboardStats', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

  const mockSuperAdminUser = {
    _id: 'super-admin-1',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    assignedApplications: [],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const mockAdminUser = {
    _id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    isActive: true,
    assignedApplications: ['NRE'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const mockBasicUser = {
    _id: 'basic-1',
    name: 'Basic User',
    email: 'basic@example.com',
    role: UserRole.BASIC,
    isActive: true,
    assignedApplications: ['E-Vite'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const mockUsersResponse = {
    users: [
      { ...mockSuperAdminUser, isActive: true },
      { ...mockAdminUser, isActive: true },
      { ...mockBasicUser, isActive: true },
      { 
        _id: 'basic-2',
        name: 'Inactive User',
        email: 'inactive@example.com',
        role: UserRole.BASIC,
        isActive: false,
        assignedApplications: [],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        _id: 'admin-2',
        name: 'Admin User 2',
        email: 'admin2@example.com',
        role: UserRole.ADMIN,
        isActive: true,
        assignedApplications: ['Portal Plus'],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
    ],
    totalUsers: 5,
    totalPages: 1,
    currentPage: 1,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering with Different User Roles', () => {
    it('should render nothing when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null } as any)

      const { container } = render(<DashboardStats />)
      
      expect(container.firstChild).toBeNull()
    })

    it('should render basic user view for basic users', () => {
      mockUseAuth.mockReturnValue({ user: mockBasicUser } as any)

      render(<DashboardStats />)

      expect(screen.getByText('User Details')).toBeInTheDocument()
      expect(screen.getByText('Your Role')).toBeInTheDocument()
      expect(screen.getByText('Basic User')).toBeInTheDocument()
      expect(screen.getByText('Account Status')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Member Since')).toBeInTheDocument()
      expect(screen.getByText('2023')).toBeInTheDocument()
      expect(screen.getByText('Access Level')).toBeInTheDocument()
      expect(screen.getByText('Standard')).toBeInTheDocument()
    })

    it('should render inactive status for inactive basic users', () => {
      const inactiveUser = { ...mockBasicUser, isActive: false }
      mockUseAuth.mockReturnValue({ user: inactiveUser } as any)

      render(<DashboardStats />)

      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })

    it('should fetch and display stats for admin users', async () => {
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      mockApiClient.getUsers.mockResolvedValue(mockUsersResponse)

      render(<DashboardStats />)

      // Should show loading initially
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg')

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('User Statistics')).toBeInTheDocument()
      })

      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('Active Users')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('Admin Users')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument() // 1 super admin + 2 admins
      expect(screen.getByText('Basic Users')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should fetch and display stats for super admin users', async () => {
      mockUseAuth.mockReturnValue({ user: mockSuperAdminUser } as any)
      mockApiClient.getUsers.mockResolvedValue(mockUsersResponse)

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('User Statistics')).toBeInTheDocument()
      })

      expect(mockApiClient.getUsers).toHaveBeenCalledWith({ limit: 1000 })
    })
  })

  describe('Data Fetching and API Integration', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
    })

    it('should handle API success and calculate correct statistics', async () => {
      mockApiClient.getUsers.mockResolvedValue(mockUsersResponse)

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('User Statistics')).toBeInTheDocument()
      })

      // Verify API call
      expect(mockApiClient.getUsers).toHaveBeenCalledWith({ limit: 1000 })

      // Verify calculated statistics
      expect(screen.getByText('5')).toBeInTheDocument() // Total users
      expect(screen.getByText('4')).toBeInTheDocument() // Active users
      expect(screen.getByText('3')).toBeInTheDocument() // Admin users (including super admin)
      expect(screen.getByText('2')).toBeInTheDocument() // Basic users
    })

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiClient.getUsers.mockRejectedValue(new Error('API Error'))

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('No statistics available')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch dashboard stats:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })

    it('should show no stats message when API returns empty data', async () => {
      mockApiClient.getUsers.mockResolvedValue({
        users: [],
        totalUsers: 0,
        totalPages: 1,
        currentPage: 1,
      })

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('User Statistics')).toBeInTheDocument()
      })

      // Should show 0 for all statistics
      const zeros = screen.getAllByText('0')
      expect(zeros).toHaveLength(4)
    })

    it('should handle network timeouts', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockApiClient.getUsers.mockRejectedValue(new Error('Network timeout'))

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('No statistics available')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch dashboard stats:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('Statistics Calculations', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockSuperAdminUser } as any)
    })

    it('should correctly count users by role', async () => {
      const customUsersResponse = {
        users: [
          { ...mockSuperAdminUser, role: UserRole.SUPER_ADMIN },
          { ...mockAdminUser, role: UserRole.ADMIN },
          { ...mockAdminUser, _id: 'admin-3', role: UserRole.ADMIN },
          { ...mockBasicUser, role: UserRole.BASIC },
          { ...mockBasicUser, _id: 'basic-3', role: UserRole.BASIC },
          { ...mockBasicUser, _id: 'basic-4', role: UserRole.BASIC },
        ],
        totalUsers: 6,
        totalPages: 1,
        currentPage: 1,
      }

      mockApiClient.getUsers.mockResolvedValue(customUsersResponse)

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('User Statistics')).toBeInTheDocument()
      })

      // Verify calculated statistics by finding specific stat containers
      expect(screen.getByText('Total Users').closest('div')).toHaveTextContent('6')
      expect(screen.getByText('Admin Users').closest('div')).toHaveTextContent('3')
      expect(screen.getByText('Basic Users').closest('div')).toHaveTextContent('3')
    })

    it('should correctly count active vs inactive users', async () => {
      const customUsersResponse = {
        users: [
          { ...mockSuperAdminUser, isActive: true },
          { ...mockAdminUser, isActive: true },
          { ...mockBasicUser, isActive: false },
          { ...mockBasicUser, _id: 'basic-3', isActive: false },
          { ...mockBasicUser, _id: 'basic-4', isActive: true },
        ],
        totalUsers: 5,
        totalPages: 1,
        currentPage: 1,
      }

      mockApiClient.getUsers.mockResolvedValue(customUsersResponse)

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('User Statistics')).toBeInTheDocument()
      })

      expect(screen.getByText('Total Users').closest('div')).toHaveTextContent('5')
      expect(screen.getByText('Active Users').closest('div')).toHaveTextContent('3')
    })

    it('should handle edge case with only super admin', async () => {
      const customUsersResponse = {
        users: [{ ...mockSuperAdminUser }],
        totalUsers: 1,
        totalPages: 1,
        currentPage: 1,
      }

      mockApiClient.getUsers.mockResolvedValue(customUsersResponse)

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('User Statistics')).toBeInTheDocument()
      })

      expect(screen.getByText('Total Users').closest('div')).toHaveTextContent('1')
      expect(screen.getByText('Active Users').closest('div')).toHaveTextContent('1')
      expect(screen.getByText('Admin Users').closest('div')).toHaveTextContent('1')
      expect(screen.getByText('Basic Users').closest('div')).toHaveTextContent('0')
    })
  })

  describe('Component Structure and Styling', () => {
    it('should render correct icons for basic user view', () => {
      mockUseAuth.mockReturnValue({ user: mockBasicUser } as any)

      render(<DashboardStats />)

      expect(screen.getAllByTestId('users-icon')).toHaveLength(2) // Header and role icon
      expect(screen.getByTestId('activity-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
    })

    it('should render correct icons for admin stats view', async () => {
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      mockApiClient.getUsers.mockResolvedValue(mockUsersResponse)

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('User Statistics')).toBeInTheDocument()
      })

      expect(screen.getAllByTestId('users-icon')).toHaveLength(2) // Header and total users
      expect(screen.getByTestId('activity-icon')).toBeInTheDocument()
      expect(screen.getByTestId('shield-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument()
    })

    it('should apply correct CSS classes for basic user view', () => {
      mockUseAuth.mockReturnValue({ user: mockBasicUser } as any)

      render(<DashboardStats />)

      expect(screen.getByText('User Details').closest('div')).toHaveClass('p-4', 'border-b', 'border-gray-200')
    })

    it('should show correct member since year', () => {
      const userWithOldDate = {
        ...mockBasicUser,
        createdAt: new Date('2020-05-15'),
      }
      mockUseAuth.mockReturnValue({ user: userWithOldDate } as any)

      render(<DashboardStats />)

      expect(screen.getByText('2020')).toBeInTheDocument()
    })
  })

  describe('Permission-based Rendering', () => {
    it('should not fetch stats for basic users', () => {
      mockUseAuth.mockReturnValue({ user: mockBasicUser } as any)

      render(<DashboardStats />)

      expect(mockApiClient.getUsers).not.toHaveBeenCalled()
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    it('should show no stats message when user lacks permissions after loading', async () => {
      // Mock a basic user who doesn't have permission to view all users
      mockUseAuth.mockReturnValue({ user: mockBasicUser } as any)

      render(<DashboardStats />)

      // Basic users should see their own user details, not "No statistics available"
      expect(screen.getByText('User Details')).toBeInTheDocument()
      expect(screen.queryByText('No statistics available')).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner while fetching data', () => {
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      // Don't resolve the promise to keep it in loading state
      mockApiClient.getUsers.mockImplementation(() => new Promise(() => {}))

      render(<DashboardStats />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should hide loading spinner after data loads', async () => {
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      mockApiClient.getUsers.mockResolvedValue(mockUsersResponse)

      render(<DashboardStats />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })
    })

    it('should hide loading spinner after error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      mockApiClient.getUsers.mockRejectedValue(new Error('API Error'))

      render(<DashboardStats />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure for basic users', () => {
      mockUseAuth.mockReturnValue({ user: mockBasicUser } as any)

      render(<DashboardStats />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('User Details')
    })

    it('should have proper heading structure for admin users', async () => {
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      mockApiClient.getUsers.mockResolvedValue(mockUsersResponse)

      render(<DashboardStats />)

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 2 })
        expect(heading).toHaveTextContent('User Statistics')
      })
    })

    it('should have descriptive text for statistics', async () => {
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      mockApiClient.getUsers.mockResolvedValue(mockUsersResponse)

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument()
        expect(screen.getByText('Active Users')).toBeInTheDocument()
        expect(screen.getByText('Admin Users')).toBeInTheDocument()
        expect(screen.getByText('Basic Users')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed API response', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      
      // Return response with missing users array
      mockApiClient.getUsers.mockResolvedValue({} as any)

      render(<DashboardStats />)

      await waitFor(() => {
        expect(screen.getByText('No statistics available')).toBeInTheDocument()
      })

      expect(consoleErrorSpy).toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle users array with invalid data', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockUseAuth.mockReturnValue({ user: mockAdminUser } as any)
      
      const invalidUsersResponse = {
        users: [
          null,
          undefined,
          { ...mockBasicUser },
          { role: null, isActive: true },
        ],
        totalUsers: 4,
        totalPages: 1,
        currentPage: 1,
      }

      mockApiClient.getUsers.mockResolvedValue(invalidUsersResponse as any)

      render(<DashboardStats />)

      await waitFor(() => {
        // Component should handle invalid data and show "No statistics available"
        expect(screen.getByText('No statistics available')).toBeInTheDocument()
      })

      consoleErrorSpy.mockRestore()
    })
  })
})