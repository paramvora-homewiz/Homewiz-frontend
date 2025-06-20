'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import { UserRole, User } from '@/types'
import config from '@/lib/config'
import { authConfigManager, AuthMode, isDemoMode } from '@/lib/auth-config'
import { collectUserAction } from '@/lib/data-collection'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: UserRole) => boolean
  updateUserRole: (role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  authMode: AuthMode
  switchAuthMode: (mode: AuthMode) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

// Demo mode AuthProvider that doesn't use Clerk
function DemoAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  // Role hierarchy for permission checking
  const roleHierarchy: Record<UserRole, number> = {
    'no_access': 0,
    'view': 1,
    'submit': 2,
    'edit': 3,
  }

  useEffect(() => {
    // Set mounted state first
    setHasMounted(true)

    // Get demo user from auth config
    const demoUserConfig = authConfigManager.getDemoUser()
    const demoUser: User = {
      ...demoUserConfig,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    setUser(demoUser)
    setIsLoading(false)

    // Collect user action
    collectUserAction('demo_login', {
      userId: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
    })
  }, [])

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false
    return user.role === role
  }

  const hasPermission = (requiredPermission: UserRole): boolean => {
    if (!user) return false
    return roleHierarchy[user.role] >= roleHierarchy[requiredPermission]
  }

  const updateUserRole = async (role: UserRole): Promise<void> => {
    // In demo mode, just update local state
    setUser(prev => prev ? { ...prev, role } : null)

    // Collect user action
    collectUserAction('role_updated', {
      userId: user?.id,
      newRole: role,
      previousRole: user?.role,
    })
  }

  const signOut = async (): Promise<void> => {
    collectUserAction('demo_logout', {
      userId: user?.id,
      email: user?.email,
    })
    setUser(null)
  }

  const switchAuthMode = (mode: AuthMode): void => {
    authConfigManager.switchMode(mode)
    collectUserAction('auth_mode_switched', {
      userId: user?.id,
      newMode: mode,
      previousMode: AuthMode.DEMO,
    })
  }

  const refreshUser = async (): Promise<void> => {
    // In demo mode, refresh from config
    const demoUserConfig = authConfigManager.getDemoUser()
    const refreshedUser: User = {
      ...demoUserConfig,
      createdAt: user?.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }
    setUser(refreshedUser)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    updateUserRole,
    signOut,
    authMode: AuthMode.DEMO,
    switchAuthMode,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Clerk AuthProvider for production mode (only used when wrapped by ClerkProvider)
function ClerkAuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerkAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Role hierarchy for permission checking
  const roleHierarchy: Record<UserRole, number> = {
    'no_access': 0,
    'view': 1,
    'submit': 2,
    'edit': 3,
  }

  useEffect(() => {
    if (isLoaded) {
      if (clerkUser) {
        // Transform Clerk user to our User type
        const transformedUser: User = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          role: (clerkUser.publicMetadata?.role as UserRole) || 'submit',
          createdAt: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }
        setUser(transformedUser)

        // Collect user action
        collectUserAction('clerk_login', {
          userId: transformedUser.id,
          email: transformedUser.email,
          role: transformedUser.role,
        })
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }
  }, [clerkUser, isLoaded])

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false
    return user.role === role
  }

  const hasPermission = (requiredPermission: UserRole): boolean => {
    if (!user) return false
    return roleHierarchy[user.role] >= roleHierarchy[requiredPermission]
  }

  const updateUserRole = async (role: UserRole): Promise<void> => {
    if (!clerkUser) return

    try {
      // Update Clerk user metadata
      await clerkUser.update({
        publicMetadata: {
          ...clerkUser.publicMetadata,
          role,
        },
      })

      // Update local state
      setUser(prev => prev ? { ...prev, role } : null)

      // Collect user action
      collectUserAction('role_updated', {
        userId: user?.id,
        newRole: role,
        previousRole: user?.role,
      })
    } catch (error) {
      console.error('Failed to update user role:', error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    collectUserAction('clerk_logout', {
      userId: user?.id,
      email: user?.email,
    })
    await clerkSignOut()
  }

  const switchAuthMode = (mode: AuthMode): void => {
    authConfigManager.switchMode(mode)
    collectUserAction('auth_mode_switched', {
      userId: user?.id,
      newMode: mode,
      previousMode: AuthMode.CLERK,
    })
  }

  const refreshUser = async (): Promise<void> => {
    if (!clerkUser) return

    try {
      await clerkUser.reload()
      // User state will be updated via the useEffect
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    hasPermission,
    updateUserRole,
    signOut,
    authMode: AuthMode.CLERK,
    switchAuthMode,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Main AuthProvider that chooses between demo and production modes
export function AuthProvider({ children }: AuthProviderProps) {
  const [authMode, setAuthMode] = useState<AuthMode>(authConfigManager.isDemoMode() ? AuthMode.DEMO : AuthMode.CLERK)

  useEffect(() => {
    // Listen for auth mode changes
    const unsubscribe = authConfigManager.addListener((config) => {
      setAuthMode(config.mode)
    })

    return unsubscribe
  }, [])

  // Debug logging
  const isClerkConfigured = authConfigManager.isClerkConfigured()
  if (typeof window !== 'undefined') {
    console.log('🔐 AuthProvider Decision:', {
      demoMode: config.app.demoMode,
      authMode,
      isClerkConfigured,
      willUseDemoMode: config.app.demoMode || authMode === AuthMode.DEMO || !isClerkConfigured,
    })
  }

  // Always use demo mode if explicitly enabled or if Clerk is not properly configured
  if (config.app.demoMode || authMode === AuthMode.DEMO || !isClerkConfigured) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>
  }

  // Only use Clerk if we're in production mode and Clerk is properly configured
  if (authMode === AuthMode.CLERK && isClerkConfigured) {
    return <ClerkAuthProvider>{children}</ClerkAuthProvider>
  }

  // Fallback to demo mode
  return <DemoAuthProvider>{children}</DemoAuthProvider>
}



// Hook for easy access to auth context
export const useAuth = () => useAuthContext()

// Higher-order component for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, hasPermission } = useAuth()

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access this page.
            </p>
            <a
              href="/sign-in"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      )
    }

    if (requiredRole && !hasPermission(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Required role: {requiredRole}, Your role: {user.role}
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

export default AuthProvider
