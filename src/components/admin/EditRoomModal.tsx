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
import { databaseService } from '@/lib/supabase/database'
import { showSuccessMessage, showWarningMessage } from '@/lib/error-handler'
import { Home, Save, X } from 'lucide-react'
import type { Room } from '@/lib/supabase/types'

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

  // Reset form when modal opens with new room
  useEffect(() => {
    if (open && room) {
      setFormKey(prev => prev + 1)
    }
  }, [open, room?.room_id])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Update room data
      const response = await databaseService.rooms.update(room!.room_id, data)
      
      if (response.success) {
        showSuccessMessage(
          'Room Updated',
          `Room "${data.room_id}" has been updated successfully.`
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        throw new Error(response.error?.message || 'Failed to update room')
      }
    } catch (error) {
      console.error('Error updating room:', error)
      showWarningMessage(
        'Update Failed',
        'Failed to update room. Please try again.'
      )
      // Return error response to prevent form from closing
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
    
    // Return success response
    return { success: true }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  if (!room) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[90vw] max-w-7xl !max-h-[95vh] !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
        onClose={handleClose}
      >
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
              <Home className="w-5 h-5 text-purple-700" />
            </div>
            Edit Room
          </DialogTitle>
          <DialogDescription>
            Update room information for {room.room_id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <RoomForm
            key={formKey} // Force re-render with new key
            initialData={{
              ...room,
              // Convert numeric fields to ensure proper types
              square_footage: room.square_footage ? Number(room.square_footage) : undefined,
              private_room_rent: room.private_room_rent ? Number(room.private_room_rent) : undefined,
              shared_room_rent_2: room.shared_room_rent_2 ? Number(room.shared_room_rent_2) : undefined,
              shared_room_rent_3: room.shared_room_rent_3 ? Number(room.shared_room_rent_3) : undefined,
              shared_room_rent_4: room.shared_room_rent_4 ? Number(room.shared_room_rent_4) : undefined,
              floor_number: room.floor_number ? Number(room.floor_number) : undefined,
              // Parse amenities if stored as JSON string
              amenities: Array.isArray(room.amenities)
                ? room.amenities
                : (typeof room.amenities === 'string' && room.amenities.startsWith('[')
                    ? JSON.parse(room.amenities)
                    : []),
              // Parse images if stored as JSON string
              images: Array.isArray(room.images)
                ? room.images
                : (typeof room.images === 'string' && room.images.startsWith('[')
                    ? JSON.parse(room.images)
                    : [])
            }}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
            buildings={buildings}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}