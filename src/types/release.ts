export interface Release {
  _id: string;
  version: string;
  title: string;
  description: string;
  releaseDate: Date;
  status: ReleaseStatus;
  type: ReleaseType;
  features: ReleaseFeature[];
  bugFixes: string[];
  breakingChanges: string[];
  author: {
    _id: string;
    name: string;
    email: string;
  };
  downloadUrl?: string;
  downloadCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReleaseStatus {
  DRAFT = 'draft',
  BETA = 'beta',
  STABLE = 'stable',
  DEPRECATED = 'deprecated'
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

export interface CreateReleaseData {
  version: string;
  title: string;
  description: string;
  releaseDate: Date;
  status: ReleaseStatus;
  type: ReleaseType;
  features: ReleaseFeature[];
  bugFixes: string[];
  breakingChanges: string[];
  downloadUrl?: string;
  isPublished: boolean;
}

export interface UpdateReleaseData extends Partial<CreateReleaseData> {
  _id: string;
}

export interface ReleaseFilters {
  status?: ReleaseStatus;
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
