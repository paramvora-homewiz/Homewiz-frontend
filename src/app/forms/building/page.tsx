'use client'

import BuildingForm from '../../../components/forms/BuildingForm'
import { FormDataProvider, useFormData } from '../../../components/forms/FormDataProvider'
import { FormStepWrapper } from '../../../components/ui/FormStepWrapper'
import { BuildingFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { buildingsApi } from '@/lib/api'
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
      console.log('Submitting building to Backend API:', data)

      // Transform data for backend compatibility
      const transformedData = transformBuildingDataForBackend(data)

      // Use backend API instead of Supabase
      const result = await buildingsApi.create(transformedData)

      if (result.success && result.data) {
        console.log('✅ Building created successfully via Backend API:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('building', 'saved')

        // Navigate back to forms dashboard immediately after success
        console.log('Navigating back to forms dashboard')

        // Use router.replace to ensure URL is clean and no step parameters remain
        setTimeout(() => {
          router.replace('/forms')
        }, 1500) // Give time for success message to show
      } else {
        // Handle API errors
        throw new Error(result.error || 'Failed to save building')
      }

    } catch (error) {
      console.error('Error saving building:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'building',
          operation: 'save',
          api: 'backend'
        }
      })
      // Don't redirect on errors - let user try again
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
