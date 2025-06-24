'use client'

import RoomForm from '@/components/forms/RoomForm'
import { FormDataProvider, useFormData } from '@/components/forms/FormDataProvider'
import { RoomFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '@/components/ui/FormHeader'

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
      alert('Room saved successfully!')
      router.push('/forms')

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

  return (
    <RoomForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
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
      />
      <FormDataProvider>
        <RoomFormContent />
      </FormDataProvider>
    </div>
  )
}
