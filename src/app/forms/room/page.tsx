'use client'

import RoomForm from '@/components/forms/RoomForm'
import { FormDataProvider, useFormData } from '@/components/forms/FormDataProvider'
import { RoomFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '@/components/ui/FormHeader'
import { getBackNavigationUrl } from '@/lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '@/lib/error-handler'
import { roomsApi } from '@/lib/api'
import { transformRoomDataForBackend } from '@/lib/backend-sync'

function RoomFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { buildings } = useFormData()

  const handleSubmit = async (data: RoomFormData) => {
    setIsLoading(true)
    try {
      console.log('Submitting room to Backend API:', data)

      // Transform data for backend compatibility
      const transformedData = transformRoomDataForBackend(data)

      // Generate room_id if not present
      if (!transformedData.room_id) {
        transformedData.room_id = `ROOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Use backend API instead of Supabase
      const result = await roomsApi.create(transformedData)

      if (result.success && result.data) {
        console.log('✅ Room created successfully via Backend API:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('room', 'saved')

        // Navigate back to forms dashboard (consistent with building form behavior)
        console.log('Navigating back to forms dashboard')

        // Use push to navigate to forms dashboard
        router.push('/forms')
      } else {
        throw new Error(result.error || 'Failed to create room')
      }

    } catch (error) {
      console.error('Error saving room:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'room',
          operation: 'save',
          api: 'backend'
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
