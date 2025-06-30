'use client'

import RoomForm from '@/components/forms/RoomForm'
import { FormDataProvider, useFormData } from '@/components/forms/FormDataProvider'
import { RoomFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '@/components/ui/FormHeader'
import { getBackNavigationUrl } from '@/lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '@/lib/error-handler'
// Using form integration instead of direct database service

function RoomFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { buildings } = useFormData()

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      console.log('🚀 Room page: Using form integration for submission:', data)
      console.log('🔍 Room page: Detailed form data analysis:', {
        hasRoomPhotos: !!data.room_photos,
        roomPhotosLength: data.room_photos?.length || 0,
        roomPhotosType: typeof data.room_photos,
        roomPhotosConstructor: data.room_photos?.constructor?.name,
        hasBuildingId: !!data.building_id,
        buildingId: data.building_id,
        roomPhotosArray: data.room_photos,
        allKeys: Object.keys(data),
        fullDataObject: data
      })

      // Debug each file if they exist
      if (data.room_photos && data.room_photos.length > 0) {
        console.log('🔍 Room page: Individual file analysis:')
        data.room_photos.forEach((file, index) => {
          console.log(`Room page File ${index + 1}:`, {
            name: file?.name,
            type: file?.type,
            size: file?.size,
            lastModified: file?.lastModified,
            isFile: file instanceof File,
            isBlob: file instanceof Blob,
            constructor: file?.constructor?.name,
            hasArrayBuffer: typeof file?.arrayBuffer === 'function',
            fileObject: file
          })
        })
      }

      // Use the same form integration that the dashboard uses
      const { RoomFormIntegration } = await import('@/lib/supabase/form-integration')
      const result = await RoomFormIntegration.submitRoom(data)

      if (result.success) {
        console.log('✅ Room page: Form integration submission successful:', result.data)
        
        // Show enhanced success message
        showFormSuccessMessage('room', 'saved')

        // Navigate back to forms dashboard (consistent with building form behavior)
        console.log('Navigating back to forms dashboard')

        // Use push to navigate to forms dashboard
        router.push('/forms')

        // Return the created room data
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create room')
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
    // Use replace to clear URL parameters and ensure clean navigation
    router.replace('/forms')
  }

  const handleBack = () => {
    const backUrl = getBackNavigationUrl('room')
    router.push(backUrl)
  }

  return (
    <RoomForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onBack={handleBack}
      isLoading={isLoading}
      buildings={buildings}
    />
  )
}

export default function RoomFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
        title="Room Setup"
        subtitle="Set up individual rooms with specifications, pricing, and availability"
        currentForm="room"
      />
      <FormDataProvider>
        <RoomFormContent />
      </FormDataProvider>
    </div>
  )
}
