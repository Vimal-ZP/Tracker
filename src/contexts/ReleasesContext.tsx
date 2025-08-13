'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Release, ReleaseFilters, ReleasesResponse, CreateReleaseData, UpdateReleaseData } from '@/types/release';
import { toast } from 'react-hot-toast';

interface ReleasesContextType {
  // State
  releases: Release[];
  currentRelease: Release | null;
  loading: boolean;
  filters: ReleaseFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  fetchReleases: (page?: number, newFilters?: ReleaseFilters) => Promise<void>;
  fetchRelease: (id: string) => Promise<Release | null>;
  createRelease: (data: CreateReleaseData) => Promise<Release | null>;
  updateRelease: (data: UpdateReleaseData) => Promise<Release | null>;
  deleteRelease: (id: string) => Promise<boolean>;
  setFilters: (filters: ReleaseFilters) => void;
  clearFilters: () => void;
  setCurrentRelease: (release: Release | null) => void;
  incrementDownloadCount: (id: string) => Promise<void>;
}

const ReleasesContext = createContext<ReleasesContextType | undefined>(undefined);

interface ReleasesProviderProps {
  children: React.ReactNode;
}

export function ReleasesProvider({ children }: ReleasesProviderProps) {
  const [releases, setReleases] = useState<Release[]>([]);
  const [currentRelease, setCurrentRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<ReleaseFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchReleases = useCallback(async (page = 1, newFilters?: ReleaseFilters) => {
    try {
      setLoading(true);
      const activeFilters = newFilters || filters;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(activeFilters.status && { status: activeFilters.status }),
        ...(activeFilters.type && { type: activeFilters.type }),
        ...(activeFilters.search && { search: activeFilters.search }),
        ...(activeFilters.dateFrom && { dateFrom: activeFilters.dateFrom.toISOString() }),
        ...(activeFilters.dateTo && { dateTo: activeFilters.dateTo.toISOString() })
      });

      const response = await fetch(`/api/releases?${params}`);
      if (!response.ok) throw new Error('Failed to fetch releases');

      const data: ReleasesResponse = await response.json();
      setReleases(data.releases);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });

      if (newFilters) {
        setFiltersState(newFilters);
      }
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast.error('Failed to fetch releases');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  const fetchRelease = useCallback(async (id: string): Promise<Release | null> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/releases/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Release not found');
          return null;
        }
        throw new Error('Failed to fetch release');
      }

      const release: Release = await response.json();
      setCurrentRelease(release);
      return release;
    } catch (error) {
      console.error('Error fetching release:', error);
      toast.error('Failed to fetch release');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRelease = useCallback(async (data: CreateReleaseData): Promise<Release | null> => {
    try {
      setLoading(true);
      const response = await fetch('/api/releases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create release');
      }

      const result = await response.json();
      const newRelease = result.release;
      
      setReleases(prev => [newRelease, ...prev]);
      toast.success('Release created successfully');
      return newRelease;
    } catch (error: any) {
      console.error('Error creating release:', error);
      toast.error(error.message || 'Failed to create release');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRelease = useCallback(async (data: UpdateReleaseData): Promise<Release | null> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/releases/${data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update release');
      }

      const result = await response.json();
      const updatedRelease = result.release;
      
      setReleases(prev => prev.map(release => 
        release._id === updatedRelease._id ? updatedRelease : release
      ));
      
      if (currentRelease && currentRelease._id === updatedRelease._id) {
        setCurrentRelease(updatedRelease);
      }
      
      toast.success('Release updated successfully');
      return updatedRelease;
    } catch (error: any) {
      console.error('Error updating release:', error);
      toast.error(error.message || 'Failed to update release');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentRelease]);

  const deleteRelease = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/releases/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete release');
      }

      setReleases(prev => prev.filter(release => release._id !== id));
      
      if (currentRelease && currentRelease._id === id) {
        setCurrentRelease(null);
      }
      
      toast.success('Release deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting release:', error);
      toast.error(error.message || 'Failed to delete release');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentRelease]);

  const setFilters = useCallback((newFilters: ReleaseFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const incrementDownloadCount = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/releases/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'increment_download' })
      });

      if (!response.ok) throw new Error('Failed to increment download count');

      const result = await response.json();
      
      // Update local state
      setReleases(prev => prev.map(release => 
        release._id === id 
          ? { ...release, downloadCount: result.downloadCount }
          : release
      ));
      
      if (currentRelease && currentRelease._id === id) {
        setCurrentRelease(prev => prev ? { ...prev, downloadCount: result.downloadCount } : null);
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
      // Don't show error toast for this as it's not critical
    }
  }, [currentRelease]);

  const value: ReleasesContextType = {
    // State
    releases,
    currentRelease,
    loading,
    filters,
    pagination,

    // Actions
    fetchReleases,
    fetchRelease,
    createRelease,
    updateRelease,
    deleteRelease,
    setFilters,
    clearFilters,
    setCurrentRelease,
    incrementDownloadCount
  };

  return (
    <ReleasesContext.Provider value={value}>
      {children}
    </ReleasesContext.Provider>
  );
}

export function useReleases(): ReleasesContextType {
  const context = useContext(ReleasesContext);
  if (context === undefined) {
    throw new Error('useReleases must be used within a ReleasesProvider');
  }
  return context;
}
