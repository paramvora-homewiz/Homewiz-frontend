'use client'

import React, { useState, useEffect } from 'react'
import { Building, MapPin, Home, DollarSign, Users, Calendar, Check, X, Loader2, Search, Filter, BedDouble, Bath, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface BuildingData {
  building_id: string
  building_name: string
  address: string
  city: string
  state: string
  zip_code: string
  total_units: number
  available_units: number
  amenities?: string[]
  image_urls?: string[]
  building_images?: string | string[]
}

interface RoomData {
  room_id: string
  room_number: string
  room_type: string
  private_room_rent: number
  status: string
  ready_to_rent: boolean
  floor_number: number
  furnished: boolean
  bathroom_included: boolean
  square_footage?: number
  room_images?: string | string[]
  image_urls?: string[]
}

export default function PropertyExplorer() {
  const [buildings, setBuildings] = useState<BuildingData[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingData | null>(null)
  const [rooms, setRooms] = useState<RoomData[]>([])
  const [loading, setLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'under2000' | '2000-3000' | 'over3000'>('all')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true)

  // Fetch all buildings
  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('building_name')

      if (error) throw error
      
      // Process building images
      const processedBuildings = (data || []).map(building => {
        let images: string[] = []
        
        // Handle different image formats
        if (building.building_images) {
          if (Array.isArray(building.building_images)) {
            images = building.building_images
          } else if (typeof building.building_images === 'string') {
            try {
              // Try parsing as JSON array
              if (building.building_images.startsWith('[')) {
                images = JSON.parse(building.building_images)
              } else if (building.building_images.includes(',')) {
                // Comma-separated URLs
                images = building.building_images.split(',').map(url => url.trim())
              } else {
                // Single URL
                images = [building.building_images]
              }
            } catch {
              images = [building.building_images]
            }
          }
        }
        
        return {
          ...building,
          image_urls: images.filter((url: string) => url && url.trim())
        }
      })
      
      setBuildings(processedBuildings)
    } catch (error) {
      console.error('Error fetching buildings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch rooms for selected building
  const fetchRoomsForBuilding = async (buildingId: string) => {
    setRoomsLoading(true)
    try {
      let query = supabase
        .from('rooms')
        .select('*')
        .eq('building_id', buildingId)
        .order('room_number')

      if (showOnlyAvailable) {
        query = query.in('status', ['AVAILABLE', 'Available'])
      }

      const { data, error } = await query

      if (error) throw error
      
      // Process room images
      const processedRooms = (data || []).map(room => {
        let images: string[] = []
        
        // Handle different image formats
        if (room.room_images) {
          if (Array.isArray(room.room_images)) {
            images = room.room_images
          } else if (typeof room.room_images === 'string') {
            try {
              // Try parsing as JSON array
              if (room.room_images.startsWith('[')) {
                images = JSON.parse(room.room_images)
              } else if (room.room_images.includes(',')) {
                // Comma-separated URLs
                images = room.room_images.split(',').map((url: string) => url.trim())
              } else {
                // Single URL
                images = [room.room_images]
              }
            } catch {
              images = [room.room_images]
            }
          }
        }
        
        return {
          ...room,
          image_urls: images.filter((url: string) => url && url.trim())
        }
      })
      
      setRooms(processedRooms)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setRoomsLoading(false)
    }
  }

  // Handle building selection
  const handleBuildingSelect = (building: BuildingData) => {
    setSelectedBuilding(building)
    fetchRoomsForBuilding(building.building_id)
  }

  // Filter buildings based on search
  const filteredBuildings = buildings.filter(building =>
    building.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter rooms based on price
  const filteredRooms = rooms.filter(room => {
    if (priceFilter === 'all') return true
    if (priceFilter === 'under2000') return room.private_room_rent < 2000
    if (priceFilter === '2000-3000') return room.private_room_rent >= 2000 && room.private_room_rent <= 3000
    if (priceFilter === 'over3000') return room.private_room_rent > 3000
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building className="w-6 h-6" />
              Property Explorer
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search buildings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Building List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Buildings ({filteredBuildings.length})
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredBuildings.map((building) => (
                    <motion.div
                      key={building.building_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleBuildingSelect(building)}
                      className={`rounded-lg border cursor-pointer transition-all overflow-hidden ${
                        selectedBuilding?.building_id === building.building_id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {/* Building Image */}
                      {building.image_urls && building.image_urls.length > 0 && (
                        <div className="relative h-32 w-full bg-gray-100 dark:bg-gray-800">
                          <img
                            src={building.image_urls[0]}
                            alt={building.building_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          {building.image_urls.length > 1 && (
                            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                              +{building.image_urls.length - 1} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {building.building_name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          {building.city}, {building.state}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {building.total_units} units
                          </span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {building.available_units} available
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Room Details */}
          <div className="lg:col-span-2">
            {selectedBuilding ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {/* Building Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                  {/* Building Images Carousel */}
                  {selectedBuilding.image_urls && selectedBuilding.image_urls.length > 0 && (
                    <div className="mb-4">
                      <div className="relative h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={selectedBuilding.image_urls[0]}
                          alt={selectedBuilding.building_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-building.svg'
                          }}
                        />
                        {selectedBuilding.image_urls.length > 1 && (
                          <div className="absolute bottom-4 right-4 flex gap-2">
                            {selectedBuilding.image_urls.slice(1, 4).map((url, idx) => (
                              <div key={idx} className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                                <img
                                  src={url}
                                  alt={`${selectedBuilding.building_name} ${idx + 2}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            ))}
                            {selectedBuilding.image_urls.length > 4 && (
                              <div className="w-16 h-16 rounded-md bg-black/60 flex items-center justify-center text-white text-sm font-medium">
                                +{selectedBuilding.image_urls.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedBuilding.building_name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedBuilding.address}, {selectedBuilding.city}, {selectedBuilding.state} {selectedBuilding.zip_code}
                  </p>
                  
                  {selectedBuilding.amenities && selectedBuilding.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedBuilding.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Room Filters */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Available Rooms
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
                    >
                      <option value="all">All Prices</option>
                      <option value="under2000">Under $2,000</option>
                      <option value="2000-3000">$2,000 - $3,000</option>
                      <option value="over3000">Over $3,000</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={showOnlyAvailable}
                        onChange={(e) => {
                          setShowOnlyAvailable(e.target.checked)
                          if (selectedBuilding) {
                            fetchRoomsForBuilding(selectedBuilding.building_id)
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Available only</span>
                    </label>
                  </div>
                </div>

                {/* Rooms Grid */}
                {roomsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {filteredRooms.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        No rooms match your criteria
                      </div>
                    ) : (
                      filteredRooms.map((room) => (
                        <motion.div
                          key={room.room_id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          {/* Room Image */}
                          {room.image_urls && room.image_urls.length > 0 && (
                            <div className="relative h-40 w-full bg-gray-100 dark:bg-gray-800">
                              <img
                                src={room.image_urls[0]}
                                alt={`Room ${room.room_number}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-room.svg'
                                }}
                              />
                              {room.image_urls.length > 1 && (
                                <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                                  {room.image_urls.length} photos
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Room {room.room_number}
                              </h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                room.status === 'AVAILABLE' || room.status === 'Available'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {room.status}
                              </span>
                            </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Type</span>
                              <span className="font-medium text-gray-900 dark:text-white">{room.room_type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Monthly Rent</span>
                              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                ${room.private_room_rent}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Floor</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {room.floor_number === 1 ? '1st' : room.floor_number === 2 ? '2nd' : room.floor_number === 3 ? '3rd' : `${room.floor_number}th`}
                              </span>
                            </div>
                            {room.square_footage && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Size</span>
                                <span className="font-medium text-gray-900 dark:text-white">{room.square_footage} sq ft</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            {room.furnished && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <BedDouble className="w-3 h-3" />
                                Furnished
                              </div>
                            )}
                            {room.bathroom_included && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                <Bath className="w-3 h-3" />
                                Private Bath
                              </div>
                            )}
                          </div>

                            <button className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                              Schedule Tour
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Building className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a building to view available rooms and pricing
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}