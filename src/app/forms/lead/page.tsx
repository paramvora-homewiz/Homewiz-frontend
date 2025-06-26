'use client'

import LeadForm from '../../../components/forms/LeadForm'
import { FormDataProvider, useFormData } from '../../../components/forms/FormDataProvider'
import { LeadFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '../../../components/ui/FormHeader'
import { getBackNavigationUrl } from '../../../lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '@/lib/error-handler'

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
      
      // Show enhanced success message
      showFormSuccessMessage('lead', 'saved')
      router.push('/forms')

    } catch (error) {
      console.error('Error saving lead:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'lead',
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
    const backUrl = getBackNavigationUrl('lead')
    router.push(backUrl)
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
      onBack={handleBack}
      isLoading={isLoading}
      rooms={enhancedRooms}
    />
  )
}

export default function LeadFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
        title="Lead Tracking"
        subtitle="Track prospective tenants and their housing interests"
        currentForm="lead"
      />
      <FormDataProvider>
        <LeadFormContent />
      </FormDataProvider>
    </div>
  )
}
