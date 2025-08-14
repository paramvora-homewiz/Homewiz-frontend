'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import TenantForm from '@/components/forms/TenantForm'
import { databaseService } from '@/lib/supabase/database'
import { showSuccessMessage, showWarningMessage } from '@/lib/error-handler'
import { UserCheck, Save, X } from 'lucide-react'
import type { Tenant } from '@/lib/supabase/types'

interface EditTenantModalProps {
  tenant: Tenant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  buildings?: Array<{ building_id: string; building_name: string }>
  rooms?: Array<{ room_id: string; building_id: string }>
}

export default function EditTenantModal({
  tenant,
  open,
  onOpenChange,
  onSuccess,
  buildings = [],
  rooms = []
}: EditTenantModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formKey, setFormKey] = useState(0) // Force form re-render when modal opens

  // Reset form when modal opens with new tenant
  useEffect(() => {
    if (open && tenant) {
      setFormKey(prev => prev + 1)
    }
  }, [open, tenant?.tenant_id])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Update tenant data
      const response = await databaseService.tenants.update(tenant!.tenant_id, data)
      
      if (response.success) {
        showSuccessMessage(
          'Tenant Updated',
          `Tenant "${data.tenant_name}" has been updated successfully.`
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        throw new Error(response.error?.message || 'Failed to update tenant')
      }
    } catch (error) {
      console.error('Error updating tenant:', error)
      showWarningMessage(
        'Update Failed',
        'Failed to update tenant. Please try again.'
      )
      // Return error response to prevent form from closing
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
    
    // Return success response
    return { success: true }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  if (!tenant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[90vw] max-w-7xl !max-h-[95vh] !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
        onClose={handleClose}
      >
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
              <UserCheck className="w-5 h-5 text-orange-700" />
            </div>
            Edit Tenant
          </DialogTitle>
          <DialogDescription>
            Update tenant information for {tenant.tenant_name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <TenantForm
            key={formKey} // Force re-render with new key
            initialData={{
              ...tenant,
              // Ensure date fields are properly formatted
              dob: tenant.dob ? new Date(tenant.dob).toISOString().split('T')[0] : undefined,
              lease_start_date: tenant.lease_start_date ? new Date(tenant.lease_start_date).toISOString().split('T')[0] : undefined,
              lease_end_date: tenant.lease_end_date ? new Date(tenant.lease_end_date).toISOString().split('T')[0] : undefined,
              // Split tenant_name into first_name and last_name if needed
              first_name: tenant.first_name || tenant.tenant_name?.split(' ')[0] || '',
              last_name: tenant.last_name || tenant.tenant_name?.split(' ').slice(1).join(' ') || ''
            }}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
            buildings={buildings}
            rooms={rooms}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}