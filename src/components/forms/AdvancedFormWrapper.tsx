'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFormAutoSave } from '@/hooks/useAutoSave'
import { useSmartValidation, ValidationSchema } from '@/hooks/useSmartValidation'
import { useConditionalLogic, ConditionalLogicConfig } from '@/hooks/useConditionalLogic'
import { useRealTimeCollaboration, CollaboratorInfo } from '@/hooks/useRealTimeCollaboration'
import { AutoSaveIndicator, CollaborationIndicator, FieldValidationIndicator } from '@/components/ui/enhanced-components'
import { AlertTriangle, Users, Settings, Zap } from 'lucide-react'

interface AdvancedFormWrapperProps<T> {
  formId: string
  initialData: T
  validationSchema: ValidationSchema
  conditionalLogic?: ConditionalLogicConfig
  currentUser: CollaboratorInfo
  onSubmit: (data: T) => Promise<void>
  onAutoSave?: (data: T) => Promise<void>
  children: (props: {
    formData: T
    updateField: (field: string, value: any) => void
    validation: any
    conditionalLogic: any
    collaboration: any
    isFieldVisible: (field: string) => boolean
    isFieldEnabled: (field: string) => boolean
    isFieldRequired: (field: string) => boolean
  }) => React.ReactNode
  className?: string
}

export function AdvancedFormWrapper<T extends Record<string, any>>({
  formId,
  initialData,
  validationSchema,
  conditionalLogic,
  currentUser,
  onSubmit,
  onAutoSave,
  children,
  className = ''
}: AdvancedFormWrapperProps<T>) {
  const [formData, setFormData] = useState<T>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | 'offline'>('saved')
  const [lastSaved, setLastSaved] = useState<Date>()

  // Auto-save functionality
  const { loadSavedData, clearSavedData, forceSave } = useFormAutoSave(
    formData,
    formId,
    {
      enabled: !!onAutoSave,
      onSave: async (data) => {
        setAutoSaveStatus('saving')
        try {
          await onAutoSave?.(data)
          setAutoSaveStatus('saved')
          setLastSaved(new Date())
        } catch (error) {
          setAutoSaveStatus('error')
          throw error
        }
      },
      onError: () => {
        setAutoSaveStatus('error')
      }
    }
  )

  // Smart validation
  const validation = useSmartValidation(formData, validationSchema, {
    validateOnChange: true,
    debounceMs: 300
  })

  // Conditional logic
  const conditionalLogicHook = useConditionalLogic(
    formData,
    conditionalLogic || { rules: [] }
  )

  // Real-time collaboration
  const collaboration = useRealTimeCollaboration({
    formId,
    currentUser,
    onCollaboratorJoin: (collaborator) => {
      console.log('Collaborator joined:', collaborator.name)
    },
    onCollaboratorLeave: (collaboratorId) => {
      console.log('Collaborator left:', collaboratorId)
    },
    onFieldActivity: (activity) => {
      console.log('Field activity:', activity)
    }
  })

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadSavedData()
    if (savedData) {
      setFormData(savedData)
    }
  }, [loadSavedData])

  // Update field with validation and conditional logic
  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Apply conditional logic
      const fieldsToClear = conditionalLogicHook.getFieldsToClear()
      fieldsToClear.forEach(fieldToClear => {
        if (fieldToClear !== field) {
          newData[fieldToClear] = ''
        }
      })

      // Apply suggested values
      Object.keys(newData).forEach(fieldName => {
        const suggestedValue = conditionalLogicHook.getFieldValue(fieldName)
        if (suggestedValue !== undefined && fieldName !== field) {
          newData[fieldName] = suggestedValue
        }
      })

      return newData
    })

    // Validate with dependencies
    validation.validateWithDependencies(field, formData)
  }, [conditionalLogicHook, validation, formData])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationResult = validation.validateAll(formData)
    if (!validationResult.isValid) {
      // Focus first error field
      const firstErrorField = Object.keys(validationResult.errors)[0]
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
        element?.focus()
      }
      return
    }

    setIsSubmitting(true)
    try {
      await forceSave() // Ensure latest data is saved
      await onSubmit(formData)
      clearSavedData() // Clear auto-saved data after successful submission
    } catch (error) {
      console.error('Form submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle field focus for collaboration
  const handleFieldFocus = useCallback((fieldName: string) => {
    collaboration.broadcastFieldFocus(fieldName)
    validation.touchField(fieldName)
  }, [collaboration, validation])

  // Handle field blur for collaboration
  const handleFieldBlur = useCallback((fieldName: string) => {
    collaboration.broadcastFieldBlur(fieldName)
  }, [collaboration])

  const onlineCollaborators = collaboration.getOnlineCollaborators()

  return (
    <div className={`relative ${className}`}>
      {/* Form Header with Status Indicators */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Advanced Form</span>
          </div>
          
          {onAutoSave && (
            <AutoSaveIndicator 
              status={autoSaveStatus}
              lastSaved={lastSaved}
            />
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Validation Status */}
          {validation.validationState.hasErrors && (
            <motion.div 
              className="flex items-center gap-2 text-red-600"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">
                {validation.validationState.errorCount} error{validation.validationState.errorCount !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}

          {/* Collaboration Indicator */}
          {onlineCollaborators.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <CollaborationIndicator collaborators={onlineCollaborators} />
            </div>
          )}

          {/* Conditional Logic Status */}
          {conditionalLogic && (
            <motion.div 
              className="flex items-center gap-2 text-purple-600"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Smart Logic</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {children({
          formData,
          updateField,
          validation,
          conditionalLogic: conditionalLogicHook,
          collaboration,
          isFieldVisible: conditionalLogicHook.isFieldVisible,
          isFieldEnabled: conditionalLogicHook.isFieldEnabled,
          isFieldRequired: conditionalLogicHook.isFieldRequired
        })}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <motion.button
            type="button"
            onClick={() => {
              const savedData = loadSavedData()
              if (savedData) {
                setFormData(savedData)
              }
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Restore Saved
          </motion.button>

          <motion.button
            type="submit"
            disabled={isSubmitting || validation.validationState.hasErrors}
            className={`
              px-8 py-3 rounded-lg font-semibold transition-all duration-200
              ${isSubmitting || validation.validationState.hasErrors
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }
            `}
            whileHover={!(isSubmitting || validation.validationState.hasErrors) ? { scale: 1.02 } : {}}
            whileTap={!(isSubmitting || validation.validationState.hasErrors) ? { scale: 0.98 } : {}}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              'Submit Form'
            )}
          </motion.button>
        </div>
      </form>

      {/* Field-specific collaboration indicators */}
      <AnimatePresence>
        {Object.entries(collaboration.collaborationState.fieldActivities).map(([fieldName, activities]) => {
          const activeCollaborators = activities
            .filter(activity => activity.action === 'editing')
            .map(activity => collaboration.collaborationState.collaborators[activity.collaboratorId])
            .filter(Boolean)

          if (activeCollaborators.length === 0) return null

          return (
            <motion.div
              key={fieldName}
              className="fixed z-50 pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)'
              }}
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
                <div className="text-xs text-gray-500 mb-1">Editing {fieldName}</div>
                <CollaborationIndicator collaborators={activeCollaborators} />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
