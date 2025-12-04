'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { MapPin, Loader2 } from 'lucide-react'
import {
  searchAddresses as googleSearchAddresses,
  getPlaceDetails,
  isGoogleApiConfigured,
  AddressSuggestion
} from '@/lib/google-geocoding-api'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect?: (addressData: AddressData) => void
  placeholder?: string
  className?: string
}

// Extended AddressData type to include neighborhood and coordinates
export interface AddressData {
  fullAddress: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  // New fields for Google Places integration
  neighborhood?: string
  sublocality?: string
  lat?: number
  lng?: number
}

// Nominatim API response interface (fallback)
interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address: {
    house_number?: string
    road?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country?: string
    neighbourhood?: string
    suburb?: string
  }
}

// Rate limiting for API calls
const API_DELAY = 300 // ms between requests

// Fallback: Nominatim (OpenStreetMap) search
const searchAddressesNominatim = async (query: string): Promise<AddressData[]> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&` +
      `format=json&` +
      `limit=5&` +
      `countrycodes=us&` +
      `addressdetails=1&` +
      `extratags=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HomeWiz Property Management App'
      }
    })

    if (!response.ok) {
      throw new Error('Address API request failed')
    }

    const results: NominatimResult[] = await response.json()

    return results.map(result => {
      const addr = result.address
      const houseNumber = addr.house_number || ''
      const road = addr.road || ''
      const street = houseNumber && road ? `${houseNumber} ${road}` : (road || '')

      return {
        fullAddress: result.display_name,
        street: street,
        city: addr.city || addr.town || addr.village || '',
        state: addr.state || '',
        zip: addr.postcode || '',
        country: addr.country || 'USA',
        neighborhood: addr.neighbourhood || addr.suburb || '',
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      }
    }).filter(addr => addr.street && addr.city && addr.state)

  } catch (error) {
    console.error('Nominatim search failed:', error)
    return []
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing address (e.g. 123 Main St, Boston)",
  className = ""
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastQueryRef = useRef<string>('')

  // Check if Google API is configured on mount
  useEffect(() => {
    setIsGoogleAvailable(isGoogleApiConfigured())
  }, [])

  // Search using Google Places API
  const searchWithGoogle = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
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
      const results = await googleSearchAddresses(searchQuery, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      })

      setSuggestions(results)
      setShowSuggestions(true)

      if (results.length === 0) {
        setError('No addresses found. Try a more specific search.')
      }
    } catch (err) {
      console.error('Google Places search failed:', err)
      setError('Unable to search addresses. Please try again.')
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Search using Nominatim (fallback)
  const searchWithNominatim = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await searchAddressesNominatim(searchQuery)

      // Convert Nominatim results to suggestion format
      const nominatimSuggestions: AddressSuggestion[] = results.map((r, idx) => ({
        placeId: `nominatim-${idx}`,
        description: r.fullAddress,
        mainText: r.street,
        secondaryText: `${r.city}, ${r.state} ${r.zip}`,
        // Store full data for later use
        _nominatimData: r
      })) as any

      setSuggestions(nominatimSuggestions)
      setShowSuggestions(true)

      if (results.length === 0) {
        setError('No addresses found. Try a more specific search.')
      }
    } catch (err) {
      setError('Unable to search addresses. Please try again.')
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (isGoogleAvailable) {
        searchWithGoogle(searchQuery)
      } else {
        searchWithNominatim(searchQuery)
      }
    }, API_DELAY)
  }, [isGoogleAvailable, searchWithGoogle, searchWithNominatim])

  // Handle input change
  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    if (newValue.length <= 2) {
      setShowSuggestions(false)
      setSuggestions([])
    } else {
      debouncedSearch(newValue)
    }
  }

  // Handle address selection
  const handleAddressSelect = async (suggestion: AddressSuggestion) => {
    setIsLoading(true)
    setShowSuggestions(false)
    setError(null)

    try {
      let addressData: AddressData

      if (isGoogleAvailable && !suggestion.placeId.startsWith('nominatim-')) {
        // Fetch full details from Google Places
        const details = await getPlaceDetails(suggestion.placeId)

        if (details) {
          addressData = {
            fullAddress: details.formattedAddress,
            street: details.fullStreetAddress,
            city: details.city,
            state: details.stateCode || details.state,
            zip: details.zipCode,
            country: details.countryCode || details.country || 'USA',
            neighborhood: details.neighborhood || details.sublocality || '',
            sublocality: details.sublocality,
            lat: details.lat,
            lng: details.lng
          }
        } else {
          // Fallback to suggestion data
          addressData = {
            fullAddress: suggestion.description,
            street: suggestion.mainText,
            city: suggestion.secondaryText.split(',')[0]?.trim() || '',
            state: suggestion.secondaryText.split(',')[1]?.trim().split(' ')[0] || '',
            zip: suggestion.secondaryText.split(' ').pop() || '',
            country: 'USA'
          }
        }
      } else {
        // Nominatim result - use stored data
        const nominatimData = (suggestion as any)._nominatimData as AddressData
        if (nominatimData) {
          addressData = nominatimData
        } else {
          // Parse from description
          addressData = {
            fullAddress: suggestion.description,
            street: suggestion.mainText,
            city: suggestion.secondaryText.split(',')[0]?.trim() || '',
            state: suggestion.secondaryText.split(',')[1]?.trim().split(' ')[0] || '',
            zip: suggestion.secondaryText.split(' ').pop() || '',
            country: 'USA'
          }
        }
      }

      onChange(addressData.street)

      if (onAddressSelect) {
        onAddressSelect(addressData)
      }

      console.log('📍 Address selected:', addressData)
    } catch (err) {
      console.error('Failed to get address details:', err)
      setError('Failed to get address details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          onFocus={() => value.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
              // If suggestions are showing, select the first one
              if (showSuggestions && suggestions.length > 0) {
                handleAddressSelect(suggestions[0])
              }
            }
          }}
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
        ) : (
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* API source indicator */}
      {isGoogleAvailable && (
        <div className="absolute -top-5 right-0 text-[10px] text-gray-400">
          Powered by Google
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && value.length > 2 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 p-3 text-center text-sm text-gray-500 z-50 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            Searching addresses...
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 border-b border-gray-100 flex items-center justify-between">
            <span>📍 Select an address to auto-fill all fields</span>
            {isGoogleAvailable && (
              <span className="text-[10px] text-green-600 font-medium">Google Places</span>
            )}
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId || index}
              type="button"
              className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors group"
              onClick={() => handleAddressSelect(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mt-0.5 flex-shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                    {suggestion.mainText}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors truncate">
                    {suggestion.secondaryText}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-orange-200 rounded-md mt-1 p-3 text-center text-sm text-orange-600 z-50 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

// Export the AddressData type for use in other components
export type { AddressData as AddressDataType }
