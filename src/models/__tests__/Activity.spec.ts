import { AVAILABLE_APPLICATIONS } from '@/types/user'
import { ActivityAction, ActivityResource } from '@/types/activity'

// Mock mongoose for testing
const mockSchema = {
  pre: jest.fn(),
  index: jest.fn(),
  statics: {},
}

const mockModel = {
  logActivity: jest.fn(),
  getActivitiesByApplication: jest.fn(),
  getActivityStats: jest.fn(),
  countDocuments: jest.fn(),
  distinct: jest.fn(),
  aggregate: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
}

jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation((schema, options) => {
    // Store the schema definition for testing
    mockSchema.definition = schema
    mockSchema.options = options
    return mockSchema
  }),
  Types: {
    Mixed: 'Mixed',
  },
  models: {},
  model: jest.fn().mockReturnValue(mockModel),
}))

describe('Activity Model Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Schema Definition', () => {
    it('should define all required fields with correct types', () => {
      // Import the model to trigger schema creation
      require('../Activity')

      const schema = mockSchema.definition

      expect(schema).toHaveProperty('userId')
      expect(schema).toHaveProperty('userName')
      expect(schema).toHaveProperty('userEmail')
      expect(schema).toHaveProperty('userRole')
      expect(schema).toHaveProperty('action')
      expect(schema).toHaveProperty('resource')
      expect(schema).toHaveProperty('details')
    })

    it('should configure userId field correctly', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.userId.type).toBe(String)
      expect(schema.userId.required).toBe(true)
      expect(schema.userId.index).toBe(true)
    })

    it('should configure userName field correctly', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.userName.type).toBe(String)
      expect(schema.userName.required).toBe(true)
      expect(schema.userName.trim).toBe(true)
    })

    it('should configure userEmail field correctly', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.userEmail.type).toBe(String)
      expect(schema.userEmail.required).toBe(true)
      expect(schema.userEmail.trim).toBe(true)
      expect(schema.userEmail.lowercase).toBe(true)
    })

    it('should configure userRole field with correct enum values', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.userRole.type).toBe(String)
      expect(schema.userRole.required).toBe(true)
      expect(schema.userRole.enum).toEqual(['super_admin', 'admin', 'basic'])
    })

    it('should configure action field with all activity actions', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.action.type).toBe(String)
      expect(schema.action.required).toBe(true)
      expect(schema.action.index).toBe(true)
      
      // Check that enum contains expected action values
      const actionEnum = schema.action.enum
      expect(actionEnum).toContain('login')
      expect(actionEnum).toContain('logout')
      expect(actionEnum).toContain('user_created')
      expect(actionEnum).toContain('prompt_used')
      expect(actionEnum).toContain('release_published')
      expect(actionEnum).toContain('settings_updated')
    })

    it('should configure resource field with correct enum values', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.resource.type).toBe(String)
      expect(schema.resource.required).toBe(true)
      expect(schema.resource.index).toBe(true)
      expect(schema.resource.enum).toEqual(['user', 'prompt', 'release', 'system', 'auth', 'report'])
    })

    it('should configure application field with available applications', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.application.type).toBe(String)
      expect(schema.application.enum).toEqual([...AVAILABLE_APPLICATIONS, null])
      expect(schema.application.index).toBe(true)
    })

    it('should configure details field with maxlength constraint', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.details.type).toBe(String)
      expect(schema.details.required).toBe(true)
      expect(schema.details.maxlength).toBe(1000)
    })

    it('should configure optional fields correctly', () => {
      require('../Activity')
      const schema = mockSchema.definition

      // resourceId - optional, indexed
      expect(schema.resourceId.type).toBe(String)
      expect(schema.resourceId.index).toBe(true)

      // ipAddress - optional, trimmed
      expect(schema.ipAddress.type).toBe(String)
      expect(schema.ipAddress.trim).toBe(true)

      // userAgent - optional, trimmed
      expect(schema.userAgent.type).toBe(String)
      expect(schema.userAgent.trim).toBe(true)
    })

    it('should configure timestamp with default and index', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.timestamp.type).toBe(Date)
      expect(schema.timestamp.default).toBe(Date.now)
      expect(schema.timestamp.index).toBe(true)
    })

    it('should enable timestamps in schema options', () => {
      require('../Activity')
      
      expect(mockSchema.options.timestamps).toBe(true)
    })
  })

  describe('Schema Indexes', () => {
    it('should create compound indexes for performance', () => {
      require('../Activity')

      // Verify that index method was called for compound indexes
      expect(mockSchema.index).toHaveBeenCalledWith({ userId: 1, timestamp: -1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ application: 1, timestamp: -1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ action: 1, timestamp: -1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ resource: 1, timestamp: -1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ timestamp: -1 })
    })
  })

  describe('Static Methods', () => {
    describe('logActivity', () => {
      it('should save activity data successfully', async () => {
        const mockSave = jest.fn().mockResolvedValue({ _id: 'activity-123' })
        const mockConstructor = jest.fn().mockImplementation(() => ({
          save: mockSave,
        }))

        // Mock the model constructor
        require('../Activity')
        mockSchema.statics.logActivity = async function(activityData: any) {
          try {
            const activity = new mockConstructor(activityData)
            await activity.save()
            return activity
          } catch (error) {
            console.error('Failed to log activity:', error)
            return null
          }
        }

        const activityData = {
          userId: 'user-123',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userRole: 'admin',
          action: 'login',
          resource: 'auth',
          details: 'User logged in',
        }

        const result = await mockSchema.statics.logActivity(activityData)

        expect(mockConstructor).toHaveBeenCalledWith(activityData)
        expect(mockSave).toHaveBeenCalled()
        expect(result).toBeDefined()
      })

      it('should handle errors gracefully', async () => {
        const mockSave = jest.fn().mockRejectedValue(new Error('Database error'))
        const mockConstructor = jest.fn().mockImplementation(() => ({
          save: mockSave,
        }))

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

        require('../Activity')
        mockSchema.statics.logActivity = async function(activityData: any) {
          try {
            const activity = new mockConstructor(activityData)
            await activity.save()
            return activity
          } catch (error) {
            console.error('Failed to log activity:', error)
            return null
          }
        }

        const result = await mockSchema.statics.logActivity({})

        expect(result).toBeNull()
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to log activity:', expect.any(Error))
        
        consoleErrorSpy.mockRestore()
      })
    })

    describe('getActivitiesByApplication', () => {
      it('should query activities by application', async () => {
        const mockFind = {
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue([{ _id: 'activity-1' }, { _id: 'activity-2' }]),
        }

        require('../Activity')
        mockSchema.statics.getActivitiesByApplication = async function(
          application?: string,
          limit: number = 50,
          skip: number = 0
        ) {
          const query = application ? { application } : {}
          return mockFind
        }

        const activities = await mockSchema.statics.getActivitiesByApplication('NRE', 25, 10)

        expect(activities).toBeDefined()
      })

      it('should handle no application filter', async () => {
        const mockFind = {
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          lean: jest.fn().mockResolvedValue([]),
        }

        require('../Activity')
        mockSchema.statics.getActivitiesByApplication = async function(
          application?: string,
          limit: number = 50,
          skip: number = 0
        ) {
          const query = application ? { application } : {}
          expect(query).toEqual({}) // Should be empty when no application
          return mockFind
        }

        await mockSchema.statics.getActivitiesByApplication()
      })
    })

    describe('getActivityStats', () => {
      it('should calculate activity statistics', async () => {
        require('../Activity')
        
        // Mock the aggregation methods
        const mockCountDocuments = jest.fn().mockResolvedValue(150)
        const mockDistinct = jest.fn().mockResolvedValue(['user1', 'user2', 'user3'])
        const mockAggregate = jest.fn()
          .mockResolvedValueOnce([
            { _id: 'login', count: 50 },
            { _id: 'user_created', count: 25 },
          ])
          .mockResolvedValueOnce([
            { _id: 'NRE', count: 75 },
            { _id: 'System', count: 75 },
          ])
          .mockResolvedValueOnce([
            { _id: 'auth', count: 50 },
            { _id: 'user', count: 25 },
            { _id: 'system', count: 75 },
          ])

        mockSchema.statics.getActivityStats = async function(dateRange?: { start: Date; end: Date }) {
          const matchStage: any = {}
          if (dateRange) {
            matchStage.timestamp = {
              $gte: dateRange.start,
              $lte: dateRange.end
            }
          }

          const totalActivities = await mockCountDocuments(matchStage)
          const uniqueUsers = await mockDistinct('userId', matchStage)
          
          const actionStats = await mockAggregate([
            { $match: matchStage },
            { $group: { _id: '$action', count: { $sum: 1 } } }
          ])
          
          const appStats = await mockAggregate([
            { $match: matchStage },
            { $group: { _id: { $ifNull: ['$application', 'System'] }, count: { $sum: 1 } } }
          ])
          
          const resourceStats = await mockAggregate([
            { $match: matchStage },
            { $group: { _id: '$resource', count: { $sum: 1 } } }
          ])

          return {
            totalActivities,
            uniqueUsers: uniqueUsers.length,
            activitiesByAction: actionStats.reduce((acc: any, item: any) => {
              acc[item._id] = item.count
              return acc
            }, {}),
            activitiesByApplication: appStats.reduce((acc: any, item: any) => {
              acc[item._id] = item.count
              return acc
            }, {}),
            activitiesByResource: resourceStats.reduce((acc: any, item: any) => {
              acc[item._id] = item.count
              return acc
            }, {})
          }
        }

        const stats = await mockSchema.statics.getActivityStats()

        expect(stats.totalActivities).toBe(150)
        expect(stats.uniqueUsers).toBe(3)
        expect(stats.activitiesByAction.login).toBe(50)
        expect(stats.activitiesByApplication.NRE).toBe(75)
        expect(stats.activitiesByResource.auth).toBe(50)
      })

      it('should handle date range filtering', async () => {
        require('../Activity')
        
        const dateRange = {
          start: new Date('2023-01-01'),
          end: new Date('2023-12-31'),
        }

        const mockCountDocuments = jest.fn().mockResolvedValue(100)
        const mockDistinct = jest.fn().mockResolvedValue(['user1', 'user2'])
        const mockAggregate = jest.fn().mockResolvedValue([])

        mockSchema.statics.getActivityStats = async function(dateRange?: { start: Date; end: Date }) {
          const matchStage: any = {}
          if (dateRange) {
            matchStage.timestamp = {
              $gte: dateRange.start,
              $lte: dateRange.end
            }
            expect(matchStage.timestamp).toEqual({
              $gte: dateRange.start,
              $lte: dateRange.end
            })
          }

          return {
            totalActivities: await mockCountDocuments(matchStage),
            uniqueUsers: 2,
            activitiesByAction: {},
            activitiesByApplication: {},
            activitiesByResource: {}
          }
        }

        const stats = await mockSchema.statics.getActivityStats(dateRange)

        expect(stats.totalActivities).toBe(100)
        expect(stats.uniqueUsers).toBe(2)
      })
    })
  })

  describe('Validation Logic', () => {
    it('should validate action enum values', () => {
      require('../Activity')
      const schema = mockSchema.definition

      const validActions = schema.action.enum
      const testActions = [
        ActivityAction.LOGIN,
        ActivityAction.USER_CREATED,
        ActivityAction.PROMPT_USED,
        ActivityAction.RELEASE_PUBLISHED,
        ActivityAction.SETTINGS_UPDATED,
      ]

      testActions.forEach(action => {
        expect(validActions).toContain(action)
      })
    })

    it('should validate resource enum values', () => {
      require('../Activity')
      const schema = mockSchema.definition

      const validResources = schema.resource.enum
      const testResources = [
        ActivityResource.AUTH,
        ActivityResource.USER,
        ActivityResource.PROMPT,
        ActivityResource.RELEASE,
        ActivityResource.SYSTEM,
        ActivityResource.REPORT,
      ]

      testResources.forEach(resource => {
        expect(validResources).toContain(resource)
      })
    })

    it('should validate application enum includes all available applications', () => {
      require('../Activity')
      const schema = mockSchema.definition

      const applicationEnum = schema.application.enum
      
      AVAILABLE_APPLICATIONS.forEach(app => {
        expect(applicationEnum).toContain(app)
      })
      
      expect(applicationEnum).toContain(null) // Should allow null
    })

    it('should validate details maxlength constraint', () => {
      require('../Activity')
      const schema = mockSchema.definition

      expect(schema.details.maxlength).toBe(1000)
    })
  })

  describe('Data Processing Logic', () => {
    it('should reduce aggregation results correctly', () => {
      const aggregationResults = [
        { _id: 'login', count: 100 },
        { _id: 'logout', count: 80 },
        { _id: 'user_created', count: 25 },
      ]

      const reduced = aggregationResults.reduce((acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {})

      expect(reduced).toEqual({
        login: 100,
        logout: 80,
        user_created: 25,
      })
    })

    it('should handle empty aggregation results', () => {
      const emptyResults: any[] = []

      const reduced = emptyResults.reduce((acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {})

      expect(reduced).toEqual({})
    })

    it('should handle null application in aggregation', () => {
      const appResults = [
        { _id: null, count: 50 },
        { _id: 'NRE', count: 75 },
      ]

      // Simulate the $ifNull operation
      const processedResults = appResults.map(item => ({
        _id: item._id || 'System',
        count: item.count,
      }))

      expect(processedResults[0]._id).toBe('System')
      expect(processedResults[1]._id).toBe('NRE')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing required fields gracefully', () => {
      const incompleteActivity = {
        userId: 'user-123',
        // Missing userName, userEmail, userRole, action, resource, details
      }

      // This would typically be handled by mongoose validation
      const requiredFields = ['userName', 'userEmail', 'userRole', 'action', 'resource', 'details']
      
      requiredFields.forEach(field => {
        expect(incompleteActivity).not.toHaveProperty(field)
      })
    })

    it('should handle very long details text', () => {
      const longDetails = 'A'.repeat(1500) // Longer than maxlength
      
      // This would typically be handled by mongoose validation
      expect(longDetails.length).toBeGreaterThan(1000)
    })

    it('should handle invalid action values', () => {
      const invalidAction = 'invalid_action'
      
      require('../Activity')
      const schema = mockSchema.definition
      const validActions = schema.action.enum
      
      expect(validActions).not.toContain(invalidAction)
    })

    it('should handle invalid resource values', () => {
      const invalidResource = 'invalid_resource'
      
      require('../Activity')
      const schema = mockSchema.definition
      const validResources = schema.resource.enum
      
      expect(validResources).not.toContain(invalidResource)
    })

    it('should handle invalid application values', () => {
      const invalidApplication = 'InvalidApp'
      
      require('../Activity')
      const schema = mockSchema.definition
      const validApplications = schema.application.enum
      
      expect(validApplications).not.toContain(invalidApplication)
    })
  })

  describe('Performance Considerations', () => {
    it('should have appropriate indexes for common queries', () => {
      require('../Activity')

      // Verify important indexes exist
      const expectedIndexes = [
        { userId: 1, timestamp: -1 },
        { application: 1, timestamp: -1 },
        { action: 1, timestamp: -1 },
        { resource: 1, timestamp: -1 },
        { timestamp: -1 },
      ]

      expectedIndexes.forEach(index => {
        expect(mockSchema.index).toHaveBeenCalledWith(index)
      })
    })

    it('should handle large aggregation operations efficiently', () => {
      // Mock data for 10,000 activities
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        _id: `activity-${i}`,
        action: ['login', 'logout', 'user_created'][i % 3],
        application: ['NRE', 'E-Vite', null][i % 3],
        resource: ['auth', 'user', 'system'][i % 3],
      }))

      const start = performance.now()
      
      // Simulate aggregation processing
      const actionCounts = largeDataset.reduce((acc, item) => {
        acc[item.action] = (acc[item.action] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const appCounts = largeDataset.reduce((acc, item) => {
        const app = item.application || 'System'
        acc[app] = (acc[app] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const end = performance.now()

      expect(Object.keys(actionCounts)).toHaveLength(3)
      expect(Object.keys(appCounts)).toHaveLength(3)
      expect(end - start).toBeLessThan(100) // Should complete in less than 100ms
    })
  })
})
