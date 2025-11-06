/**
 * useBackendData Hook
 *
 * Replaces useSupabaseData hook with backend API calls
 * Provides same interface for backward compatibility
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  buildingsApi,
  roomsApi,
  tenantsApi,
  operatorsApi,
  leadsApi
} from '@/lib/api'
import { realtimePolling } from '@/lib/api/realtime-polling'
import { ApiResponse } from '@/lib/api-client'

type TableName = 'buildings' | 'rooms' | 'tenants' | 'operators' | 'leads'

interface UseBackendDataOptions {
  enableRealtime?: boolean // Use polling for real-time updates
  realtimeInterval?: number // Polling interval in ms (default: 5000)
  enableCaching?: boolean // Use API client caching
  refetchOnWindowFocus?: boolean // Refetch when window regains focus
  retryOnError?: boolean // Retry on error
  maxRetries?: number // Maximum retry attempts (default: 3)
}

interface UseBackendDataReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  create: (item: any) => Promise<boolean>
  update: (id: string | number, item: any) => Promise<boolean>
  remove: (id: string | number) => Promise<boolean>
  clearError: () => void
}

/**
 * Generic hook for backend data management
 * Supports CRUD operations and optional real-time polling
 */
export function useBackendData<T = any>(
  tableName: TableName,
  options: UseBackendDataOptions = {}
): UseBackendDataReturn<T> {
  const {
    enableRealtime = false,
    realtimeInterval = 5000,
    enableCaching = true,
    refetchOnWindowFocus = false,
    retryOnError = true,
    maxRetries = 3
  } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subscriptionIdRef = useRef<string | null>(null)
  const retryCountRef = useRef(0)
  const isMountedRef = useRef(true)

  // Get appropriate API service
  const getApiService = useCallback(() => {
    switch (tableName) {
      case 'buildings':
        return buildingsApi
      case 'rooms':
        return roomsApi
      case 'tenants':
        return tenantsApi
      case 'operators':
        return operatorsApi
      case 'leads':
        return leadsApi
      default:
        throw new Error(`Unknown table: ${tableName}`)
    }
  }, [tableName])

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return

    try {
      setLoading(true)
      setError(null)

      const apiService = getApiService() as any
      const response: ApiResponse<T[]> = await apiService.getAll({
        cache: enableCaching
      })

      if (!isMountedRef.current) return

      if (response.success && response.data) {
        setData(response.data)
        retryCountRef.current = 0
      } else {
        throw new Error(response.error || 'Failed to fetch data')
      }
    } catch (err: any) {
      if (!isMountedRef.current) return

      const errorMessage = err.message || 'An error occurred'
      setError(errorMessage)

      // Retry logic
      if (retryOnError && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000)

        setTimeout(() => {
          if (isMountedRef.current) {
            fetchData()
          }
        }, delay)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [tableName, enableCaching, retryOnError, maxRetries, getApiService])

  // Create operation
  const create = useCallback(async (item: any): Promise<boolean> => {
    try {
      setError(null)
      const apiService = getApiService() as any
      const response = await apiService.create(item)

      if (response.success) {
        // Refresh data after successful create
        await fetchData()
        return true
      } else {
        setError(response.error || 'Failed to create item')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create item')
      return false
    }
  }, [tableName, fetchData, getApiService])

  // Update operation
  const update = useCallback(async (id: string | number, item: any): Promise<boolean> => {
    try {
      setError(null)
      const apiService = getApiService() as any
      const response = await apiService.update(id, item)

      if (response.success) {
        // Optimistically update local data
        setData(prev =>
          prev.map(d => {
            const itemId = (d as any).id || (d as any)[`${tableName.slice(0, -1)}_id`]
            return itemId === id ? { ...d, ...item } : d
          })
        )
        return true
      } else {
        setError(response.error || 'Failed to update item')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update item')
      return false
    }
  }, [tableName, getApiService])

  // Delete operation
  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      setError(null)
      const apiService = getApiService() as any
      const response = await apiService.delete(id)

      if (response.success) {
        // Optimistically remove from local data
        setData(prev =>
          prev.filter(d => {
            const itemId = (d as any).id || (d as any)[`${tableName.slice(0, -1)}_id`]
            return itemId !== id
          })
        )
        return true
      } else {
        setError(response.error || 'Failed to delete item')
        return false
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
      return false
    }
  }, [tableName, getApiService])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true
    fetchData()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchData])

  // Setup real-time polling if enabled
  useEffect(() => {
    if (!enableRealtime) return

    const subscriptionId = realtimePolling.subscribe({
      tableName,
      interval: realtimeInterval,
      onData: (newData) => {
        if (isMountedRef.current) {
          setData(newData)
        }
      }
    })

    subscriptionIdRef.current = subscriptionId

    return () => {
      if (subscriptionIdRef.current) {
        realtimePolling.unsubscribe(subscriptionIdRef.current)
      }
    }
  }, [enableRealtime, tableName, realtimeInterval])

  // Refetch on window focus if enabled
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      if (isMountedRef.current) {
        fetchData()
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [refetchOnWindowFocus, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove,
    clearError
  }
}

/**
 * Pre-configured hooks for specific tables
 */
export function useBuildings(options?: UseBackendDataOptions) {
  return useBackendData<any>('buildings', options)
}

export function useRooms(options?: UseBackendDataOptions) {
  return useBackendData<any>('rooms', options)
}

export function useTenants(options?: UseBackendDataOptions) {
  return useBackendData<any>('tenants', options)
}

export function useOperators(options?: UseBackendDataOptions) {
  return useBackendData<any>('operators', options)
}

export function useLeads(options?: UseBackendDataOptions) {
  return useBackendData<any>('leads', options)
}
