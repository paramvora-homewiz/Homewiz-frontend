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
import OperatorForm from '@/components/forms/OperatorForm'
import { databaseService } from '@/lib/supabase/database'
import { showSuccessMessage, showWarningMessage } from '@/lib/error-handler'
import { Users, Save, X } from 'lucide-react'
import type { Operator } from '@/lib/supabase/types'

interface EditOperatorModalProps {
  operator: Operator | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function EditOperatorModal({
  operator,
  open,
  onOpenChange,
  onSuccess
}: EditOperatorModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formKey, setFormKey] = useState(0) // Force form re-render when modal opens

  // Reset form when modal opens with new operator
  useEffect(() => {
    if (open && operator) {
      setFormKey(prev => prev + 1)
    }
  }, [open, operator?.operator_id])

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      // Update operator data
      const response = await databaseService.operators.update(operator!.operator_id, data)
      
      if (response.success) {
        showSuccessMessage(
          'Operator Updated',
          `Operator "${data.name}" has been updated successfully.`
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        throw new Error(response.error?.message || 'Failed to update operator')
      }
    } catch (error) {
      console.error('Error updating operator:', error)
      showWarningMessage(
        'Update Failed',
        'Failed to update operator. Please try again.'
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

  if (!operator) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[90vw] max-w-7xl !max-h-[95vh] !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
        onClose={handleClose}
      >
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
              <Users className="w-5 h-5 text-blue-700" />
            </div>
            Edit Operator
          </DialogTitle>
          <DialogDescription>
            Update operator information for {operator.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <OperatorForm
            key={formKey} // Force re-render with new key
            initialData={{
              ...operator,
              // Ensure boolean fields are properly typed
              active: operator.active !== false, // Default to true if not explicitly false
              emergency_contact: operator.emergency_contact === true,
              calendar_sync_enabled: operator.calendar_sync_enabled === true
            }}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}