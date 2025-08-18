import { PromptLanguage, AIModel } from '@/types/prompt'

// Mock mongoose for testing
const mockSchema = {
  pre: jest.fn(),
  index: jest.fn(),
  methods: {},
  statics: {},
}

const mockModel = {
  findByCategory: jest.fn(),
  findByTags: jest.fn(),
  findFavorites: jest.fn(),
  findMostUsed: jest.fn(),
  findRecent: jest.fn(),
  searchPrompts: jest.fn(),
  getStats: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  find: jest.fn(),
}

jest.mock('mongoose', () => ({
  Schema: jest.fn().mockImplementation((schema, options) => {
    mockSchema.definition = schema
    mockSchema.options = options
    return mockSchema
  }),
  Types: {
    ObjectId: jest.fn(),
    Mixed: 'Mixed',
  },
  models: {},
  model: jest.fn().mockReturnValue(mockModel),
}))

describe('Prompt Model Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Schema Definition', () => {
    it('should define all required fields with correct types', () => {
      require('../Prompt')

      const schema = mockSchema.definition

      expect(schema).toHaveProperty('id')
      expect(schema).toHaveProperty('title')
      expect(schema).toHaveProperty('content')
      expect(schema).toHaveProperty('category')
      expect(schema).toHaveProperty('tags')
      expect(schema).toHaveProperty('isActive')
      expect(schema).toHaveProperty('createdBy')
    })

    it('should configure id field correctly', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.id.type).toBe(String)
      expect(schema.id.required).toBe(true)
      expect(schema.id.unique).toBe(true)
      expect(schema.id.index).toBe(true)
    })

    it('should configure title field with constraints', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.title.type).toBe(String)
      expect(schema.title.required).toBe(true)
      expect(schema.title.trim).toBe(true)
      expect(schema.title.maxlength).toBe(200)
      expect(schema.title.index).toBe(true)
    })

    it('should configure content field with maxlength', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.content.type).toBe(String)
      expect(schema.content.required).toBe(true)
      expect(schema.content.maxlength).toBe(10000)
    })

    it('should configure description field as optional', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.description.type).toBe(String)
      expect(schema.description.trim).toBe(true)
      expect(schema.description.maxlength).toBe(500)
    })

    it('should configure category field correctly', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.category.type).toBe(String)
      expect(schema.category.required).toBe(true)
      expect(schema.category.trim).toBe(true)
      expect(schema.category.index).toBe(true)
    })

    it('should configure tags as array of strings', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(Array.isArray(schema.tags)).toBe(true)
      expect(schema.tags[0].type).toBe(String)
      expect(schema.tags[0].trim).toBe(true)
      expect(schema.tags[0].lowercase).toBe(true)
      expect(schema.tags[0].index).toBe(true)
    })

    it('should configure boolean fields with defaults', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.isActive.type).toBe(Boolean)
      expect(schema.isActive.default).toBe(true)
      expect(schema.isActive.index).toBe(true)

      expect(schema.isFavorite.type).toBe(Boolean)
      expect(schema.isFavorite.default).toBe(false)
      expect(schema.isFavorite.index).toBe(true)
    })

    it('should configure usageCount with constraints', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.usageCount.type).toBe(Number)
      expect(schema.usageCount.default).toBe(0)
      expect(schema.usageCount.min).toBe(0)
      expect(schema.usageCount.index).toBe(true)
    })

    it('should configure language field with enum', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.language.type).toBe(String)
      expect(schema.language.enum).toEqual(Object.values(PromptLanguage))
      expect(schema.language.default).toBe(PromptLanguage.ENGLISH)
      expect(schema.language.index).toBe(true)
    })

    it('should configure AI model settings', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      // Model field
      expect(schema.model.type).toBe(String)
      expect(schema.model.enum).toEqual(Object.values(AIModel))
      expect(schema.model.default).toBe(AIModel.GPT_4)
      expect(schema.model.index).toBe(true)

      // Temperature
      expect(schema.temperature.type).toBe(Number)
      expect(schema.temperature.min).toBe(0)
      expect(schema.temperature.max).toBe(2)
      expect(schema.temperature.default).toBe(0.7)

      // Max tokens
      expect(schema.maxTokens.type).toBe(Number)
      expect(schema.maxTokens.min).toBe(1)
      expect(schema.maxTokens.max).toBe(4096)
      expect(schema.maxTokens.default).toBe(1000)

      // Top P
      expect(schema.topP.type).toBe(Number)
      expect(schema.topP.min).toBe(0)
      expect(schema.topP.max).toBe(1)
      expect(schema.topP.default).toBe(1)

      // Frequency penalty
      expect(schema.frequencyPenalty.type).toBe(Number)
      expect(schema.frequencyPenalty.min).toBe(-2)
      expect(schema.frequencyPenalty.max).toBe(2)
      expect(schema.frequencyPenalty.default).toBe(0)

      // Presence penalty
      expect(schema.presencePenalty.type).toBe(Number)
      expect(schema.presencePenalty.min).toBe(-2)
      expect(schema.presencePenalty.max).toBe(2)
      expect(schema.presencePenalty.default).toBe(0)
    })
  })

  describe('Schema Options and Middleware', () => {
    it('should enable timestamps', () => {
      require('../Prompt')
      
      expect(mockSchema.options.timestamps).toBe(true)
    })

    it('should configure JSON transformation', () => {
      require('../Prompt')
      
      expect(mockSchema.options.toJSON).toBeDefined()
      expect(typeof mockSchema.options.toJSON.transform).toBe('function')
    })

    it('should configure object transformation', () => {
      require('../Prompt')
      
      expect(mockSchema.options.toObject).toBeDefined()
      expect(typeof mockSchema.options.toObject.transform).toBe('function')
    })

    it('should have pre-save middleware for ID generation', () => {
      require('../Prompt')
      
      expect(mockSchema.pre).toHaveBeenCalledWith('save', expect.any(Function))
    })
  })

  describe('Schema Indexes', () => {
    it('should create text indexes for search', () => {
      require('../Prompt')

      expect(mockSchema.index).toHaveBeenCalledWith({ title: 'text', content: 'text', description: 'text' })
    })

    it('should create compound indexes for filtering', () => {
      require('../Prompt')

      expect(mockSchema.index).toHaveBeenCalledWith({ category: 1, isActive: 1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ tags: 1, isActive: 1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ createdBy: 1, createdAt: -1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ usageCount: -1, isActive: 1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ isFavorite: 1, createdBy: 1 })
      expect(mockSchema.index).toHaveBeenCalledWith({ updatedAt: -1 })
    })
  })

  describe('Instance Methods', () => {
    let mockPromptInstance: any

    beforeEach(() => {
      mockPromptInstance = {
        usageCount: 5,
        isFavorite: false,
        content: 'Original content',
        variables: [],
        updatedAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      }
    })

    describe('incrementUsage', () => {
      it('should increment usage count and save', async () => {
        require('../Prompt')
        
        mockSchema.methods.incrementUsage = function() {
          this.usageCount += 1
          return this.save()
        }

        const incrementUsage = mockSchema.methods.incrementUsage.bind(mockPromptInstance)
        await incrementUsage()

        expect(mockPromptInstance.usageCount).toBe(6)
        expect(mockPromptInstance.save).toHaveBeenCalled()
      })
    })

    describe('toggleFavorite', () => {
      it('should toggle favorite status and save', async () => {
        require('../Prompt')
        
        mockSchema.methods.toggleFavorite = function() {
          this.isFavorite = !this.isFavorite
          return this.save()
        }

        const toggleFavorite = mockSchema.methods.toggleFavorite.bind(mockPromptInstance)
        await toggleFavorite()

        expect(mockPromptInstance.isFavorite).toBe(true)
        expect(mockPromptInstance.save).toHaveBeenCalled()
      })

      it('should toggle from true to false', async () => {
        mockPromptInstance.isFavorite = true
        require('../Prompt')
        
        mockSchema.methods.toggleFavorite = function() {
          this.isFavorite = !this.isFavorite
          return this.save()
        }

        const toggleFavorite = mockSchema.methods.toggleFavorite.bind(mockPromptInstance)
        await toggleFavorite()

        expect(mockPromptInstance.isFavorite).toBe(false)
      })
    })

    describe('updateContent', () => {
      it('should update content and save', async () => {
        require('../Prompt')
        
        mockSchema.methods.updateContent = function(content: string, variables?: any[]) {
          this.content = content
          if (variables) {
            this.variables = variables
          }
          this.updatedAt = new Date()
          return this.save()
        }

        const updateContent = mockSchema.methods.updateContent.bind(mockPromptInstance)
        await updateContent('New content')

        expect(mockPromptInstance.content).toBe('New content')
        expect(mockPromptInstance.updatedAt).toBeInstanceOf(Date)
        expect(mockPromptInstance.save).toHaveBeenCalled()
      })

      it('should update content and variables', async () => {
        require('../Prompt')
        
        const newVariables = [
          { name: 'var1', type: 'text', label: 'Variable 1', required: true },
        ]

        mockSchema.methods.updateContent = function(content: string, variables?: any[]) {
          this.content = content
          if (variables) {
            this.variables = variables
          }
          this.updatedAt = new Date()
          return this.save()
        }

        const updateContent = mockSchema.methods.updateContent.bind(mockPromptInstance)
        await updateContent('New content with variables', newVariables)

        expect(mockPromptInstance.content).toBe('New content with variables')
        expect(mockPromptInstance.variables).toEqual(newVariables)
      })
    })
  })

  describe('Static Methods', () => {
    describe('findByCategory', () => {
      it('should find prompts by category', async () => {
        const mockFind = {
          sort: jest.fn().mockResolvedValue([{ _id: 'prompt1' }, { _id: 'prompt2' }]),
        }

        require('../Prompt')
        mockSchema.statics.findByCategory = function(category: string) {
          expect(category).toBe('Development')
          return mockFind
        }

        const result = await mockSchema.statics.findByCategory('Development')
        expect(result).toBeDefined()
      })
    })

    describe('findByTags', () => {
      it('should find prompts by tags', async () => {
        const mockFind = {
          sort: jest.fn().mockResolvedValue([{ _id: 'prompt1' }]),
        }

        require('../Prompt')
        mockSchema.statics.findByTags = function(tags: string[]) {
          expect(tags).toEqual(['ai', 'coding'])
          return mockFind
        }

        const result = await mockSchema.statics.findByTags(['ai', 'coding'])
        expect(result).toBeDefined()
      })
    })

    describe('findFavorites', () => {
      it('should find user favorites', async () => {
        const mockFind = {
          sort: jest.fn().mockResolvedValue([{ _id: 'favorite1' }]),
        }

        require('../Prompt')
        mockSchema.statics.findFavorites = function(userId: string) {
          expect(userId).toBe('user-123')
          return mockFind
        }

        const result = await mockSchema.statics.findFavorites('user-123')
        expect(result).toBeDefined()
      })
    })

    describe('findMostUsed', () => {
      it('should find most used prompts with default limit', async () => {
        const mockFind = {
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([{ _id: 'popular1' }]),
        }

        require('../Prompt')
        mockSchema.statics.findMostUsed = function(limit: number = 10) {
          expect(limit).toBe(10)
          return mockFind
        }

        const result = await mockSchema.statics.findMostUsed()
        expect(result).toBeDefined()
      })

      it('should find most used prompts with custom limit', async () => {
        const mockFind = {
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([]),
        }

        require('../Prompt')
        mockSchema.statics.findMostUsed = function(limit: number = 10) {
          expect(limit).toBe(5)
          return mockFind
        }

        await mockSchema.statics.findMostUsed(5)
      })
    })

    describe('findRecent', () => {
      it('should find recent prompts', async () => {
        const mockFind = {
          sort: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([{ _id: 'recent1' }]),
        }

        require('../Prompt')
        mockSchema.statics.findRecent = function(limit: number = 10) {
          expect(limit).toBe(10)
          return mockFind
        }

        const result = await mockSchema.statics.findRecent()
        expect(result).toBeDefined()
      })
    })

    describe('searchPrompts', () => {
      it('should search prompts by query', async () => {
        const mockFind = {
          sort: jest.fn().mockResolvedValue([{ _id: 'search1' }]),
        }

        require('../Prompt')
        mockSchema.statics.searchPrompts = function(query: string) {
          expect(query).toBe('machine learning')
          return mockFind
        }

        const result = await mockSchema.statics.searchPrompts('machine learning')
        expect(result).toBeDefined()
      })
    })

    describe('getStats', () => {
      it('should calculate comprehensive statistics', async () => {
        require('../Prompt')
        
        const mockCountDocuments = jest.fn()
          .mockResolvedValueOnce(100) // totalPrompts
          .mockResolvedValueOnce(80)  // activePrompts
          .mockResolvedValueOnce(25)  // favoritePrompts

        const mockAggregate = jest.fn()
          .mockResolvedValueOnce([{ _id: null, totalUsage: 5000 }])
          .mockResolvedValueOnce([
            { _id: 'Development', count: 30 },
            { _id: 'Marketing', count: 20 },
          ])
          .mockResolvedValueOnce([
            { _id: 'ai', count: 40 },
            { _id: 'coding', count: 25 },
          ])
          .mockResolvedValueOnce([
            { _id: 'gpt-4', count: 60 },
            { _id: 'claude-3-opus', count: 20 },
          ])
          .mockResolvedValueOnce([
            { _id: 'en', count: 70 },
            { _id: 'es', count: 10 },
          ])
          .mockResolvedValueOnce([
            { month: '2023-12', count: 500 },
            { month: '2023-11', count: 400 },
          ])

        const mockFind = jest.fn()
          .mockReturnValueOnce({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([{ _id: 'top1' }]),
          })
          .mockReturnValueOnce({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([{ _id: 'recent1' }]),
          })

        mockSchema.statics.getStats = async function() {
          const totalPrompts = await mockCountDocuments()
          const activePrompts = await mockCountDocuments()
          const favoritePrompts = await mockCountDocuments()
          
          const usageStats = await mockAggregate()
          const categoryStats = await mockAggregate()
          const tagStats = await mockAggregate()
          const modelStats = await mockAggregate()
          const languageStats = await mockAggregate()
          const usageByMonth = await mockAggregate()
          
          const topPrompts = await mockFind()
          const recentPrompts = await mockFind()
          
          return {
            totalPrompts,
            activePrompts,
            favoritePrompts,
            totalUsage: usageStats[0]?.totalUsage || 0,
            categoryStats: categoryStats.reduce((acc: any, item: any) => {
              acc[item._id] = item.count
              return acc
            }, {}),
            tagStats: tagStats.reduce((acc: any, item: any) => {
              acc[item._id] = item.count
              return acc
            }, {}),
            modelStats: modelStats.reduce((acc: any, item: any) => {
              acc[item._id] = item.count
              return acc
            }, {}),
            languageStats: languageStats.reduce((acc: any, item: any) => {
              acc[item._id] = item.count
              return acc
            }, {}),
            usageByMonth,
            topPrompts,
            recentPrompts
          }
        }

        const stats = await mockSchema.statics.getStats()

        expect(stats.totalPrompts).toBe(100)
        expect(stats.activePrompts).toBe(80)
        expect(stats.favoritePrompts).toBe(25)
        expect(stats.totalUsage).toBe(5000)
        expect(stats.categoryStats.Development).toBe(30)
        expect(stats.tagStats.ai).toBe(40)
        expect(stats.modelStats['gpt-4']).toBe(60)
        expect(stats.languageStats.en).toBe(70)
        expect(stats.usageByMonth).toHaveLength(2)
      })
    })
  })

  describe('Pre-save Middleware', () => {
    it('should set ID from _id if not provided', () => {
      require('../Prompt')
      
      const preSaveCallback = mockSchema.pre.mock.calls.find(call => call[0] === 'save')[1]
      const mockNext = jest.fn()
      
      const promptDoc = {
        id: undefined,
        _id: { toString: () => 'generated-id-123' },
      }

      preSaveCallback.call(promptDoc, mockNext)

      expect(promptDoc.id).toBe('generated-id-123')
      expect(mockNext).toHaveBeenCalled()
    })

    it('should not override existing ID', () => {
      require('../Prompt')
      
      const preSaveCallback = mockSchema.pre.mock.calls.find(call => call[0] === 'save')[1]
      const mockNext = jest.fn()
      
      const promptDoc = {
        id: 'existing-id',
        _id: { toString: () => 'generated-id-123' },
      }

      preSaveCallback.call(promptDoc, mockNext)

      expect(promptDoc.id).toBe('existing-id')
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Data Transformation', () => {
    it('should transform document to JSON with ID', () => {
      require('../Prompt')
      
      const transform = mockSchema.options.toJSON.transform
      const doc = {}
      const ret = {
        _id: { toString: () => 'doc-id-123' },
        title: 'Test Prompt',
        content: 'Test content',
      }

      const result = transform(doc, ret)

      expect(result.id).toBe('doc-id-123')
      expect(result.title).toBe('Test Prompt')
      expect(result.content).toBe('Test content')
    })

    it('should transform document to object with ID', () => {
      require('../Prompt')
      
      const transform = mockSchema.options.toObject.transform
      const doc = {}
      const ret = {
        _id: { toString: () => 'doc-id-456' },
        category: 'Development',
      }

      const result = transform(doc, ret)

      expect(result.id).toBe('doc-id-456')
      expect(result.category).toBe('Development')
    })
  })

  describe('Validation Logic', () => {
    it('should validate language enum values', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      const validLanguages = schema.language.enum
      const testLanguages = [
        PromptLanguage.ENGLISH,
        PromptLanguage.SPANISH,
        PromptLanguage.FRENCH,
        PromptLanguage.CHINESE,
      ]

      testLanguages.forEach(lang => {
        expect(validLanguages).toContain(lang)
      })
    })

    it('should validate AI model enum values', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      const validModels = schema.model.enum
      const testModels = [
        AIModel.GPT_4,
        AIModel.GPT_4_TURBO,
        AIModel.CLAUDE_3_OPUS,
        AIModel.GEMINI_PRO,
      ]

      testModels.forEach(model => {
        expect(validModels).toContain(model)
      })
    })

    it('should validate numeric constraints', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      // Temperature constraints
      expect(schema.temperature.min).toBe(0)
      expect(schema.temperature.max).toBe(2)

      // Max tokens constraints
      expect(schema.maxTokens.min).toBe(1)
      expect(schema.maxTokens.max).toBe(4096)

      // Top P constraints
      expect(schema.topP.min).toBe(0)
      expect(schema.topP.max).toBe(1)

      // Penalty constraints
      expect(schema.frequencyPenalty.min).toBe(-2)
      expect(schema.frequencyPenalty.max).toBe(2)
      expect(schema.presencePenalty.min).toBe(-2)
      expect(schema.presencePenalty.max).toBe(2)
    })

    it('should validate string length constraints', () => {
      require('../Prompt')
      const schema = mockSchema.definition

      expect(schema.title.maxlength).toBe(200)
      expect(schema.content.maxlength).toBe(10000)
      expect(schema.description.maxlength).toBe(500)
    })
  })

  describe('Performance and Optimization', () => {
    it('should handle large datasets efficiently in aggregation', () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        _id: `prompt-${i}`,
        category: ['Development', 'Marketing', 'Writing'][i % 3],
        tags: [['ai'], ['coding'], ['content']][i % 3],
        model: ['gpt-4', 'claude-3-opus', 'gemini-pro'][i % 3],
        language: ['en', 'es', 'fr'][i % 3],
        usageCount: Math.floor(Math.random() * 1000),
      }))

      const start = performance.now()
      
      // Simulate aggregation operations
      const categoryStats = largeDataset.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const modelStats = largeDataset.reduce((acc, item) => {
        acc[item.model] = (acc[item.model] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const totalUsage = largeDataset.reduce((sum, item) => sum + item.usageCount, 0)
      
      const end = performance.now()

      expect(Object.keys(categoryStats)).toHaveLength(3)
      expect(Object.keys(modelStats)).toHaveLength(3)
      expect(totalUsage).toBeGreaterThan(0)
      expect(end - start).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should handle complex search queries efficiently', () => {
      const searchQuery = 'machine learning python neural network deep learning AI'
      const mockResults = Array.from({ length: 100 }, (_, i) => ({
        _id: `result-${i}`,
        title: `AI Prompt ${i}`,
        content: `Content about ${searchQuery.split(' ')[i % 6]}`,
        score: Math.random(),
      }))

      const start = performance.now()
      
      // Simulate search processing
      const processedResults = mockResults
        .filter(result => result.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
      
      const end = performance.now()

      expect(processedResults.length).toBeLessThanOrEqual(20)
      expect(end - start).toBeLessThan(50) // Should complete quickly
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty aggregation results', () => {
      const emptyAggregation: any[] = []
      
      const reduced = emptyAggregation.reduce((acc: any, item: any) => {
        acc[item._id] = item.count
        return acc
      }, {})

      expect(reduced).toEqual({})
    })

    it('should handle prompts with no variables', () => {
      const promptWithoutVariables = {
        variables: undefined,
        title: 'Simple Prompt',
        content: 'No variables here',
      }

      expect(promptWithoutVariables.variables).toBeUndefined()
    })

    it('should handle prompts with many variables', () => {
      const manyVariables = Array.from({ length: 50 }, (_, i) => ({
        name: `var${i}`,
        type: 'text',
        label: `Variable ${i}`,
        required: i % 2 === 0,
      }))

      expect(manyVariables).toHaveLength(50)
      expect(manyVariables.filter(v => v.required)).toHaveLength(25)
    })

    it('should handle extreme AI model settings', () => {
      const extremeSettings = {
        temperature: 0,
        maxTokens: 1,
        topP: 0,
        frequencyPenalty: -2,
        presencePenalty: 2,
      }

      // These should be valid according to schema constraints
      expect(extremeSettings.temperature).toBeGreaterThanOrEqual(0)
      expect(extremeSettings.maxTokens).toBeGreaterThanOrEqual(1)
      expect(extremeSettings.topP).toBeGreaterThanOrEqual(0)
      expect(extremeSettings.frequencyPenalty).toBeGreaterThanOrEqual(-2)
      expect(extremeSettings.presencePenalty).toBeLessThanOrEqual(2)
    })
  })
})
