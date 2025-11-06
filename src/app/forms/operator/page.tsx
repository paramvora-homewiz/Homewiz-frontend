'use client'

import OperatorForm from '../../../components/forms/OperatorForm'
import { FormDataProvider } from '../../../components/forms/FormDataProvider'
import { OperatorFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createOperator } from '../../../lib/api-client'
import FormHeader from '../../../components/ui/FormHeader'
import { getForwardNavigationUrl, getBackNavigationUrl } from '../../../lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '../../../lib/error-handler'

export default function OperatorFormPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: OperatorFormData) => {
    setIsLoading(true)
    try {
      console.log('Submitting operator:', data)

      // Make actual API call to save the operator
      const response = await createOperator(data)

      // Handle different response formats
      const isSuccess = response?.success !== undefined ? response.success : true

      if (isSuccess) {
        // Show enhanced success message
        showFormSuccessMessage('operator', 'saved')

        // Navigate to the next form in the workflow
        const nextUrl = getForwardNavigationUrl('operator')
        console.log('Navigating to next form:', nextUrl)

        // Clear any existing URL parameters and navigate to clean URL
        const cleanUrl = nextUrl.split('?')[0]
        router.replace(cleanUrl)
      } else {
        throw new Error(response?.message || 'Failed to save operator')
      }

    } catch (error) {
      console.error('Error saving operator:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'operator',
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
