'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import RoomPoCForm from '@/components/forms/RoomPoCForm'
import { databaseService } from '@/lib/supabase/database'
import { showSuccessMessage, showWarningMessage } from '@/lib/error-handler'
import { Home, Camera } from 'lucide-react'
import type { Room } from '@/lib/supabase/types'
import type { RoomPoCFormData, BedData, RoomPoCType, BathroomType } from '@/types'
import UpdateRoomImagesModal from './UpdateRoomImagesModal'

interface EditRoomModalProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  buildings?: Array<{ building_id: string; building_name: string }>
}

/**
 * Transform database Room data to RoomPoCFormData format
 */
function transformRoomToFormData(room: Room): Partial<RoomPoCFormData> {
  // Parse beds_configuration from JSON if it exists
  let bedsConfig: any = null
  if (room.beds_configuration) {
    try {
      bedsConfig = typeof room.beds_configuration === 'string'
        ? JSON.parse(room.beds_configuration)
        : room.beds_configuration
    } catch (e) {
      console.error('Error parsing beds_configuration:', e)
    }
  }

  // Parse utilities_included_details if it exists
  let utilitiesConfig: any = null
  if ((room as any).utilities_included_details) {
    try {
      utilitiesConfig = typeof (room as any).utilities_included_details === 'string'
        ? JSON.parse((room as any).utilities_included_details)
        : (room as any).utilities_included_details
    } catch (e) {
      console.error('Error parsing utilities_included_details:', e)
    }
  }

  // Transform beds from DB format to form format
  const beds: BedData[] = []
  if (bedsConfig?.beds && Array.isArray(bedsConfig.beds)) {
    for (const bed of bedsConfig.beds) {
      beds.push({
        bedName: bed.bedName || bed.bed_name || undefined,
        bedType: bed.bedType || bed.bed_type || undefined,
        view: bed.view || undefined,
        rent: bed.rent || undefined,
        maxOccupancy: bed.maxOccupancy || bed.max_occupancy || 1,
        bookingInfo: {
          status: bed.status || 'Available',
          availableFrom: bed.availableFrom || bed.available_from || undefined,
          availableUntil: bed.availableUntil || bed.available_until || undefined
        }
      })
    }
  }

  // Determine room type based on bed count
  // Use Math.max to ensure we never lose existing beds - check ALL possible sources
  const bedCount = Math.max(
    room.max_beds || 0,                    // max_beds field
    (room as any).total_beds || 0,         // total_beds field (legacy)
    bedsConfig?.total_beds || 0,           // beds_configuration.total_beds
    bedsConfig?.beds?.length || 0,         // actual beds array length in config
    beds.length,                           // parsed beds array length
    1                                       // minimum 1 bed
  )

  // Map bathroom_type to form format
  let bathroomType: BathroomType | undefined
  if (room.bathroom_type) {
    const bt = room.bathroom_type.toLowerCase()
    if (bt === 'private') bathroomType = 'Private'
    else if (bt === 'shared') bathroomType = 'Shared'
    else if (bt === 'en-suite' || bt === 'ensuite') bathroomType = 'En-Suite'
  }

  // Calculate final beds array first so we can use its length for maxBeds
  const finalBeds = (() => {
    if (beds.length === 0) {
      // No beds saved, create all empty
      return Array(bedCount).fill({}).map(() => ({}))
    } else if (beds.length >= bedCount) {
      // We have enough or more beds - return all parsed beds (don't lose data!)
      return beds
    } else {
      // Pad existing beds with empty beds to reach bedCount
      const emptyBeds = Array(bedCount - beds.length).fill({}).map(() => ({}))
      return [...beds, ...emptyBeds]
    }
  })()

  return {
    roomNumber: String(room.room_number || ''),
    buildingId: room.building_id,
    roomType: finalBeds.length <= 1 ? 'Private' : 'Shared', // Recalculate based on actual beds
    maxBeds: finalBeds.length, // Use actual beds count
    bathroomType,
    floorNumber: room.floor_number || undefined,
    beds: finalBeds,
    roomAmenities: {
      miniFridge: (room as any).mini_fridge || false,
      sink: (room as any).sink || false,
      beddingProvided: (room as any).bedding_provided || room.furnished || false,
      workDesk: (room as any).work_desk || false,
      workChair: (room as any).work_chair || false,
      heating: (room as any).heating || false,
      airConditioning: (room as any).air_conditioning || false,
      cableTv: (room as any).cable_tv || false,
    },
    roomPhotos: [], // Photos are handled separately - existing photos shown but new uploads are File[]
    customAmenities: room.description || '',
    maintenance: {
      lastCheckDate: (room as any).last_check_date || undefined,
      lastMaintenanceStaffId: (room as any).last_maintenance_staff_id || undefined,
      lastRenovationDate: (room as any).last_renovation_date || undefined,
    },
    condition: {
      roomConditionScore: (room as any).room_condition_score || undefined,
      cleaningFrequency: (room as any).cleaning_frequency || undefined,
      utilitiesMeterId: (room as any).utilities_meter_id || undefined,
      lastCleaningDate: (room as any).last_cleaning_date || undefined,
    },
    utilitiesIncluded: {
      electricity: utilitiesConfig?.electricity || false,
      water: utilitiesConfig?.water || false,
      gas: utilitiesConfig?.gas || false,
      internet: utilitiesConfig?.internet || false,
      cableTv: utilitiesConfig?.cableTv || false,
      trash: utilitiesConfig?.trash || false,
      heating: utilitiesConfig?.heating || false,
      ac: utilitiesConfig?.ac || false,
    },
  }
}

