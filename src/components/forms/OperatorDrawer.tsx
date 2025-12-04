'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus } from 'lucide-react'
import OperatorForm from './OperatorForm'
import { OperatorFormData } from '@/types'
import { showSuccessMessage, showWarningMessage } from '@/lib/error-handler'

interface OperatorDrawerProps {
  isOpen: boolean
  onClose: () => void
  onOperatorCreated?: (operator: any) => void
}

export default function OperatorDrawer({
  isOpen,
  onClose,
  onOperatorCreated
}: OperatorDrawerProps) {
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSubmit = async (data: OperatorFormData) => {
    setIsSubmitting(true)
    try {
      // Use Supabase form integration directly (no backend API required)
      const { OperatorFormIntegration } = await import('@/lib/supabase/form-integration')
      const result = await OperatorFormIntegration.submitOperator(data)

      if (result.success && result.data) {
        showSuccessMessage('Operator created successfully!')
        onOperatorCreated?.(result.data)
        onClose()
      } else if (result.validationErrors) {
        const errorMessages = Object.values(result.validationErrors).join(', ')
        showWarningMessage(`Validation error: ${errorMessages}`)
      } else {
        showWarningMessage(result.error || 'Failed to create operator')
      }
    } catch (error) {
      console.error('Error creating operator:', error)
      showWarningMessage('Failed to create operator. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[90vw] md:w-[80vw] lg:w-[700px] xl:w-[800px] max-w-[90vw] bg-white shadow-2xl z-[10000] flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex-shrink-0">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Add New Operator</h2>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Create a new operator without leaving this form</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0 ml-2"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <OperatorForm
                onSubmit={handleSubmit}
                onCancel={onClose}
                isLoading={isSubmitting}
                mode="drawer"
                showHeader={false}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(drawerContent, document.body)
}
