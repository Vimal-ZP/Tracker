'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

// Types for prompts
export interface Prompt {
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
}

export interface PromptCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  promptCount: number;
}

export interface CreatePromptData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface UpdatePromptData {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  isFavorite?: boolean;
}

export interface PromptFilters {
  category?: string;
  tags?: string[];
  search?: string;
  isActive?: boolean;
  isFavorite?: boolean;
  createdBy?: string;
}

// Context state interface
interface PromptsContextState {
  // Data
  prompts: Prompt[];
  categories: PromptCategory[];
  selectedPrompt: Prompt | null;
  
  // Loading states
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  
  // Filters and search
  filters: PromptFilters;
  searchTerm: string;
  selectedCategory: string | null;
  
  // UI state
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteConfirm: boolean;
  viewMode: 'grid' | 'list';
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'usageCount';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  fetchPrompts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createPrompt: (data: CreatePromptData) => Promise<void>;
  updatePrompt: (id: string, data: UpdatePromptData) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  duplicatePrompt: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  incrementUsage: (id: string) => Promise<void>;
  
  // Selection and UI actions
  selectPrompt: (prompt: Prompt | null) => void;
  setFilters: (filters: PromptFilters) => void;
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sortBy: 'title' | 'createdAt' | 'updatedAt' | 'usageCount') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Modal actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (prompt: Prompt) => void;
  closeEditModal: () => void;
  openDeleteConfirm: (prompt: Prompt) => void;
  closeDeleteConfirm: () => void;
  
  // Utility functions
  getFilteredPrompts: () => Prompt[];
  getPromptsByCategory: (categoryId: string) => Prompt[];
  getFavoritePrompts: () => Prompt[];
  getRecentPrompts: (limit?: number) => Prompt[];
  getMostUsedPrompts: (limit?: number) => Prompt[];
  searchPrompts: (query: string) => Prompt[];
  
  // Statistics
  getTotalPrompts: () => number;
  getActivePrompts: () => number;
  getFavoriteCount: () => number;
  getTotalUsage: () => number;
  getCategoryStats: () => { [key: string]: number };
}

// Create context
const PromptsContext = createContext<PromptsContextState | undefined>(undefined);

// Provider component
export function PromptsProvider({ children }: { children: React.ReactNode }) {
  // State
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Filters and search
  const [filters, setFilters] = useState<PromptFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt' | 'usageCount'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // API Actions
  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/prompt-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const createPrompt = useCallback(async (data: CreatePromptData) => {
    try {
      setSaving(true);
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const newPrompt = await response.json();
        setPrompts(prev => [newPrompt, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating prompt:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePrompt = useCallback(async (id: string, data: UpdatePromptData) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const updatedPrompt = await response.json();
        setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));
        setSelectedPrompt(updatedPrompt);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  const deletePrompt = useCallback(async (id: string) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPrompts(prev => prev.filter(p => p.id !== id));
        setSelectedPrompt(null);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
    } finally {
      setDeleting(false);
    }
  }, []);

  const duplicatePrompt = useCallback(async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      const duplicateData: CreatePromptData = {
        title: `${prompt.title} (Copy)`,
        content: prompt.content,
        category: prompt.category,
        tags: [...prompt.tags],
      };
      await createPrompt(duplicateData);
    }
  }, [prompts, createPrompt]);

  const toggleFavorite = useCallback(async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      await updatePrompt(id, { isFavorite: !prompt.isFavorite });
    }
  }, [prompts, updatePrompt]);

  const incrementUsage = useCallback(async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      await updatePrompt(id, { usageCount: prompt.usageCount + 1 });
    }
  }, [prompts, updatePrompt]);

  // Selection and UI actions
  const selectPrompt = useCallback((prompt: Prompt | null) => {
    setSelectedPrompt(prompt);
  }, []);

  // Modal actions
  const openCreateModal = useCallback(() => setShowCreateModal(true), []);
  const closeCreateModal = useCallback(() => setShowCreateModal(false), []);
  
  const openEditModal = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowEditModal(true);
  }, []);
  const closeEditModal = useCallback(() => setShowEditModal(false), []);
  
  const openDeleteConfirm = useCallback((prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowDeleteConfirm(true);
  }, []);
  const closeDeleteConfirm = useCallback(() => setShowDeleteConfirm(false), []);

  // Utility functions
  const getFilteredPrompts = useCallback(() => {
    let filtered = [...prompts];

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        filters.tags!.some(tag => p.tags.includes(tag))
      );
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.content.toLowerCase().includes(search) ||
        p.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    if (filters.isActive !== undefined) {
      filtered = filtered.filter(p => p.isActive === filters.isActive);
    }
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(p => p.isFavorite === filters.isFavorite);
    }
    if (filters.createdBy) {
      filtered = filtered.filter(p => p.createdBy === filters.createdBy);
    }

    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search) ||
        p.content.toLowerCase().includes(search) ||
        p.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [prompts, filters, searchTerm, selectedCategory, sortBy, sortOrder]);

  const getPromptsByCategory = useCallback((categoryId: string) => {
    return prompts.filter(p => p.category === categoryId);
  }, [prompts]);

  const getFavoritePrompts = useCallback(() => {
    return prompts.filter(p => p.isFavorite);
  }, [prompts]);

  const getRecentPrompts = useCallback((limit = 10) => {
    return [...prompts]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }, [prompts]);

  const getMostUsedPrompts = useCallback((limit = 10) => {
    return [...prompts]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }, [prompts]);

  const searchPrompts = useCallback((query: string) => {
    const search = query.toLowerCase();
    return prompts.filter(p => 
      p.title.toLowerCase().includes(search) ||
      p.content.toLowerCase().includes(search) ||
      p.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }, [prompts]);

  // Statistics
  const getTotalPrompts = useCallback(() => prompts.length, [prompts]);
  const getActivePrompts = useCallback(() => prompts.filter(p => p.isActive).length, [prompts]);
  const getFavoriteCount = useCallback(() => prompts.filter(p => p.isFavorite).length, [prompts]);
  const getTotalUsage = useCallback(() => prompts.reduce((sum, p) => sum + p.usageCount, 0), [prompts]);
  
  const getCategoryStats = useCallback(() => {
    const stats: { [key: string]: number } = {};
    prompts.forEach(p => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });
    return stats;
  }, [prompts]);

  const value: PromptsContextState = {
    // Data
    prompts,
    categories,
    selectedPrompt,
    
    // Loading states
    loading,
    saving,
    deleting,
    
    // Filters and search
    filters,
    searchTerm,
    selectedCategory,
    
    // UI state
    showCreateModal,
    showEditModal,
    showDeleteConfirm,
    viewMode,
    sortBy,
    sortOrder,
    
    // Actions
    fetchPrompts,
    fetchCategories,
    createPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    toggleFavorite,
    incrementUsage,
    
    // Selection and UI actions
    selectPrompt,
    setFilters,
    setSearchTerm,
    setSelectedCategory,
    setViewMode,
    setSortBy,
    setSortOrder,
    
    // Modal actions
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    
    // Utility functions
    getFilteredPrompts,
    getPromptsByCategory,
    getFavoritePrompts,
    getRecentPrompts,
    getMostUsedPrompts,
    searchPrompts,
    
    // Statistics
    getTotalPrompts,
    getActivePrompts,
    getFavoriteCount,
    getTotalUsage,
    getCategoryStats,
  };

  return (
    <PromptsContext.Provider value={value}>
      {children}
    </PromptsContext.Provider>
  );
}

// Hook to use the prompts context
export function usePrompts() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}
