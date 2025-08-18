import {
  Prompt,
  PromptVariable,
  PromptCategory,
  PromptTemplate,
  PromptReview,
  PromptExecution,
  PromptSettings,
  PromptCollection,
  CreatePromptData,
  UpdatePromptData,
  CreateCategoryData,
  UpdateCategoryData,
  ExecutePromptData,
  PromptFilters,
  PromptSortOptions,
  PromptStats,
  PromptStatus,
  PromptType,
  PromptLanguage,
  AIModel,
  PromptWithCategory,
  PromptWithStats,
  PromptSearchResult,
  PromptsResponse,
  CategoriesResponse,
  PromptExecutionResponse,
  PromptStatsResponse,
} from '../prompt'

describe('prompt.ts - Types and Interfaces', () => {
  // Mock data for testing
  const mockPromptVariable: PromptVariable = {
    name: 'userInput',
    type: 'text',
    label: 'User Input',
    description: 'The main input from the user',
    required: true,
    defaultValue: '',
    options: undefined,
    validation: {
      min: 1,
      max: 1000,
      pattern: '^[a-zA-Z0-9\\s]+$',
      message: 'Only alphanumeric characters allowed',
    },
  }

  const mockPrompt: Prompt = {
    _id: 'prompt-123',
    id: 'prompt-123',
    title: 'Code Generator',
    content: 'Generate {language} code for {task}',
    category: 'Development',
    tags: ['code', 'programming', 'ai'],
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-15T10:30:00Z'),
    createdBy: 'user-456',
    usageCount: 150,
    isFavorite: true,
    variables: [mockPromptVariable],
    description: 'Generate code snippets in various programming languages',
    version: '1.2.0',
    language: PromptLanguage.ENGLISH,
    model: AIModel.GPT_4,
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  }

  const mockCategory: PromptCategory = {
    _id: 'cat-123',
    id: 'cat-123',
    name: 'Development',
    description: 'Programming and development related prompts',
    color: '#3B82F6',
    icon: 'code',
    promptCount: 25,
    isActive: true,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-10T00:00:00Z'),
    createdBy: 'admin-user',
    parentId: undefined,
    order: 1,
  }

  describe('Enums', () => {
    describe('PromptStatus Enum', () => {
      it('should contain all expected status values', () => {
        expect(PromptStatus.DRAFT).toBe('draft')
        expect(PromptStatus.ACTIVE).toBe('active')
        expect(PromptStatus.ARCHIVED).toBe('archived')
        expect(PromptStatus.DEPRECATED).toBe('deprecated')
      })

      it('should have exactly 4 status values', () => {
        const statusValues = Object.values(PromptStatus)
        expect(statusValues).toHaveLength(4)
      })
    })

    describe('PromptType Enum', () => {
      it('should contain all expected type values', () => {
        expect(PromptType.SYSTEM).toBe('system')
        expect(PromptType.USER).toBe('user')
        expect(PromptType.ASSISTANT).toBe('assistant')
        expect(PromptType.FUNCTION).toBe('function')
      })

      it('should have exactly 4 type values', () => {
        const typeValues = Object.values(PromptType)
        expect(typeValues).toHaveLength(4)
      })
    })

    describe('PromptLanguage Enum', () => {
      it('should contain all expected language values', () => {
        expect(PromptLanguage.ENGLISH).toBe('en')
        expect(PromptLanguage.SPANISH).toBe('es')
        expect(PromptLanguage.FRENCH).toBe('fr')
        expect(PromptLanguage.GERMAN).toBe('de')
        expect(PromptLanguage.ITALIAN).toBe('it')
        expect(PromptLanguage.PORTUGUESE).toBe('pt')
        expect(PromptLanguage.RUSSIAN).toBe('ru')
        expect(PromptLanguage.CHINESE).toBe('zh')
        expect(PromptLanguage.JAPANESE).toBe('ja')
        expect(PromptLanguage.KOREAN).toBe('ko')
      })

      it('should have exactly 10 language values', () => {
        const languageValues = Object.values(PromptLanguage)
        expect(languageValues).toHaveLength(10)
      })

      it('should use standard language codes', () => {
        const languageCodes = Object.values(PromptLanguage)
        languageCodes.forEach(code => {
          expect(code).toMatch(/^[a-z]{2}$/)
        })
      })
    })

    describe('AIModel Enum', () => {
      it('should contain all expected AI model values', () => {
        expect(AIModel.GPT_4).toBe('gpt-4')
        expect(AIModel.GPT_4_TURBO).toBe('gpt-4-turbo')
        expect(AIModel.GPT_3_5_TURBO).toBe('gpt-3.5-turbo')
        expect(AIModel.CLAUDE_3_OPUS).toBe('claude-3-opus')
        expect(AIModel.CLAUDE_3_SONNET).toBe('claude-3-sonnet')
        expect(AIModel.CLAUDE_3_HAIKU).toBe('claude-3-haiku')
        expect(AIModel.GEMINI_PRO).toBe('gemini-pro')
        expect(AIModel.LLAMA_2).toBe('llama-2')
        expect(AIModel.MISTRAL_7B).toBe('mistral-7b')
      })

      it('should have exactly 9 AI model values', () => {
        const modelValues = Object.values(AIModel)
        expect(modelValues).toHaveLength(9)
      })

      it('should include popular AI models', () => {
        const modelValues = Object.values(AIModel)
        expect(modelValues).toContain('gpt-4')
        expect(modelValues).toContain('claude-3-opus')
        expect(modelValues).toContain('gemini-pro')
      })
    })
  })

  describe('Core Interfaces', () => {
    describe('PromptVariable Interface', () => {
      it('should accept all variable types', () => {
        const variableTypes: PromptVariable['type'][] = [
          'text', 'number', 'boolean', 'select', 'multiselect', 'date', 'textarea'
        ]

        variableTypes.forEach(type => {
          const variable: PromptVariable = {
            name: `test${type}`,
            type,
            label: `Test ${type}`,
            required: false,
          }
          expect(variable.type).toBe(type)
        })
      })

      it('should handle validation constraints', () => {
        const variableWithValidation: PromptVariable = {
          name: 'numberInput',
          type: 'number',
          label: 'Number Input',
          required: true,
          defaultValue: 10,
          validation: {
            min: 1,
            max: 100,
            message: 'Must be between 1 and 100',
          },
        }

        expect(variableWithValidation.validation?.min).toBe(1)
        expect(variableWithValidation.validation?.max).toBe(100)
        expect(variableWithValidation.validation?.message).toBe('Must be between 1 and 100')
      })

      it('should handle select options', () => {
        const selectVariable: PromptVariable = {
          name: 'category',
          type: 'select',
          label: 'Category',
          required: true,
          options: ['Option A', 'Option B', 'Option C'],
          defaultValue: 'Option A',
        }

        expect(selectVariable.options).toEqual(['Option A', 'Option B', 'Option C'])
        expect(selectVariable.defaultValue).toBe('Option A')
      })

      it('should work with minimal required fields', () => {
        const minimalVariable: PromptVariable = {
          name: 'simple',
          type: 'text',
          label: 'Simple Input',
          required: false,
        }

        expect(minimalVariable.description).toBeUndefined()
        expect(minimalVariable.defaultValue).toBeUndefined()
        expect(minimalVariable.options).toBeUndefined()
        expect(minimalVariable.validation).toBeUndefined()
      })
    })

    describe('Prompt Interface', () => {
      it('should accept complete prompt data', () => {
        const prompt: Prompt = mockPrompt

        expect(prompt._id).toBe('prompt-123')
        expect(prompt.title).toBe('Code Generator')
        expect(prompt.content).toBe('Generate {language} code for {task}')
        expect(prompt.category).toBe('Development')
        expect(prompt.tags).toEqual(['code', 'programming', 'ai'])
        expect(prompt.isActive).toBe(true)
        expect(prompt.usageCount).toBe(150)
        expect(prompt.isFavorite).toBe(true)
        expect(prompt.model).toBe(AIModel.GPT_4)
        expect(prompt.temperature).toBe(0.7)
        expect(prompt.variables).toHaveLength(1)
      })

      it('should work with minimal required fields', () => {
        const minimalPrompt: Prompt = {
          _id: 'minimal-123',
          id: 'minimal-123',
          title: 'Minimal Prompt',
          content: 'Simple prompt content',
          category: 'General',
          tags: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-123',
          usageCount: 0,
          isFavorite: false,
        }

        expect(minimalPrompt.variables).toBeUndefined()
        expect(minimalPrompt.description).toBeUndefined()
        expect(minimalPrompt.version).toBeUndefined()
        expect(minimalPrompt.language).toBeUndefined()
        expect(minimalPrompt.model).toBeUndefined()
      })

      it('should handle AI model settings', () => {
        const promptWithSettings: Prompt = {
          ...mockPrompt,
          temperature: 0.8,
          maxTokens: 4000,
          topP: 0.95,
          frequencyPenalty: 0.2,
          presencePenalty: 0.3,
        }

        expect(promptWithSettings.temperature).toBe(0.8)
        expect(promptWithSettings.maxTokens).toBe(4000)
        expect(promptWithSettings.topP).toBe(0.95)
        expect(promptWithSettings.frequencyPenalty).toBe(0.2)
        expect(promptWithSettings.presencePenalty).toBe(0.3)
      })
    })

    describe('PromptCategory Interface', () => {
      it('should accept complete category data', () => {
        const category: PromptCategory = mockCategory

        expect(category.name).toBe('Development')
        expect(category.description).toBe('Programming and development related prompts')
        expect(category.color).toBe('#3B82F6')
        expect(category.icon).toBe('code')
        expect(category.promptCount).toBe(25)
        expect(category.order).toBe(1)
      })

      it('should handle hierarchical categories', () => {
        const parentCategory: PromptCategory = {
          ...mockCategory,
          _id: 'parent-cat',
          id: 'parent-cat',
          name: 'Programming',
          parentId: undefined,
        }

        const childCategory: PromptCategory = {
          ...mockCategory,
          _id: 'child-cat',
          id: 'child-cat',
          name: 'Frontend',
          parentId: 'parent-cat',
        }

        expect(parentCategory.parentId).toBeUndefined()
        expect(childCategory.parentId).toBe('parent-cat')
      })
    })

    describe('PromptExecution Interface', () => {
      it('should accept complete execution data', () => {
        const execution: PromptExecution = {
          _id: 'exec-123',
          promptId: 'prompt-456',
          userId: 'user-789',
          input: { language: 'Python', task: 'sort array' },
          output: 'def sort_array(arr):\n    return sorted(arr)',
          model: AIModel.GPT_4,
          settings: {
            model: AIModel.GPT_4,
            temperature: 0.7,
            maxTokens: 1500,
            topP: 0.9,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
          executionTime: 2500,
          tokenUsage: {
            prompt: 50,
            completion: 80,
            total: 130,
          },
          cost: 0.0026,
          status: 'success',
          createdAt: new Date(),
        }

        expect(execution.status).toBe('success')
        expect(execution.tokenUsage.total).toBe(130)
        expect(execution.cost).toBe(0.0026)
        expect(execution.executionTime).toBe(2500)
      })

      it('should handle execution errors', () => {
        const failedExecution: PromptExecution = {
          _id: 'exec-failed',
          promptId: 'prompt-456',
          userId: 'user-789',
          input: { invalid: 'data' },
          output: '',
          model: AIModel.GPT_4,
          settings: {
            model: AIModel.GPT_4,
            temperature: 0.7,
            maxTokens: 1000,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0,
          },
          executionTime: 0,
          tokenUsage: { prompt: 0, completion: 0, total: 0 },
          cost: 0,
          status: 'error',
          error: 'Invalid input format',
          createdAt: new Date(),
        }

        expect(failedExecution.status).toBe('error')
        expect(failedExecution.error).toBe('Invalid input format')
        expect(failedExecution.cost).toBe(0)
      })
    })
  })

  describe('Request/Response Interfaces', () => {
    describe('CreatePromptData Interface', () => {
      it('should accept minimal create data', () => {
        const createData: CreatePromptData = {
          title: 'New Prompt',
          content: 'Prompt content here',
          category: 'General',
          tags: ['new', 'test'],
        }

        expect(createData.title).toBe('New Prompt')
        expect(createData.content).toBe('Prompt content here')
        expect(createData.category).toBe('General')
        expect(createData.tags).toEqual(['new', 'test'])
      })

      it('should accept complete create data', () => {
        const createData: CreatePromptData = {
          title: 'Advanced Prompt',
          content: 'Advanced prompt with variables',
          category: 'Development',
          tags: ['advanced', 'variables'],
          description: 'A complex prompt with multiple variables',
          variables: [mockPromptVariable],
          isActive: true,
          language: PromptLanguage.ENGLISH,
          model: AIModel.GPT_4_TURBO,
          temperature: 0.8,
          maxTokens: 3000,
          topP: 0.95,
          frequencyPenalty: 0.1,
          presencePenalty: 0.2,
        }

        expect(createData.variables).toHaveLength(1)
        expect(createData.model).toBe(AIModel.GPT_4_TURBO)
        expect(createData.temperature).toBe(0.8)
      })
    })

    describe('UpdatePromptData Interface', () => {
      it('should allow partial updates', () => {
        const updateData: UpdatePromptData = {
          title: 'Updated Title',
          isFavorite: true,
        }

        expect(updateData.title).toBe('Updated Title')
        expect(updateData.isFavorite).toBe(true)
        expect(updateData.content).toBeUndefined()
        expect(updateData.category).toBeUndefined()
      })

      it('should allow complete updates', () => {
        const updateData: UpdatePromptData = {
          title: 'Completely Updated',
          content: 'New content',
          category: 'Updated Category',
          tags: ['updated', 'new'],
          description: 'Updated description',
          variables: [],
          isActive: false,
          isFavorite: true,
          language: PromptLanguage.SPANISH,
          model: AIModel.CLAUDE_3_OPUS,
          temperature: 0.5,
          maxTokens: 2500,
          topP: 0.8,
          frequencyPenalty: 0.3,
          presencePenalty: 0.4,
        }

        expect(updateData.language).toBe(PromptLanguage.SPANISH)
        expect(updateData.model).toBe(AIModel.CLAUDE_3_OPUS)
        expect(updateData.variables).toEqual([])
      })
    })

    describe('PromptFilters Interface', () => {
      it('should accept comprehensive filters', () => {
        const filters: PromptFilters = {
          category: 'Development',
          tags: ['ai', 'code'],
          search: 'python generator',
          isActive: true,
          isFavorite: false,
          createdBy: 'user-123',
          language: PromptLanguage.ENGLISH,
          model: AIModel.GPT_4,
          dateFrom: new Date('2023-01-01'),
          dateTo: new Date('2023-12-31'),
          usageMin: 10,
          usageMax: 1000,
        }

        expect(filters.category).toBe('Development')
        expect(filters.tags).toEqual(['ai', 'code'])
        expect(filters.search).toBe('python generator')
        expect(filters.usageMin).toBe(10)
        expect(filters.usageMax).toBe(1000)
      })

      it('should work with partial filters', () => {
        const partialFilters: PromptFilters = {
          isActive: true,
          tags: ['important'],
        }

        expect(partialFilters.isActive).toBe(true)
        expect(partialFilters.tags).toEqual(['important'])
        expect(partialFilters.category).toBeUndefined()
      })
    })

    describe('PromptsResponse Interface', () => {
      it('should provide paginated response structure', () => {
        const response: PromptsResponse = {
          prompts: [mockPrompt],
          total: 100,
          page: 1,
          limit: 20,
          totalPages: 5,
        }

        expect(response.prompts).toHaveLength(1)
        expect(response.total).toBe(100)
        expect(response.totalPages).toBe(5)
      })
    })
  })

  describe('Utility Types', () => {
    describe('PromptWithCategory Type', () => {
      it('should combine prompt with category info', () => {
        const promptWithCategory: PromptWithCategory = {
          ...mockPrompt,
          categoryInfo: mockCategory,
        }

        expect(promptWithCategory.title).toBe('Code Generator')
        expect(promptWithCategory.categoryInfo.name).toBe('Development')
        expect(promptWithCategory.categoryInfo.color).toBe('#3B82F6')
      })
    })

    describe('PromptWithStats Type', () => {
      it('should combine prompt with statistics', () => {
        const promptWithStats: PromptWithStats = {
          ...mockPrompt,
          executionCount: 50,
          averageRating: 4.5,
          lastUsed: new Date('2023-12-01T10:00:00Z'),
        }

        expect(promptWithStats.executionCount).toBe(50)
        expect(promptWithStats.averageRating).toBe(4.5)
        expect(promptWithStats.lastUsed).toBeInstanceOf(Date)
      })
    })

    describe('PromptSearchResult Type', () => {
      it('should provide search result with highlights', () => {
        const searchResult: PromptSearchResult = {
          prompt: mockPrompt,
          score: 0.85,
          highlights: {
            title: '<mark>Code</mark> Generator',
            content: 'Generate <mark>Python</mark> code',
            tags: ['<mark>code</mark>', 'programming'],
          },
        }

        expect(searchResult.score).toBe(0.85)
        expect(searchResult.highlights.title).toContain('<mark>')
        expect(searchResult.highlights.tags).toContain('<mark>code</mark>')
      })
    })
  })

  describe('Data Validation and Edge Cases', () => {
    it('should handle prompts with no variables', () => {
      const promptWithoutVariables: Prompt = {
        ...mockPrompt,
        variables: undefined,
      }

      expect(promptWithoutVariables.variables).toBeUndefined()
    })

    it('should handle prompts with many variables', () => {
      const manyVariables: PromptVariable[] = Array.from({ length: 20 }, (_, i) => ({
        name: `var${i}`,
        type: 'text',
        label: `Variable ${i}`,
        required: i % 2 === 0,
      }))

      const promptWithManyVariables: Prompt = {
        ...mockPrompt,
        variables: manyVariables,
      }

      expect(promptWithManyVariables.variables).toHaveLength(20)
      expect(promptWithManyVariables.variables?.filter(v => v.required)).toHaveLength(10)
    })

    it('should handle various AI model settings ranges', () => {
      const extremeSettings: Partial<Prompt> = {
        temperature: 0,
        maxTokens: 1,
        topP: 0,
        frequencyPenalty: -2,
        presencePenalty: 2,
      }

      // These should be valid according to typical AI model constraints
      expect(extremeSettings.temperature).toBe(0)
      expect(extremeSettings.maxTokens).toBe(1)
      expect(extremeSettings.topP).toBe(0)
      expect(extremeSettings.frequencyPenalty).toBe(-2)
      expect(extremeSettings.presencePenalty).toBe(2)
    })

    it('should handle complex variable validation patterns', () => {
      const complexVariable: PromptVariable = {
        name: 'email',
        type: 'text',
        label: 'Email Address',
        required: true,
        validation: {
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          message: 'Please enter a valid email address',
        },
      }

      expect(complexVariable.validation?.pattern).toContain('@')
      expect(complexVariable.validation?.message).toContain('email')
    })

    it('should handle empty and null values gracefully', () => {
      const promptWithEmptyValues: Partial<Prompt> = {
        tags: [],
        variables: [],
        description: '',
        metadata: undefined,
      }

      expect(Array.isArray(promptWithEmptyValues.tags)).toBe(true)
      expect(promptWithEmptyValues.tags).toHaveLength(0)
      expect(Array.isArray(promptWithEmptyValues.variables)).toBe(true)
      expect(promptWithEmptyValues.variables).toHaveLength(0)
    })
  })

  describe('Complex Data Structures', () => {
    it('should handle prompt collections', () => {
      const collection: PromptCollection = {
        _id: 'collection-123',
        id: 'collection-123',
        name: 'AI Development Tools',
        description: 'Collection of prompts for AI development',
        prompts: ['prompt-1', 'prompt-2', 'prompt-3'],
        isPublic: true,
        tags: ['ai', 'development', 'tools'],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-123',
        collaborators: ['user-456', 'user-789'],
        shareSettings: {
          canView: true,
          canEdit: false,
          canExecute: true,
        },
      }

      expect(collection.prompts).toHaveLength(3)
      expect(collection.collaborators).toHaveLength(2)
      expect(collection.shareSettings.canView).toBe(true)
      expect(collection.shareSettings.canEdit).toBe(false)
    })

    it('should handle prompt templates with reviews', () => {
      const reviews: PromptReview[] = [
        {
          _id: 'review-1',
          userId: 'user-123',
          userName: 'John Doe',
          rating: 5,
          comment: 'Excellent prompt!',
          createdAt: new Date(),
          isHelpful: true,
        },
        {
          _id: 'review-2',
          userId: 'user-456',
          userName: 'Jane Smith',
          rating: 4,
          comment: 'Very useful',
          createdAt: new Date(),
          isHelpful: true,
        },
      ]

      const template: PromptTemplate = {
        _id: 'template-123',
        id: 'template-123',
        name: 'Code Review Template',
        description: 'Template for code review prompts',
        template: 'Review this {language} code: {code}',
        variables: [
          {
            name: 'language',
            type: 'select',
            label: 'Programming Language',
            required: true,
            options: ['JavaScript', 'Python', 'Java'],
          },
          {
            name: 'code',
            type: 'textarea',
            label: 'Code to Review',
            required: true,
          },
        ],
        category: 'Code Review',
        tags: ['review', 'code', 'quality'],
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-123',
        usageCount: 75,
        rating: 4.5,
        reviews,
      }

      expect(template.reviews).toHaveLength(2)
      expect(template.variables).toHaveLength(2)
      expect(template.rating).toBe(4.5)
    })
  })

  describe('Performance Considerations', () => {
    it('should handle large prompt datasets efficiently', () => {
      const largePromptArray = Array.from({ length: 1000 }, (_, index) => ({
        ...mockPrompt,
        _id: `prompt-${index}`,
        id: `prompt-${index}`,
        title: `Prompt ${index}`,
        usageCount: Math.floor(Math.random() * 1000),
      }))

      const start = performance.now()
      
      // Simulate filtering and sorting operations
      const activePrompts = largePromptArray.filter(p => p.isActive)
      const sortedByUsage = largePromptArray.sort((a, b) => b.usageCount - a.usageCount)
      const topPrompts = sortedByUsage.slice(0, 10)
      
      const end = performance.now()

      expect(largePromptArray).toHaveLength(1000)
      expect(activePrompts.length).toBeGreaterThan(0)
      expect(topPrompts).toHaveLength(10)
      expect(end - start).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should handle complex search and filter operations', () => {
      const complexFilters: PromptFilters = {
        search: 'machine learning python neural network',
        tags: ['ai', 'ml', 'neural', 'python'],
        category: 'Machine Learning',
        isActive: true,
        language: PromptLanguage.ENGLISH,
        model: AIModel.GPT_4,
        usageMin: 50,
        usageMax: 500,
        dateFrom: new Date('2023-01-01'),
        dateTo: new Date('2023-12-31'),
      }

      // Verify complex filter structure
      expect(complexFilters.tags).toHaveLength(4)
      expect(complexFilters.search?.split(' ')).toHaveLength(5)
      expect(complexFilters.dateFrom).toBeInstanceOf(Date)
      expect(complexFilters.dateTo).toBeInstanceOf(Date)
    })
  })
})
