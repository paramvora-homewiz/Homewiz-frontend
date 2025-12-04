'use client'

import React, { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/enhanced-components'
import { Room } from '@/lib/supabase/types'
import { parseBuildingImages } from '@/lib/backend-sync'
import {
  Home,
  DollarSign,
  Users,
  Bed,
  Bath,
  Eye,
  Calendar,
  MapPin,
  Building,
  BedDouble,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'

interface BedConfig {
  bed_id?: string
  bedName?: string
  bedType?: string
  rent?: number
  status?: string
  availableFrom?: string | null
  availableUntil?: string | null
  view?: string
  maxOccupancy?: number
}

interface BedsConfigurationData {
  beds?: BedConfig[]
  min_rent?: number
  max_rent?: number
  available_count?: number
  has_available?: boolean
  total_beds?: number
}

interface BuildingInfo {
  building_id: string
  building_name: string
  address?: string
  city?: string
  state?: string
}

interface ViewRoomModalProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  building?: BuildingInfo | null
}

export function ViewRoomModal({ room, open, onOpenChange, building }: ViewRoomModalProps) {
  // Parse beds_configuration
  const bedsData = useMemo(() => {
    if (!room?.beds_configuration) return null

    try {
      let parsed: BedsConfigurationData | BedConfig[]
      if (typeof room.beds_configuration === 'string') {
        parsed = JSON.parse(room.beds_configuration)
      } else {
        parsed = room.beds_configuration as BedsConfigurationData | BedConfig[]
      }

      // Handle both formats: {beds: [...]} and direct array [...]
      if (Array.isArray(parsed)) {
        return { beds: parsed, min_rent: null, max_rent: null, available_count: parsed.length, total_beds: parsed.length }
      }
      return parsed
    } catch (e) {
      console.error('Failed to parse beds_configuration:', e)
      return null
    }
  }, [room?.beds_configuration])

  if (!room) return null

  // Get bed status badge color
  const getBedStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getBedStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'reserved':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'occupied':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
              <Home className="w-6 h-6 text-blue-700" />
            </div>
            Room Details - {room.room_number}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-blue-700 font-medium">Room Number</label>
                  <p className="text-blue-900 font-semibold text-lg">{room.room_number}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Building</label>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-900 font-semibold">
                      {building?.building_name || 'Unknown Building'}
                    </p>
                  </div>
                  {(building?.city || building?.address) && (
                    <p className="text-blue-700 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {building?.address ? `${building.address}, ` : ''}{building?.city}{building?.state ? `, ${building.state}` : ''}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={room.status || 'Available'} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Furnished</label>
                  <div className="mt-1">
                    <StatusBadge status={room.furnished ? 'YES' : 'NO'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Occupancy & Pricing - Only show for rooms WITHOUT beds_configuration */}
            {(!bedsData || !bedsData.beds || bedsData.beds.length === 0) && (room.private_room_rent || room.shared_room_rent_2) && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Occupancy & Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {room.square_footage && (
                    <div>
                      <label className="text-sm text-green-700 font-medium">Square Footage</label>
                      <p className="text-green-900 font-semibold text-lg">{room.square_footage} sq ft</p>
                    </div>
                  )}
                  {room.floor_number && (
                    <div>
                      <label className="text-sm text-green-700 font-medium">Floor Number</label>
                      <p className="text-green-900 font-semibold text-lg">{room.floor_number}</p>
                    </div>
                  )}
                  {room.private_room_rent && (
                    <div className="col-span-2">
                      <label className="text-sm text-green-700 font-medium">Private Room Rent</label>
                      <p className="text-green-900 font-semibold text-xl">${room.private_room_rent}/month</p>
                    </div>
                  )}
                  {room.shared_room_rent_2 && (
                    <div className="col-span-2">
                      <label className="text-sm text-green-700 font-medium">Shared Room Rent</label>
                      <p className="text-green-900 font-semibold text-lg">${room.shared_room_rent_2}/month</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Summary - Show for rooms WITH beds_configuration */}
            {bedsData && bedsData.beds && bedsData.beds.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Summary
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-green-700 font-medium">Starting From</label>
                    <p className="text-green-900 font-semibold text-xl">
                      ${bedsData.min_rent || Math.min(...bedsData.beds.filter(b => b.rent).map(b => b.rent!))}/month
                    </p>
                  </div>
                  {bedsData.available_count !== undefined && (
                    <div>
                      <label className="text-sm text-green-700 font-medium">Available Beds</label>
                      <p className="text-green-900 font-semibold">
                        {bedsData.available_count} of {bedsData.total_beds || bedsData.beds.length}
                      </p>
                    </div>
                  )}
                  {room.square_footage && (
                    <div>
                      <label className="text-sm text-green-700 font-medium">Square Footage</label>
                      <p className="text-green-900 font-semibold">{room.square_footage} sq ft</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Booking Information */}
            {(room.booked_from || room.booked_till) && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Booking Information
                </h3>
                <div className="space-y-2">
                  {room.booked_from && (
                    <div>
                      <label className="text-sm text-orange-700 font-medium">Booked From</label>
                      <p className="text-orange-900">{new Date(room.booked_from).toLocaleDateString()}</p>
                    </div>
                  )}
                  {room.booked_till && (
                    <div>
                      <label className="text-sm text-orange-700 font-medium">Booked Until</label>
                      <p className="text-orange-900">{new Date(room.booked_till).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Room Specifications */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Building className="w-5 h-5" />
                Room Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-purple-700 font-medium">Floor Number</label>
                  <p className="text-purple-900 font-semibold">{room.floor_number}</p>
                </div>
                <div>
                  <label className="text-sm text-purple-700 font-medium">Bed Count</label>
                  <p className="text-purple-900 font-semibold">{room.bed_count}</p>
                </div>
                <div>
                  <label className="text-sm text-purple-700 font-medium">Bathroom Type</label>
                  <p className="text-purple-900">{room.bathroom_type}</p>
                </div>
                <div>
                  <label className="text-sm text-purple-700 font-medium">Bed Size</label>
                  <p className="text-purple-900">{room.bed_size}</p>
                </div>
                <div>
                  <label className="text-sm text-purple-700 font-medium">Bed Type</label>
                  <p className="text-purple-900">{room.bed_type}</p>
                </div>
                {room.view && (
                  <div>
                    <label className="text-sm text-purple-700 font-medium">View</label>
                    <p className="text-purple-900">{room.view}</p>
                  </div>
                )}
                {room.sq_footage && (
                  <div>
                    <label className="text-sm text-purple-700 font-medium">Square Footage</label>
                    <p className="text-purple-900">{room.sq_footage} sq ft</p>
                  </div>
                )}
              </div>
            </div>

            {/* Individual Beds Configuration */}
            {bedsData && bedsData.beds && bedsData.beds.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <BedDouble className="w-5 h-5" />
                  Beds in this Room ({bedsData.beds.length})
                </h3>
                {bedsData.min_rent && bedsData.max_rent && (
                  <p className="text-sm text-amber-700 mb-3">
                    Price range: ${bedsData.min_rent} - ${bedsData.max_rent}/month
                  </p>
                )}
                <div className="space-y-3">
                  {bedsData.beds.map((bed, index) => (
                    <div
                      key={bed.bed_id || index}
                      className="bg-white/70 rounded-lg p-3 border border-amber-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-amber-700" />
                          <span className="font-semibold text-amber-900">
                            {bed.bedName || `Bed ${index + 1}`}
                          </span>
                          {bed.bedType && (
                            <Badge variant="outline" className="text-xs">
                              {bed.bedType}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getBedStatusIcon(bed.status)}
                          <Badge variant="outline" className={`text-xs ${getBedStatusColor(bed.status)}`}>
                            {bed.status || 'Available'}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {bed.rent && (
                          <div className="flex items-center gap-1 text-amber-800">
                            <DollarSign className="w-3 h-3" />
                            <span className="font-medium">${bed.rent}/month</span>
                          </div>
                        )}
                        {bed.view && (
                          <div className="flex items-center gap-1 text-amber-700">
                            <Eye className="w-3 h-3" />
                            <span>{bed.view} view</span>
                          </div>
                        )}
                        {bed.availableFrom && (
                          <div className="flex items-center gap-1 text-amber-700">
                            <Calendar className="w-3 h-3" />
                            <span>From: {new Date(bed.availableFrom).toLocaleDateString()}</span>
                          </div>
                        )}
                        {bed.availableUntil && (
                          <div className="flex items-center gap-1 text-amber-700">
                            <Calendar className="w-3 h-3" />
                            <span>Until: {new Date(bed.availableUntil).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <Bed className="w-5 h-5" />
                Room Amenities
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {room.mini_fridge && (
                  <Badge variant="outline" className="w-fit bg-green-100 text-green-800 border-green-300">
                    🧊 Mini Fridge
                  </Badge>
                )}
                {room.sink && (
                  <Badge variant="outline" className="w-fit bg-blue-100 text-blue-800 border-blue-300">
                    🚿 Sink
                  </Badge>
                )}
                {room.bedding_provided && (
                  <Badge variant="outline" className="w-fit bg-purple-100 text-purple-800 border-purple-300">
                    🛏️ Bedding Provided
                  </Badge>
                )}
                {room.work_desk && (
                  <Badge variant="outline" className="w-fit bg-orange-100 text-orange-800 border-orange-300">
                    🪑 Work Desk
                  </Badge>
                )}
                {room.work_chair && (
                  <Badge variant="outline" className="w-fit bg-yellow-100 text-yellow-800 border-yellow-300">
                    💺 Work Chair
                  </Badge>
                )}
                {room.heating && (
                  <Badge variant="outline" className="w-fit bg-red-100 text-red-800 border-red-300">
                    🔥 Heating
                  </Badge>
                )}
                {room.air_conditioning && (
                  <Badge variant="outline" className="w-fit bg-cyan-100 text-cyan-800 border-cyan-300">
                    ❄️ AC
                  </Badge>
                )}
                {room.cable_tv && (
                  <Badge variant="outline" className="w-fit bg-gray-100 text-gray-800 border-gray-300">
                    📺 Cable TV
                  </Badge>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(room.room_storage || room.noise_level || room.sunlight) && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
                <div className="space-y-2">
                  {room.room_storage && (
                    <div>
                      <label className="text-sm text-gray-700 font-medium">Storage</label>
                      <p className="text-gray-900">{room.room_storage}</p>
                    </div>
                  )}
                  {room.noise_level && (
                    <div>
                      <label className="text-sm text-gray-700 font-medium">Noise Level</label>
                      <p className="text-gray-900">{room.noise_level}</p>
                    </div>
                  )}
                  {room.sunlight && (
                    <div>
                      <label className="text-sm text-gray-700 font-medium">Sunlight</label>
                      <p className="text-gray-900">{room.sunlight}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Virtual Tour */}
        {room.virtual_tour_url && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Virtual Tour
            </h3>
            <a 
              href={room.virtual_tour_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Virtual Tour
            </a>
          </div>
        )}

        {/* Room Images */}
        {(() => {
          const imagesArray = parseBuildingImages(room.room_images)
          
          if (imagesArray.length === 0) return null
          
          return (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Room Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagesArray.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Room ${room.room_number} - Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ))}
              </div>
              {imagesArray.length > 4 && (
                <p className="text-sm text-gray-500 mt-2">
                  +{imagesArray.length - 4} more images
                </p>
              )}
            </div>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}