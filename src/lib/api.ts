import { AuthResponse, LoginCredentials, CreateUserData, User } from '@/types/user';

// Get the base URL for API calls
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // Client-side: use current origin
        return window.location.origin;
    }
    // Server-side: use environment variable or default
    return process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
};

class ApiClient {
    private baseURL: string;
    private token: string | null = null;

    constructor() {
        this.baseURL = getBaseURL();

        // Load token from localStorage on client side
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('auth_token');
        }
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        return headers;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}/api${endpoint}`;

        const config: RequestInit = {
            headers: this.getHeaders(),
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: `HTTP error! status: ${response.status}`
                }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('API request failed:', { url, error });
            throw error;
        }
    }

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('auth_token', token);
                // Also set as cookie for middleware access
                document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
            } else {
                localStorage.removeItem('auth_token');
                // Remove cookie
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        }
    }

    // Auth endpoints
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        this.setToken(response.token);
        return response;
    }

    async register(userData: CreateUserData): Promise<AuthResponse> {
        const response = await this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        this.setToken(response.token);
        return response;
    }

    async getProfile(): Promise<{ user: User }> {
        return this.request<{ user: User }>('/auth/me');
    }

    async logout() {
        this.setToken(null);
    }

    // User management endpoints
    async getUsers(params?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
    }): Promise<{
        users: User[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.role) searchParams.set('role', params.role);

        const query = searchParams.toString();
        return this.request(`/users${query ? `?${query}` : ''}`);
    }

    async createUser(userData: CreateUserData): Promise<{ user: User; message: string }> {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async updateUser(id: string, userData: Partial<User>): Promise<{ user: User; message: string }> {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    }

    async deleteUser(id: string): Promise<{ message: string }> {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }

    async getUser(id: string): Promise<{ user: User }> {
        return this.request(`/users/${id}`);
    }

    // Application management endpoints
    async getApplications(params?: {
        search?: string;
        isActive?: boolean;
    }): Promise<{ applications: any[] }> {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.set('search', params.search);
        if (params?.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());

        const query = searchParams.toString();
        return this.request(`/applications${query ? `?${query}` : ''}`);
    }

    async createApplication(applicationData: any): Promise<{ application: any; message: string }> {
        return this.request('/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData),
        });
    }

    async updateApplication(id: string, applicationData: any): Promise<{ application: any; message: string }> {
        return this.request(`/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(applicationData),
        });
    }

    async deleteApplication(id: string): Promise<{ message: string }> {
        return this.request(`/applications/${id}`, {
            method: 'DELETE',
        });
    }

    async getApplication(id: string): Promise<{ application: any }> {
        return this.request(`/applications/${id}`);
    }

    // Release management endpoints
    async getReleases(params?: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
        applicationName?: string;
        releaseDate?: string;
        published?: string;
    }): Promise<{
        releases: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', params.page.toString());
        if (params?.limit) searchParams.set('limit', params.limit.toString());
        if (params?.search) searchParams.set('search', params.search);
        if (params?.type) searchParams.set('type', params.type);
        if (params?.applicationName) searchParams.set('applicationName', params.applicationName);
        if (params?.releaseDate) searchParams.set('releaseDate', params.releaseDate);
        if (params?.published) searchParams.set('published', params.published);

        const query = searchParams.toString();
        return this.request(`/releases${query ? `?${query}` : ''}`);
    }

    async getRelease(id: string): Promise<any> {
        return this.request(`/releases/${id}`);
    }

    async createRelease(releaseData: any): Promise<{ release: any; message: string }> {
        return this.request('/releases', {
            method: 'POST',
            body: JSON.stringify(releaseData),
        });
    }

    async updateRelease(id: string, releaseData: any): Promise<{ release: any; message: string }> {
        return this.request(`/releases/${id}`, {
            method: 'PUT',
            body: JSON.stringify(releaseData),
        });
    }

    async deleteRelease(id: string): Promise<{ message: string }> {
        return this.request(`/releases/${id}`, {
            method: 'DELETE',
        });
    }
}

export const apiClient = new ApiClient();
