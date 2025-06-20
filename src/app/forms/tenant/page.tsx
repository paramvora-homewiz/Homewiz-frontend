'use client'

import TenantForm from '@/components/forms/TenantForm'
import { FormDataProvider, useFormData } from '@/components/forms/FormDataProvider'
import { TenantFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function TenantFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { buildings, rooms, operators } = useFormData()

  const handleSubmit = async (data: TenantFormData) => {
    setIsLoading(true)
    try {
      // Here you would make an API call to save the tenant
      console.log('Submitting tenant:', data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message and redirect
      alert('Tenant saved successfully!')
      router.push('/forms')
      
    } catch (error) {
      console.error('Error saving tenant:', error)
      alert('Error saving tenant. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/forms')
  }

  return (
    <TenantForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      buildings={buildings}
      rooms={rooms}
      operators={operators}
    />
  )
}

export default function TenantFormPage() {
  return (
    <FormDataProvider>
      <TenantFormContent />
    </FormDataProvider>
  )
}
