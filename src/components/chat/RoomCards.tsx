import React, { useState } from 'react'
import { Home, DollarSign, BedDouble, Bath, MapPin, Calendar, Camera, Eye } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { parseBuildingImages } from '@/lib/backend-sync'

interface RoomData {
  room_id: string
  room_number: string
  room_type: string
  private_room_rent: number
  status: string
  floor_number: number
  furnished?: boolean
  bathroom_included?: boolean
  room_images?: any // Can be string, array, or null
  buildings?: {
    building_name: string
    city: string
    state: string
    building_images?: any // Building images as fallback
  }
  // Support for singular 'building' as well
  building?: {
    building_name: string
    city: string
    state: string
    building_images?: any
  }
}

interface RoomCardsProps {
  rooms: RoomData[]
  showExploreLink?: boolean
  onRoomClick?: (room: RoomData) => void
}

export default function RoomCards({ rooms, showExploreLink = true, onRoomClick }: RoomCardsProps) {
  const [showAll, setShowAll] = useState(false)
  
  // Debug logging to check room data structure
  console.log('🏠 RoomCards received rooms:', rooms)
  if (rooms.length > 0) {
    console.log('🔍 First room data structure:', {
      room: rooms[0],
      hasBuildings: !!rooms[0].buildings,
      buildingName: rooms[0].buildings?.building_name,
      buildingsObject: rooms[0].buildings,
      // Check all fields to find building info
      allFields: Object.keys(rooms[0]),
      // Check for alternative building fields
      building_id: rooms[0].building_id,
      building_name: rooms[0].building_name,
      building: rooms[0].building,
      // Check both singular and plural
      hasBuildingSingular: !!rooms[0].building,
      buildingSingularName: rooms[0].building?.building_name
    })
  }
  
  // Show only first 4 rooms initially, or all if showAll is true
  const displayRooms = showAll ? rooms : rooms.slice(0, 4)
  const hasMore = rooms.length > 4

  return (
    <div className="mt-4">
      {/* Grid of room cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4"
        layout
      >
        <AnimatePresence>
        {displayRooms.map((room, index) => {
          // Get room images and fall back to building images if no room images
          const roomImages = parseBuildingImages(room.room_images)
          // Support both 'buildings' (plural) and 'building' (singular)
          const buildingFromPlural = room.buildings ? parseBuildingImages(room.buildings.building_images) : []
          const buildingFromSingular = room.building ? parseBuildingImages(room.building.building_images) : []
          const buildingImages = buildingFromPlural.length > 0 ? buildingFromPlural : buildingFromSingular
          const images = roomImages.length > 0 ? roomImages : buildingImages
          const mainImage = images[0]
          
          // Check if we have a valid image URL
          const hasValidImage = mainImage && typeof mainImage === 'string' && mainImage.trim() !== ''
          
          return (
            <motion.div
              key={room.room_id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, delay: showAll && index >= 4 ? (index - 4) * 0.05 : 0 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => onRoomClick?.(room)}
            >
              {/* Room Image Section - Always show for consistent UI */}
              <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                {hasValidImage ? (
                  <>
                    <img
                      src={mainImage}
                      alt={`Room ${room.room_number}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Replace with placeholder UI when image fails to load
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                              <div class="text-center text-gray-400">
                                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-xs">No image available</p>
                              </div>
                            </div>
                          `
                        }
                      }}
                    />
                    {/* Only show count if more than 1 image */}
                    {images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {images.length} photos
                      </div>
                    )}
                    {/* Indicate if using building photo */}
                    {roomImages.length === 0 && buildingImages.length > 0 && (
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                        Building photo
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                    <div className="text-center text-gray-400">
                      <Camera className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-xs">No image available</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Room {room.room_number}
                    </h4>
                    {/* Support both 'buildings' (plural) and 'building' (singular) */}
                    {((room.buildings && room.buildings.building_name) || (room.building && room.building.building_name)) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {room.buildings?.building_name || room.building?.building_name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full">
                      <p className="text-lg font-bold">
                        ${room.private_room_rent}<span className="text-xs font-normal">/mo</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Room Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{room.room_type || 'Standard'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Floor</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {room.floor_number || 1}
                    </span>
                  </div>
                </div>

                {/* Amenities and Status */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {room.furnished && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                        <BedDouble className="w-3 h-3" />
                        Furnished
                      </span>
                    )}
                    {room.bathroom_included && (
                      <span className="flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                        <Bath className="w-3 h-3" />
                        Private Bath
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    room.status === 'AVAILABLE' || room.status === 'Available' || room.status === 'available'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {room.status || 'Available'}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
        </AnimatePresence>
      </motion.div>

      {/* View more button */}
      {hasMore && !showAll && (
        <div className="text-center mb-4">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Eye className="w-5 h-5" />
            View {rooms.length - 4} More {rooms.length - 4 === 1 ? 'Room' : 'Rooms'}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {rooms.length} total rooms available
          </p>
        </div>
      )}
      
      {/* Show less button when expanded */}
      {hasMore && showAll && (
        <div className="text-center mb-4">
          <button
            onClick={() => setShowAll(false)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Show Less
          </button>
        </div>
      )}

      {/* Explore link */}
      {showExploreLink && (
        <div className="flex items-center gap-2">
          <Link 
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            View All Properties & Rooms
          </Link>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 inline mr-2" />
            Schedule Tour
          </button>
        </div>
      )}
    </div>
  )
}