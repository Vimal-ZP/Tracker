'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts';
import { Release, ReleaseStatus, ReleaseType, FeatureCategory, WorkItem, WorkItemType } from '@/types/release';
import { rolePermissions } from '@/types/user';
import {
  Package,
  Calendar,
  Download,
  Edit,
  ArrowLeft,
  Tag,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Bug,
  AlertTriangle,
  ExternalLink,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Copy,
  Eye,
  Mountain,
  Zap,
  FileText,
  Shield,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import WorkItemModal, { WorkItemFormData } from '@/components/releases/WorkItemModal';

export default function ReleaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [release, setRelease] = useState<Release | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingWorkItem, setIsAddingWorkItem] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showBulkDeleteConfirmation, setShowBulkDeleteConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WorkItem | null>(null);
  const [showWorkItemModal, setShowWorkItemModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'createChild' | 'createEpic'>('create');
  const [modalWorkItem, setModalWorkItem] = useState<WorkItem | null>(null);
  const [modalParentItem, setModalParentItem] = useState<WorkItem | null>(null);

  // Close drawer on escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };

    // Prevent body scroll on mobile when drawer is open
    if (typeof window !== 'undefined') {
      if (isDrawerOpen && window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      }
    };
  }, [isDrawerOpen]);
  const [workItemFormData, setWorkItemFormData] = useState<Omit<WorkItem, '_id' | 'createdAt' | 'updatedAt'>>({
    type: WorkItemType.EPIC,
    title: '',
    flagName: '',
    remarks: '',
    hyperlink: '',
    parentId: undefined,
    actualHours: undefined
  });

  const permissions = user ? rolePermissions[user.role] : null;

  useEffect(() => {
    if (params.id) {
      fetchRelease();
    }
  }, [params.id]);

  // Handle editWorkItem query parameter
  useEffect(() => {
    const editWorkItemId = searchParams.get('editWorkItem');
    if (editWorkItemId && release?.workItems) {
      const workItemToEdit = release.workItems.find(item => item._id === editWorkItemId);
      if (workItemToEdit) {
        handleEditWorkItem(workItemToEdit);
      }
    }
  }, [searchParams, release]);

  const fetchRelease = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/releases/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Release not found');
          router.push('/releases');
          return;
        }
        throw new Error('Failed to fetch release');
      }

      const data = await response.json();
      setRelease(data);
    } catch (error) {
      console.error('Error fetching release:', error);
      toast.error('Failed to fetch release');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!release?.downloadUrl) return;

    try {
      // Open download URL
      window.open(release.downloadUrl, '_blank');

      toast.success('Download started');
    } catch (error) {
      console.error('Error handling download:', error);
      toast.error('Failed to process download');
    }
  };

  const getStatusIcon = (status: ReleaseStatus) => {
    switch (status) {
      case ReleaseStatus.DRAFT:
        return <Clock className="w-5 h-5 text-gray-500" />;
      case ReleaseStatus.BETA:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case ReleaseStatus.STABLE:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case ReleaseStatus.DEPRECATED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ReleaseStatus) => {
    switch (status) {
      case ReleaseStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case ReleaseStatus.BETA:
        return 'bg-yellow-100 text-yellow-800';
      case ReleaseStatus.STABLE:
        return 'bg-green-100 text-green-800';
      case ReleaseStatus.DEPRECATED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: ReleaseType) => {
    switch (type) {
      case ReleaseType.MAJOR:
        return 'bg-purple-100 text-purple-800';
      case ReleaseType.MINOR:
        return 'bg-blue-100 text-blue-800';
      case ReleaseType.PATCH:
        return 'bg-green-100 text-green-800';
      case ReleaseType.HOTFIX:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: FeatureCategory) => {
    switch (category) {
      case FeatureCategory.NEW:
        return <Star className="w-4 h-4 text-blue-500" />;
      case FeatureCategory.IMPROVED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case FeatureCategory.SECURITY:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case FeatureCategory.PERFORMANCE:
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <Star className="w-4 h-4 text-blue-500" />;
    }
  };

  // Work Item CRUD functions
  const getValidParents = (type: WorkItemType, workItems: WorkItem[]) => {
    switch (type) {
      case WorkItemType.FEATURE:
        return workItems.filter(item => item.type === WorkItemType.EPIC);
      case WorkItemType.USER_STORY:
        return workItems.filter(item => item.type === WorkItemType.FEATURE);
      case WorkItemType.BUG:
        return workItems.filter(item => item.type === WorkItemType.USER_STORY);
      default:
        return [];
    }
  };

  const handleAddWorkItem = (type: WorkItemType, parentId?: string) => {
    setIsAddingWorkItem(true);
    setEditingWorkItem(null);
    setWorkItemFormData({
      type,
      title: '',
      flagName: '',
      remarks: '',
      hyperlink: '',
      parentId,
      actualHours: undefined
    });
  };

  const handleEditWorkItem = (item: WorkItem) => {
    setEditingWorkItem(item);
    setIsAddingWorkItem(true);
    setWorkItemFormData({
      type: item.type,
      title: item.title,
      flagName: item.flagName || '',
      remarks: item.remarks || '',
      hyperlink: item.hyperlink || '',
      parentId: item.parentId,
      actualHours: item.actualHours
    });
  };

  const handleSaveWorkItem = async () => {
    if (!release) return;

    try {
      let updatedWorkItems = [...(release.workItems || [])];

      if (editingWorkItem) {
        // Update existing work item
        const index = updatedWorkItems.findIndex(item => item._id === editingWorkItem._id);
        if (index !== -1) {
          updatedWorkItems[index] = { ...editingWorkItem, ...workItemFormData };
        }
      } else {
        // Add new work item
        updatedWorkItems.push({ ...workItemFormData, _id: Date.now().toString() });
      }

      // Update release with new work items
      const response = await fetch(`/api/releases/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...release,
          workItems: updatedWorkItems
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update release');
      }

      const updatedRelease = await response.json();
      setRelease(updatedRelease.release);
      setIsAddingWorkItem(false);
      setEditingWorkItem(null);
      toast.success(editingWorkItem ? 'Work item updated successfully' : 'Work item added successfully');
    } catch (error) {
      console.error('Error saving work item:', error);
      toast.error('Failed to save work item');
    }
  };

  const handleDeleteWorkItem = async (itemId: string) => {
    if (!release) return;

    // Find the item to get its title for confirmation
    const itemToDelete = release.workItems.find(item => item._id === itemId);
    if (!itemToDelete) return;

    setItemToDelete(itemToDelete);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteWorkItem = async () => {
    if (!release || !itemToDelete) return;

    try {
      // Remove the item and all its children
      const removeItemAndChildren = (items: WorkItem[], targetId: string): WorkItem[] => {
        return items.filter(item => {
          if (item._id === targetId) return false;
          if (item.parentId === targetId) return false;
          // Check if any parent in the chain is being removed
          let currentParentId = item.parentId;
          while (currentParentId) {
            if (currentParentId === targetId) return false;
            const parent = items.find(p => p._id === currentParentId);
            currentParentId = parent?.parentId || '';
          }
          return true;
        });
      };

      const updatedWorkItems = removeItemAndChildren(release.workItems || [], itemToDelete._id!);

      const response = await fetch(`/api/releases/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...release,
          workItems: updatedWorkItems
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update release');
      }

      const updatedRelease = await response.json();
      setRelease(updatedRelease.release);
      toast.success('Work item deleted successfully');
    } catch (error) {
      console.error('Error deleting work item:', error);
      toast.error('Failed to delete work item');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleCancelWorkItem = () => {
    setIsAddingWorkItem(false);
    setEditingWorkItem(null);
  };

  // Modal handlers
  const handleOpenEditModal = (item: WorkItem) => {
    setModalMode('edit');
    setModalWorkItem(item);
    setModalParentItem(null);
    setShowWorkItemModal(true);
  };

  const handleOpenCreateChildModal = (parentItem: WorkItem) => {
    setModalMode('createChild');
    setModalWorkItem(null);
    setModalParentItem(parentItem);
    setShowWorkItemModal(true);
  };

  const handleCloseModal = () => {
    setShowWorkItemModal(false);
    setModalMode('create');
    setModalWorkItem(null);
    setModalParentItem(null);
  };

  const handleModalSubmit = async (formData: WorkItemFormData) => {
    if (!release) return;

    try {
      let updatedWorkItems;

      if (modalMode === 'edit' && modalWorkItem) {
        // Update existing work item
        updatedWorkItems = release.workItems.map(item =>
          item._id === modalWorkItem._id
            ? {
              ...item,
              id: formData.id,
              title: formData.title,
              flagName: formData.flagName,
              remarks: formData.remarks,
              hyperlink: formData.hyperlink,
              parentId: formData.parentId || undefined
            }
            : item
        );
      } else {
        // Create new work item
        const newWorkItem: Omit<WorkItem, '_id'> = {
          type: formData.type,
          id: formData.id,
          title: formData.title,
          flagName: formData.flagName,
          remarks: formData.remarks,
          hyperlink: formData.hyperlink,
          parentId: formData.parentId || undefined
        };

        updatedWorkItems = [...(release.workItems || []), newWorkItem];
      }

      const response = await fetch(`/api/releases/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...release,
          workItems: updatedWorkItems
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update release');
      }

      const updatedRelease = await response.json();
      setRelease(updatedRelease.release);
      handleCloseModal();

      toast.success(modalMode === 'edit' ? 'Work item updated successfully' : 'Work item created successfully');
    } catch (error) {
      console.error('Error saving work item:', error);
      toast.error('Failed to save work item');
    }
  };

  const handleDuplicateWorkItem = (item: WorkItem) => {
    setIsAddingWorkItem(true);
    setEditingWorkItem(null);
    setWorkItemFormData({
      type: item.type,
      title: `${item.title} (Copy)`,
      flagName: item.flagName || '',
      remarks: item.remarks || '',
      hyperlink: item.hyperlink || '',
      parentId: item.parentId,
      actualHours: undefined // Reset hours for duplicate
    });
  };

  // Bulk operations
  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (!release?.workItems) return;

    if (selectedItems.size === release.workItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(release.workItems.map(item => item._id!)));
    }
  };

  const handleBulkDelete = async () => {
    if (!release || selectedItems.size === 0) return;

    setShowBulkDeleteConfirmation(true);
  };

  const confirmBulkDelete = async () => {
    if (!release || selectedItems.size === 0) return;

    try {
      // Remove selected items and their children
      const removeSelectedAndChildren = (items: WorkItem[]): WorkItem[] => {
        return items.filter(item => {
          // If item is selected, remove it
          if (selectedItems.has(item._id!)) return false;

          // If item's parent is selected (or any ancestor), remove it
          let currentParentId = item.parentId;
          while (currentParentId) {
            if (selectedItems.has(currentParentId)) return false;
            const parent = items.find(p => p._id === currentParentId);
            currentParentId = parent?.parentId || '';
          }
          return true;
        });
      };

      const updatedWorkItems = removeSelectedAndChildren(release.workItems);

      const response = await fetch(`/api/releases/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...release,
          workItems: updatedWorkItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete work items');
      }

      const updatedRelease = await response.json();
      setRelease(updatedRelease.release);
      setSelectedItems(new Set());
      toast.success(`Successfully deleted ${Array.from(selectedItems).length} work item(s)`);
    } catch (error) {
      console.error('Error deleting work items:', error);
      toast.error('Failed to delete work items');
    }
  };

  // Helper functions for work items
  const getWorkItemTypeIcon = (type: WorkItemType | string) => {
    const normalizedType = typeof type === 'string' ? type.toLowerCase() : type;

    switch (normalizedType) {
      case WorkItemType.EPIC:
      case 'epic':
        return <Layers className="w-4 h-4 text-purple-600" />; // Azure DevOps Epic style
      case WorkItemType.FEATURE:
      case 'feature':
        return <Sparkles className="w-4 h-4 text-blue-500" />; // Azure DevOps Feature style
      case WorkItemType.USER_STORY:
      case 'user_story':
        return <BookOpen className="w-4 h-4 text-green-500" />; // Azure DevOps User Story style
      case WorkItemType.BUG:
      case 'bug':
        return <AlertCircle className="w-4 h-4 text-red-500" />; // Azure DevOps Bug style
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getWorkItemTypeColor = (type: WorkItemType | string) => {
    const normalizedType = typeof type === 'string' ? type.toLowerCase() : type;

    switch (normalizedType) {
      case WorkItemType.EPIC:
      case 'epic':
        return 'bg-purple-50 text-purple-700 border-purple-200'; // Azure DevOps Epic colors
      case WorkItemType.FEATURE:
      case 'feature':
        return 'bg-blue-50 text-blue-700 border-blue-200'; // Azure DevOps Feature colors
      case WorkItemType.USER_STORY:
      case 'user_story':
        return 'bg-green-50 text-green-700 border-green-200'; // Azure DevOps User Story colors
      case WorkItemType.BUG:
      case 'bug':
        return 'bg-red-50 text-red-700 border-red-200'; // Azure DevOps Bug colors
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };





  // Helper functions for table view
  const getWorkItemHierarchyLevel = (item: WorkItem, workItems: WorkItem[]): number => {
    let level = 0;
    let currentParentId = item.parentId;

    while (currentParentId) {
      level++;
      const parent = workItems.find(wi => wi._id === currentParentId);
      currentParentId = parent?.parentId || '';
    }

    return level;
  };

  const sortWorkItemsForTable = (workItems: WorkItem[]): WorkItem[] => {
    // Create a hierarchical sort that maintains parent-child relationships
    const result: WorkItem[] = [];
    const processed = new Set<string>();

    // Helper function to add item and its children recursively
    const addItemWithChildren = (item: WorkItem) => {
      if (processed.has(item._id!)) return;

      processed.add(item._id!);
      result.push(item);

      // Find and add children in the correct order
      const children = workItems
        .filter(child => child.parentId === item._id)
        .sort((a, b) => {
          // Sort children by type first, then by title
          const typeOrder = {
            [WorkItemType.EPIC]: 0,
            [WorkItemType.FEATURE]: 1,
            [WorkItemType.USER_STORY]: 2,
            [WorkItemType.BUG]: 3
          };
          const typeComparison = typeOrder[a.type] - typeOrder[b.type];
          if (typeComparison !== 0) return typeComparison;
          return a.title.localeCompare(b.title);
        });

      children.forEach(child => addItemWithChildren(child));
    };

    // Start with root items (items with no parent)
    const rootItems = workItems
      .filter(item => !item.parentId)
      .sort((a, b) => {
        // Sort root items by type first, then by title
        const typeOrder = {
          [WorkItemType.EPIC]: 0,
          [WorkItemType.FEATURE]: 1,
          [WorkItemType.USER_STORY]: 2,
          [WorkItemType.BUG]: 3
        };
        const typeComparison = typeOrder[a.type] - typeOrder[b.type];
        if (typeComparison !== 0) return typeComparison;
        return a.title.localeCompare(b.title);
      });

    // Add each root item and its children
    rootItems.forEach(rootItem => addItemWithChildren(rootItem));

    return result;
  };

  // Helper functions for collapsible functionality
  const hasChildren = (itemId: string, workItems: WorkItem[]): boolean => {
    return workItems.some(item => item.parentId === itemId);
  };

  const isItemVisible = (item: WorkItem, workItems: WorkItem[]): boolean => {
    // If item has no parent, it's always visible
    if (!item.parentId) return true;

    // Check if any ancestor is collapsed
    let currentParentId = item.parentId;
    while (currentParentId) {
      if (collapsedItems.has(currentParentId)) {
        return false;
      }
      const parent = workItems.find(wi => wi._id === currentParentId);
      currentParentId = parent?.parentId || '';
    }

    return true;
  };

  const toggleCollapse = (itemId: string) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Release not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The release you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/releases" className="mt-4 btn btn-primary">
          Back to Releases
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{release.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {release.version && (
                <span className="flex items-center space-x-1 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">v{release.version}</span>
                </span>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(release.status)}`}>
                {getStatusIcon(release.status)}
                <span className="ml-1">{release.status}</span>
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(release.type)}`}>
                {release.type}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="btn btn-secondary flex items-center space-x-2"
            title={isDrawerOpen ? 'Close Details' : 'Show More Details'}
          >
            {isDrawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>{isDrawerOpen ? 'Close' : 'More Details'}</span>
          </button>

          {release.downloadUrl && (
            <button
              onClick={handleDownload}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}

          {permissions?.canManageUsers && (
            <Link
              href={`/releases/${release._id}/edit`}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
          )}

          <Link
            href="/releases"
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Releases</span>
          </Link>
        </div>
      </div>

      {/* Release Info */}
      <div className="relative overflow-hidden min-h-screen">
        <div className={`space-y-6 transition-all duration-300 ${isDrawerOpen ? 'lg:pr-80' : ''}`}>
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-700 whitespace-pre-wrap">{release.description}</p>
            </div>
          </div>

          {/* Features */}
          {release.features && release.features.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900">New Features & Improvements</h2>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {release.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {getCategoryIcon(feature.category)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {feature.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bug Fixes */}
          {release.bugFixes && release.bugFixes.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Bug className="w-5 h-5 text-green-600" />
                  <span>Bug Fixes</span>
                </h2>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {release.bugFixes.map((fix, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Breaking Changes */}
          {release.breakingChanges && release.breakingChanges.length > 0 && (
            <div className="card border-red-200">
              <div className="card-header bg-red-50">
                <h2 className="text-lg font-medium text-red-900 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Breaking Changes</span>
                </h2>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {release.breakingChanges.map((change, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Work Items (Epic → Feature → User Story → Bug) */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>Work Items</span>
                  {release.workItems && release.workItems.length > 0 && (
                    <span className="text-sm text-gray-500 font-normal">
                      ({release.workItems.filter(item => isItemVisible(item, release.workItems)).length} of {release.workItems.length} visible)
                    </span>
                  )}
                  {selectedItems.size > 0 && (
                    <span className="text-sm text-blue-600 font-medium">
                      ({selectedItems.size} selected)
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-2">
                  {/* Bulk Actions */}
                  {selectedItems.size > 0 && permissions?.canManageUsers && (
                    <button
                      onClick={handleBulkDelete}
                      className="btn btn-danger btn-sm flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Selected ({selectedItems.size})</span>
                    </button>
                  )}

                  {/* Expand/Collapse All toggle button */}
                  {release.workItems && release.workItems.length > 0 && (() => {
                    const allParentIds = new Set(
                      release.workItems
                        .filter(item => hasChildren(item._id!, release.workItems))
                        .map(item => item._id!)
                    );
                    const allCollapsed = allParentIds.size > 0 && Array.from(allParentIds).every(id => collapsedItems.has(id));

                    return (
                      <button
                        onClick={() => {
                          if (allCollapsed) {
                            // Expand all
                            setCollapsedItems(new Set());
                          } else {
                            // Collapse all
                            setCollapsedItems(allParentIds);
                          }
                        }}
                        className="btn btn-secondary btn-sm flex items-center space-x-1"
                        title={allCollapsed ? "Expand All" : "Collapse All"}
                      >
                        {allCollapsed ? (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>Expand All</span>
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-4 h-4" />
                            <span>Collapse All</span>
                          </>
                        )}
                      </button>
                    );
                  })()}
                  {permissions?.canManageUsers && (
                    <button
                      onClick={() => {
                        setModalMode('createEpic');
                        setModalWorkItem(null);
                        setModalParentItem(null);
                        setShowWorkItemModal(true);
                      }}
                      className="btn btn-primary btn-sm flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Epic</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="card-body">
              {release.workItems && release.workItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {permissions?.canManageUsers && (
                          <th className="px-3 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-12">
                            <input
                              type="checkbox"
                              checked={release?.workItems && selectedItems.size === release.workItems.length && release.workItems.length > 0}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                        )}
                        <th className="px-3 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-16">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider w-20">
                          Id
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Flag Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                        {permissions?.canManageUsers && (
                          <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortWorkItemsForTable(release.workItems)
                        .filter(item => isItemVisible(item, release.workItems))
                        .map((item) => {
                          const hierarchyLevel = getWorkItemHierarchyLevel(item, release.workItems);
                          const indentStyle = { paddingLeft: `${hierarchyLevel * 16 + 12}px` };
                          const itemHasChildren = hasChildren(item._id!, release.workItems);
                          const isCollapsed = collapsedItems.has(item._id!);

                          return (
                            <tr key={item._id} className="hover:bg-gray-50">
                              {permissions?.canManageUsers && (
                                <td className="px-3 py-4 whitespace-nowrap text-sm">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(item._id!)}
                                    onChange={() => handleSelectItem(item._id!)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                </td>
                              )}
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="flex items-center" style={indentStyle}>
                                  {/* Collapse/Expand button */}
                                  {itemHasChildren ? (
                                    <button
                                      onClick={() => toggleCollapse(item._id!)}
                                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                                      title={isCollapsed ? 'Expand' : 'Collapse'}
                                    >
                                      {isCollapsed ? (
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                      )}
                                    </button>
                                  ) : (
                                    <div className="w-6"></div> // Spacer for alignment
                                  )}

                                  {/* Add hierarchy visual indicators */}
                                  {hierarchyLevel > 0 && (
                                    <div className="flex items-center">
                                      {Array.from({ length: hierarchyLevel }, (_, i) => (
                                        <div key={i} className="w-4 h-4 flex items-center justify-center">
                                          {i === hierarchyLevel - 1 ? (
                                            <div className="w-2 h-2 border-l-2 border-b-2 border-gray-300"></div>
                                          ) : (
                                            <div className="w-0.5 h-4 bg-gray-300"></div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div
                                    className="flex items-center"
                                    title={item.type.replace('_', ' ').toUpperCase()}
                                  >
                                    {getWorkItemTypeIcon(item.type)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">
                                {item.id && item.hyperlink ? (
                                  <a
                                    href={item.hyperlink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                    title={`Open ${item.id} in new tab`}
                                  >
                                    {item.id}
                                  </a>
                                ) : item.id ? (
                                  <span className="text-gray-900">{item.id}</span>
                                ) : (
                                  <span className="text-gray-900">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{item.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.flagName || '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs truncate" title={item.remarks}>
                                  {item.remarks || '-'}
                                </div>
                              </td>
                              {permissions?.canManageUsers && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleOpenEditModal(item)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteWorkItem(item._id!)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                    {/* Create child button - only show if item can have children (not for bugs) */}
                                    {item.type?.toLowerCase() !== 'bug' && (
                                      <button
                                        onClick={() => handleOpenCreateChildModal(item)}
                                        className="text-green-600 hover:text-green-800"
                                        title={`Add ${item.type?.toLowerCase() === 'epic' ? 'Feature' :
                                          item.type?.toLowerCase() === 'feature' ? 'User Story' :
                                            item.type?.toLowerCase() === 'user_story' ? 'Bug' : 'Child'
                                          }`}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No work items added yet. Start by creating an Epic.</p>
              )}

              {/* Work Item Form */}
              {isAddingWorkItem && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingWorkItem ? `Edit ${workItemFormData.type}` : `Add New ${workItemFormData.type}`}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={workItemFormData.type}
                        onChange={(e) => setWorkItemFormData({ ...workItemFormData, type: e.target.value as WorkItemType })}
                        className="input w-full"
                        disabled={!!editingWorkItem}
                      >
                        <option value={WorkItemType.EPIC}>Epic</option>
                        <option value={WorkItemType.FEATURE}>Feature</option>
                        <option value={WorkItemType.USER_STORY}>User Story</option>
                        <option value={WorkItemType.BUG}>Bug</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parent
                      </label>
                      <select
                        value={workItemFormData.parentId || ''}
                        onChange={(e) => setWorkItemFormData({ ...workItemFormData, parentId: e.target.value || undefined })}
                        className="input w-full"
                      >
                        <option value="">No Parent</option>
                        {getValidParents(workItemFormData.type, release.workItems || []).map((parent) => (
                          <option key={parent._id} value={parent._id}>
                            {parent.title} ({parent.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={workItemFormData.title}
                        onChange={(e) => setWorkItemFormData({ ...workItemFormData, title: e.target.value })}
                        className="input w-full"
                        placeholder="Enter title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flag Name
                      </label>
                      <input
                        type="text"
                        value={workItemFormData.flagName || ''}
                        onChange={(e) => setWorkItemFormData({ ...workItemFormData, flagName: e.target.value })}
                        className="input w-full"
                        placeholder="Enter flag name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={workItemFormData.remarks || ''}
                        onChange={(e) => setWorkItemFormData({ ...workItemFormData, remarks: e.target.value })}
                        className="input w-full"
                        placeholder="Enter remarks"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hyperlink
                      </label>
                      <input
                        type="url"
                        value={workItemFormData.hyperlink || ''}
                        onChange={(e) => setWorkItemFormData({ ...workItemFormData, hyperlink: e.target.value })}
                        className="input w-full"
                        placeholder="Enter hyperlink URL (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Hours
                      </label>
                      <input
                        type="number"
                        value={workItemFormData.actualHours || ''}
                        onChange={(e) => setWorkItemFormData({ ...workItemFormData, actualHours: e.target.value ? Number(e.target.value) : undefined })}
                        className="input w-full"
                        placeholder="Enter actual hours"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mt-6">
                    <button
                      onClick={handleSaveWorkItem}
                      className="btn btn-primary"
                      disabled={!workItemFormData.title}
                    >
                      {editingWorkItem ? 'Update Work Item' : 'Add Work Item'}
                    </button>
                    <button
                      onClick={handleCancelWorkItem}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Drawer */}
        <div className={`
          fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 border-l border-gray-200
          lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-80
          transform transition-transform duration-300 ease-in-out overflow-hidden
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {/* Drawer Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Release Details</h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Close Details"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="overflow-y-auto h-full pb-20">
            <div className="p-6 space-y-6">
              {/* Release Details */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Release Details</h2>
                </div>
                <div className="card-body space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Release Date</p>
                      <p className="text-sm text-gray-600">
                        {new Date(release.releaseDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>



                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Author</p>
                      <p className="text-sm text-gray-600">{release.author.name}</p>
                    </div>
                  </div>

                  {release.downloadUrl && (
                    <div className="pt-4 border-t border-gray-200">
                      <a
                        href={release.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Download Link</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Publication Status */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Publication Status</h2>
                </div>
                <div className="card-body">
                  <div className="flex items-center space-x-2">
                    {release.isPublished ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Published</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Draft</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {release.isPublished
                      ? 'This release is publicly available'
                      : 'This release is not yet published'
                    }
                  </p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-medium text-gray-900">Timestamps</h2>
                </div>
                <div className="card-body space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(release.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-600">
                      {new Date(release.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Work Item Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDeleteWorkItem}
        title="Delete Work Item"
        message={`Are you sure you want to delete "${itemToDelete?.title}"?`}
        details={itemToDelete && release?.workItems ? (() => {
          const countChildren = (items: WorkItem[], parentId: string): number => {
            return items.filter(item => item.parentId === parentId).reduce((count, child) => {
              return count + 1 + countChildren(items, child._id!);
            }, 0);
          };
          const childrenCount = countChildren(release.workItems, itemToDelete._id!);
          return childrenCount > 0
            ? `This will also delete ${childrenCount} child item(s).\n\nThis action cannot be undone.`
            : 'This action cannot be undone.';
        })() : 'This action cannot be undone.'}
        confirmText="Delete Work Item"
        cancelText="Cancel"
        type="danger"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showBulkDeleteConfirmation}
        onClose={() => setShowBulkDeleteConfirmation(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Work Items"
        message={`Are you sure you want to delete ${selectedItems.size} work item(s)?`}
        details={(() => {
          const selectedItemsArray = Array.from(selectedItems);
          const itemTitles = selectedItemsArray
            .map(id => release?.workItems.find(item => item._id === id)?.title)
            .filter(Boolean)
            .slice(0, 3);
          const titleDisplay = itemTitles.length > 0
            ? itemTitles.join(', ') + (selectedItemsArray.length > 3 ? ` and ${selectedItemsArray.length - 3} more` : '')
            : 'selected items';
          return `Items to delete: ${titleDisplay}\n\nThis will also delete any child items.\n\nThis action cannot be undone.`;
        })()}
        confirmText={`Delete ${selectedItems.size} Item(s)`}
        cancelText="Cancel"
        type="danger"
      />

      {/* Work Item Modal */}
      <WorkItemModal
        isOpen={showWorkItemModal}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        workItem={modalWorkItem}
        parentItem={modalParentItem}
        mode={modalMode}
        availableParents={release?.workItems || []}
      />
    </div>
  );
}
