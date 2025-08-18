import {
  UserRole,
  User,
  CreateUserData,
  LoginCredentials,
  AuthResponse,
  UserPermissions,
  AVAILABLE_APPLICATIONS,
  getUserAccessibleApplications,
  userHasApplicationAccess,
  userHasAnyApplicationAccess,
  rolePermissions,
} from '../user'

describe('user.ts - Types and Utilities', () => {
  // Mock user data for testing
  const mockSuperAdminUser: User = {
    _id: 'super-admin-id',
    email: 'superadmin@example.com',
    name: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    assignedApplications: [], // Super Admin doesn't need explicit assignments
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const mockAdminUser: User = {
    _id: 'admin-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
    isActive: true,
    assignedApplications: ['NRE', 'Portal Plus'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const mockBasicUser: User = {
    _id: 'basic-id',
    email: 'basic@example.com',
    name: 'Basic User',
    role: UserRole.BASIC,
    isActive: true,
    assignedApplications: ['E-Vite'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const mockInactiveUser: User = {
    _id: 'inactive-id',
    email: 'inactive@example.com',
    name: 'Inactive User',
    role: UserRole.BASIC,
    isActive: false,
    assignedApplications: ['NVE'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  describe('UserRole Enum', () => {
    it('should contain all expected role values', () => {
      expect(UserRole.SUPER_ADMIN).toBe('super_admin')
      expect(UserRole.ADMIN).toBe('admin')
      expect(UserRole.BASIC).toBe('basic')
    })

    it('should have exactly 3 roles', () => {
      const roleValues = Object.values(UserRole)
      expect(roleValues).toHaveLength(3)
      expect(roleValues).toContain('super_admin')
      expect(roleValues).toContain('admin')
      expect(roleValues).toContain('basic')
    })
  })

  describe('AVAILABLE_APPLICATIONS Constant', () => {
    it('should contain all expected applications', () => {
      expect(AVAILABLE_APPLICATIONS).toEqual([
        'NRE',
        'NVE', 
        'E-Vite',
        'Portal Plus',
        'Fast 2.0',
        'FMS'
      ])
    })

    it('should be a readonly array', () => {
      expect(AVAILABLE_APPLICATIONS).toHaveLength(6)
      // Test that it's defined as a const (readonly at compile time)
      expect(AVAILABLE_APPLICATIONS).toBeDefined()
      expect(Array.isArray(AVAILABLE_APPLICATIONS)).toBe(true)
    })

    it('should contain unique application names', () => {
      const uniqueApps = [...new Set(AVAILABLE_APPLICATIONS)]
      expect(uniqueApps).toHaveLength(AVAILABLE_APPLICATIONS.length)
    })
  })

  describe('getUserAccessibleApplications Function', () => {
    it('should return empty array for null/undefined user', () => {
      expect(getUserAccessibleApplications(null as any)).toEqual([])
      expect(getUserAccessibleApplications(undefined as any)).toEqual([])
    })

    it('should return all applications for Super Admin', () => {
      const result = getUserAccessibleApplications(mockSuperAdminUser)
      expect(result).toEqual([...AVAILABLE_APPLICATIONS])
      expect(result).toHaveLength(AVAILABLE_APPLICATIONS.length)
    })

    it('should return assigned applications for Admin', () => {
      const result = getUserAccessibleApplications(mockAdminUser)
      expect(result).toEqual(['NRE', 'Portal Plus'])
      expect(result).toHaveLength(2)
    })

    it('should return assigned applications for Basic user', () => {
      const result = getUserAccessibleApplications(mockBasicUser)
      expect(result).toEqual(['E-Vite'])
      expect(result).toHaveLength(1)
    })

    it('should return empty array if assignedApplications is not an array', () => {
      const userWithInvalidApps = {
        ...mockBasicUser,
        assignedApplications: null as any,
      }
      const result = getUserAccessibleApplications(userWithInvalidApps)
      expect(result).toEqual([])
    })

    it('should return empty array if assignedApplications is undefined', () => {
      const userWithUndefinedApps = {
        ...mockBasicUser,
        assignedApplications: undefined as any,
      }
      const result = getUserAccessibleApplications(userWithUndefinedApps)
      expect(result).toEqual([])
    })

    it('should handle empty assignedApplications array', () => {
      const userWithNoApps = {
        ...mockBasicUser,
        assignedApplications: [],
      }
      const result = getUserAccessibleApplications(userWithNoApps)
      expect(result).toEqual([])
    })

    it('should work with inactive users', () => {
      const result = getUserAccessibleApplications(mockInactiveUser)
      expect(result).toEqual(['NVE'])
    })
  })

  describe('userHasApplicationAccess Function', () => {
    it('should return true for Super Admin accessing any application', () => {
      AVAILABLE_APPLICATIONS.forEach(app => {
        expect(userHasApplicationAccess(mockSuperAdminUser, app)).toBe(true)
      })
    })

    it('should return true for Admin accessing assigned applications', () => {
      expect(userHasApplicationAccess(mockAdminUser, 'NRE')).toBe(true)
      expect(userHasApplicationAccess(mockAdminUser, 'Portal Plus')).toBe(true)
    })

    it('should return false for Admin accessing non-assigned applications', () => {
      expect(userHasApplicationAccess(mockAdminUser, 'E-Vite')).toBe(false)
      expect(userHasApplicationAccess(mockAdminUser, 'Fast 2.0')).toBe(false)
      expect(userHasApplicationAccess(mockAdminUser, 'FMS')).toBe(false)
    })

    it('should return true for Basic user accessing assigned application', () => {
      expect(userHasApplicationAccess(mockBasicUser, 'E-Vite')).toBe(true)
    })

    it('should return false for Basic user accessing non-assigned applications', () => {
      expect(userHasApplicationAccess(mockBasicUser, 'NRE')).toBe(false)
      expect(userHasApplicationAccess(mockBasicUser, 'Portal Plus')).toBe(false)
    })

    it('should return false for non-existent application', () => {
      expect(userHasApplicationAccess(mockSuperAdminUser, 'NonExistentApp')).toBe(false)
      expect(userHasApplicationAccess(mockAdminUser, 'InvalidApp')).toBe(false)
    })

    it('should handle case-sensitive application names', () => {
      expect(userHasApplicationAccess(mockAdminUser, 'nre')).toBe(false)
      expect(userHasApplicationAccess(mockAdminUser, 'NRE')).toBe(true)
    })

    it('should work with inactive users', () => {
      expect(userHasApplicationAccess(mockInactiveUser, 'NVE')).toBe(true)
      expect(userHasApplicationAccess(mockInactiveUser, 'NRE')).toBe(false)
    })

    it('should handle null/undefined user', () => {
      expect(userHasApplicationAccess(null as any, 'NRE')).toBe(false)
      expect(userHasApplicationAccess(undefined as any, 'NRE')).toBe(false)
    })
  })

  describe('userHasAnyApplicationAccess Function', () => {
    it('should return true if user has access to at least one application', () => {
      expect(userHasAnyApplicationAccess(mockAdminUser, ['NRE', 'E-Vite'])).toBe(true)
      expect(userHasAnyApplicationAccess(mockAdminUser, ['Portal Plus', 'FMS'])).toBe(true)
    })

    it('should return false if user has no access to any of the applications', () => {
      expect(userHasAnyApplicationAccess(mockBasicUser, ['NRE', 'Portal Plus'])).toBe(false)
      expect(userHasAnyApplicationAccess(mockBasicUser, ['Fast 2.0', 'FMS'])).toBe(false)
    })

    it('should return true for Super Admin with any application list', () => {
      expect(userHasAnyApplicationAccess(mockSuperAdminUser, ['NRE'])).toBe(true)
      expect(userHasAnyApplicationAccess(mockSuperAdminUser, ['E-Vite', 'FMS'])).toBe(true)
      expect(userHasAnyApplicationAccess(mockSuperAdminUser, [...AVAILABLE_APPLICATIONS])).toBe(true)
    })

    it('should return false for empty application list', () => {
      expect(userHasAnyApplicationAccess(mockSuperAdminUser, [])).toBe(false)
      expect(userHasAnyApplicationAccess(mockAdminUser, [])).toBe(false)
      expect(userHasAnyApplicationAccess(mockBasicUser, [])).toBe(false)
    })

    it('should handle single application in array', () => {
      expect(userHasAnyApplicationAccess(mockBasicUser, ['E-Vite'])).toBe(true)
      expect(userHasAnyApplicationAccess(mockBasicUser, ['NRE'])).toBe(false)
    })

    it('should handle non-existent applications', () => {
      expect(userHasAnyApplicationAccess(mockAdminUser, ['InvalidApp1', 'InvalidApp2'])).toBe(false)
    })

    it('should handle mixed valid and invalid applications', () => {
      expect(userHasAnyApplicationAccess(mockAdminUser, ['NRE', 'InvalidApp'])).toBe(true)
      expect(userHasAnyApplicationAccess(mockBasicUser, ['InvalidApp', 'NRE'])).toBe(false)
    })

    it('should handle null/undefined user', () => {
      expect(userHasAnyApplicationAccess(null as any, ['NRE'])).toBe(false)
      expect(userHasAnyApplicationAccess(undefined as any, ['NRE'])).toBe(false)
    })
  })

  describe('rolePermissions Configuration', () => {
    it('should contain permissions for all user roles', () => {
      expect(rolePermissions[UserRole.SUPER_ADMIN]).toBeDefined()
      expect(rolePermissions[UserRole.ADMIN]).toBeDefined()
      expect(rolePermissions[UserRole.BASIC]).toBeDefined()
    })

    describe('Super Admin Permissions', () => {
      const superAdminPerms = rolePermissions[UserRole.SUPER_ADMIN]

      it('should have all permissions enabled', () => {
        expect(superAdminPerms.canCreateUsers).toBe(true)
        expect(superAdminPerms.canDeleteUsers).toBe(true)
        expect(superAdminPerms.canEditUsers).toBe(true)
        expect(superAdminPerms.canViewAllUsers).toBe(true)
        expect(superAdminPerms.canManageUsers).toBe(true)
        expect(superAdminPerms.canManageRoles).toBe(true)
        expect(superAdminPerms.canAccessAdminPanel).toBe(true)
        expect(superAdminPerms.canViewReports).toBe(true)
        expect(superAdminPerms.canManageSettings).toBe(true)
        expect(superAdminPerms.canEditReleases).toBe(true)
      })

      it('should have all required permission properties', () => {
        const expectedProperties = [
          'canCreateUsers',
          'canDeleteUsers', 
          'canEditUsers',
          'canViewAllUsers',
          'canManageUsers',
          'canManageRoles',
          'canAccessAdminPanel',
          'canViewReports',
          'canManageSettings',
          'canEditReleases'
        ]
        expectedProperties.forEach(prop => {
          expect(superAdminPerms).toHaveProperty(prop)
        })
      })
    })

    describe('Admin Permissions', () => {
      const adminPerms = rolePermissions[UserRole.ADMIN]

      it('should have specific permissions enabled', () => {
        expect(adminPerms.canCreateUsers).toBe(true)
        expect(adminPerms.canEditUsers).toBe(true)
        expect(adminPerms.canViewAllUsers).toBe(true)
        expect(adminPerms.canManageUsers).toBe(true)
        expect(adminPerms.canAccessAdminPanel).toBe(true)
        expect(adminPerms.canViewReports).toBe(true)
        expect(adminPerms.canEditReleases).toBe(true)
      })

      it('should have specific permissions disabled', () => {
        expect(adminPerms.canDeleteUsers).toBe(false)
        expect(adminPerms.canManageRoles).toBe(false)
        expect(adminPerms.canManageSettings).toBe(false)
      })

      it('should be more restrictive than Super Admin', () => {
        const superAdminPerms = rolePermissions[UserRole.SUPER_ADMIN]
        
        // Admin should have fewer or equal permissions than Super Admin
        Object.keys(adminPerms).forEach(permission => {
          const key = permission as keyof UserPermissions
          if (adminPerms[key] === true) {
            expect(superAdminPerms[key]).toBe(true)
          }
        })
      })
    })

    describe('Basic User Permissions', () => {
      const basicPerms = rolePermissions[UserRole.BASIC]

      it('should have all permissions disabled', () => {
        expect(basicPerms.canCreateUsers).toBe(false)
        expect(basicPerms.canDeleteUsers).toBe(false)
        expect(basicPerms.canEditUsers).toBe(false)
        expect(basicPerms.canViewAllUsers).toBe(false)
        expect(basicPerms.canManageUsers).toBe(false)
        expect(basicPerms.canManageRoles).toBe(false)
        expect(basicPerms.canAccessAdminPanel).toBe(false)
        expect(basicPerms.canViewReports).toBe(false)
        expect(basicPerms.canManageSettings).toBe(false)
        expect(basicPerms.canEditReleases).toBe(false)
      })

      it('should be most restrictive role', () => {
        const adminPerms = rolePermissions[UserRole.ADMIN]
        const superAdminPerms = rolePermissions[UserRole.SUPER_ADMIN]

        Object.keys(basicPerms).forEach(permission => {
          const key = permission as keyof UserPermissions
          expect(basicPerms[key]).toBe(false)
          
          // Basic should never have more permissions than Admin or Super Admin
          if (basicPerms[key] === true) {
            expect(adminPerms[key]).toBe(true)
            expect(superAdminPerms[key]).toBe(true)
          }
        })
      })
    })

    it('should maintain permission hierarchy', () => {
      const superAdminPerms = rolePermissions[UserRole.SUPER_ADMIN]
      const adminPerms = rolePermissions[UserRole.ADMIN]
      const basicPerms = rolePermissions[UserRole.BASIC]

      // Count true permissions for each role
      const superAdminTrueCount = Object.values(superAdminPerms).filter(Boolean).length
      const adminTrueCount = Object.values(adminPerms).filter(Boolean).length
      const basicTrueCount = Object.values(basicPerms).filter(Boolean).length

      expect(superAdminTrueCount).toBeGreaterThanOrEqual(adminTrueCount)
      expect(adminTrueCount).toBeGreaterThanOrEqual(basicTrueCount)
    })
  })

  describe('Type Interfaces', () => {
    describe('User Interface', () => {
      it('should accept valid user object', () => {
        const validUser: User = {
          _id: 'test-id',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.ADMIN,
          isActive: true,
          assignedApplications: ['NRE'],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        expect(validUser._id).toBe('test-id')
        expect(validUser.email).toBe('test@example.com')
        expect(validUser.role).toBe(UserRole.ADMIN)
      })
    })

    describe('CreateUserData Interface', () => {
      it('should accept valid create user data', () => {
        const validCreateData: CreateUserData = {
          email: 'new@example.com',
          name: 'New User',
          password: 'password123',
          role: UserRole.BASIC,
          assignedApplications: ['E-Vite'],
        }
        
        expect(validCreateData.email).toBe('new@example.com')
        expect(validCreateData.assignedApplications).toEqual(['E-Vite'])
      })

      it('should work without optional assignedApplications', () => {
        const validCreateData: CreateUserData = {
          email: 'new@example.com',
          name: 'New User',
          password: 'password123',
          role: UserRole.BASIC,
        }
        
        expect(validCreateData.assignedApplications).toBeUndefined()
      })
    })

    describe('LoginCredentials Interface', () => {
      it('should accept valid login credentials', () => {
        const validCredentials: LoginCredentials = {
          email: 'user@example.com',
          password: 'password123',
        }
        
        expect(validCredentials.email).toBe('user@example.com')
        expect(validCredentials.password).toBe('password123')
      })
    })

    describe('AuthResponse Interface', () => {
      it('should accept valid auth response', () => {
        const validResponse: AuthResponse = {
          user: mockAdminUser,
          token: 'jwt-token-here',
        }
        
        expect(validResponse.user).toBe(mockAdminUser)
        expect(validResponse.token).toBe('jwt-token-here')
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed user objects gracefully', () => {
      const malformedUser = {
        _id: 'test',
        role: UserRole.BASIC,
        // Missing required fields
      } as any

      expect(() => getUserAccessibleApplications(malformedUser)).not.toThrow()
      expect(getUserAccessibleApplications(malformedUser)).toEqual([])
    })

    it('should handle empty string application names', () => {
      expect(userHasApplicationAccess(mockAdminUser, '')).toBe(false)
      expect(userHasAnyApplicationAccess(mockAdminUser, ['', 'NRE'])).toBe(true)
    })

    it('should handle special characters in application names', () => {
      expect(userHasApplicationAccess(mockAdminUser, 'NRE!')).toBe(false)
      expect(userHasApplicationAccess(mockAdminUser, 'NRE ')).toBe(false)
    })

    it('should handle very long application arrays', () => {
      const longAppList = new Array(1000).fill('NRE')
      expect(userHasAnyApplicationAccess(mockAdminUser, longAppList)).toBe(true)
      
      const longInvalidAppList = new Array(1000).fill('InvalidApp')
      expect(userHasAnyApplicationAccess(mockAdminUser, longInvalidAppList)).toBe(false)
    })
  })

  describe('Performance Considerations', () => {
    it('should handle large assignedApplications arrays efficiently', () => {
      const userWithManyApps = {
        ...mockAdminUser,
        assignedApplications: [...AVAILABLE_APPLICATIONS, ...AVAILABLE_APPLICATIONS, ...AVAILABLE_APPLICATIONS],
      }

      const start = performance.now()
      const result = getUserAccessibleApplications(userWithManyApps)
      const end = performance.now()

      expect(result.length).toBeGreaterThan(0)
      expect(end - start).toBeLessThan(10) // Should complete in less than 10ms
    })

    it('should perform application access checks efficiently', () => {
      const start = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        userHasApplicationAccess(mockAdminUser, 'NRE')
      }
      
      const end = performance.now()
      expect(end - start).toBeLessThan(50) // Should complete 1000 checks in less than 50ms
    })
  })
})
