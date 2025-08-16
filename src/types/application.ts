export interface Application {
    _id: string;
    name: string;
    displayName: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateApplicationData {
    name: string;
    displayName: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateApplicationData {
    name?: string;
    displayName?: string;
    description?: string;
    isActive?: boolean;
}

export interface ApplicationFilters {
    search?: string;
    isActive?: boolean;
}
