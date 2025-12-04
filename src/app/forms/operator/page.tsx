'use client'

import OperatorForm from '../../../components/forms/OperatorForm'
import { FormDataProvider } from '../../../components/forms/FormDataProvider'
import { OperatorFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '../../../components/ui/FormHeader'
import { getForwardNavigationUrl, getBackNavigationUrl } from '../../../lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '../../../lib/error-handler'

export default function OperatorFormPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Shared submission logic - returns true on success, false on failure
  const submitOperator = async (data: OperatorFormData): Promise<boolean> => {
    try {
      console.log('Submitting operator to Supabase:', data)

      // Use the form integration service for proper validation and Supabase direct access
      const { OperatorFormIntegration } = await import('@/lib/supabase/form-integration')
      const result = await OperatorFormIntegration.submitOperator(data)

      if (result.success) {
        console.log('✅ Operator created successfully:', result.data)
        showFormSuccessMessage('operator', 'saved')
        return true
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
            formType: 'operator',
            operation: 'validation',
            validationErrors: result.validationErrors
          }
        )
        return false
      } else {
        // Handle other errors (database, network, etc.)
        throw new Error(result.error || 'Failed to save operator')
      }

    } catch (error) {
      console.error('Error saving operator:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'operator',
          operation: 'save'
        }
      })
      return false
    }
  }

  const handleSubmit = async (data: OperatorFormData) => {
    setIsLoading(true)
    try {
      const success = await submitOperator(data)
      if (success) {
        // Navigate back to forms dashboard after successful submission
        console.log('Navigating back to forms dashboard')
        router.push('/forms')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Save & Add Another - saves but stays on the page
  const handleSaveAndAddAnother = async (data: OperatorFormData): Promise<boolean> => {
    console.log('🔄 handleSaveAndAddAnother called')
    setIsLoading(true)
    try {
      const success = await submitOperator(data)
      console.log('🔄 submitOperator returned:', success)
      // Return success status - form will reset itself if true
      // DO NOT navigate - the form handles the reset
      return success
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Use replace to clear URL parameters and ensure clean navigation
    router.replace('/forms')
  }

  const handleBack = () => {
    const backUrl = getBackNavigationUrl('operator')
    router.push(backUrl)
  }

  const handleFinish = () => {
    // Called when user clicks "Done" after adding multiple operators
    router.push('/forms')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
        title="Operator Management"
        subtitle="Manage property operators, staff, and their permissions"
        currentForm="operator"
        showWorkflowProgress={true}
      />
      <FormDataProvider>
        <OperatorForm
          onSubmit={handleSubmit}
          onSaveAndAddAnother={handleSaveAndAddAnother}
          onCancel={handleCancel}
          onBack={handleBack}
          onFinish={handleFinish}
          isLoading={isLoading}
        />
      </FormDataProvider>
    </div>
  )
}
