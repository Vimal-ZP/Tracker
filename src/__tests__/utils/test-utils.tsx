import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { UIProvider } from '@/contexts/UIContext'
import { UserProvider } from '@/contexts/UserContext'
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

// Create a mock AuthContext
const MockAuthContext = React.createContext<any>(null)

// Mock AuthProvider
const MockAuthProvider = ({
  children,
  user = null
}: {
  children: React.ReactNode
  user?: typeof mockUser | null
}) => {
  const authContextValue = {
    user,
    loading: false,
    isInitialized: true,
    login: jest.fn(),
    logout: jest.fn(),
    refreshUser: jest.fn(),
  }

  return (
    <MockAuthContext.Provider value={authContextValue}>
      {children}
    </MockAuthContext.Provider>
  )
}

// Mock DashboardProvider that doesn't depend on AuthContext
const MockDashboardProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="dashboard-provider">{children}</div>
}

// Mock useAuth hook
export const useAuth = () => {
  const context = React.useContext(MockAuthContext)
  if (!context) {
    return {
      user: null,
      loading: false,
      isInitialized: true,
      login: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    }
  }
  return context
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
  const testUser = initialAuthState.user ?? user

  return (
    <UIProvider>
      <MockAuthProvider user={testUser}>
        <UserProvider>
          <MockDashboardProvider>
            <ReleasesProvider>
              <ReportsProvider>
                <SettingsProvider>
                  <PromptsProvider>
                    {children}
                  </PromptsProvider>
                </SettingsProvider>
              </ReportsProvider>
            </ReleasesProvider>
          </MockDashboardProvider>
        </UserProvider>
      </MockAuthProvider>
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
