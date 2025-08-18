import { logActivity, getClientInfo, ActivityLogger } from '../activity'
import { ActivityAction, ActivityResource } from '@/types/activity'
import { UserRole } from '@/types/user'

// Mock fetch for testing
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock navigator for client-side testing
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
})

describe('activity.ts - Utility Functions', () => {
  const mockUser = {
    _id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.ADMIN,
    isActive: true,
    assignedApplications: ['NRE', 'E-Vite'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('logActivity Function', () => {
    it('should successfully log activity with minimal data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const result = await logActivity(
        mockUser,
        ActivityAction.LOGIN,
        ActivityResource.AUTH,
        'User logged in successfully'
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-123',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userRole: UserRole.ADMIN,
          action: ActivityAction.LOGIN,
          resource: ActivityResource.AUTH,
          details: 'User logged in successfully',
        }),
      })
    })

    it('should log activity with all optional parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const options = {
        resourceId: 'resource-456',
        application: 'NRE',
        metadata: { sessionId: 'session-789', browser: 'Chrome' },
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0.4472.124',
      }

      const result = await logActivity(
        mockUser,
        ActivityAction.USER_CREATED,
        ActivityResource.USER,
        'Created new user account',
        options
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-123',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userRole: UserRole.ADMIN,
          action: ActivityAction.USER_CREATED,
          resource: ActivityResource.USER,
          details: 'Created new user account',
          ...options,
        }),
      })
    })

    it('should handle API failure gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const result = await logActivity(
        mockUser,
        ActivityAction.LOGIN,
        ActivityResource.AUTH,
        'Failed login attempt'
      )

      expect(result).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      // Spy on console.error to verify error logging
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await logActivity(
        mockUser,
        ActivityAction.LOGIN,
        ActivityResource.AUTH,
        'Network error test'
      )

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to log activity:', expect.any(Error))
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle different user roles correctly', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const superAdminUser = { ...mockUser, role: UserRole.SUPER_ADMIN }
      const basicUser = { ...mockUser, role: UserRole.BASIC }

      // Test super admin
      await logActivity(superAdminUser, ActivityAction.SETTINGS_UPDATED, ActivityResource.SYSTEM, 'Settings updated')
      expect(mockFetch).toHaveBeenLastCalledWith('/api/activities', expect.objectContaining({
        body: expect.stringContaining(`"userRole":"${UserRole.SUPER_ADMIN}"`),
      }))

      // Test basic user
      await logActivity(basicUser, ActivityAction.PROMPT_USED, ActivityResource.PROMPT, 'Prompt used')
      expect(mockFetch).toHaveBeenLastCalledWith('/api/activities', expect.objectContaining({
        body: expect.stringContaining(`"userRole":"${UserRole.BASIC}"`),
      }))
    })

    it('should handle various activity actions and resources', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const testCases = [
        { action: ActivityAction.PROMPT_CREATED, resource: ActivityResource.PROMPT },
        { action: ActivityAction.RELEASE_PUBLISHED, resource: ActivityResource.RELEASE },
        { action: ActivityAction.REPORT_GENERATED, resource: ActivityResource.REPORT },
        { action: ActivityAction.USER_DELETED, resource: ActivityResource.USER },
      ]

      for (const { action, resource } of testCases) {
        await logActivity(mockUser, action, resource, `Test ${action}`)
        expect(mockFetch).toHaveBeenLastCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining(`"action":"${action}"`),
        }))
        expect(mockFetch).toHaveBeenLastCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining(`"resource":"${resource}"`),
        }))
      }
    })
  })

  describe('getClientInfo Function', () => {
    it('should return user agent when called on client-side', () => {
      // Mock window object
      Object.defineProperty(global, 'window', {
        value: { navigator: mockNavigator },
        writable: true,
      })

      const clientInfo = getClientInfo()

      expect(clientInfo).toEqual({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      })
    })

    it('should extract IP and user agent from request headers', () => {
      // Mock Request object
      const mockRequest = {
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('192.168.1.100, 10.0.0.1') // x-forwarded-for
            .mockReturnValueOnce('Chrome/91.0.4472.124'), // user-agent
        },
      } as any

      const clientInfo = getClientInfo(mockRequest)

      expect(clientInfo).toEqual({
        ipAddress: '192.168.1.100',
        userAgent: 'Chrome/91.0.4472.124',
      })

      expect(mockRequest.headers.get).toHaveBeenCalledWith('x-forwarded-for')
      expect(mockRequest.headers.get).toHaveBeenCalledWith('user-agent')
    })

    it('should fallback to x-real-ip when x-forwarded-for is not available', () => {
      const mockRequest = {
        headers: {
          get: jest.fn()
            .mockReturnValueOnce(null) // x-forwarded-for
            .mockReturnValueOnce('10.0.0.1') // x-real-ip
            .mockReturnValueOnce('Safari/537.36'), // user-agent
        },
      } as any

      const clientInfo = getClientInfo(mockRequest)

      expect(clientInfo).toEqual({
        ipAddress: '10.0.0.1',
        userAgent: 'Safari/537.36',
      })
    })

    it('should handle missing headers gracefully', () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      } as any

      const clientInfo = getClientInfo(mockRequest)

      expect(clientInfo).toEqual({
        ipAddress: undefined,
        userAgent: undefined,
      })
    })

    it('should return empty object when no request provided and not in browser', () => {
      // Remove window object to simulate server-side without request
      delete (global as any).window

      const clientInfo = getClientInfo()

      expect(clientInfo).toEqual({})
    })

    it('should handle complex forwarded-for header', () => {
      const mockRequest = {
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('203.0.113.195, 70.41.3.18, 150.172.238.178') // x-forwarded-for
            .mockReturnValueOnce('Firefox/89.0'), // user-agent
        },
      } as any

      const clientInfo = getClientInfo(mockRequest)

      expect(clientInfo).toEqual({
        ipAddress: '203.0.113.195', // Should take the first IP
        userAgent: 'Firefox/89.0',
      })
    })
  })

  describe('ActivityLogger Helpers', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({ ok: true })
    })

    describe('Authentication Activities', () => {
      it('should log successful login', async () => {
        const options = { ipAddress: '192.168.1.1', userAgent: 'Chrome/91.0' }
        
        await ActivityLogger.login(mockUser, options)

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"login"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"resource":"auth"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"details":"User logged in successfully"'),
        }))
      })

      it('should log logout', async () => {
        const options = { ipAddress: '192.168.1.1', userAgent: 'Chrome/91.0' }
        
        await ActivityLogger.logout(mockUser, options)

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"logout"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"details":"User logged out"'),
        }))
      })

      it('should log failed login attempts', async () => {
        const email = 'failed@example.com'
        const options = { ipAddress: '192.168.1.1', userAgent: 'Chrome/91.0' }
        
        await ActivityLogger.loginFailed(email, options)

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"login_failed"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"userId":"anonymous"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining(`"userEmail":"${email}"`),
        }))
      })
    })

    describe('User Management Activities', () => {
      const targetUser = {
        _id: 'target-user-456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: UserRole.BASIC,
        isActive: true,
        assignedApplications: ['E-Vite'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      it('should log user creation', async () => {
        await ActivityLogger.userCreated(mockUser, targetUser, 'NRE')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"user_created"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"resourceId":"target-user-456"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"application":"NRE"'),
        }))
      })

      it('should log user updates with changes', async () => {
        const changes = ['name', 'email', 'role']
        
        await ActivityLogger.userUpdated(mockUser, targetUser, changes, 'Portal Plus')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"user_updated"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('name, email, role'),
        }))
      })

      it('should log user deletion', async () => {
        await ActivityLogger.userDeleted(mockUser, targetUser, 'E-Vite')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"user_deleted"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"application":"E-Vite"'),
        }))
      })

      it('should log role changes', async () => {
        await ActivityLogger.roleChanged(mockUser, targetUser, 'basic', 'admin', 'NRE')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"role_changed"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('from basic to admin'),
        }))
      })
    })

    describe('Prompt Activities', () => {
      const promptId = 'prompt-123'
      const promptTitle = 'AI Code Generator'

      it('should log prompt creation', async () => {
        await ActivityLogger.promptCreated(mockUser, promptId, promptTitle, 'NRE')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"prompt_created"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"resource":"prompt"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining(`"resourceId":"${promptId}"`),
        }))
      })

      it('should log prompt usage', async () => {
        await ActivityLogger.promptUsed(mockUser, promptId, promptTitle, 'E-Vite')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"prompt_used"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining(`Used prompt: ${promptTitle}`),
        }))
      })

      it('should log prompt updates', async () => {
        await ActivityLogger.promptUpdated(mockUser, promptId, promptTitle, 'Portal Plus')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"prompt_updated"'),
        }))
      })

      it('should log prompt deletion', async () => {
        await ActivityLogger.promptDeleted(mockUser, promptId, promptTitle, 'Fast 2.0')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"prompt_deleted"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining(`"application":"Fast 2.0"`),
        }))
      })
    })

    describe('Release Activities', () => {
      const releaseId = 'release-456'
      const releaseTitle = 'Version 2.0.0'

      it('should log release creation', async () => {
        await ActivityLogger.releaseCreated(mockUser, releaseId, releaseTitle, 'NRE')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"release_created"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"resource":"release"'),
        }))
      })

      it('should log release updates', async () => {
        await ActivityLogger.releaseUpdated(mockUser, releaseId, releaseTitle, 'E-Vite')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"release_updated"'),
        }))
      })

      it('should log release publishing', async () => {
        await ActivityLogger.releasePublished(mockUser, releaseId, releaseTitle, 'Portal Plus')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"release_published"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining(`Published release: ${releaseTitle}`),
        }))
      })

      it('should log release deletion', async () => {
        await ActivityLogger.releaseDeleted(mockUser, releaseId, releaseTitle, 'FMS')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"release_deleted"'),
        }))
      })
    })

    describe('System Activities', () => {
      it('should log settings updates', async () => {
        await ActivityLogger.settingsUpdated(mockUser, 'theme', 'NRE')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"settings_updated"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"resource":"system"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('Updated system setting: theme'),
        }))
      })

      it('should log report generation', async () => {
        await ActivityLogger.reportGenerated(mockUser, 'user_activity', 'E-Vite')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"report_generated"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"resource":"report"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('Generated user_activity report'),
        }))
      })

      it('should log data exports', async () => {
        await ActivityLogger.dataExported(mockUser, 'user_list', 'Portal Plus')

        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('"action":"data_exported"'),
        }))
        expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
          body: expect.stringContaining('Exported user_list data'),
        }))
      })
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty user names and emails', async () => {
      const userWithEmptyFields = {
        ...mockUser,
        name: '',
        email: '',
      }

      mockFetch.mockResolvedValueOnce({ ok: true })

      const result = await logActivity(
        userWithEmptyFields,
        ActivityAction.LOGIN,
        ActivityResource.AUTH,
        'Test with empty fields'
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
        body: expect.stringContaining('"userName":""'),
      }))
      expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
        body: expect.stringContaining('"userEmail":""'),
      }))
    })

    it('should handle very long details text', async () => {
      const longDetails = 'A'.repeat(2000) // Very long string
      mockFetch.mockResolvedValueOnce({ ok: true })

      const result = await logActivity(
        mockUser,
        ActivityAction.SETTINGS_UPDATED,
        ActivityResource.SYSTEM,
        longDetails
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
        body: expect.stringContaining(longDetails),
      }))
    })

    it('should handle null/undefined metadata', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const result = await logActivity(
        mockUser,
        ActivityAction.LOGIN,
        ActivityResource.AUTH,
        'Test null metadata',
        { metadata: null as any }
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/activities', expect.objectContaining({
        body: expect.stringContaining('"metadata":null'),
      }))
    })

    it('should handle special characters in user agent and IP', async () => {
      const mockRequestWithSpecialChars = {
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('192.168.1.100, ::1, fe80::1%lo0') // IPv6 mixed
            .mockReturnValueOnce('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'), // user-agent
        },
      } as any

      const clientInfo = getClientInfo(mockRequestWithSpecialChars)

      expect(clientInfo.ipAddress).toBe('192.168.1.100')
      expect(clientInfo.userAgent).toContain('Macintosh')
    })
  })

  describe('Performance and Load Testing', () => {
    it('should handle rapid successive activity logs', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const promises = Array.from({ length: 100 }, (_, index) =>
        logActivity(
          mockUser,
          ActivityAction.LOGIN,
          ActivityResource.AUTH,
          `Rapid login ${index}`
        )
      )

      const start = performance.now()
      const results = await Promise.all(promises)
      const end = performance.now()

      expect(results.every(result => result === true)).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(100)
      expect(end - start).toBeLessThan(1000) // Should complete in less than 1 second
    })

    it('should handle ActivityLogger helper calls efficiently', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      const start = performance.now()

      await Promise.all([
        ActivityLogger.login(mockUser),
        ActivityLogger.userCreated(mockUser, mockUser, 'NRE'),
        ActivityLogger.promptUsed(mockUser, 'prompt-123', 'Test Prompt'),
        ActivityLogger.releasePublished(mockUser, 'release-456', 'v2.0.0'),
        ActivityLogger.settingsUpdated(mockUser, 'theme'),
      ])

      const end = performance.now()

      expect(mockFetch).toHaveBeenCalledTimes(5)
      expect(end - start).toBeLessThan(500) // Should complete quickly
    })
  })
})
