'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getBuildings, getRooms, getOperators } from '../../lib/api-client'
import { databaseService } from '../../lib/supabase/database'
import { isSupabaseAvailable } from '../../lib/supabase/client'
import config from '../../lib/config'

// Types for form data
interface Operator {
  operator_id: number
  name: string
  email: string
  operator_type: 'LEASING_AGENT' | 'MAINTENANCE' | 'BUILDING_MANAGER' | 'ADMIN'
  active: boolean
}

interface Building {
  building_id: string
  building_name: string
  operator_id?: number
  floors?: number
  total_rooms?: number
  available: boolean
}

interface Room {
  room_id: string
  room_number: string
  building_id: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
  private_room_rent?: number
  shared_room_rent_2?: number
  ready_to_rent: boolean
}

interface FormDataContextType {
  // Data
  operators: Operator[]
  buildings: Building[]
  rooms: Room[]
  
  // Loading states
  operatorsLoading: boolean
  buildingsLoading: boolean
  roomsLoading: boolean
  
  // Error states
  operatorsError: string | null
  buildingsError: string | null
  roomsError: string | null
  
  // Methods
  refreshOperators: () => Promise<void>
  refreshBuildings: () => Promise<void>
  refreshRooms: () => Promise<void>
  refreshAll: () => Promise<void>
  
  // Filtered data helpers
  getOperatorsByType: (type: string) => Operator[]
  getRoomsByBuilding: (buildingId: string) => Room[]
  getAvailableRooms: () => Room[]
  getBuildingsByOperator: (operatorId: number) => Building[]
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined)

interface FormDataProviderProps {
  children: ReactNode
  /**
   * Configuration options for data loading
   * - loadOperators: Whether to load operators data (default: true)
   * - loadBuildings: Whether to load buildings data (default: true) 
   * - loadRooms: Whether to load rooms data (default: true)
   * - useMockData: Force use of mock data instead of API/Supabase (default: false)
   * - autoRefresh: Enable automatic data refresh (default: false)
   */
  config?: {
    loadOperators?: boolean
    loadBuildings?: boolean
    loadRooms?: boolean
    useMockData?: boolean
    autoRefresh?: boolean
  }
}

/**
 * FormDataProvider - Centralized Data Management for Form Components
 * 
 * This provider manages data loading, caching, and state for all form components in the application.
 * It handles both Supabase and backend API fallbacks with intelligent error handling and retry logic.
 * 
 * Features:
 * - Smart data source selection (Supabase preferred, API fallback)
 * - Configurable data loading (operators, buildings, rooms)
 * - Real-time data refresh capabilities
 * - Error handling with graceful degradation to demo data
 * - Performance optimization with loading state management
 * 
 * @param children - Child components that will have access to form data context
 * @param config - Configuration object to control which data is loaded and how
 */
