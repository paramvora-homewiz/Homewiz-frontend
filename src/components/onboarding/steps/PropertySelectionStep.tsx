'use client'

import React, { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PropertySelectionStepProps {
  form: UseFormReturn<any>
}

// Mock data for demonstration
const mockBuildings = [
  {
    building_id: 'bldg_1',
    building_name: 'Sunset Apartments',
    address: '123 Main St, Downtown',
    amenities: ['WiFi', 'Laundry', 'Gym', 'Rooftop']
  },
  {
    building_id: 'bldg_2',
    building_name: 'Garden View Complex',
    address: '456 Oak Ave, Midtown',
    amenities: ['WiFi', 'Parking', 'Pool', 'Security']
  }
]

const mockRooms = [
  {
    room_id: 'room_1',
    building_id: 'bldg_1',
    room_number: '101',
    type: 'Private',
    rent: 800,
    available: true
  },
  {
    room_id: 'room_2',
    building_id: 'bldg_1',
    room_number: '102',
    type: 'Shared',
    rent: 500,
    available: true
  },
  {
    room_id: 'room_3',
    building_id: 'bldg_2',
    room_number: '201',
    type: 'Private',
    rent: 900,
    available: true
  }
]

export function PropertySelectionStep({ form }: PropertySelectionStepProps) {
  const { register, watch, setValue, formState: { errors } } = form
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  const [availableRooms, setAvailableRooms] = useState<any[]>([])

  const watchedBuildingId = watch('selected_building_id')

  useEffect(() => {
    if (watchedBuildingId) {
      setSelectedBuilding(watchedBuildingId)
      const rooms = mockRooms.filter(room => room.building_id === watchedBuildingId)
      setAvailableRooms(rooms)
    } else {
      setAvailableRooms([])
    }
  }, [watchedBuildingId])

  const handleBuildingSelect = (buildingId: string) => {
    setValue('selected_building_id', buildingId)
    setValue('selected_room_id', '') // Reset room selection
  }

  const handleRoomSelect = (roomId: string, roomNumber: string) => {
    setValue('selected_room_id', roomId)
    setValue('room_number', roomNumber)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Building</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockBuildings.map((building) => (
            <div
              key={building.building_id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedBuilding === building.building_id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleBuildingSelect(building.building_id)}
            >
              <h4 className="font-semibold text-lg">{building.building_name}</h4>
              <p className="text-gray-600 text-sm mb-2">{building.address}</p>
              <div className="flex flex-wrap gap-1">
                {building.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {errors.selected_building_id && (
          <p className="text-red-500 text-sm mt-2">{String(errors.selected_building_id.message || 'Building selection is required')}</p>
        )}
      </Card>

      {selectedBuilding && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Room</h3>
          
          {availableRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRooms.map((room) => (
                <div
                  key={room.room_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    watch('selected_room_id') === room.room_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRoomSelect(room.room_id, room.room_number)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Room {room.room_number}</h4>
                    <Badge variant={room.available ? 'default' : 'secondary'}>
                      {room.available ? 'Available' : 'Occupied'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Type: {room.type}</p>
                  <p className="text-lg font-semibold text-green-600">${room.rent}/month</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No rooms available in this building
            </p>
          )}

          {errors.selected_room_id && (
            <p className="text-red-500 text-sm mt-2">{String(errors.selected_room_id.message || 'Room selection is required')}</p>
          )}
        </Card>
      )}

      {/* Hidden inputs for form validation */}
      <input type="hidden" {...register('selected_building_id')} />
      <input type="hidden" {...register('selected_room_id')} />
      <input type="hidden" {...register('room_number')} />
    </div>
  )
}
