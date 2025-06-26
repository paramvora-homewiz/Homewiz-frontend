'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Simple types
interface Building {
  building_id: string
  building_name: string
  operator_id?: number
  floors?: number
  total_rooms?: number
  available: boolean
}

interface SimpleFormDataContextType {
  buildings: Building[]
  buildingsLoading: boolean
  buildingsError: string | null
}

const SimpleFormDataContext = createContext<SimpleFormDataContextType | undefined>(undefined)

export function SimpleFormDataProvider({ children }: { children: React.ReactNode }) {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [buildingsLoading, setBuildingsLoading] = useState(false)
  const [buildingsError, setBuildingsError] = useState<string | null>(null)

  // Mock buildings data for demo
  const MOCK_BUILDINGS: Building[] = [
    {
      building_id: 'bldg_sunset_001',
      building_name: 'Sunset Apartments',
      operator_id: 1,
      floors: 5,
      total_rooms: 50,
      available: true
    },
    {
      building_id: 'bldg_garden_002',
      building_name: 'Garden View Complex',
      operator_id: 1,
      floors: 8,
      total_rooms: 80,
      available: true
    },
    {
      building_id: 'bldg_downtown_003',
      building_name: 'Downtown Lofts',
      operator_id: 2,
      floors: 12,
      total_rooms: 120,
      available: true
    }
  ]

  // Load demo data on mount
  useEffect(() => {
    setBuildingsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setBuildings(MOCK_BUILDINGS)
      setBuildingsLoading(false)
    }, 100)
  }, [])

  const contextValue: SimpleFormDataContextType = {
    buildings,
    buildingsLoading,
    buildingsError
  }

  return (
    <SimpleFormDataContext.Provider value={contextValue}>
      {children}
    </SimpleFormDataContext.Provider>
  )
}

export function useSimpleFormData() {
  const context = useContext(SimpleFormDataContext)
  if (context === undefined) {
    throw new Error('useSimpleFormData must be used within a SimpleFormDataProvider')
  }
  return context
}