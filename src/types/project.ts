export interface Project {
  _id: string;
  name: string;
  description: string;
  code: string; // Short code like "PROJ-001"
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  manager: {
    _id: string;
    name: string;
    email: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface CreateProjectData {
  name: string;
  description: string;
  code: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
}

// Release Plan specific types
export interface ReleasePlan {
  _id: string;
  project: {
    _id: string;
    name: string;
    code: string;
  };
  plannedDate: Date;
  version: string;
  title: string;
  description?: string;
  status: ReleasePlanStatus;
  priority: ReleasePlanPriority;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export enum ReleasePlanStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  READY = 'ready',
  RELEASED = 'released',
  CANCELLED = 'cancelled'
}

export enum ReleasePlanPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface CreateReleasePlanData {
  projectId: string;
  plannedDate: Date;
  version: string;
  title: string;
  description?: string;
  priority: ReleasePlanPriority;
}
