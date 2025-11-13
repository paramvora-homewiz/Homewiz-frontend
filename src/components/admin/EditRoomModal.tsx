'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import RoomForm from '@/components/forms/RoomForm'
import { roomsApi } from '@/lib/api'
import { showSuccessMessage, showWarningMessage } from '@/lib/error-handler'
import { transformRoomDataForFrontend, parseBuildingImages } from '@/lib/backend-sync'
import { Home, Save, X, Camera } from 'lucide-react'
import type { Room } from '@/lib/api/types'
import UpdateRoomImagesModal from './UpdateRoomImagesModal'

interface EditRoomModalProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  buildings?: Array<{ building_id: string; building_name: string }>
}

export default function EditRoomModal({
  room,
  open,
  onOpenChange,
  onSuccess,
  buildings = []
}: EditRoomModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formKey, setFormKey] = useState(0) // Force form re-render when modal opens
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentRoomData, setCurrentRoomData] = useState<Room | null>(room)

  // Reset form when modal opens with new room
  useEffect(() => {
    if (open && room) {
      setFormKey(prev => prev + 1)
      setCurrentRoomData(room)
    }
  }, [open, room?.room_id])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Update room data via backend API
      const response = await roomsApi.update(room!.room_id, data)

      if (response.success) {
        // After successful update, fetch fresh room data to ensure we have the latest images
        const freshRoomResponse = await roomsApi.getById(room!.room_id)
        if (freshRoomResponse.success && freshRoomResponse.data) {
          setCurrentRoomData(freshRoomResponse.data)
          // Force form to re-render with fresh data
          setFormKey(prev => prev + 1)
        }

        showSuccessMessage(
          'Room Updated',
          `Room "${data.room_id}" has been updated successfully.`
        )

        // Return the updated room data so RoomForm can handle image uploads
        return {
          success: true,
          data: {
            ...response.data,
            room_id: room!.room_id,
            building_id: room!.building_id
          },
          // Add callback to close modal after all operations complete
          onComplete: () => {
            onOpenChange(false)
            onSuccess?.()
          }
        }
      } else {
        throw new Error(response.error || 'Failed to update room')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update room. Please try again.'
      showWarningMessage(
        'Update Failed',
        errorMessage
      )
      // Return error response to prevent form from closing
      return { success: false, error: errorMessage }
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
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                  <Home className="w-5 h-5 text-purple-700" />
                </div>
                Edit Room
              </DialogTitle>
              <DialogDescription>
                Update room information for {room.room_id}
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
          <RoomForm
            key={formKey} // Force re-render with new key
            onSuccess={async () => {
              // Refresh room data after successful image upload
              if (room?.room_id) {
                const freshRoomResponse = await roomsApi.getById(room.room_id)
                if (freshRoomResponse.success && freshRoomResponse.data) {
                  setCurrentRoomData(freshRoomResponse.data)
                  setFormKey(prev => prev + 1)
                }
              }
              // Also notify parent component
              onSuccess?.()
            }}
            initialData={(() => {
              const transformedData = transformRoomDataForFrontend(currentRoomData)
              const initialData = {
                // Transform backend data to frontend format
                ...transformedData,
                // Preserve room_id for update
                room_id: currentRoomData.room_id,
                // Convert numeric fields to ensure proper types
                square_footage: currentRoomData.square_footage ? Number(currentRoomData.square_footage) : undefined,
                private_room_rent: currentRoomData.private_room_rent ? Number(currentRoomData.private_room_rent) : undefined,
                shared_room_rent_2: currentRoomData.shared_room_rent_2 ? Number(currentRoomData.shared_room_rent_2) : undefined,
                shared_room_rent_3: currentRoomData.shared_room_rent_3 ? Number(currentRoomData.shared_room_rent_3) : undefined,
                shared_room_rent_4: currentRoomData.shared_room_rent_4 ? Number(currentRoomData.shared_room_rent_4) : undefined,
                floor_number: currentRoomData.floor_number ? Number(currentRoomData.floor_number) : undefined,
                // Parse amenities if stored as JSON string
                amenities: Array.isArray(currentRoomData.amenities)
                  ? currentRoomData.amenities
                  : (typeof currentRoomData.amenities === 'string' && currentRoomData.amenities.startsWith('[')
                      ? JSON.parse(currentRoomData.amenities)
                      : []),
                // Handle room_images properly - parse if JSON string
                room_images: currentRoomData.room_images,
                images: parseBuildingImages(currentRoomData.room_images)
              }

              return initialData
            })()}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
            buildings={buildings}
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
        onOpenChange(false) // Close the parent EditRoomModal as well
        onSuccess?.()
      }}
    />
  </>
  )
}