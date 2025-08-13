# Context Architecture Documentation

This document explains the context-based state management architecture used in the Tracker application.

## Overview

The application uses React Context API to manage global state across different categories. Each context is responsible for a specific domain of the application, promoting separation of concerns and maintainability.

## Context Categories

### 1. AuthContext
**Purpose**: Manages user authentication state and operations
**Location**: `src/contexts/AuthContext.tsx`

**State:**
- `user`: Current authenticated user
- `loading`: Authentication loading state

**Actions:**
- `login(credentials)`: Authenticate user
- `register(userData)`: Register new user
- `logout()`: Sign out user
- `refreshUser()`: Refresh user data

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  // ...
}
```

### 2. UserContext
**Purpose**: Manages user CRUD operations and user list state
**Location**: `src/contexts/UserContext.tsx`

**State:**
- `users`: Array of users
- `loading`: Loading state for user operations
- `currentPage`: Current pagination page
- `totalPages`: Total number of pages
- `searchTerm`: Current search filter
- `roleFilter`: Current role filter
- `selectedUser`: Currently selected user

**Actions:**
- `fetchUsers()`: Load users with current filters
- `createUser(userData)`: Create new user
- `updateUser(id, userData)`: Update existing user
- `deleteUser(id)`: Delete user
- `toggleUserStatus(id)`: Toggle user active/inactive status
- `setCurrentPage(page)`: Update pagination
- `setSearchTerm(term)`: Update search filter
- `setRoleFilter(role)`: Update role filter

**Usage:**
```tsx
import { useUser } from '@/contexts/UserContext';

function UserManagement() {
  const { users, loading, fetchUsers, createUser } = useUser();
  // ...
}
```

### 3. DashboardContext
**Purpose**: Manages dashboard statistics and activity data
**Location**: `src/contexts/DashboardContext.tsx`

**State:**
- `stats`: Dashboard statistics (user counts, growth metrics)
- `activities`: Recent activity items
- `loading`: Loading state
- `error`: Error messages

**Actions:**
- `fetchDashboardData()`: Load all dashboard data
- `addActivity(activity)`: Add new activity item
- `clearActivities()`: Clear activity history
- `refreshStats()`: Refresh statistics

**Usage:**
```tsx
import { useDashboard } from '@/contexts/DashboardContext';

function Dashboard() {
  const { stats, activities, loading } = useDashboard();
  // ...
}
```

### 4. UIContext
**Purpose**: Manages UI state (theme, sidebar, modals, notifications)
**Location**: `src/contexts/UIContext.tsx`

**State:**
- `theme`: Current theme ('light', 'dark', 'system')
- `resolvedTheme`: Actual theme being used
- `sidebarState`: Sidebar state ('open', 'closed', 'collapsed')
- `modals`: Object tracking modal open/closed states
- `globalLoading`: Global loading state
- `notifications`: Array of notifications
- `isMobile/isTablet/isDesktop`: Responsive breakpoint states

**Actions:**
- `setTheme(theme)`: Change theme
- `toggleSidebar()`: Toggle sidebar
- `openModal(id)`: Open specific modal
- `closeModal(id)`: Close specific modal
- `addNotification(notification)`: Add notification
- `removeNotification(id)`: Remove notification

**Usage:**
```tsx
import { useUI } from '@/contexts/UIContext';

function MyComponent() {
  const { theme, setTheme, openModal, isMobile } = useUI();
  // ...
}
```

### 5. SettingsContext
**Purpose**: Manages system settings and configuration
**Location**: `src/contexts/SettingsContext.tsx`

**State:**
- `systemSettings`: General system configuration
- `securitySettings`: Security policies and settings
- `notificationSettings`: Notification preferences
- `loading`: Loading state
- `error`: Error messages

**Actions:**
- `updateSystemSettings(settings)`: Update system settings
- `updateSecuritySettings(settings)`: Update security settings
- `updateNotificationSettings(settings)`: Update notification settings
- `resetToDefaults()`: Reset all settings to defaults
- `exportSettings()`: Export settings as JSON
- `importSettings(json)`: Import settings from JSON

**Usage:**
```tsx
import { useSettings } from '@/contexts/SettingsContext';

