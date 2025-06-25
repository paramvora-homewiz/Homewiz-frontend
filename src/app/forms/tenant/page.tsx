'use client'

import TenantForm from '@/components/forms/TenantForm'
import { FormDataProvider, useFormData } from '@/components/forms/FormDataProvider'
import { FormStepWrapper } from '@/components/ui/FormStepWrapper'
import { TenantFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '@/components/ui/FormHeader'
import { getForwardNavigationUrl } from '@/lib/form-workflow'

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
      alert('Tenant saved successfully! Proceeding to Lead Tracking.')
      // Navigate to the next form in the workflow
      const nextUrl = getForwardNavigationUrl('tenant')
      router.push(nextUrl)
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FormHeader
        title="Tenant Management"
        subtitle="Manage tenant information, leases, and preferences"
        currentForm="tenant"
      />
      <FormDataProvider>
        <FormStepWrapper>
          <TenantFormContent />
        </FormStepWrapper>
      </FormDataProvider>
    </div>
  )
}
