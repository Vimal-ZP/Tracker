export interface Release {
  _id: string;
  version?: string;
  title: string;
  projectName: string;
  description: string;
  releaseDate: Date;
  type: ReleaseType;
  features: ReleaseFeature[];
  bugFixes: string[];
  breakingChanges: string[];
  workItems: WorkItem[];
  author: {
    _id: string;
    name: string;
    email: string;
  };
  downloadUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}



export enum ReleaseType {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
  HOTFIX = 'hotfix'
}

export interface ReleaseFeature {
  title: string;
  description: string;
  category: FeatureCategory;
}

export enum FeatureCategory {
  NEW = 'new',
  IMPROVED = 'improved',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

export enum WorkItemType {
  EPIC = 'epic',
  FEATURE = 'feature',
  USER_STORY = 'user_story',
  BUG = 'bug'
}

export enum WorkItemStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  BLOCKED = 'blocked'
}

export interface WorkItem {
  _id?: string;
  id?: string;
  type: WorkItemType;
  title: string;
  flagName?: string;
  remarks?: string;
  hyperlink?: string;
  parentId?: string;
  actualHours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateReleaseData {
  version?: string;
  title: string;
  projectName: string;
  description: string;
  releaseDate: Date;
  type: ReleaseType;
  features: ReleaseFeature[];
  bugFixes: string[];
  breakingChanges: string[];
  workItems: WorkItem[];
  downloadUrl?: string;
  isPublished: boolean;
}

export interface UpdateReleaseData extends Partial<CreateReleaseData> {
  _id: string;
}

export interface ReleaseFilters {
  type?: ReleaseType;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ReleasesResponse {
  releases: Release[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
