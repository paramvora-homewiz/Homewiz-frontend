/**
 * Custom hooks for Google Places/Geocoding integration
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  searchAddresses,
  getPlaceDetails,
  getNeighborhoodInfo,
  isGoogleApiConfigured,
  AddressSuggestion,
  AddressComponents,
  NeighborhoodInfo
} from '@/lib/google-geocoding-api'

/**
 * Hook for address autocomplete functionality
 */
export function useAddressAutocomplete(options?: {
  debounceMs?: number
  minChars?: number
  country?: string
}) {
  const { debounceMs = 300, minChars = 3, country } = options || {}

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<AddressComponents | null>(null)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastQueryRef = useRef<string>('')

  // Check if API is configured
  const isConfigured = isGoogleApiConfigured()

  // Search for addresses
  const search = useCallback(async (searchQuery: string) => {
    if (!isConfigured) {
      setError('Google API not configured')
      return
    }

    if (searchQuery.length < minChars) {
      setSuggestions([])
      return
    }

    // Skip if same query
    if (searchQuery === lastQueryRef.current) {
      return
    }
    lastQueryRef.current = searchQuery

    setIsLoading(true)
    setError(null)

    try {
      const results = await searchAddresses(searchQuery, {
        types: ['address'],
        componentRestrictions: country ? { country } : undefined
      })
      setSuggestions(results)
    } catch (err) {
      setError('Failed to search addresses')
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [isConfigured, minChars, country])

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      search(searchQuery)
    }, debounceMs)
  }, [search, debounceMs])

  // Handle query change
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    setSelectedAddress(null)
    debouncedSearch(newQuery)
  }, [debouncedSearch])

  // Select an address from suggestions
  const selectAddress = useCallback(async (suggestion: AddressSuggestion) => {
    setIsLoading(true)
    setError(null)

    try {
      const details = await getPlaceDetails(suggestion.placeId)
      if (details) {
        setSelectedAddress(details)
        setQuery(details.formattedAddress)
        setSuggestions([])
      } else {
        setError('Failed to get address details')
      }
    } catch (err) {
      setError('Failed to get address details')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Clear everything
  const clear = useCallback(() => {
    setQuery('')
    setSuggestions([])
    setSelectedAddress(null)
    setError(null)
    lastQueryRef.current = ''
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
    query,
    setQuery: handleQueryChange,
    suggestions,
    isLoading,
    error,
    selectedAddress,
    selectAddress,
    clear,
    isConfigured
  }
}

/**
 * Hook for fetching neighborhood information
 */
export function useNeighborhood(options?: {
  address?: string
  city?: string
  state?: string
  zip?: string
  enabled?: boolean
  debounceMs?: number
}) {
  const { address, city, state, zip, enabled = true, debounceMs = 1000 } = options || {}

  const [neighborhoodInfo, setNeighborhoodInfo] = useState<NeighborhoodInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastAddressRef = useRef<string>('')

  const isConfigured = isGoogleApiConfigured()

  // Fetch neighborhood info
  const fetchNeighborhood = useCallback(async () => {
    if (!isConfigured || !enabled) return
    if (!address || !city || !state || !zip) return

    const fullAddress = `${address}, ${city}, ${state} ${zip}`

    // Skip if same address
    if (fullAddress === lastAddressRef.current) return
    lastAddressRef.current = fullAddress

    setIsLoading(true)
    setError(null)

    try {
      const info = await getNeighborhoodInfo(address, city, state, zip)
      setNeighborhoodInfo(info)
    } catch (err) {
      setError('Failed to fetch neighborhood info')
      setNeighborhoodInfo(null)
    } finally {
      setIsLoading(false)
    }
  }, [isConfigured, enabled, address, city, state, zip])

  // Debounced fetch when address changes
  useEffect(() => {
    if (!enabled || !isConfigured) return

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchNeighborhood()
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [fetchNeighborhood, enabled, debounceMs, isConfigured])

  // Manual refresh
  const refresh = useCallback(() => {
    lastAddressRef.current = '' // Force refresh
    fetchNeighborhood()
  }, [fetchNeighborhood])

  return {
    neighborhoodInfo,
    isLoading,
    error,
    refresh,
    isConfigured
  }
}

/**
 * Combined hook for address input with autocomplete and neighborhood
 */
export function useAddressWithNeighborhood() {
  const autocomplete = useAddressAutocomplete({ country: 'us' })
  const [addressFields, setAddressFields] = useState({
    street: '',
    city: '',
    state: '',
    zip: ''
  })

  const neighborhood = useNeighborhood({
    address: addressFields.street,
    city: addressFields.city,
    state: addressFields.state,
    zip: addressFields.zip,
    enabled: !!(addressFields.street && addressFields.city && addressFields.state && addressFields.zip)
  })

  // When an address is selected from autocomplete, update all fields
  useEffect(() => {
    if (autocomplete.selectedAddress) {
      setAddressFields({
        street: autocomplete.selectedAddress.fullStreetAddress,
        city: autocomplete.selectedAddress.city,
        state: autocomplete.selectedAddress.stateCode || autocomplete.selectedAddress.state,
        zip: autocomplete.selectedAddress.zipCode
      })
    }
  }, [autocomplete.selectedAddress])

  // Allow manual field updates
  const updateField = useCallback((field: keyof typeof addressFields, value: string) => {
    setAddressFields(prev => ({ ...prev, [field]: value }))
  }, [])

  return {
    autocomplete,
    addressFields,
    updateField,
    neighborhood,
    // Convenience method to get all data
    getFormData: () => ({
      ...addressFields,
      neighborhood: neighborhood.neighborhoodInfo?.neighborhood || '',
      sublocality: neighborhood.neighborhoodInfo?.sublocality || '',
      nearbyAreas: neighborhood.neighborhoodInfo?.nearbyAreas || [],
      lat: autocomplete.selectedAddress?.lat || 0,
      lng: autocomplete.selectedAddress?.lng || 0
    })
  }
}
