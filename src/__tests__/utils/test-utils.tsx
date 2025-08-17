import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { UIProvider } from '@/contexts/UIContext'
import { UserProvider } from '@/contexts/UserContext'
import { DashboardProvider } from '@/contexts/DashboardContext'
import { ReleasesProvider } from '@/contexts/ReleasesContext'
import { ReportsProvider } from '@/contexts/ReportsContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { PromptsProvider } from '@/contexts/PromptsContext'
import { UserRole } from '@/types/user'

// Mock user data for testing
export const mockUser = {
  _id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: UserRole.ADMIN,
  isActive: true,
  assignedApplications: ['Test App'],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockSuperAdminUser = {
  ...mockUser,
  role: UserRole.SUPER_ADMIN,
}

export const mockBasicUser = {
  ...mockUser,
  role: UserRole.BASIC,
}

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  user?: typeof mockUser | null
  initialAuthState?: {
    user?: typeof mockUser | null
    loading?: boolean
    isInitialized?: boolean
  }
}

const AllTheProviders = ({ 
  children, 
  user = null,
  initialAuthState = {}
}: { 
  children: React.ReactNode
  user?: typeof mockUser | null
  initialAuthState?: {
    user?: typeof mockUser | null
    loading?: boolean
    isInitialized?: boolean
  }
}) => {
  // Mock the auth context value
  const mockAuthContextValue = {
    user: initialAuthState.user ?? user,
    loading: initialAuthState.loading ?? false,
    isInitialized: initialAuthState.isInitialized ?? true,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }

  return (
    <UIProvider>
      <AuthProvider value={mockAuthContextValue}>
        <UserProvider>
          <DashboardProvider>
            <ReleasesProvider>
              <ReportsProvider>
                <SettingsProvider>
                  <PromptsProvider>
                    {children}
                  </PromptsProvider>
                </SettingsProvider>
              </ReportsProvider>
            </ReleasesProvider>
          </DashboardProvider>
        </UserProvider>
      </AuthProvider>
    </UIProvider>
  )
}

export const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { user, initialAuthState, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders user={user} initialAuthState={initialAuthState}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Helper function to create mock fetch responses
export const createMockResponse = (data: any, ok = true, status = 200) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response)
}

// Helper to mock fetch for specific endpoints
export const mockFetch = (responses: Record<string, any>) => {
  const mockFetch = jest.fn((url: string) => {
    const endpoint = Object.keys(responses).find(key => url.includes(key))
    if (endpoint) {
      return createMockResponse(responses[endpoint])
    }
    return createMockResponse({ error: 'Not found' }, false, 404)
  })
  
  global.fetch = mockFetch
  return mockFetch
}

// Mock release data
export const mockRelease = {
  _id: 'test-release-id',
  title: 'Test Release',
  description: 'A test release',
  applicationName: 'Test App',
  version: '1.0.0',
  releaseDate: new Date(),
  isPublished: true,
  downloadUrl: 'https://example.com/download',
  author: 'Test Author',
  workItems: [
    {
      id: 'EPIC-001',
      type: 'Epic' as const,
      title: 'Test Epic',
      status: 'Done' as const,
      assignee: 'Test User',
      priority: 'High' as const,
      estimatedHours: 40,
      hyperlink: 'https://example.com/epic-001'
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock application data
export const mockApplication = {
  _id: 'test-app-id',
  name: 'Test App',
  displayName: 'Test Application',
  description: 'A test application',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }
