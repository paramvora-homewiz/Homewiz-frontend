import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface RoomSearchParams {
  priceMin?: number
  priceMax?: number
  bedrooms?: number
  city?: string
  amenities?: string[]
  petFriendly?: boolean
  furnished?: boolean
}

export interface BuildingInfo {
  building_id: string
  building_name: string
  address: string
  city: string
  state: string
  zip_code: string
  total_units: number
  available_units: number
  amenities?: string[]
  year_built?: number
  parking_available?: boolean
  elevator?: boolean
  gym?: boolean
  pool?: boolean
  laundry_in_building?: boolean
  pets_allowed?: boolean
  virtual_tour_url?: string
  contact_phone?: string
  contact_email?: string
  building_images?: string | string[]
  building_videos?: string | string[]
}

export interface RoomInfo {
  room_id: string
  building_id: string
  room_number: string
  room_type: string
  square_footage?: number
  private_room_rent?: number
  shared_room_rent_2?: number
  shared_room_rent_3?: number
  shared_room_rent_4?: number
  bathroom_included?: boolean
  furnished?: boolean
  available_from?: string
  floor_number?: number
  room_images?: string[]
  building?: BuildingInfo
}

export class SupabaseChatService {
  // Search for rooms based on natural language parameters
  static async searchRooms(params: RoomSearchParams): Promise<RoomInfo[]> {
    try {
      let query = supabase
        .from('rooms')
        .select(`
          *,
          buildings (
            building_id,
            building_name,
            address,
            city,
            state,
            zip_code,
            total_units,
            available_units,
            amenities,
            year_built,
            parking_available,
            elevator,
            gym,
            pool,
            laundry_in_building,
            pets_allowed,
            virtual_tour_url,
            contact_phone,
            contact_email,
            building_images,
            building_videos
          )
        `)
        .eq('ready_to_rent', true)

      // Apply price filters
      if (params.priceMin) {
        query = query.gte('private_room_rent', params.priceMin)
      }
      if (params.priceMax) {
        query = query.lte('private_room_rent', params.priceMax)
      }

      // Apply city filter
      if (params.city) {
        query = query.ilike('buildings.city', `%${params.city}%`)
      }

      // Apply bedroom filter (room type)
      if (params.bedrooms) {
        const roomType = params.bedrooms === 1 ? 'Single' : params.bedrooms === 2 ? 'Double' : 'Multiple'
        query = query.eq('room_type', roomType)
      }

      // Apply furnished filter
      if (params.furnished !== undefined) {
        query = query.eq('furnished', params.furnished)
      }

      const { data, error } = await query

      if (error) throw error

      // Post-process for amenities and pet-friendly
      let filteredData = data || []
      
      if (params.petFriendly) {
        filteredData = filteredData.filter(room => room.buildings?.pets_allowed)
      }

      if (params.amenities && params.amenities.length > 0) {
        filteredData = filteredData.filter(room => {
          const buildingAmenities = room.buildings?.amenities || []
          return params.amenities!.every(amenity => 
            buildingAmenities.some((ba: string) => ba.toLowerCase().includes(amenity.toLowerCase()))
          )
        })
      }

      return filteredData.map(room => ({
        ...room,
        building: room.buildings
      }))
    } catch (error) {
      console.error('Error searching rooms:', error)
      throw error
    }
  }

  // Get building details by name or ID
  static async getBuildingInfo(buildingNameOrId: string): Promise<BuildingInfo | null> {
    try {
      // First try by ID
      let { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('building_id', buildingNameOrId)
        .single()

      if (!data || error) {
        // Try by name
        const nameResult = await supabase
          .from('buildings')
          .select('*')
          .ilike('building_name', `%${buildingNameOrId}%`)
          .limit(1)
          .single()
        
        data = nameResult.data
        error = nameResult.error
      }

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting building info:', error)
      return null
    }
  }

  // Get available rooms count by city
  static async getAvailabilityByCity(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('buildings!inner(city)')
        .eq('ready_to_rent', true)

      if (error) throw error

      const cityCount: Record<string, number> = {}
      data?.forEach(room => {
        const city = room.buildings?.city
        if (city) {
          cityCount[city] = (cityCount[city] || 0) + 1
        }
      })

      return cityCount
    } catch (error) {
      console.error('Error getting availability by city:', error)
      return {}
    }
  }

  // Get price statistics
  static async getPriceStats(city?: string): Promise<{
    avg: number
    min: number
    max: number
    median: number
  } | null> {
    try {
      let query = supabase
        .from('rooms')
        .select('private_room_rent, buildings!inner(city)')
        .eq('ready_to_rent', true)
        .not('private_room_rent', 'is', null)

      if (city) {
        query = query.ilike('buildings.city', `%${city}%`)
      }

      const { data, error } = await query

      if (error) throw error
      if (!data || data.length === 0) return null

      const prices = data.map(r => r.private_room_rent).filter(p => p !== null) as number[]
      prices.sort((a, b) => a - b)

      return {
        avg: Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length),
        min: prices[0],
        max: prices[prices.length - 1],
        median: prices[Math.floor(prices.length / 2)]
      }
    } catch (error) {
      console.error('Error getting price stats:', error)
      return null
    }
  }

  // Get featured/popular buildings
  static async getFeaturedBuildings(limit: number = 5): Promise<BuildingInfo[]> {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*, building_images, building_videos')
        .gt('available_units', 0)
        .order('available_units', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting featured buildings:', error)
      return []
    }
  }

  // Search leads (for admin users)
  static async searchLeads(searchTerm?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching leads:', error)
      return []
    }
  }

  // Create a new lead
  static async createLead(leadData: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    move_in_date?: string
    budget_max?: number
    preferred_locations?: string[]
    notes?: string
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('leads')
        .insert([leadData])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating lead:', error)
      return false
    }
  }

  // Schedule a tour
  static async scheduleTour(tourData: {
    lead_id?: string
    building_id: string
    preferred_date: string
    preferred_time: string
    notes?: string
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tours')
        .insert([{
          ...tourData,
          status: 'scheduled'
        }])

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error scheduling tour:', error)
      return false
    }
  }

  // Get all rooms with limit
  static async getAllRooms(limit: number = 10): Promise<RoomInfo[]> {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          buildings (
            building_id,
            building_name,
            address,
            city,
            state,
            zip_code,
            total_units,
            available_units,
            amenities,
            year_built,
            parking_available,
            elevator,
            gym,
            pool,
            laundry_in_building,
            pets_allowed,
            virtual_tour_url,
            contact_phone,
            contact_email,
            building_images,
            building_videos
          )
        `)
        .eq('ready_to_rent', true)
        .limit(limit)

      if (error) throw error

      return (data || []).map(room => ({
        ...room,
        building: room.buildings
      }))
    } catch (error) {
      console.error('Error getting all rooms:', error)
      throw error
    }
  }
}

export default SupabaseChatService