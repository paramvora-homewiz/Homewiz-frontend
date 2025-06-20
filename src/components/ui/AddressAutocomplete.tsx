'use client'

import React, { useState, useEffect } from 'react'
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

// Mock address suggestions (in real app, this would use Google Places API)
const MOCK_ADDRESSES = [
  {
    fullAddress: '123 Main Street, New York, NY 10001',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA'
  },
  {
    fullAddress: '456 Oak Avenue, Los Angeles, CA 90210',
    street: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90210',
    country: 'USA'
  },
  {
    fullAddress: '789 Pine Road, Chicago, IL 60601',
    street: '789 Pine Road',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    country: 'USA'
  },
  {
    fullAddress: '321 Elm Street, Boston, MA 02101',
    street: '321 Elm Street',
    city: 'Boston',
    state: 'MA',
    zip: '02101',
    country: 'USA'
  },
  {
    fullAddress: '654 Maple Drive, Seattle, WA 98101',
    street: '654 Maple Drive',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'USA'
  }
]

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  onAddressSelect, 
  placeholder = "Enter address...",
  className = ""
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (value.length > 2) {
      setIsLoading(true)
      // Simulate API delay
      const timer = setTimeout(() => {
        const filtered = MOCK_ADDRESSES.filter(addr => 
          addr.fullAddress.toLowerCase().includes(value.toLowerCase())
        )
        setSuggestions(filtered)
        setShowSuggestions(true)
        setIsLoading(false)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [value])

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
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 p-3 text-center text-sm text-gray-500 z-10">
          Searching addresses...
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
          {suggestions.map((address, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{address.street}</div>
                  <div className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zip}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showSuggestions && suggestions.length === 0 && !isLoading && value.length > 2 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md mt-1 p-3 text-center text-sm text-gray-500 z-10">
          No addresses found. Try a different search.
        </div>
      )}
    </div>
  )
}

// Export the AddressData type for use in other components
export type { AddressData }
