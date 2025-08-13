// Prompt-related TypeScript interfaces and types

export interface Prompt {
  _id: string;
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  usageCount: number;
  isFavorite: boolean;
  variables?: PromptVariable[];
  description?: string;
  version?: string;
  language?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface PromptVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'textarea';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select/multiselect types
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface PromptCategory {
  _id: string;
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  promptCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  parentId?: string;
  order: number;
}

export interface PromptTemplate {
  _id: string;
  id: string;
  name: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  usageCount: number;
  rating: number;
  reviews: PromptReview[];
}

export interface PromptReview {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  isHelpful: boolean;
}

export interface PromptExecution {
  _id: string;
  promptId: string;
  userId: string;
  input: { [key: string]: any };
  output: string;
  model: string;
  settings: PromptSettings;
  executionTime: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
  status: 'success' | 'error' | 'timeout';
  error?: string;
  createdAt: Date;
}

export interface PromptSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences?: string[];
}

export interface PromptCollection {
  _id: string;
  id: string;
  name: string;
  description: string;
  prompts: string[]; // Array of prompt IDs
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  collaborators: string[];
  shareSettings: {
    canView: boolean;
    canEdit: boolean;
    canExecute: boolean;
  };
}

// Request/Response types
export interface CreatePromptData {
  title: string;
  content: string;
  category: string;
  tags: string[];
  description?: string;
  variables?: PromptVariable[];
  isActive?: boolean;
  language?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface UpdatePromptData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  description?: string;
  variables?: PromptVariable[];
  isActive?: boolean;
  isFavorite?: boolean;
  language?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  color: string;
  icon: string;
  parentId?: string;
  order?: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
}

export interface ExecutePromptData {
  promptId: string;
  variables: { [key: string]: any };
  settings?: Partial<PromptSettings>;
}

export interface PromptFilters {
  category?: string;
  tags?: string[];
  search?: string;
  isActive?: boolean;
  isFavorite?: boolean;
  createdBy?: string;
  language?: string;
  model?: string;
  dateFrom?: Date;
  dateTo?: Date;
  usageMin?: number;
  usageMax?: number;
}

export interface PromptSortOptions {
  field: 'title' | 'createdAt' | 'updatedAt' | 'usageCount' | 'rating';
  order: 'asc' | 'desc';
}

export interface PromptStats {
  totalPrompts: number;
  activePrompts: number;
  favoritePrompts: number;
  totalUsage: number;
  totalExecutions: number;
  averageRating: number;
  categoryStats: { [key: string]: number };
  tagStats: { [key: string]: number };
  modelStats: { [key: string]: number };
  languageStats: { [key: string]: number };
  usageByMonth: { month: string; count: number }[];
  topPrompts: Prompt[];
  recentPrompts: Prompt[];
}

// Enums
export enum PromptStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated'
}

export enum PromptType {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  FUNCTION = 'function'
}

export enum PromptLanguage {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  ITALIAN = 'it',
  PORTUGUESE = 'pt',
  RUSSIAN = 'ru',
  CHINESE = 'zh',
  JAPANESE = 'ja',
  KOREAN = 'ko'
}

export enum AIModel {
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  CLAUDE_3_OPUS = 'claude-3-opus',
  CLAUDE_3_SONNET = 'claude-3-sonnet',
  CLAUDE_3_HAIKU = 'claude-3-haiku',
  GEMINI_PRO = 'gemini-pro',
  LLAMA_2 = 'llama-2',
  MISTRAL_7B = 'mistral-7b'
}

// Utility types
export type PromptWithCategory = Prompt & {
  categoryInfo: PromptCategory;
};

export type PromptWithStats = Prompt & {
  executionCount: number;
  averageRating: number;
  lastUsed: Date;
};

export type PromptSearchResult = {
  prompt: Prompt;
  score: number;
  highlights: {
    title?: string;
    content?: string;
    tags?: string[];
  };
};

// API Response types
export interface PromptsResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriesResponse {
  categories: PromptCategory[];
  total: number;
}

export interface PromptExecutionResponse {
  execution: PromptExecution;
  result: string;
  usage: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: number;
}

export interface PromptStatsResponse {
  stats: PromptStats;
}
