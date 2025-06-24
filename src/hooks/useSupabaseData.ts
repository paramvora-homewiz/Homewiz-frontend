/**
 * Custom Hook for Supabase Data Management
 * 
 * This hook provides:
 * - Data loading and caching
 * - Real-time subscriptions
 * - Error handling and retry logic
 * - Loading states management
 * - Optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { databaseService } from '../lib/supabase/database'
import { realtimeManager, RealtimeEvent } from '../lib/supabase/realtime'
import { errorHandler } from '../lib/supabase/error-handler'
import { Building, Room, Tenant, Operator, Lead } from '../lib/supabase/types'

// Hook options interface
interface UseSupabaseDataOptions {
  enableRealtime?: boolean
  enableCaching?: boolean
  refetchOnWindowFocus?: boolean
  retryOnError?: boolean
  maxRetries?: number
}

// Hook return type
interface UseSupabaseDataReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  create: (item: any) => Promise<boolean>
  update: (id: string | number, item: any) => Promise<boolean>
  remove: (id: string | number) => Promise<boolean>
  clearError: () => void
}

// Default options
const defaultOptions: Required<UseSupabaseDataOptions> = {
  enableRealtime: true,
  enableCaching: true,
  refetchOnWindowFocus: true,
  retryOnError: true,
  maxRetries: 3
}

/**
 * Generic hook for Supabase data management
 */
