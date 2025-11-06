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

  const handleSubmit = async (data: OperatorFormData) => {
    setIsLoading(true)
    try {
      console.log('Submitting operator to Supabase:', data)

      // Use the form integration service for proper validation and Supabase direct access
      const { OperatorFormIntegration } = await import('@/lib/supabase/form-integration')
      const result = await OperatorFormIntegration.submitOperator(data)

      if (result.success) {
        console.log('✅ Operator created successfully:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('operator', 'saved')

        // Navigate back to forms dashboard (consistent with other forms)
        console.log('Navigating back to forms dashboard')
        router.push('/forms')
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

        // Don't redirect on validation errors - let user fix them
        return
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
      // Don't redirect on errors - let user try again
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
          onCancel={handleCancel}
          onBack={handleBack}
          isLoading={isLoading}
        />
      </FormDataProvider>
    </div>
  )
}