/**
 * Transform RoomPoCFormData to database update format
 */
function transformFormDataToRoom(formData: RoomPoCFormData, roomId: string) {
  // Process beds with proper structure for AI consumption
  const processedBeds = formData.beds.map((bed, index) => ({
    bed_id: `${roomId}_BED_${index + 1}`,
    bedName: bed.bedName || `Bed ${index + 1}`,
    bedType: bed.bedType || null,
    view: bed.view || null,
    rent: bed.rent || null,
    maxOccupancy: bed.maxOccupancy || 1,
    status: bed.bookingInfo?.status || 'Available',
    availableFrom: bed.bookingInfo?.availableFrom || null,
    availableUntil: bed.bookingInfo?.availableUntil || null,
  }))

  // Compute AI-friendly summary data
  const bedRents = processedBeds.map(b => b.rent).filter((r): r is number => r != null && r > 0)
  const availableBeds = processedBeds.filter(b => b.status === 'Available' || !b.status)

  const bedsConfigWithMeta = {
    beds: processedBeds,
    min_rent: bedRents.length > 0 ? Math.min(...bedRents) : null,
    max_rent: bedRents.length > 0 ? Math.max(...bedRents) : null,
    available_count: availableBeds.length,
    has_available: availableBeds.length > 0,
    total_beds: processedBeds.length,
  }

  return {
    // Basic info
    room_number: formData.roomNumber,
    building_id: formData.buildingId,
    room_type: formData.roomType,
    floor_number: formData.floorNumber || 1,
    bathroom_type: formData.bathroomType || 'Shared',
    bed_count: formData.maxBeds,

    // Status
    status: 'Available',
    ready_to_rent: true,

    // Beds configuration
    beds_configuration: JSON.stringify(bedsConfigWithMeta),

    // Boolean amenity fields
    mini_fridge: formData.roomAmenities.miniFridge || false,
    sink: formData.roomAmenities.sink || false,
    bedding_provided: formData.roomAmenities.beddingProvided || false,
    work_desk: formData.roomAmenities.workDesk || false,
    work_chair: formData.roomAmenities.workChair || false,
    heating: formData.roomAmenities.heating || false,
    air_conditioning: formData.roomAmenities.airConditioning || false,
    cable_tv: formData.roomAmenities.cableTv || false,
    furnished: formData.roomAmenities.beddingProvided || false,

    // Maintenance tracking
    last_renovation_date: formData.maintenance.lastRenovationDate || null,
    room_condition_score: formData.condition.roomConditionScore || null,
    cleaning_frequency: formData.condition.cleaningFrequency || null,
    utilities_meter_id: formData.condition.utilitiesMeterId || null,
    last_cleaning_date: formData.condition.lastCleaningDate || null,

    // Utilities
    utilities_included_details: JSON.stringify(formData.utilitiesIncluded),

    // Description
    description: formData.customAmenities || null,

    // Legacy rent fields for backward compatibility
    private_room_rent: formData.beds[0]?.rent || null,
    shared_room_rent_2: formData.beds.length >= 2 ? formData.beds[1]?.rent : null,
    shared_room_rent_3: formData.beds.length >= 3 ? formData.beds[2]?.rent : null,
    shared_room_rent_4: formData.beds.length >= 4 ? formData.beds[3]?.rent : null,
  }
}

