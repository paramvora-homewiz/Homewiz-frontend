/**
 * Authentication utilities for HomeWiz Frontend
 *
 * This module provides client-side authentication utilities and role-based
 * access control functions that work with Clerk authentication.
 */

import { UserRole, User } from '@/types'
import config from './config'

// Role hierarchy for permission checking
export const roleHierarchy: Record<UserRole, number> = {
  'no_access': 0,
  'view': 1,
  'submit': 2,
  'edit': 3,
}

/**
 * Check if a user role has permission for a required role
 */
export function hasPermission(userRole: UserRole, requiredPermission: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredPermission]
}

/**
 * Check if user can view content
 */
export function canView(userRole: UserRole): boolean {
  return hasPermission(userRole, 'view')
}

/**
 * Check if user can submit forms/data
 */
export function canSubmit(userRole: UserRole): boolean {
  return hasPermission(userRole, 'submit')
}

/**
 * Check if user can edit content
 */
export function canEdit(userRole: UserRole): boolean {
  return hasPermission(userRole, 'edit')
}

/**
 * Get all available roles
 */
export function getAvailableRoles(): UserRole[] {
  return Object.keys(roleHierarchy) as UserRole[]
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    'no_access': 'No Access',
    'view': 'View Only',
    'submit': 'Submit Forms',
    'edit': 'Full Edit Access',
  }
  return displayNames[role] || role
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    'no_access': 'Cannot access any content',
    'view': 'Can view content but cannot make changes',
    'submit': 'Can view content and submit forms/applications',
    'edit': 'Full access to view, submit, and edit all content',
  }
  return descriptions[role] || 'Unknown role'
}

/**
 * Validate user role
 */
export function isValidRole(role: string): role is UserRole {
  return Object.keys(roleHierarchy).includes(role as UserRole)
}

/**
 * Get demo user for development/testing
 */
export function getDemoUser(): User {
  return {
    id: 'demo_user_123',
    role: 'submit' as UserRole,
    email: 'demo@homewiz.com',
    firstName: 'Demo',
    lastName: 'User',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  }
}

/**
 * Assign user role (integrates with backend API)
 */
export async function assignUserRole(userId: string, role: UserRole): Promise<void> {
  if (!isValidRole(role)) {
    throw new Error(`Invalid role: ${role}`)
  }

  try {
    // In demo mode, just log the action
    if (config.app.demoMode) {
      console.log(`🎭 Demo: Assigning role ${role} to user ${userId}`)
      return
    }

    // Make API call to backend to update user role
    const response = await fetch(`${config.api.baseUrl}/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    })

    if (!response.ok) {
      throw new Error(`Failed to assign role: ${response.statusText}`)
    }

    console.log(`✅ Successfully assigned role ${role} to user ${userId}`)
  } catch (error) {
    console.error('Error assigning user role:', error)
    throw error
  }
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.some(role => hasPermission(userRole, role))
}

/**
 * Get user permissions summary
 */
export function getUserPermissions(userRole: UserRole) {
  return {
    role: userRole,
    displayName: getRoleDisplayName(userRole),
    description: getRoleDescription(userRole),
    permissions: {
      canView: canView(userRole),
      canSubmit: canSubmit(userRole),
      canEdit: canEdit(userRole),
    },
    level: roleHierarchy[userRole],
  }
}

// Export types and constants
export { roleHierarchy as ROLE_HIERARCHY }
export type { UserRole }
