'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { WalkScoreData, UseWalkScoreReturn } from '@/types'
import { fetchWalkScore, isAddressComplete } from '@/lib/walkscore-api'

interface UseWalkScoreOptions {
  /** Debounce delay in milliseconds before fetching (default: 1000ms) */
  debounceMs?: number
  /** Whether to auto-fetch when address changes (default: true) */
  autoFetch?: boolean
}

/**
 * Custom hook for fetching and managing WalkScore data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, fetchWalkScore } = useWalkScore()
 *
 * // Auto-fetch when address is complete
 * useEffect(() => {
 *   if (address && city && state && zip) {
 *     fetchWalkScore(address, city, state, zip)
 *   }
 * }, [address, city, state, zip])
 * ```
 */
export function useWalkScore(options: UseWalkScoreOptions = {}): UseWalkScoreReturn {
  const { debounceMs = 1000 } = options

  const [data, setData] = useState<WalkScoreData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Track last fetched address to avoid duplicate requests
  const lastFetchedAddressRef = useRef<string>('')

  /**
   * Fetch WalkScore data for the given address
   */
  const doFetchWalkScore = useCallback(async (
    address: string,
    city: string,
    state: string,
    zip: string
  ): Promise<void> => {
    // Validate address completeness
    if (!isAddressComplete(address, city, state, zip)) {
      return
    }

    // Create address key to check for duplicates
    const addressKey = `${address}-${city}-${state}-${zip}`.toLowerCase()

    // Skip if already fetched for this address
    if (addressKey === lastFetchedAddressRef.current && data) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchWalkScore(address, city, state, zip)
      setData(result)
      lastFetchedAddressRef.current = addressKey

      if (result.status === 'error') {
        setError(result.error_message || 'Failed to fetch WalkScore data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch WalkScore data'
      setError(errorMessage)
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [data])

  /**
   * Debounced version of fetchWalkScore
   */
  const fetchWalkScoreDebounced = useCallback((
    address: string,
    city: string,
    state: string,
    zip: string
  ): Promise<void> => {
    return new Promise((resolve) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(async () => {
        await doFetchWalkScore(address, city, state, zip)
        resolve()
      }, debounceMs)
    })
  }, [doFetchWalkScore, debounceMs])

  /**
   * Clear WalkScore data
   */
  const clearData = useCallback(() => {
    setData(null)
    setError(null)
    lastFetchedAddressRef.current = ''
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    fetchWalkScore: fetchWalkScoreDebounced,
    clearData
  }
}

/**
 * Hook that automatically fetches WalkScore when address fields change
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAutoWalkScore({
 *   address: formData.street,
 *   city: formData.city,
 *   state: formData.state,
 *   zip: formData.zip_code
 * })
 * ```
 */
export function useAutoWalkScore(params: {
  address?: string
  city?: string
  state?: string
  zip?: string
  enabled?: boolean
  debounceMs?: number
}) {
  const {
    address,
    city,
    state,
    zip,
    enabled = true,
    debounceMs = 1500
  } = params

  const { data, isLoading, error, fetchWalkScore, clearData } = useWalkScore({ debounceMs })

  // Auto-fetch when address is complete
  useEffect(() => {
    if (!enabled) {
      return
    }

    if (isAddressComplete(address, city, state, zip)) {
      fetchWalkScore(address!, city!, state!, zip!)
    } else {
      // Clear data when address becomes incomplete
      clearData()
    }
  }, [address, city, state, zip, enabled, fetchWalkScore, clearData])

  // Manual retry function
  const retry = useCallback(() => {
    if (isAddressComplete(address, city, state, zip)) {
      clearData()
      fetchWalkScore(address!, city!, state!, zip!)
    }
  }, [address, city, state, zip, fetchWalkScore, clearData])

  return {
    data,
    isLoading,
    error,
    retry,
    clearData,
    isAddressComplete: isAddressComplete(address, city, state, zip)
  }
}

export default useWalkScore
