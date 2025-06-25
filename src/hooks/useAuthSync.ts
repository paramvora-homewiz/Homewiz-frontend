/**
 * Authentication Synchronization Hook
 * 
 * This hook manages synchronization between Clerk authentication
 * and the HomeWiz backend API for user data and roles.
 */

import { useEffect, useState, useCallback } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { UserRole, User } from '@/types'
import config from '@/lib/config'

interface AuthSyncState {
  isLoading: boolean
  isSyncing: boolean
  lastSyncAt: Date | null
  syncError: string | null
}

interface UseAuthSyncReturn extends AuthSyncState {
  syncUserWithBackend: () => Promise<void>
  updateUserRole: (role: UserRole) => Promise<void>
  refreshUserData: () => Promise<void>
}

export function useAuthSync(): UseAuthSyncReturn {
  const { user: clerkUser } = useUser()
  const { getToken } = useAuth()
  
  const [state, setState] = useState<AuthSyncState>({
    isLoading: false,
    isSyncing: false,
    lastSyncAt: null,
    syncError: null,
  })

  /**
   * Get authentication headers for API requests
   */
  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (config.app.demoMode) {
      return {
        'Content-Type': 'application/json',
        'X-Demo-Mode': 'true',
      }
    }

    const token = await getToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }, [getToken])

  /**
   * Sync user data with backend
   */
  const syncUserWithBackend = useCallback(async () => {
    if (!clerkUser || config.app.demoMode) {
      return
    }

    setState(prev => ({ ...prev, isSyncing: true, syncError: null }))

    try {
      const headers = await getAuthHeaders()
      
      const userData = {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role: clerkUser.publicMetadata?.role || 'submit',
        createdAt: clerkUser.createdAt?.toISOString(),
        lastLogin: new Date().toISOString(),
      }

      const response = await fetch(`${config.api.baseUrl}/api/users/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        syncError: null,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }))
      console.error('❌ Failed to sync user data:', error)
    }
  }, [clerkUser, getAuthHeaders])

  /**
   * Update user role both in Clerk and backend
   */
  const updateUserRole = useCallback(async (role: UserRole) => {
    if (!clerkUser) {
      throw new Error('No authenticated user')
    }

    setState(prev => ({ ...prev, isSyncing: true, syncError: null }))

    try {
      // Note: publicMetadata can only be updated from the Backend API, not frontend
      // For now, we'll just sync with backend and rely on webhooks or backend sync
      // to update Clerk metadata

      // Sync with backend
      if (!config.app.demoMode) {
        const headers = await getAuthHeaders()

        const response = await fetch(`${config.api.baseUrl}/api/users/${clerkUser.id}/role`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ role }),
        })

        if (!response.ok) {
          throw new Error(`Role update failed: ${response.statusText}`)
        }
      }

      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        syncError: null,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }))
      console.error('❌ Failed to update user role:', error)
      throw error
    }
  }, [clerkUser, getAuthHeaders])

  /**
   * Refresh user data from backend
   */
  const refreshUserData = useCallback(async () => {
    if (!clerkUser || config.app.demoMode) {
      return
    }

    setState(prev => ({ ...prev, isLoading: true, syncError: null }))

    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`${config.api.baseUrl}/api/users/${clerkUser.id}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`)
      }

      const userData = await response.json()

      // Note: publicMetadata can only be updated from the Backend API, not frontend
      // The backend should handle updating Clerk metadata via webhooks or Backend API
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastSyncAt: new Date(),
        syncError: null,
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        isLoading: false,
        syncError: errorMessage,
      }))
      console.error('❌ Failed to refresh user data:', error)
    }
  }, [clerkUser, getAuthHeaders])

  /**
   * Auto-sync on user changes
   */
  useEffect(() => {
    if (clerkUser && !config.app.demoMode) {
      // Sync user data when user changes
      syncUserWithBackend()
    }
  }, [clerkUser, syncUserWithBackend])

  /**
   * Periodic sync (every 5 minutes)
   */
  useEffect(() => {
    if (config.app.demoMode) return

    const interval = setInterval(() => {
      if (clerkUser) {
        syncUserWithBackend()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [clerkUser, syncUserWithBackend])

  return {
    ...state,
    syncUserWithBackend,
    updateUserRole,
    refreshUserData,
  }
}

export default useAuthSync