export default function EditRoomModal({
  room,
  open,
  onOpenChange,
  onSuccess,
  buildings = []
}: EditRoomModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentRoomData, setCurrentRoomData] = useState<Room | null>(room)

  // Reset form when modal opens with new room
  useEffect(() => {
    if (open && room) {
      setFormKey(prev => prev + 1)
      setCurrentRoomData(room)
    }
  }, [open, room?.room_id])

  // Transform room data to form format
  const initialFormData = useMemo(() => {
    if (!currentRoomData) return undefined
    return transformRoomToFormData(currentRoomData)
  }, [currentRoomData])

  const handleSubmit = async (formData: RoomPoCFormData) => {
    if (!room) return

    setIsLoading(true)
    try {
      // Transform form data to database format
      const updateData = transformFormDataToRoom(formData, room.room_id)

      console.log('📦 Updating room with data:', updateData)

      // Update room via Supabase
      const response = await databaseService.rooms.update(room.room_id, updateData)

      if (response.success) {
        // Fetch fresh room data
        const freshRoomResponse = await databaseService.rooms.getById(room.room_id)
        if (freshRoomResponse.success && freshRoomResponse.data) {
          setCurrentRoomData(freshRoomResponse.data as Room)
          setFormKey(prev => prev + 1)
        }

        showSuccessMessage(
          'Room Updated',
          `Room "${formData.roomNumber}" has been updated successfully.`
        )

        // Close modal and notify parent
        onOpenChange(false)
        onSuccess?.()
      } else {
        throw new Error(response.error?.message || 'Failed to update room')
      }
    } catch (error: any) {
      console.error('Error updating room:', error)
      showWarningMessage(
        'Update Failed',
        error?.message || 'Failed to update room. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  if (!room || !currentRoomData) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="!w-[90vw] max-w-7xl !max-h-[95vh] !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
          onClose={handleClose}
        >
          <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg">
                    <Home className="w-5 h-5 text-blue-700" />
                  </div>
                  Edit Room
                </DialogTitle>
                <DialogDescription>
                  Update room information for {room.room_number || room.room_id}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageModal(true)}
                className="flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Update Images Only
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 pr-2">
            <RoomPoCForm
              key={formKey}
              onSubmit={handleSubmit}
              onCancel={handleClose}
              isLoading={isLoading}
              buildings={buildings}
              initialData={initialFormData}
              mode="edit"
              roomId={room.room_id}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Image-only update modal */}
      <UpdateRoomImagesModal
        room={room}
        open={showImageModal}
        onOpenChange={setShowImageModal}
        onSuccess={() => {
          setShowImageModal(false)
          onOpenChange(false)
          onSuccess?.()
        }}
      />
    </>
  )
}
