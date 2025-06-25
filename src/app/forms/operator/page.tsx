'use client'

import OperatorForm from '../../../components/forms/OperatorForm'
import { FormDataProvider } from '../../../components/forms/FormDataProvider'
import { OperatorFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiService } from '../../../services/apiService'
import FormHeader from '../../../components/ui/FormHeader'
import { getForwardNavigationUrl, getBackNavigationUrl } from '../../../lib/form-workflow'

export default function OperatorFormPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: OperatorFormData) => {
    setIsLoading(true)
    try {
      console.log('Submitting operator:', data)

      // Make actual API call to save the operator
      const response = await apiService.createOperator(data)

      if (response.success) {
        alert('Operator saved successfully! Proceeding to Building Configuration.')
        // Navigate to the next form in the workflow
        const nextUrl = getForwardNavigationUrl('operator')
        router.push(nextUrl)
      } else {
        throw new Error(response.message || 'Failed to save operator')
      }

    } catch (error) {
      console.error('Error saving operator:', error)
      alert(`Error saving operator: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/forms')
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