function useSupabaseData<T>(
  tableName: 'buildings' | 'rooms' | 'tenants' | 'operators' | 'leads',
  options: UseSupabaseDataOptions = {}
): UseSupabaseDataReturn<T> {
  const opts = { ...defaultOptions, ...options }
  
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const subscriptionRef = useRef<string | null>(null)
  const retryCountRef = useRef(0)
  const isMountedRef = useRef(true)

  // Get the appropriate service
  const getService = useCallback(() => {
    switch (tableName) {
      case 'buildings':
        return databaseService.buildings
      case 'rooms':
        return databaseService.rooms
      case 'tenants':
        return databaseService.tenants
      case 'operators':
        return databaseService.operators
      case 'leads':
        return databaseService.leads
      default:
        throw new Error(`Unknown table: ${tableName}`)
    }
  }, [tableName])

  // Fetch data function
  const fetchData = useCallback(async (showLoading = true) => {
    if (!isMountedRef.current) return

    try {
      if (showLoading) setLoading(true)
      setError(null)

      const service = getService()
      const result = await service.list()

      if (!isMountedRef.current) return

      if (result.success) {
        setData(result.data as T[])
        retryCountRef.current = 0
      } else {
        throw new Error(result.error?.userMessage || 'Failed to fetch data')
      }
    } catch (err) {
      if (!isMountedRef.current) return

      const enhancedError = errorHandler.processError(err, `fetch_${tableName}`)
      setError(enhancedError.userMessage)

      // Retry logic
      if (opts.retryOnError && retryCountRef.current < opts.maxRetries) {
        retryCountRef.current++
        const delay = Math.pow(2, retryCountRef.current) * 1000 // Exponential backoff
        
        setTimeout(() => {
          if (isMountedRef.current) {
            fetchData(false)
          }
        }, delay)
      }
    } finally {
      if (isMountedRef.current && showLoading) {
        setLoading(false)
      }
    }
  }, [tableName, getService, opts.retryOnError, opts.maxRetries])

  // Handle real-time events
  const handleRealtimeEvent = useCallback((event: RealtimeEvent<T>) => {
    if (!isMountedRef.current) return

    setData(currentData => {
      switch (event.eventType) {
        case 'INSERT':
          if (event.new) {
            return [...currentData, event.new]
          }
          break
        case 'UPDATE':
          if (event.new) {
            return currentData.map(item => 
              (item as any).id === (event.new as any).id ? event.new : item
            )
          }
          break
        case 'DELETE':
          if (event.old) {
            return currentData.filter(item => 
              (item as any).id !== (event.old as any).id
            )
          }
          break
      }
      return currentData
    })
  }, [])

  // Setup real-time subscription
  const setupRealtime = useCallback(() => {
    if (!opts.enableRealtime) return

    try {
      const subscriptionId = realtimeManager.subscribe(
        { table: tableName },
        handleRealtimeEvent
      )
      subscriptionRef.current = subscriptionId
    } catch (err) {
      console.warn(`Failed to setup real-time subscription for ${tableName}:`, err)
    }
  }, [tableName, opts.enableRealtime, handleRealtimeEvent])

  // Cleanup real-time subscription
  const cleanupRealtime = useCallback(() => {
    if (subscriptionRef.current) {
      realtimeManager.unsubscribe(subscriptionRef.current)
      subscriptionRef.current = null
    }
  }, [])

  // Create item
  const create = useCallback(async (item: any): Promise<boolean> => {
    try {
      const service = getService()
      const result = await service.create(item)
      
      if (result.success) {
        // Optimistic update if real-time is disabled
        if (!opts.enableRealtime && result.data) {
          setData(currentData => [...currentData, result.data as T])
        }
        return true
      } else {
        setError(result.error?.userMessage || 'Failed to create item')
        return false
      }
    } catch (err) {
      const enhancedError = errorHandler.processError(err, `create_${tableName}`)
      setError(enhancedError.userMessage)
      return false
    }
  }, [tableName, getService, opts.enableRealtime])

  // Update item
  const update = useCallback(async (id: string | number, item: any): Promise<boolean> => {
    try {
      const service = getService()
      const result = await service.update(id, item)
      
      if (result.success) {
        // Optimistic update if real-time is disabled
        if (!opts.enableRealtime && result.data) {
          setData(currentData => 
            currentData.map(dataItem => 
              (dataItem as any).id === id ? result.data as T : dataItem
            )
          )
        }
        return true
      } else {
        setError(result.error?.userMessage || 'Failed to update item')
        return false
      }
    } catch (err) {
      const enhancedError = errorHandler.processError(err, `update_${tableName}`)
      setError(enhancedError.userMessage)
      return false
    }
  }, [tableName, getService, opts.enableRealtime])

  // Remove item
  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    try {
      const service = getService()
      const result = await service.delete(id)
      
      if (result.success) {
        // Optimistic update if real-time is disabled
        if (!opts.enableRealtime) {
          setData(currentData => 
            currentData.filter(item => (item as any).id !== id)
          )
        }
        return true
      } else {
        setError(result.error?.userMessage || 'Failed to delete item')
        return false
      }
    } catch (err) {
      const enhancedError = errorHandler.processError(err, `delete_${tableName}`)
      setError(enhancedError.userMessage)
      return false
    }
  }, [tableName, getService, opts.enableRealtime])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  // Setup effect
  useEffect(() => {
    isMountedRef.current = true
    
    // Initial data fetch
    fetchData()
    
    // Setup real-time subscription
    setupRealtime()
    
    // Setup window focus refetch
    const handleFocus = () => {
      if (opts.refetchOnWindowFocus) {
        fetchData(false)
      }
    }
    
    if (opts.refetchOnWindowFocus) {
      window.addEventListener('focus', handleFocus)
    }
    
    // Cleanup
    return () => {
      isMountedRef.current = false
      cleanupRealtime()
      
      if (opts.refetchOnWindowFocus) {
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [fetchData, setupRealtime, cleanupRealtime, opts.refetchOnWindowFocus])

  return {
    data,
    loading,
    error,
    refetch,
    create,
    update,
    remove,
    clearError
  }
}

// Specific hooks for each table
export const useBuildings = (options?: UseSupabaseDataOptions) => 
  useSupabaseData<Building>('buildings', options)

export const useRooms = (options?: UseSupabaseDataOptions) => 
  useSupabaseData<Room>('rooms', options)

export const useTenants = (options?: UseSupabaseDataOptions) => 
  useSupabaseData<Tenant>('tenants', options)

export const useOperators = (options?: UseSupabaseDataOptions) => 
  useSupabaseData<Operator>('operators', options)

export const useLeads = (options?: UseSupabaseDataOptions) => 
  useSupabaseData<Lead>('leads', options)

// Export the generic hook as well
export default useSupabaseData
