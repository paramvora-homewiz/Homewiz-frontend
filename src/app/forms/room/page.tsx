'use client'

import RoomPoCForm from '@/components/forms/RoomPoCForm'
import { FormDataProvider, useFormData } from '@/components/forms/FormDataProvider'
import { RoomPoCFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '@/components/ui/FormHeader'
import { showFormSuccessMessage, handleFormSubmissionError } from '@/lib/error-handler'
import { databaseService } from '@/lib/supabase/database'

function RoomFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { buildings } = useFormData()

  const handleSubmit = async (data: RoomPoCFormData) => {
    setIsLoading(true)
    try {
      console.log('🎯 Submitting room to Supabase:', data)
      console.log('📊 Total Beds Configured:', data.beds.length)
      console.log('🛏️ Bed Details:', data.beds)

      // Generate room_id
      const roomId = `ROOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Process beds with proper structure for AI consumption
      // Each bed gets: id, status, rent, availability dates
      const processedBeds = data.beds.map((bed, index) => ({
        bed_id: `${roomId}_BED_${index + 1}`,
        bedName: bed.bedName || `Bed ${index + 1}`,
        bedType: bed.bedType || null,
        view: bed.view || null,
        rent: bed.rent || null,
        maxOccupancy: bed.maxOccupancy || 1,
        // CRITICAL: Individual bed status for AI queries
        status: bed.bookingInfo?.status || 'Available',
        availableFrom: bed.bookingInfo?.availableFrom || null,
        availableUntil: bed.bookingInfo?.availableUntil || null,
      }))

      // Compute AI-friendly summary data (stored inside beds_configuration JSON)
      const bedRents = processedBeds.map(b => b.rent).filter((r): r is number => r != null && r > 0)
      const availableBeds = processedBeds.filter(b => b.status === 'Available' || !b.status)

      // Wrap beds with computed fields for AI queries
      const bedsConfigWithMeta = {
        beds: processedBeds,
        // AI-optimized computed fields (stored in JSON since DB columns may not exist)
        min_rent: bedRents.length > 0 ? Math.min(...bedRents) : null,
        max_rent: bedRents.length > 0 ? Math.max(...bedRents) : null,
        available_count: availableBeds.length,
        has_available: availableBeds.length > 0,
        total_beds: processedBeds.length,
      }

      // Transform to ACTUAL database columns that exist
      // Based on backend/app/db/models.py Room class
      const transformedData = {
        // Required identifiers
        room_id: roomId,
        building_id: data.buildingId,
        room_number: data.roomNumber,

        // Room classification (columns that EXIST)
        room_type: data.roomType,
        floor_number: data.floorNumber || 1,
        bathroom_type: data.bathroomType || 'Shared',
        bed_count: data.maxBeds,

        // Status fields (these columns EXIST in backend model)
        status: 'Available',
        ready_to_rent: true,

        // Beds configuration as JSON string (column EXISTS)
        // Store all bed data + computed fields here for AI to parse
        beds_configuration: JSON.stringify(bedsConfigWithMeta),

        // Boolean amenity fields (these columns EXIST)
        mini_fridge: data.roomAmenities.miniFridge || false,
        sink: data.roomAmenities.sink || false,
        bedding_provided: data.roomAmenities.beddingProvided || false,
        work_desk: data.roomAmenities.workDesk || false,
        work_chair: data.roomAmenities.workChair || false,
        heating: data.roomAmenities.heating || false,
        air_conditioning: data.roomAmenities.airConditioning || false,
        cable_tv: data.roomAmenities.cableTv || false,
        furnished: data.roomAmenities.beddingProvided || false,

        // Maintenance tracking (columns EXIST)
        last_renovation_date: data.maintenance.lastRenovationDate || null,
        room_condition_score: data.condition.roomConditionScore || null,
        cleaning_frequency: data.condition.cleaningFrequency || null,
        utilities_meter_id: data.condition.utilitiesMeterId || null,
        last_cleaning_date: data.condition.lastCleaningDate || null,

        // Utilities as JSON string (column is utilities_included_details, NOT utilities_included)
        utilities_included_details: JSON.stringify(data.utilitiesIncluded),

        // Description for AI context
        description: data.customAmenities || null,

        // Legacy rent fields (columns EXIST) - for backward compatibility
        private_room_rent: data.beds[0]?.rent || null,
        shared_room_rent_2: data.beds.length >= 2 ? data.beds[1]?.rent : null,
        shared_room_rent_3: data.beds.length >= 3 ? data.beds[2]?.rent : null,
        shared_room_rent_4: data.beds.length >= 4 ? data.beds[3]?.rent : null,
      }

      console.log('📦 Transformed data for database:', transformedData)

      // Save room to Supabase database
      const result = await databaseService.rooms.create(transformedData)

      if (result.success) {
        console.log('✅ Room created successfully:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('room', 'saved')

        // Navigate back to forms dashboard
        router.push('/forms')
      } else {
        throw new Error(result.error?.message || 'Failed to create room')
      }

    } catch (error) {
      console.error('Error saving room:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'room',
          operation: 'save'
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.replace('/forms')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RoomPoCForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        buildings={buildings}
      />
    </div>
  )
}

export default function RoomFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100">
      <FormHeader
        title="Room Setup"
        subtitle="Set up individual rooms with specifications, pricing, and availability tracking"
        currentForm="room"
      />
      <FormDataProvider>
        <RoomFormContent />
      </FormDataProvider>
    </div>
  )
}
