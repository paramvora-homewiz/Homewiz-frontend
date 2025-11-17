'use client'

import TenantForm from '@/components/forms/TenantForm'
import { FormDataProvider, useFormData } from '@/components/forms/FormDataProvider'
import { FormStepWrapper } from '@/components/ui/FormStepWrapper'
import { TenantFormData } from '@/types'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import FormHeader from '@/components/ui/FormHeader'
import { getForwardNavigationUrl } from '@/lib/form-workflow'
import { showFormSuccessMessage, handleFormSubmissionError } from '@/lib/error-handler'
import { tenantsApi } from '@/lib/api'
import { transformTenantDataForBackend } from '@/lib/backend-sync'

function TenantFormContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { buildings, rooms, operators } = useFormData()

  const handleSubmit = async (data: TenantFormData) => {
    setIsLoading(true)
    try {
      console.log('Submitting tenant to Backend API:', data)

      // Transform data for backend compatibility
      const transformedData = transformTenantDataForBackend(data)

      // Generate tenant_id if not present
      if (!transformedData.tenant_id) {
        transformedData.tenant_id = `TNT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      // Use backend API instead of Supabase
      const result = await tenantsApi.create(transformedData)

      if (result.success && result.data) {
        console.log('✅ Tenant created successfully via Backend API:', result.data)

        // Show enhanced success message
        showFormSuccessMessage('tenant', 'saved')

        // Navigate back to forms dashboard (consistent with building and room form behavior)
        console.log('Navigating back to forms dashboard')
        router.push('/forms')
      } else {
        throw new Error(result.error || 'Failed to create tenant')
      }

    } catch (error) {
      console.error('Error saving tenant:', error)
      handleFormSubmissionError(error, {
        additionalInfo: {
          formType: 'tenant',
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
