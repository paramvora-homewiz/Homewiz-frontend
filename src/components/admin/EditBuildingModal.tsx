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
import BuildingForm from '@/components/forms/BuildingForm'
import { buildingsApi } from '@/lib/api'
import { showSuccessMessage, showWarningMessage } from '@/lib/error-handler'
import { transformBackendDataForFrontend } from '@/lib/backend-sync'
import { Building as BuildingIcon, Save, X } from 'lucide-react'
import type { Building } from '@/lib/api/types'

interface EditBuildingModalProps {
  building: Building | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  operators?: Array<{ operator_id: number; name: string; operator_type: string }>
}

export default function EditBuildingModal({
  building,
  open,
  onOpenChange,
  onSuccess,
  operators = []
}: EditBuildingModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formKey, setFormKey] = useState(0) // Force form re-render when modal opens

  // Reset form when modal opens with new building
  useEffect(() => {
    if (open && building) {
      setFormKey(prev => prev + 1)
    }
  }, [open, building?.building_id])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Update building data via backend API
      const response = await buildingsApi.update(building!.building_id, data)

      if (response.success) {
        showSuccessMessage(
          'Building Updated',
          `Building "${data.building_name}" has been updated successfully.`
        )
        onOpenChange(false)
        onSuccess?.()

        // Return success response with building data for image upload handling
        return {
          success: true,
          data: {
            building_id: building!.building_id,
            ...response.data
          }
        }
      } else {
        throw new Error(response.error || 'Failed to update building')
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update building. Please try again.'
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

  if (!building) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[95vw] sm:!w-[90vw] lg:!w-[85vw] max-w-7xl !max-h-[95vh] !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
        onClose={handleClose}
      >
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
              <BuildingIcon className="w-5 h-5 text-emerald-700" />
            </div>
            Edit Building
          </DialogTitle>
          <DialogDescription>
            Update building information for {building.building_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <BuildingForm
            key={formKey} // Force re-render with new key
            initialData={{
              // Transform backend data to frontend format first
              ...transformBackendDataForFrontend(building),
              // Explicitly preserve building_id for update operations
              building_id: building.building_id,
              // Convert operator_id to match form expectations
              operator_id: building.operator_id ? Number(building.operator_id) : undefined,
              property_manager: building.property_manager ? Number(building.property_manager) : undefined,
              // Ensure all numeric fields are properly typed
              year_built: building.year_built ? Number(building.year_built) : undefined,
              floors: building.floors ? Number(building.floors) : undefined,
              total_rooms: building.total_rooms ? Number(building.total_rooms) : undefined,
              available_rooms: building.available_rooms ? Number(building.available_rooms) : undefined,
              min_lease_term: building.min_lease_term ? Number(building.min_lease_term) : undefined,
              pref_min_lease_term: building.pref_min_lease_term ? Number(building.pref_min_lease_term) : undefined,
              // Parse amenities if stored as JSON string
              amenities: Array.isArray(building.amenities) 
                ? building.amenities 
                : (typeof building.amenities === 'string' && building.amenities.startsWith('[')
                    ? JSON.parse(building.amenities)
                    : []),
              // Ensure images are properly mapped
              images: building.building_images || building.images || [],
              building_images: building.building_images || building.images || []
            }}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
            operators={operators}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}