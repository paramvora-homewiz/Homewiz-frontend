'use client'

import React, { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFormData } from '@/components/forms/FormDataProvider'

interface PropertySelectionStepProps {
  form: UseFormReturn<any>
}



export function PropertySelectionStep({ form }: PropertySelectionStepProps) {
  const { register, watch, setValue, formState: { errors } } = form
  const { buildings, rooms, buildingsLoading, roomsLoading, getRoomsByBuilding } = useFormData()
  const [selectedBuilding, setSelectedBuilding] = useState<string>('')
  const [availableRooms, setAvailableRooms] = useState<any[]>([])

  const watchedBuildingId = watch('selected_building_id')

  useEffect(() => {
    if (watchedBuildingId) {
      setSelectedBuilding(watchedBuildingId)
      const filteredRooms = getRoomsByBuilding(watchedBuildingId)
      setAvailableRooms(filteredRooms)
    } else {
      setAvailableRooms([])
    }
  }, [watchedBuildingId, getRoomsByBuilding])

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
        
        {buildingsLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading buildings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buildings.map((building) => (
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
                <p className="text-gray-600 text-sm mb-2">
                  {building.floors ? `${building.floors} floors` : ''}
                  {building.total_rooms ? ` • ${building.total_rooms} rooms` : ''}
                </p>
                <div className="flex flex-wrap gap-1">
                  {building.available && (
                    <Badge variant="default" className="text-xs">
                      Available
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {building.total_rooms || 0} rooms
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.selected_building_id && (
          <p className="text-red-500 text-sm mt-2">{String(errors.selected_building_id.message || 'Building selection is required')}</p>
        )}
      </Card>

      {selectedBuilding && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Room</h3>
          
          {roomsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading rooms...</p>
            </div>
          ) : availableRooms.length > 0 ? (
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
                    <Badge variant={room.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                      {room.status === 'AVAILABLE' ? 'Available' : room.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {room.private_room_rent && `$${room.private_room_rent}/month`}
                    {room.shared_room_rent_2 && ` • Shared: $${room.shared_room_rent_2}/month`}
                  </p>
                </div>
              ))}
            </div>
          ) : selectedBuilding ? (
            <p className="text-gray-500 text-center py-8">
              No rooms available in this building
            </p>
          ) : null}

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