export function FormDataProvider({ children, config: providerConfig }: FormDataProviderProps) {
  // Default configuration
  const defaultConfig = {
    loadOperators: true,
    loadBuildings: true,
    loadRooms: true,
    useMockData: false,
    autoRefresh: false
  }
  
  const finalConfig = React.useMemo(() => ({ ...defaultConfig, ...providerConfig }), [providerConfig])
  // State for operators
  const [operators, setOperators] = useState<Operator[]>([])
  const [operatorsLoading, setOperatorsLoading] = useState(false)
  const [operatorsError, setOperatorsError] = useState<string | null>(null)
  
  // State for buildings
  const [buildings, setBuildings] = useState<Building[]>([])
  const [buildingsLoading, setBuildingsLoading] = useState(false)
  const [buildingsError, setBuildingsError] = useState<string | null>(null)
  
  // State for rooms
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState<string | null>(null)

  // Real API configuration - using config module for consistency
  // Note: API_BASE_URL is not used since we're using apiService which already has the correct URL
  const MOCK_OPERATORS: Operator[] = [
    {
      operator_id: 1,
      name: 'John Smith',
      email: 'john.smith@homewiz.com',
      operator_type: 'BUILDING_MANAGER',
      active: true
    },
    {
      operator_id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@homewiz.com',
      operator_type: 'LEASING_AGENT',
      active: true
    },
    {
      operator_id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@homewiz.com',
      operator_type: 'MAINTENANCE',
      active: true
    },
    {
      operator_id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@homewiz.com',
      operator_type: 'ADMIN',
      active: true
    }
  ]

  // Demo operators data for fallback
  const demoOperators: Operator[] = [
    {
      operator_id: 1,
      name: 'John Smith',
      email: 'john.smith@homewiz.com',
      operator_type: 'BUILDING_MANAGER',
      active: true
    },
    {
      operator_id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@homewiz.com',
      operator_type: 'LEASING_AGENT',
      active: true
    },
    {
      operator_id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@homewiz.com',
      operator_type: 'MAINTENANCE',
      active: true
    }
  ]

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

  const MOCK_ROOMS: Room[] = [
    {
      room_id: 'room_sunset_101',
      room_number: '101',
      building_id: 'bldg_sunset_001',
      status: 'AVAILABLE',
      private_room_rent: 800,
      shared_room_rent_2: 500,
      ready_to_rent: true
    },
    {
      room_id: 'room_sunset_102',
      room_number: '102',
      building_id: 'bldg_sunset_001',
      status: 'OCCUPIED',
      private_room_rent: 850,
      shared_room_rent_2: 525,
      ready_to_rent: false
    },
    {
      room_id: 'room_garden_201',
      room_number: '201',
      building_id: 'bldg_garden_002',
      status: 'AVAILABLE',
      private_room_rent: 900,
      shared_room_rent_2: 550,
      ready_to_rent: true
    },
    {
      room_id: 'room_garden_202',
      room_number: '202',
      building_id: 'bldg_garden_002',
      status: 'MAINTENANCE',
      private_room_rent: 900,
      shared_room_rent_2: 550,
      ready_to_rent: false
    },
    {
      room_id: 'room_downtown_301',
      room_number: '301',
      building_id: 'bldg_downtown_003',
      status: 'AVAILABLE',
      private_room_rent: 1200,
      shared_room_rent_2: 700,
      ready_to_rent: true
    }
  ]

  // Map backend role to frontend operator_type
  const mapRoleToOperatorType = (role: string): 'LEASING_AGENT' | 'MAINTENANCE' | 'BUILDING_MANAGER' | 'ADMIN' => {
    switch (role.toLowerCase()) {
      case 'property manager':
      case 'building manager':
        return 'BUILDING_MANAGER'
      case 'assistant manager':
      case 'admin':
        return 'ADMIN'
      case 'maintenance':
      case 'maintenance supervisor':
        return 'MAINTENANCE'
      case 'leasing agent':
      case 'leasing':
        return 'LEASING_AGENT'
      default:
        return 'LEASING_AGENT' // Default fallback
    }
  }

  // Transform backend operator data to frontend format
  const transformOperatorData = (backendOperators: any[]): Operator[] => {
    return backendOperators.map(op => ({
      operator_id: op.operator_id,
      name: op.name,
      email: op.email,
      operator_type: mapRoleToOperatorType(op.role || 'Leasing Agent'),
      active: op.active
    }))
  }

  /**
   * Intelligent operator data fetching with multi-source fallback
   * 
   * Implements a smart data fetching strategy:
   * 1. Try Supabase first if enabled or backend is disabled
   * 2. Fall back to backend API if Supabase fails
   * 3. Transform data to ensure consistent frontend format
   * 4. Return mock data as last resort
   * 
   * @returns Promise<Operator[]> - Array of operator objects in frontend format
   */
  const fetchOperators = async (): Promise<Operator[]> => {
    // Use Supabase if backend is disabled or if Supabase is available and backend is not preferred
    if (config.api.disabled || (isSupabaseAvailable() && !config.api.preferCloud)) {
      console.log('🔄 Fetching operators from Supabase...')
      const result = await databaseService.operators.list()
      if (result.success && result.data) {
        console.log('✅ Operators fetched from Supabase:', result.data.length, 'operators')
        return result.data.map((op: any) => ({
          operator_id: parseInt(op.operator_id) || 0,
          name: op.name || '',
          email: op.email,
          operator_type: op.operator_type || 'LEASING_AGENT',
          active: op.active !== undefined ? Boolean(op.active) : true
        })) as Operator[]
      } else {
        console.error('❌ Failed to fetch operators from Supabase:', result.error)
        return MOCK_OPERATORS
      }
    } else if (!config.api.disabled) {
      // Try backend API only if not disabled
      try {
        console.log('🔄 Fetching operators from API...')
        const data = await getOperators()
        console.log('✅ Operators fetched from backend:', data.length, 'operators')

        // Transform backend data to frontend format
        const transformedData = transformOperatorData(data)
        console.log('🔄 Transformed operators:', transformedData.map(op => `${op.name} (${op.operator_type})`))

        return transformedData
      } catch (error) {
        console.warn('⚠️ Backend API failed, trying Supabase fallback...')

        // Fallback to Supabase if backend fails and Supabase is available
        if (isSupabaseAvailable()) {
          console.log('🔄 Fetching operators from Supabase (fallback)...')
          const result = await databaseService.operators.list()
          if (result.success && result.data) {
            console.log('✅ Operators fetched from Supabase fallback:', result.data.length, 'operators')
            return result.data.map((op: any) => ({
              operator_id: parseInt(op.operator_id) || 0,
              name: op.name || '',
              email: op.email,
              operator_type: op.operator_type || 'LEASING_AGENT',
              active: op.active !== undefined ? Boolean(op.active) : true
            })) as Operator[]
          }
        }

        // If both fail, throw the original error
        throw error
      }
    }
  }

  // Fetch buildings from API or Supabase
  const fetchBuildings = async (): Promise<Building[]> => {
    // Use Supabase if backend is disabled or if Supabase is available and backend is not preferred
    if (config.api.disabled || (isSupabaseAvailable() && !config.api.preferCloud)) {
      console.log('🔄 Fetching buildings from Supabase...')
      const result = await databaseService.buildings.list()
      if (result.success && result.data) {
        console.log('✅ Buildings fetched from Supabase:', result.data.length, 'buildings')
        return result.data.map((bldg: any) => ({
          building_id: bldg.building_id,
          building_name: bldg.building_name || bldg.name,
          operator_id: bldg.operator_id,
          floors: bldg.floors || bldg.total_floors,
          total_rooms: bldg.total_rooms || bldg.total_units,
          available: bldg.available || bldg.available_units > 0
        })) as Building[]
      } else {
        console.error('❌ Failed to fetch buildings from Supabase:', result.error)
        return []
      }
    } else if (!config.api.disabled) {
      // Try backend API only if not disabled
      try {
        console.log('🔄 Fetching buildings from API...')
        const data = await getBuildings()
        console.log('✅ Buildings fetched:', data.length, 'buildings')
        return data
      } catch (error) {
        console.warn('⚠️ Backend API failed, trying Supabase fallback for buildings...')

        // Fallback to Supabase if backend fails and Supabase is available
        if (isSupabaseAvailable()) {
          console.log('🔄 Fetching buildings from Supabase (fallback)...')
          const result = await databaseService.buildings.list()
          if (result.success && result.data) {
            console.log('✅ Buildings fetched from Supabase fallback:', result.data.length, 'buildings')
            return result.data.map((bldg: any) => ({
              building_id: bldg.building_id,
              building_name: bldg.building_name || bldg.name,
              operator_id: bldg.operator_id,
              floors: bldg.floors || bldg.total_floors,
              total_rooms: bldg.total_rooms || bldg.total_units,
              available: bldg.available || bldg.available_units > 0
            })) as Building[]
          }
        }

        // If both fail, throw the original error
        throw error
      }
    }
  }

  // Fetch rooms from API or Supabase
  const fetchRooms = async (): Promise<Room[]> => {
    // Use Supabase if backend is disabled or if Supabase is available and backend is not preferred
    if (config.api.disabled || (isSupabaseAvailable() && !config.api.preferCloud)) {
      console.log('🔄 Fetching rooms from Supabase...')
      const result = await databaseService.rooms.list()
      if (result.success && result.data) {
        console.log('✅ Rooms fetched from Supabase:', result.data.length, 'rooms')
        return result.data as Room[]
      } else {
        console.error('❌ Failed to fetch rooms from Supabase:', result.error)
        return MOCK_ROOMS
      }
    } else if (!config.api.disabled) {
      // Try backend API only if not disabled
      try {
        console.log('🔄 Fetching rooms from API...')
        const data = await getRooms()
        console.log('✅ Rooms fetched:', data.length, 'rooms')
        return data
      } catch (error) {
        console.warn('⚠️ Backend API failed, trying Supabase fallback for rooms...')

        // Fallback to Supabase if backend fails and Supabase is available
        if (isSupabaseAvailable()) {
          console.log('🔄 Fetching rooms from Supabase (fallback)...')
          const result = await databaseService.rooms.list()
          if (result.success && result.data) {
            console.log('✅ Rooms fetched from Supabase fallback:', result.data.length, 'rooms')
            return result.data as Room[]
          }
        }

        // If both fail, throw the original error
        throw error
      }
    }
  }

  // Refresh operators
  const refreshOperators = React.useCallback(async () => {
    setOperatorsLoading(true)
    setOperatorsError(null)
    try {
      const data = await fetchOperators()
      setOperators(data)
      console.log('📊 Dashboard Update: Operators count updated to', data.length)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch operators'
      setOperatorsError(errorMessage)
      console.error('❌ Error fetching operators:', error)
      
      // If it's a connection error, show demo mode
      if (errorMessage.includes('Backend server not running') || errorMessage.includes('Failed to fetch')) {
        console.log('🎭 Using demo data for operators (backend not available)')
        setOperators(demoOperators)
      }
    } finally {
      setOperatorsLoading(false)
    }
  }, [])

  // Refresh buildings
  const refreshBuildings = React.useCallback(async () => {
    setBuildingsLoading(true)
    setBuildingsError(null)
    try {
      const data = await fetchBuildings()
      setBuildings(data)
      console.log('📊 Dashboard Update: Buildings count updated to', data.length)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch buildings'
      setBuildingsError(errorMessage)
      console.error('❌ Error fetching buildings:', error)
      
      // If it's a connection error and we're not using Supabase, show demo mode
      if (errorMessage.includes('Backend server not running') || errorMessage.includes('Failed to fetch')) {
        if (config.api.disabled || isSupabaseAvailable()) {
          console.log('🔧 Supabase mode enabled but no data available')
          setBuildings([]) // Empty for Supabase mode
        } else {
          console.log('🎭 Using demo data for buildings (backend not available)')
          setBuildings([]) // Empty for demo, or add demo buildings if needed
        }
      }
    } finally {
      setBuildingsLoading(false)
    }
  }, [])

  // Refresh rooms
  const refreshRooms = React.useCallback(async () => {
    setRoomsLoading(true)
    setRoomsError(null)
    try {
      const data = await fetchRooms()
      setRooms(data)
      const availableRooms = data.filter(room => room.status === 'AVAILABLE' && room.ready_to_rent)
      console.log('📊 Dashboard Update: Total rooms updated to', data.length, '| Available rooms:', availableRooms.length)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rooms'
      setRoomsError(errorMessage)
      console.error('❌ Error fetching rooms:', error)
      
      // If it's a connection error and we're not using Supabase, show demo mode
      if (errorMessage.includes('Backend server not running') || errorMessage.includes('Failed to fetch')) {
        if (config.api.disabled || isSupabaseAvailable()) {
          console.log('🔧 Supabase mode enabled but no data available')
          setRooms([]) // Empty for Supabase mode
        } else {
          console.log('🎭 Using demo data for rooms (backend not available)')
          setRooms([]) // Empty for demo, or add demo rooms if needed
        }
      }
    } finally {
      setRoomsLoading(false)
    }
  }, [])

  // Refresh all data
  const refreshAll = React.useCallback(async () => {
    const promises: Promise<void>[] = []
    
    if (finalConfig.loadOperators) {
      promises.push(refreshOperators())
    }
    if (finalConfig.loadBuildings) {
      promises.push(refreshBuildings())
    }
    if (finalConfig.loadRooms) {
      promises.push(refreshRooms())
    }
    
    await Promise.all(promises)
  }, [refreshOperators, refreshBuildings, refreshRooms, finalConfig])

  // Helper methods for filtered data
  const getOperatorsByType = React.useCallback((type: string): Operator[] => {
    return operators.filter(op => op.operator_type === type && op.active)
  }, [operators])

  const getRoomsByBuilding = React.useCallback((buildingId: string): Room[] => {
    return rooms.filter(room => room.building_id === buildingId)
  }, [rooms])

  const getAvailableRooms = React.useCallback((): Room[] => {
    return rooms.filter(room => room.status?.toUpperCase() === 'AVAILABLE' && room.ready_to_rent)
  }, [rooms])

  const getBuildingsByOperator = React.useCallback((operatorId: number): Building[] => {
    return buildings.filter(building => building.operator_id === operatorId && building.available)
  }, [buildings])

  // Load initial data on mount
  useEffect(() => {
    // Log the current data source mode
    if (config.api.disabled || isSupabaseAvailable()) {
      console.log('🔧 FormDataProvider: Using Supabase cloud database')
    } else if (config.api.disabled) {
      console.log('🎭 FormDataProvider: Backend disabled, Supabase not available - using demo mode')
    } else {
      console.log('🔌 FormDataProvider: Using backend API')
    }

    refreshAll()
  }, [refreshAll])

  const contextValue: FormDataContextType = React.useMemo(() => ({
    // Data
    operators,
    buildings,
    rooms,
    
    // Loading states
    operatorsLoading,
    buildingsLoading,
    roomsLoading,
    
    // Error states
    operatorsError,
    buildingsError,
    roomsError,
    
    // Methods
    refreshOperators,
    refreshBuildings,
    refreshRooms,
    refreshAll,
    
    // Filtered data helpers
    getOperatorsByType,
    getRoomsByBuilding,
    getAvailableRooms,
    getBuildingsByOperator
  }), [
    operators,
    buildings,
    rooms,
    operatorsLoading,
    buildingsLoading,
    roomsLoading,
    operatorsError,
    buildingsError,
    roomsError,
    refreshOperators,
    refreshBuildings,
    refreshRooms,
    refreshAll,
    getOperatorsByType,
    getRoomsByBuilding,
    getAvailableRooms,
    getBuildingsByOperator
  ])

  return (
    <FormDataContext.Provider value={contextValue}>
      {children}
    </FormDataContext.Provider>
  )
}

