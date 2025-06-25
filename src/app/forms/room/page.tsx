'use client'

import RoomForm from '@/components/forms/RoomForm'
import { FormDataProvider, useFormData } from '@/components/forms/FormDataProvider'
import { RoomFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '@/components/ui/FormHeader'
import { getForwardNavigationUrl, getBackNavigationUrl } from '@/lib/form-workflow'

function RoomFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { buildings } = useFormData()

  const handleSubmit = async (data: RoomFormData) => {
    setIsLoading(true)
    try {
      // Here you would make an API call to save the room
      console.log('Submitting room:', data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Show success message and redirect
      alert('Room saved successfully! Proceeding to Tenant Management.')
      // Navigate to the next form in the workflow
      const nextUrl = getForwardNavigationUrl('room')
      router.push(nextUrl)

    } catch (error) {
      console.error('Error saving room:', error)
      alert('Error saving room. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/forms')
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
