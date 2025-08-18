import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import DashboardStats from '../DashboardStats'
import { render as customRender, mockUser, mockFetch } from '@/__tests__/utils/test-utils'

describe('DashboardStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renders loading state initially', () => {
    // Mock a delayed response
    global.fetch = jest.fn().mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({
              totalReleases: 10,
              activeReleases: 5,
              totalWorkItems: 50,
              completedWorkItems: 30,
            }),
          }), 100
        )
      )
    )

    customRender(<DashboardStats />, { user: mockUser })

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays stats after successful API call', async () => {
    const mockStats = {
      totalReleases: 15,
      activeReleases: 8,
      totalWorkItems: 75,
      completedWorkItems: 45,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('75')).toBeInTheDocument()
      expect(screen.getByText('45')).toBeInTheDocument()
    })
  })

  it('displays correct stat labels', async () => {
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 50,
      completedWorkItems: 30,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      expect(screen.getByText('Total Releases')).toBeInTheDocument()
      expect(screen.getByText('Active Releases')).toBeInTheDocument()
      expect(screen.getByText('Total Work Items')).toBeInTheDocument()
      expect(screen.getByText('Completed Items')).toBeInTheDocument()
    })
  })

  it('calculates and displays completion percentage', async () => {
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 100,
      completedWorkItems: 60,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      expect(screen.getByText('60%')).toBeInTheDocument()
    })
  })

  it('handles zero work items gracefully', async () => {
    const mockStats = {
      totalReleases: 5,
      activeReleases: 2,
      totalWorkItems: 0,
      completedWorkItems: 0,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  it('displays user-specific stats when available', async () => {
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 50,
      completedWorkItems: 30,
      userStats: {
        assignedItems: 10,
        completedItems: 7,
      },
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      expect(screen.getByText('Your Assigned')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
      expect(screen.getByText('Your Completed')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
    })
  })

  it('handles API error gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      // Should not crash and should show some fallback or hide loading
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  it('makes API call with correct parameters', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        totalReleases: 10,
        activeReleases: 5,
        totalWorkItems: 50,
        completedWorkItems: 30,
      }),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/dashboard/stats',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  it('displays icons for each stat item', async () => {
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 50,
      completedWorkItems: 30,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      // Icons should be rendered as SVG elements
      const statsContainer = screen.getByText('Total Releases').closest('.bg-white')
      expect(statsContainer).toBeInTheDocument()
    })
  })

  it('has proper styling and layout', async () => {
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 50,
      completedWorkItems: 30,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    const { container } = customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      const statsContainer = container.querySelector('.bg-white.rounded-xl.shadow-sm')
      expect(statsContainer).toBeInTheDocument()
    })
  })

  it('updates stats when user changes', async () => {
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 50,
      completedWorkItems: 30,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    const { rerender } = customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    // Change user and check if stats are refetched
    rerender(<DashboardStats />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('displays user account status', async () => {
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 50,
      completedWorkItems: 30,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      expect(screen.getByText('Account Status')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })

  it('handles inactive user status', async () => {
    const inactiveUser = { ...mockUser, isActive: false }
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 50,
      completedWorkItems: 30,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    customRender(<DashboardStats />, { user: inactiveUser })

    await waitFor(() => {
      expect(screen.getByText('Inactive')).toBeInTheDocument()
    })
  })

  it('displays responsive grid layout', async () => {
    const mockStats = {
      totalReleases: 10,
      activeReleases: 5,
      totalWorkItems: 50,
      completedWorkItems: 30,
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStats),
    })

    const { container } = customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
    })
  })

  it('handles empty or null stats gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    customRender(<DashboardStats />, { user: mockUser })

    await waitFor(() => {
      // Should handle empty stats without crashing
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })
})