// Custom hook to use the form data context
export function useFormData() {
  const context = useContext(FormDataContext)
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider')
  }
  return context
}

// Higher-order component to wrap forms with data provider
export function withFormData<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <FormDataProvider>
        <Component {...props} />
      </FormDataProvider>
    )
  }
}

// Utility component for displaying loading states
export function FormDataLoader({ 
  loading, 
  error, 
  children, 
  fallback 
}: { 
  loading: boolean
  error: string | null
  children: ReactNode
  fallback?: ReactNode
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex">
          <div className="text-red-400">⚠️</div>
          <div className="ml-2">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Compatibility exports for SimpleFormDataProvider
export function SimpleFormDataProvider({ children }: { children: React.ReactNode }) {
  return (
    <FormDataProvider config={{ loadOperators: false, loadRooms: false, loadBuildings: true }}>
      {children}
    </FormDataProvider>
  )
}

export function useSimpleFormData() {
  const context = useFormData()
  return {
    buildings: context.buildings,
    buildingsLoading: context.buildingsLoading,
    buildingsError: context.buildingsError
  }
}

// Smart select component that handles foreign key relationships
interface SmartSelectProps {
  label: string
  value: string | number | undefined
  onChange: (value: string | number | undefined) => void
  options: Array<{ value: string | number; label: string; disabled?: boolean }>
  placeholder?: string
  required?: boolean
  loading?: boolean
  error?: string
  helpText?: string
  className?: string
}

export function SmartSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  loading = false,
  error,
  helpText,
  className = ""
}: SmartSelectProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <select
        value={value || ''}
        onChange={(e) => {
          const val = e.target.value
          onChange(val === '' ? undefined : (isNaN(Number(val)) ? val : Number(val)))
        }}
        disabled={loading}
        className={`w-full p-2 border border-gray-300 rounded-md ${
          error ? 'border-red-500' : ''
        } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helpText && !error && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
    </div>
  )
}
