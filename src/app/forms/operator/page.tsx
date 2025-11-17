'use client'

import OperatorForm from '../../../components/forms/OperatorForm'
import { FormDataProvider } from '../../../components/forms/FormDataProvider'
import { OperatorFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '../../../components/ui/FormHeader'
import { getForwardNavigationUrl, getBackNavigationUrl } from '../../../lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '../../../lib/error-handler'
import { operatorsApi } from '@/lib/api'
import { transformOperatorDataForBackend } from '@/lib/backend-sync'

export default function OperatorFormPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: OperatorFormData) => {
    setIsLoading(true)
    try {
      console.log('Submitting operator to Backend API:', data)

      // Transform data for backend compatibility
      const transformedData = transformOperatorDataForBackend(data)

      // Generate operator_id if not present
      if (!transformedData.operator_id) {
        transformedData.operator_id = `OP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Use backend API instead of Supabase
      const result = await operatorsApi.create(transformedData)

      if (result.success && result.data) {
        console.log('✅ Operator created successfully via Backend API:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('operator', 'saved')

        // Navigate back to forms dashboard (consistent with other forms)
        console.log('Navigating back to forms dashboard')
        router.push('/forms')
      } else {
        throw new Error(result.error || 'Failed to create operator')
      }

    } catch (error) {
      console.error('Error saving operator:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'operator',
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
