'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect?: (addressData: AddressData) => void
  placeholder?: string
  className?: string
}

interface AddressData {
  fullAddress: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

// Nominatim API response interface
interface NominatimResult {
  display_name: string
  address: {
    house_number?: string
    road?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country?: string
  }
}

// Rate limiting for API calls
const API_DELAY = 500 // ms between requests
let debounceTimer: NodeJS.Timeout | null = null

// Address API service
const searchAddresses = async (query: string): Promise<AddressData[]> => {
  try {
    // Option 1: OpenStreetMap Nominatim API (free, no API key needed)
    // Rate limited but good for development and basic usage
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}&` +
      `format=json&` +
      `limit=5&` +
      `countrycodes=us&` + // Limit to US addresses
      `addressdetails=1&` +
      `extratags=1`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HomeWiz Property Management App' // Required by Nominatim
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
        country: addr.country || 'USA'
      }
    }).filter(addr => addr.street && addr.city && addr.state) // Only include complete addresses
    
  } catch (error) {
    console.error('Address search failed:', error)
    return []
  }
}

/* 
// Option 2: Google Places API (more accurate but requires API key and billing)
// To use Google Places API instead, replace the searchAddresses function above with:

const searchAddresses = async (query: string): Promise<AddressData[]> => {
  try {
    const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error('Google Places API key not configured')
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
      `input=${encodeURIComponent(query)}&` +
      `types=address&` +
      `components=country:us&` +
      `key=${GOOGLE_PLACES_API_KEY}`
    )

    const data = await response.json()
    
    // Note: You'd need to make additional calls to get detailed address info
    // This is a simplified example - Google Places requires place details API calls
    return data.predictions?.map((prediction: any) => ({
      fullAddress: prediction.description,
      street: '', // Would need place details API call
      city: '',   // Would need place details API call  
      state: '',  // Would need place details API call
      zip: '',    // Would need place details API call
      country: 'USA'
    })) || []
    
  } catch (error) {
    console.error('Google Places API failed:', error)
    return []
  }
}
*/

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  onAddressSelect, 
  placeholder = "Start typing address (e.g. 123 Main St, Boston)",
  className = ""
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await searchAddresses(searchQuery)
      setSuggestions(results)
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

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer
    debounceTimer = setTimeout(() => {
      debouncedSearch(value)
    }, API_DELAY)

    // Cleanup
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [value, debouncedSearch])

  const handleAddressSelect = (address: AddressData) => {
    onChange(address.fullAddress)
    setShowSuggestions(false)
    if (onAddressSelect) {
      onAddressSelect(address)
    }
  }

  const handleInputChange = (newValue: string) => {
    onChange(newValue)
    if (newValue.length <= 2) {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          onFocus={() => value.length > 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 p-3 text-center text-sm text-gray-500 z-10 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            Searching addresses...
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 border-b border-gray-100">
            📍 Select an address to auto-fill all fields
          </div>
          {suggestions.map((address, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors group"
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mt-0.5 flex-shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                    {address.street}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                    {address.city}, {address.state} {address.zip}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-red-200 rounded-md mt-1 p-3 text-center text-sm text-red-600 z-10 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        </div>
      )}

      {/* No results - only show if no error */}
      {showSuggestions && suggestions.length === 0 && !isLoading && !error && value.length > 2 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 p-3 text-center text-sm text-gray-500 z-10 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <span>🔍</span>
            No addresses found. Try a more specific search.
          </div>
        </div>
      )}
    </div>
  )
}

// Export the AddressData type for use in other components
export type { AddressData }
