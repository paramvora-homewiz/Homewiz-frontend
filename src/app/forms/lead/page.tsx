'use client'

import LeadForm from '../../../components/forms/LeadForm'
import { FormDataProvider, useFormData } from '../../../components/forms/FormDataProvider'
import { LeadFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '../../../components/ui/FormHeader'
import { getBackNavigationUrl } from '../../../lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '@/lib/error-handler'
import { leadsApi } from '@/lib/api'
import { transformLeadDataForBackend } from '../../../lib/backend-sync'

function LeadFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { rooms, buildings } = useFormData()

  const handleSubmit = async (data: LeadFormData) => {
    setIsLoading(true)
    try {
      console.log('Submitting lead to Backend API:', data)

      // Transform data for backend compatibility
      const transformedData = transformLeadDataForBackend(data)

      // Generate lead_id if not present
      if (!transformedData.lead_id) {
        transformedData.lead_id = `LEAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Use backend API instead of Supabase
      const result = await leadsApi.create(transformedData)

      if (result.success && result.data) {
        console.log('✅ Lead created successfully via Backend API:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('lead', 'saved')
        router.push('/forms')
      } else {
        throw new Error(result.error || 'Failed to create lead')
      }

    } catch (error) {
      console.error('Error saving lead:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'lead',
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
