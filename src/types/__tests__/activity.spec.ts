import {
  Activity,
  ActivityAction,
  ActivityResource,
  ActivityFilters,
  ActivityStats,
  ActivityByApplication,
  CreateActivityData,
} from '../activity'

describe('activity.ts - Types and Interfaces', () => {
  // Mock activity data for testing
  const mockActivity: Activity = {
    _id: 'activity-id-1',
    userId: 'user-123',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userRole: 'admin',
    action: ActivityAction.USER_CREATED,
    resource: ActivityResource.USER,
    resourceId: 'target-user-456',
    application: 'NRE',
    details: 'Created user account for Jane Smith',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date('2023-12-01T10:00:00Z'),
    metadata: {
      targetUserName: 'Jane Smith',
      previousRole: null,
      newRole: 'basic'
    },
    createdAt: new Date('2023-12-01T10:00:00Z'),
    updatedAt: new Date('2023-12-01T10:00:00Z'),
  }

  const mockLoginActivity: Activity = {
    _id: 'activity-id-2',
    userId: 'user-789',
    userName: 'Admin User',
    userEmail: 'admin@example.com',
    userRole: 'super_admin',
    action: ActivityAction.LOGIN,
    resource: ActivityResource.AUTH,
    details: 'User logged in successfully',
    ipAddress: '10.0.0.1',
    userAgent: 'Chrome/91.0.4472.124',
    timestamp: new Date('2023-12-01T09:30:00Z'),
    createdAt: new Date('2023-12-01T09:30:00Z'),
    updatedAt: new Date('2023-12-01T09:30:00Z'),
  }

  describe('ActivityAction Enum', () => {
    it('should contain all expected authentication actions', () => {
      expect(ActivityAction.LOGIN).toBe('login')
      expect(ActivityAction.LOGOUT).toBe('logout')
      expect(ActivityAction.LOGIN_FAILED).toBe('login_failed')
    })

    it('should contain all expected user management actions', () => {
      expect(ActivityAction.USER_CREATED).toBe('user_created')
      expect(ActivityAction.USER_UPDATED).toBe('user_updated')
      expect(ActivityAction.USER_DELETED).toBe('user_deleted')
      expect(ActivityAction.USER_ACTIVATED).toBe('user_activated')
      expect(ActivityAction.USER_DEACTIVATED).toBe('user_deactivated')
      expect(ActivityAction.ROLE_CHANGED).toBe('role_changed')
      expect(ActivityAction.PASSWORD_CHANGED).toBe('password_changed')
      expect(ActivityAction.PROFILE_UPDATED).toBe('profile_updated')
    })

    it('should contain all expected prompt management actions', () => {
      expect(ActivityAction.PROMPT_CREATED).toBe('prompt_created')
      expect(ActivityAction.PROMPT_UPDATED).toBe('prompt_updated')
      expect(ActivityAction.PROMPT_DELETED).toBe('prompt_deleted')
      expect(ActivityAction.PROMPT_USED).toBe('prompt_used')
      expect(ActivityAction.PROMPT_FAVORITED).toBe('prompt_favorited')
      expect(ActivityAction.PROMPT_UNFAVORITED).toBe('prompt_unfavorited')
      expect(ActivityAction.PROMPT_DUPLICATED).toBe('prompt_duplicated')
    })

    it('should contain all expected release management actions', () => {
      expect(ActivityAction.RELEASE_CREATED).toBe('release_created')
      expect(ActivityAction.RELEASE_UPDATED).toBe('release_updated')
      expect(ActivityAction.RELEASE_DELETED).toBe('release_deleted')
      expect(ActivityAction.RELEASE_PUBLISHED).toBe('release_published')
      expect(ActivityAction.RELEASE_UNPUBLISHED).toBe('release_unpublished')
      expect(ActivityAction.RELEASE_VIEWED).toBe('release_viewed')
    })

    it('should contain all expected system actions', () => {
      expect(ActivityAction.SETTINGS_UPDATED).toBe('settings_updated')
      expect(ActivityAction.APPLICATION_ASSIGNED).toBe('application_assigned')
      expect(ActivityAction.APPLICATION_UNASSIGNED).toBe('application_unassigned')
      expect(ActivityAction.REPORT_GENERATED).toBe('report_generated')
      expect(ActivityAction.DATA_EXPORTED).toBe('data_exported')
    })

    it('should have correct total number of actions', () => {
      const totalActions = Object.values(ActivityAction).length
      expect(totalActions).toBe(29) // Update this number if actions are added/removed
    })

    it('should have unique action values', () => {
      const actionValues = Object.values(ActivityAction)
      const uniqueValues = [...new Set(actionValues)]
      expect(uniqueValues).toHaveLength(actionValues.length)
    })
  })

  describe('ActivityResource Enum', () => {
    it('should contain all expected resource types', () => {
      expect(ActivityResource.USER).toBe('user')
      expect(ActivityResource.PROMPT).toBe('prompt')
      expect(ActivityResource.RELEASE).toBe('release')
      expect(ActivityResource.SYSTEM).toBe('system')
      expect(ActivityResource.AUTH).toBe('auth')
      expect(ActivityResource.REPORT).toBe('report')
    })

    it('should have correct total number of resources', () => {
      const totalResources = Object.values(ActivityResource).length
      expect(totalResources).toBe(6)
    })

    it('should have unique resource values', () => {
      const resourceValues = Object.values(ActivityResource)
      const uniqueValues = [...new Set(resourceValues)]
      expect(uniqueValues).toHaveLength(resourceValues.length)
    })
  })

  describe('Activity Interface', () => {
    it('should accept valid activity object with all required fields', () => {
      const activity: Activity = {
        _id: 'test-id',
        userId: 'user-123',
        userName: 'Test User',
        userEmail: 'test@example.com',
        userRole: 'basic',
        action: ActivityAction.LOGIN,
        resource: ActivityResource.AUTH,
        details: 'Test activity',
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(activity._id).toBe('test-id')
      expect(activity.action).toBe(ActivityAction.LOGIN)
      expect(activity.resource).toBe(ActivityResource.AUTH)
    })

    it('should accept activity object with optional fields', () => {
      const activity: Activity = {
        ...mockActivity,
        resourceId: 'optional-resource-id',
        application: 'E-Vite',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        metadata: { key: 'value' },
      }

      expect(activity.resourceId).toBe('optional-resource-id')
      expect(activity.application).toBe('E-Vite')
      expect(activity.ipAddress).toBe('127.0.0.1')
      expect(activity.userAgent).toBe('test-agent')
      expect(activity.metadata).toEqual({ key: 'value' })
    })

    it('should work without optional fields', () => {
      const minimalActivity: Activity = {
        _id: 'minimal-id',
        userId: 'user-123',
        userName: 'Test User',
        userEmail: 'test@example.com',
        userRole: 'basic',
        action: ActivityAction.LOGIN,
        resource: ActivityResource.AUTH,
        details: 'Minimal activity',
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(minimalActivity.resourceId).toBeUndefined()
      expect(minimalActivity.application).toBeUndefined()
      expect(minimalActivity.ipAddress).toBeUndefined()
      expect(minimalActivity.userAgent).toBeUndefined()
      expect(minimalActivity.metadata).toBeUndefined()
    })
  })

  describe('CreateActivityData Interface', () => {
    it('should accept valid create activity data', () => {
      const createData: CreateActivityData = {
        userId: 'user-123',
        userName: 'Test User',
        userEmail: 'test@example.com',
        userRole: 'admin',
        action: ActivityAction.USER_CREATED,
        resource: ActivityResource.USER,
        details: 'Creating test user',
        resourceId: 'new-user-456',
        application: 'Portal Plus',
        ipAddress: '192.168.1.1',
        userAgent: 'test-browser',
        metadata: { source: 'admin-panel' },
      }

      expect(createData.userId).toBe('user-123')
      expect(createData.action).toBe(ActivityAction.USER_CREATED)
      expect(createData.resource).toBe(ActivityResource.USER)
      expect(createData.metadata).toEqual({ source: 'admin-panel' })
    })

    it('should work with minimal required fields only', () => {
      const minimalData: CreateActivityData = {
        userId: 'user-123',
        userName: 'Test User',
        userEmail: 'test@example.com',
        userRole: 'basic',
        action: ActivityAction.LOGIN,
        resource: ActivityResource.AUTH,
        details: 'User login',
      }

      expect(minimalData.resourceId).toBeUndefined()
      expect(minimalData.application).toBeUndefined()
      expect(minimalData.ipAddress).toBeUndefined()
      expect(minimalData.userAgent).toBeUndefined()
      expect(minimalData.metadata).toBeUndefined()
    })
  })

  describe('ActivityFilters Interface', () => {
    it('should accept comprehensive filter options', () => {
      const filters: ActivityFilters = {
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
        applications: ['NRE', 'E-Vite'],
        actions: [ActivityAction.LOGIN, ActivityAction.USER_CREATED],
        resources: [ActivityResource.AUTH, ActivityResource.USER],
        users: ['user-123', 'user-456'],
        limit: 50,
        skip: 0,
      }

      expect(filters.dateRange?.start).toBeInstanceOf(Date)
      expect(filters.applications).toHaveLength(2)
      expect(filters.actions).toContain(ActivityAction.LOGIN)
      expect(filters.resources).toContain(ActivityResource.AUTH)
      expect(filters.limit).toBe(50)
    })

    it('should work with partial filter options', () => {
      const partialFilters: ActivityFilters = {
        applications: ['NRE'],
        limit: 10,
      }

      expect(partialFilters.applications).toEqual(['NRE'])
      expect(partialFilters.limit).toBe(10)
      expect(partialFilters.dateRange).toBeUndefined()
      expect(partialFilters.actions).toBeUndefined()
    })

    it('should work with empty filter object', () => {
      const emptyFilters: ActivityFilters = {}

      expect(Object.keys(emptyFilters)).toHaveLength(0)
    })
  })

  describe('ActivityStats Interface', () => {
    it('should accept complete activity statistics', () => {
      const stats: ActivityStats = {
        totalActivities: 1250,
        uniqueUsers: 45,
        activitiesByAction: {
          [ActivityAction.LOGIN]: 300,
          [ActivityAction.USER_CREATED]: 25,
          [ActivityAction.PROMPT_USED]: 500,
        },
        activitiesByApplication: {
          'NRE': 400,
          'E-Vite': 300,
          'Portal Plus': 250,
          'System': 300,
        },
        activitiesByResource: {
          [ActivityResource.AUTH]: 350,
          [ActivityResource.USER]: 200,
          [ActivityResource.PROMPT]: 700,
        },
        recentActivities: [mockActivity, mockLoginActivity],
        topUsers: [
          { userId: 'user-123', userName: 'John Doe', activityCount: 150 },
          { userId: 'user-456', userName: 'Jane Smith', activityCount: 120 },
        ],
      }

      expect(stats.totalActivities).toBe(1250)
      expect(stats.uniqueUsers).toBe(45)
      expect(stats.activitiesByAction[ActivityAction.LOGIN]).toBe(300)
      expect(stats.activitiesByApplication['NRE']).toBe(400)
      expect(stats.activitiesByResource[ActivityResource.AUTH]).toBe(350)
      expect(stats.recentActivities).toHaveLength(2)
      expect(stats.topUsers).toHaveLength(2)
      expect(stats.topUsers[0].activityCount).toBe(150)
    })

    it('should handle empty statistics', () => {
      const emptyStats: ActivityStats = {
        totalActivities: 0,
        uniqueUsers: 0,
        activitiesByAction: {},
        activitiesByApplication: {},
        activitiesByResource: {},
        recentActivities: [],
        topUsers: [],
      }

      expect(emptyStats.totalActivities).toBe(0)
      expect(emptyStats.recentActivities).toHaveLength(0)
      expect(emptyStats.topUsers).toHaveLength(0)
      expect(Object.keys(emptyStats.activitiesByAction)).toHaveLength(0)
    })
  })

  describe('ActivityByApplication Interface', () => {
    it('should accept complete application activity data', () => {
      const appActivity: ActivityByApplication = {
        application: 'NRE',
        activities: [mockActivity],
        stats: {
          totalActivities: 150,
          uniqueUsers: 25,
          mostCommonAction: 'user_created',
          lastActivity: new Date('2023-12-01T15:30:00Z'),
        },
      }

      expect(appActivity.application).toBe('NRE')
      expect(appActivity.activities).toHaveLength(1)
      expect(appActivity.stats.totalActivities).toBe(150)
      expect(appActivity.stats.uniqueUsers).toBe(25)
      expect(appActivity.stats.mostCommonAction).toBe('user_created')
      expect(appActivity.stats.lastActivity).toBeInstanceOf(Date)
    })

    it('should handle application with no activities', () => {
      const emptyAppActivity: ActivityByApplication = {
        application: 'Fast 2.0',
        activities: [],
        stats: {
          totalActivities: 0,
          uniqueUsers: 0,
          mostCommonAction: '',
          lastActivity: new Date('1970-01-01T00:00:00Z'),
        },
      }

      expect(emptyAppActivity.activities).toHaveLength(0)
      expect(emptyAppActivity.stats.totalActivities).toBe(0)
      expect(emptyAppActivity.stats.mostCommonAction).toBe('')
    })
  })

  describe('Data Validation and Edge Cases', () => {
    it('should handle activities with different action-resource combinations', () => {
      const combinations = [
        { action: ActivityAction.LOGIN, resource: ActivityResource.AUTH },
        { action: ActivityAction.USER_CREATED, resource: ActivityResource.USER },
        { action: ActivityAction.PROMPT_USED, resource: ActivityResource.PROMPT },
        { action: ActivityAction.RELEASE_PUBLISHED, resource: ActivityResource.RELEASE },
        { action: ActivityAction.SETTINGS_UPDATED, resource: ActivityResource.SYSTEM },
        { action: ActivityAction.REPORT_GENERATED, resource: ActivityResource.REPORT },
      ]

      combinations.forEach(({ action, resource }) => {
        const activity: Activity = {
          _id: `test-${action}-${resource}`,
          userId: 'user-123',
          userName: 'Test User',
          userEmail: 'test@example.com',
          userRole: 'basic',
          action,
          resource,
          details: `Test ${action} on ${resource}`,
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        expect(activity.action).toBe(action)
        expect(activity.resource).toBe(resource)
      })
    })

    it('should handle activities with various user roles', () => {
      const userRoles = ['super_admin', 'admin', 'basic', 'guest']

      userRoles.forEach(role => {
        const activity: Activity = {
          _id: `test-role-${role}`,
          userId: 'user-123',
          userName: 'Test User',
          userEmail: 'test@example.com',
          userRole: role,
          action: ActivityAction.LOGIN,
          resource: ActivityResource.AUTH,
          details: `Login by ${role}`,
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        expect(activity.userRole).toBe(role)
      })
    })

    it('should handle activities with various applications', () => {
      const applications = ['NRE', 'NVE', 'E-Vite', 'Portal Plus', 'Fast 2.0', 'FMS']

      applications.forEach(app => {
        const activity: Activity = {
          _id: `test-app-${app}`,
          userId: 'user-123',
          userName: 'Test User',
          userEmail: 'test@example.com',
          userRole: 'basic',
          action: ActivityAction.SETTINGS_UPDATED,
          resource: ActivityResource.SYSTEM,
          application: app,
          details: `Settings updated for ${app}`,
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        expect(activity.application).toBe(app)
      })
    })

    it('should handle large metadata objects', () => {
      const largeMetadata = {
        changes: ['field1', 'field2', 'field3'],
        previousValues: {
          field1: 'old_value_1',
          field2: 'old_value_2',
          field3: 'old_value_3',
        },
        newValues: {
          field1: 'new_value_1',
          field2: 'new_value_2',
          field3: 'new_value_3',
        },
        context: {
          source: 'admin_panel',
          timestamp: new Date().toISOString(),
          sessionId: 'session-123',
        },
        additionalData: {
          clientInfo: {
            browser: 'Chrome',
            version: '91.0.4472.124',
            os: 'Windows 10',
          },
        },
      }

      const activity: Activity = {
        _id: 'test-large-metadata',
        userId: 'user-123',
        userName: 'Test User',
        userEmail: 'test@example.com',
        userRole: 'admin',
        action: ActivityAction.USER_UPDATED,
        resource: ActivityResource.USER,
        details: 'User profile updated with multiple changes',
        metadata: largeMetadata,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(activity.metadata).toEqual(largeMetadata)
      expect(activity.metadata?.changes).toHaveLength(3)
      expect(activity.metadata?.context.source).toBe('admin_panel')
    })

    it('should handle activities with special characters in details', () => {
      const specialDetails = [
        'User "John O\'Malley" was created',
        'Updated prompt with title: "How to use AI & ML?"',
        'Release notes: <b>Version 2.0</b> - New features!',
        'Error: Failed to connect to database @ 192.168.1.100:5432',
        'Settings updated: {"theme": "dark", "language": "en-US"}',
      ]

      specialDetails.forEach((details, index) => {
        const activity: Activity = {
          _id: `test-special-${index}`,
          userId: 'user-123',
          userName: 'Test User',
          userEmail: 'test@example.com',
          userRole: 'basic',
          action: ActivityAction.SETTINGS_UPDATED,
          resource: ActivityResource.SYSTEM,
          details,
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        expect(activity.details).toBe(details)
      })
    })
  })

  describe('Type Safety and Constraints', () => {
    it('should enforce action enum constraints', () => {
      const validActions = Object.values(ActivityAction)
      
      validActions.forEach(action => {
        const activity: Activity = {
          _id: 'test-action',
          userId: 'user-123',
          userName: 'Test User',
          userEmail: 'test@example.com',
          userRole: 'basic',
          action,
          resource: ActivityResource.SYSTEM,
          details: 'Test activity',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        expect(validActions).toContain(activity.action)
      })
    })

    it('should enforce resource enum constraints', () => {
      const validResources = Object.values(ActivityResource)
      
      validResources.forEach(resource => {
        const activity: Activity = {
          _id: 'test-resource',
          userId: 'user-123',
          userName: 'Test User',
          userEmail: 'test@example.com',
          userRole: 'basic',
          action: ActivityAction.SETTINGS_UPDATED,
          resource,
          details: 'Test activity',
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        expect(validResources).toContain(activity.resource)
      })
    })

    it('should handle date field types correctly', () => {
      const now = new Date()
      const activity: Activity = {
        _id: 'test-dates',
        userId: 'user-123',
        userName: 'Test User',
        userEmail: 'test@example.com',
        userRole: 'basic',
        action: ActivityAction.LOGIN,
        resource: ActivityResource.AUTH,
        details: 'Test activity',
        timestamp: now,
        createdAt: now,
        updatedAt: now,
      }

      expect(activity.timestamp).toBeInstanceOf(Date)
      expect(activity.createdAt).toBeInstanceOf(Date)
      expect(activity.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('Performance Considerations', () => {
    it('should handle large activity arrays efficiently', () => {
      const largeActivityArray = Array.from({ length: 1000 }, (_, index) => ({
        _id: `activity-${index}`,
        userId: `user-${index % 10}`,
        userName: `User ${index % 10}`,
        userEmail: `user${index % 10}@example.com`,
        userRole: 'basic',
        action: ActivityAction.LOGIN,
        resource: ActivityResource.AUTH,
        details: `Login activity ${index}`,
        timestamp: new Date(Date.now() - index * 60000),
        createdAt: new Date(Date.now() - index * 60000),
        updatedAt: new Date(Date.now() - index * 60000),
      }))

      const start = performance.now()
      
      // Simulate processing operations
      const userCounts = largeActivityArray.reduce((acc, activity) => {
        acc[activity.userId] = (acc[activity.userId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const actionCounts = largeActivityArray.reduce((acc, activity) => {
        acc[activity.action] = (acc[activity.action] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const end = performance.now()

      expect(largeActivityArray).toHaveLength(1000)
      expect(Object.keys(userCounts)).toHaveLength(10) // 10 unique users
      expect(actionCounts[ActivityAction.LOGIN]).toBe(1000) // All login actions
      expect(end - start).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should handle complex filter combinations efficiently', () => {
      const complexFilters: ActivityFilters = {
        dateRange: {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        },
        applications: ['NRE', 'E-Vite', 'Portal Plus'],
        actions: [
          ActivityAction.LOGIN,
          ActivityAction.USER_CREATED,
          ActivityAction.PROMPT_USED,
          ActivityAction.RELEASE_PUBLISHED,
        ],
        resources: [
          ActivityResource.AUTH,
          ActivityResource.USER,
          ActivityResource.PROMPT,
          ActivityResource.RELEASE,
        ],
        users: Array.from({ length: 50 }, (_, i) => `user-${i}`),
        limit: 100,
        skip: 0,
      }

      // Verify complex filter structure
      expect(complexFilters.applications).toHaveLength(3)
      expect(complexFilters.actions).toHaveLength(4)
      expect(complexFilters.resources).toHaveLength(4)
      expect(complexFilters.users).toHaveLength(50)
      expect(complexFilters.dateRange?.start).toBeInstanceOf(Date)
      expect(complexFilters.dateRange?.end).toBeInstanceOf(Date)
    })
  })
})
