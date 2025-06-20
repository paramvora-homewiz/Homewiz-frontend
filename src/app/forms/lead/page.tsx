'use client'

import LeadForm from '../../../components/forms/LeadForm'
import { FormDataProvider, useFormData } from '../../../components/forms/FormDataProvider'
import { LeadFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function LeadFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { rooms, buildings } = useFormData()

  const handleSubmit = async (data: LeadFormData) => {
    setIsLoading(true)
    try {
      // Here you would make an API call to save the lead
      console.log('Submitting lead:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message and redirect
      alert('Lead saved successfully!')
      router.push('/forms')
      
    } catch (error) {
      console.error('Error saving lead:', error)
      alert('Error saving lead. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/forms')
  }

  // Enhance rooms with building names
  const enhancedRooms = rooms.map(room => ({
    ...room,
    building_name: buildings.find(b => b.building_id === room.building_id)?.building_name || 'Unknown Building'
  }))

  return (
    <LeadForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      rooms={enhancedRooms}
    />
  )
}

export default function LeadFormPage() {
  return (
    <FormDataProvider>
      <LeadFormContent />
    </FormDataProvider>
  )
}
