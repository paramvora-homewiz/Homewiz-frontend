'use client'

import BuildingForm from '../../../components/forms/BuildingForm'
import { FormDataProvider, useFormData } from '../../../components/forms/FormDataProvider'
import { BuildingFormData } from '../../../types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function BuildingFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { operators } = useFormData()

  const handleSubmit = async (data: BuildingFormData) => {
    setIsLoading(true)
    try {
      // Here you would make an API call to save the building
      console.log('Submitting building:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message and redirect
      alert('Building saved successfully!')
      router.push('/forms')
      
    } catch (error) {
      console.error('Error saving building:', error)
      alert('Error saving building. Please try again.')
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
    <FormDataProvider>
      <BuildingFormContent />
    </FormDataProvider>
  )
}
