'use client'

import BuildingForm from '../../../components/forms/BuildingForm'
import { FormDataProvider, useFormData } from '../../../components/forms/FormDataProvider'
import { FormStepWrapper } from '../../../components/ui/FormStepWrapper'
import { BuildingFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiService } from '../../../services/apiService'
import FormHeader from '../../../components/ui/FormHeader'
import { getForwardNavigationUrl } from '../../../lib/form-workflow'

function BuildingFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { operators } = useFormData()

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      console.log('Submitting building:', data instanceof FormData ? 'FormData with files' : 'JSON data', data)

      // Make actual API call to save the building
      const response = await apiService.createBuilding(data)

      if (response.success) {
        alert('Building saved successfully! Proceeding to Room Setup.')
        // Navigate to the next form in the workflow
        const nextUrl = getForwardNavigationUrl('building')
        router.push(nextUrl)
      } else {
        throw new Error(response.message || 'Failed to save building')
      }

    } catch (error) {
      console.error('Error saving building:', error)
      alert(`Error saving building: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/forms')
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