function SettingsPage() {
  const { systemSettings, updateSystemSettings } = useSettings();
  // ...
}
```

### 6. ReportsContext
**Purpose**: Manages reports, analytics, and metrics
**Location**: `src/contexts/ReportsContext.tsx`

**State:**
- `userAnalytics`: User-related analytics data
- `systemMetrics`: System performance metrics
- `securityReport`: Security-related reports
- `activityReport`: Activity and usage reports
- `filters`: Current report filters
- `loading`: Loading state
- `error`: Error messages

**Actions:**
- `fetchUserAnalytics()`: Load user analytics
- `fetchSystemMetrics()`: Load system metrics
- `fetchSecurityReport()`: Load security reports
- `fetchActivityReport()`: Load activity reports
- `updateFilters(filters)`: Update report filters
- `exportReport(type, format)`: Export report data
- `scheduleReport(type, schedule)`: Schedule automated reports

**Usage:**
```tsx
import { useReports } from '@/contexts/ReportsContext';

function ReportsPage() {
  const { userAnalytics, systemMetrics, loading } = useReports();
  // ...
}
```

## Provider Hierarchy

The contexts are organized in a specific hierarchy to manage dependencies:

```tsx
<UIProvider>              // Theme, UI state (no dependencies)
  <AuthProvider>          // Authentication (depends on UI for loading)
    <SettingsProvider>    // Settings (depends on auth for permissions)
      <UserProvider>      // User management (depends on auth)
        <DashboardProvider> // Dashboard (depends on auth, users)
          <ReportsProvider> // Reports (depends on auth, users)
            <App />
          </ReportsProvider>
        </DashboardProvider>
      </UserProvider>
    </SettingsProvider>
  </AuthProvider>
</UIProvider>
```

## Combined Provider

For convenience, all providers are combined in a single `AppProviders` component:

```tsx
import { AppProviders } from '@/contexts';

function App() {
  return (
    <AppProviders>
      <YourAppContent />
    </AppProviders>
  );
}
```

## Best Practices

### 1. Context Separation
- Each context handles a single domain
- Avoid cross-context dependencies where possible
- Use composition over inheritance

### 2. Performance Optimization
- Contexts are split to minimize re-renders
- Use `useCallback` and `useMemo` for expensive operations
- Consider context splitting if components re-render too frequently

### 3. Error Handling
- Each context handles its own errors
- Errors are exposed through context state
- Use try-catch blocks in async operations

### 4. Type Safety
- All contexts are fully typed with TypeScript
- Interfaces define the shape of state and actions
- Custom hooks provide type-safe access

### 5. Testing
- Contexts can be tested in isolation
- Mock providers can be created for testing
- Use React Testing Library for context testing

## Usage Examples

### Basic Usage
```tsx
import { useAuth, useUser } from '@/contexts';

function UserProfile() {
  const { user } = useAuth();
  const { updateUser } = useUser();
  
  const handleUpdate = async (data) => {
    await updateUser(user._id, data);
  };
  
  return (
    <div>
      <h1>{user.name}</h1>
      {/* Profile form */}
    </div>
  );
}
```

### Multiple Contexts
```tsx
import { useAuth, useUI, useDashboard } from '@/contexts';

function Dashboard() {
  const { user } = useAuth();
  const { theme, setTheme } = useUI();
  const { stats, loading } = useDashboard();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <h1>Welcome, {user.name}</h1>
      <StatsCards stats={stats} />
    </div>
  );
}
```

### Conditional Context Usage
```tsx
import { useAuth, useReports } from '@/contexts';
import { UserRole } from '@/types/user';

function ReportsPage() {
  const { user } = useAuth();
  const { userAnalytics, loading } = useReports();
  
  if (user.role === UserRole.BASIC) {
    return <div>Access Denied</div>;
  }
  
  return (
    <div>
      <h1>Reports</h1>
      {loading ? <LoadingSpinner /> : <AnalyticsCharts data={userAnalytics} />}
    </div>
  );
}
```

## Migration Guide

If you're updating from the single AuthContext approach:

1. **Update imports:**
   ```tsx
   // Old
   import { useAuth } from '@/contexts/AuthContext';
   
   // New
   import { useAuth } from '@/contexts';
   ```

2. **Use specific contexts:**
   ```tsx
   // Old - everything in AuthContext
   const { user, users, fetchUsers } = useAuth();
   
   // New - separated contexts
   const { user } = useAuth();
   const { users, fetchUsers } = useUser();
   ```

3. **Update providers:**
   ```tsx
   // Old
   <AuthProvider>
     <App />
   </AuthProvider>
   
   // New
   <AppProviders>
     <App />
   </AppProviders>
   ```

This architecture provides better separation of concerns, improved performance, and easier maintenance as the application grows.
