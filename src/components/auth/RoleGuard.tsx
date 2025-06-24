'use client'

import { ReactNode, useEffect, useState } from 'react'
import { UserRole } from '@/types'
import { useAuth } from './AuthProvider'
import config from '@/lib/config'

interface RoleGuardProps {
  children: ReactNode
  requiredRole: UserRole
  fallback?: ReactNode
  showFallback?: boolean
}

export function RoleGuard({
  children,
  requiredRole,
  fallback,
  showFallback = true
}: RoleGuardProps) {
  // Track if component has mounted to prevent hydration mismatch
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const { user, isLoading, hasPermission } = useAuth()

  // Show loading state during SSR and initial client render to prevent hydration mismatch
  if (!hasMounted || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // In demo mode, always allow access (check after mounting to prevent hydration issues)
  if (config.app.demoMode) {
    return <>{children}</>
  }

  // User not authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showFallback) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-600 mb-4">
              Please sign in to access this content.
            </p>
            <a
              href="/sign-in"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      )
    }

    return null
  }

  // Check permissions
  if (!hasPermission(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showFallback) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-600 mb-2">
              You don't have permission to access this content.
            </p>
            <p className="text-sm text-gray-500">
              Required: {requiredRole} | Your role: {user.role}
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  // User has required permissions
  return <>{children}</>
}

// Utility component for conditional rendering based on roles
export function RoleBasedRender({
  roles,
  children,
  fallback
}: {
  roles: UserRole[],
  children: ReactNode,
  fallback?: ReactNode
}) {
  const [hasMounted, setHasMounted] = useState(false)
  const { user, hasPermission } = useAuth()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Prevent hydration mismatch by showing consistent content until mounted
  if (!hasMounted) {
    return fallback ? <>{fallback}</> : null
  }

  if (config.app.demoMode) {
    return <>{children}</>
  }

  if (!user) {
    return fallback ? <>{fallback}</> : null
  }

  const hasAnyRole = roles.some(role => hasPermission(role))

  return hasAnyRole ? <>{children}</> : (fallback ? <>{fallback}</> : null)
}

// Hook for checking permissions in components
export function usePermissions() {
  const { user, hasPermission, hasRole } = useAuth()

  return {
    user,
    hasPermission,
    hasRole,
    canView: hasPermission('view'),
    canSubmit: hasPermission('submit'),
    canEdit: hasPermission('edit'),
    isAdmin: hasRole('edit'), // Assuming 'edit' is the highest role
  }
}
