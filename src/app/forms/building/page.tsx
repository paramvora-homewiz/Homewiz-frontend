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

      // First, use the form integration service for proper validation
      const { BuildingFormIntegration } = await import('@/lib/supabase/form-integration')
      const result = await BuildingFormIntegration.submitBuilding(data)

      if (result.success) {
        console.log('✅ Building created successfully:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('building', 'saved')

        // Navigate back to forms dashboard immediately after success
        console.log('Navigating back to forms dashboard')

        // Use router.replace to ensure URL is clean and no step parameters remain
        setTimeout(() => {
          router.replace('/forms')
        }, 1500) // Give time for success message to show
      } else if (result.validationErrors) {
        // Handle validation errors - don't redirect, show errors to user
        console.error('❌ Validation errors:', result.validationErrors)

        // Import and use the validation error handler
        const { handleValidationError } = await import('@/lib/error-handler')

        // Create a comprehensive error message from validation errors
        const errorMessages = Object.entries(result.validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n')

        handleValidationError(
          new Error(`Validation failed:\n${errorMessages}`),
          {
            formType: 'building',
            operation: 'validation',
            validationErrors: result.validationErrors
          }
        )

        // Don't redirect on validation errors - let user fix them
        return
      } else {
        // Handle other errors (database, network, etc.)
        throw new Error(result.error || 'Failed to save building')
      }

    } catch (error) {
      console.error('Error saving building:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'building',
          operation: 'save'
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
