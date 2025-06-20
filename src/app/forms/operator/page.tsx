'use client'

import OperatorForm from '@/components/forms/OperatorForm'
import { FormDataProvider } from '@/components/forms/FormDataProvider'
import { OperatorFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function OperatorFormPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: OperatorFormData) => {
    setIsLoading(true)
    try {
      // Here you would make an API call to save the operator
      console.log('Submitting operator:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message and redirect
      alert('Operator saved successfully!')
      router.push('/forms')
      
    } catch (error) {
      console.error('Error saving operator:', error)
      alert('Error saving operator. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/forms')
  }

  return (
    <FormDataProvider>
      <OperatorForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </FormDataProvider>
  )
}
