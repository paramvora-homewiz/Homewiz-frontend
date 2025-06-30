'use client'

import BuildingForm from '../../../components/forms/BuildingForm'
import { FormDataProvider, useFormData } from '../../../components/forms/FormDataProvider'
import { FormStepWrapper } from '../../../components/ui/FormStepWrapper'
import { BuildingFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { databaseService } from '../../../lib/supabase/database'
import { transformBuildingDataForBackend } from '../../../lib/backend-sync'
import FormHeader from '../../../components/ui/FormHeader'
import { getForwardNavigationUrl } from '../../../lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '../../../lib/error-handler'

function BuildingFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { operators } = useFormData()

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      console.log('Submitting building to Supabase:', data)

      // Transform data for database
      const transformedData = transformBuildingDataForBackend(data)

      // Generate building_id if not present
      if (!transformedData.building_id) {
        transformedData.building_id = `BLD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Save building to Supabase database
      const result = await databaseService.buildings.create(transformedData)

      if (result.success) {
        console.log('✅ Building created successfully:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('building', 'saved')

        // Navigate to the next form in the workflow
        const nextUrl = getForwardNavigationUrl('building')
        console.log('Next URL from workflow:', nextUrl)

        // Clear any existing URL parameters and navigate to clean URL
        // This ensures step parameters don't persist
        const cleanUrl = nextUrl.split('?')[0] // Remove any existing query parameters
        console.log('Clean URL for navigation:', cleanUrl)

        // Force navigation with window.location to ensure clean URL
        // This bypasses any router state that might be causing issues
        setTimeout(() => {
          console.log('Attempting navigation to:', cleanUrl)
          window.location.href = cleanUrl
        }, 1000) // Give time for success message to show
      } else {
        throw new Error(result.error?.message || 'Failed to save building')
      }

    } catch (error) {
      console.error('Error saving building:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'building',
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

  return (
    <BuildingForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      operators={operators}
    />
  )
}

export default function BuildingFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
        title="Building Configuration"
        subtitle="Add and configure building details, amenities, and policies"
        currentForm="building"
        showWorkflowProgress={true}
      />
      <FormDataProvider>
        <FormStepWrapper>
          <BuildingFormContent />
        </FormStepWrapper>
      </FormDataProvider>
    </div>
  )
}
