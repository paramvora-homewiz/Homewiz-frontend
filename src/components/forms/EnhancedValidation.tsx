'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

export interface ValidationMessage {
  type: 'error' | 'warning' | 'success' | 'info'
  message: string
  field?: string
}

interface EnhancedValidationProps {
  messages: ValidationMessage[]
  onDismiss?: (index: number) => void
  className?: string
  showSummary?: boolean
  autoHide?: boolean
  autoHideDelay?: number
}

export default function EnhancedValidation({
  messages,
  onDismiss,
  className = '',
  showSummary = true,
  autoHide = false,
  autoHideDelay = 5000
}: EnhancedValidationProps) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])

  useEffect(() => {
    setVisibleMessages(messages.map((_, index) => index))
  }, [messages])

  useEffect(() => {
    if (autoHide && messages.length > 0) {
      const timer = setTimeout(() => {
        setVisibleMessages([])
      }, autoHideDelay)
      return () => clearTimeout(timer)
    }
  }, [messages, autoHide, autoHideDelay])

  const handleDismiss = (index: number) => {
    setVisibleMessages(prev => prev.filter(i => i !== index))
    onDismiss?.(index)
  }

  const getIcon = (type: ValidationMessage['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
    }
  }

  const getColors = (type: ValidationMessage['type']) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500'
        }
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          icon: 'text-amber-500'
        }
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-500'
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500'
        }
    }
  }

  const groupedMessages = messages.reduce((acc, message, index) => {
    if (!visibleMessages.includes(index)) return acc
    
    if (!acc[message.type]) {
      acc[message.type] = []
    }
    acc[message.type].push({ ...message, originalIndex: index })
    return acc
  }, {} as Record<string, Array<ValidationMessage & { originalIndex: number }>>)

  if (Object.keys(groupedMessages).length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence>
        {Object.entries(groupedMessages).map(([type, typeMessages]) => {
          const colors = getColors(type as ValidationMessage['type'])
          
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`rounded-lg border p-4 ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${colors.icon}`}>
                  {getIcon(type as ValidationMessage['type'])}
                </div>
                
                <div className="flex-1 min-w-0">
                  {showSummary && typeMessages.length > 1 && (
                    <h4 className={`font-medium ${colors.text} mb-2`}>
                      {type === 'error' && `${typeMessages.length} errors found`}
                      {type === 'warning' && `${typeMessages.length} warnings`}
                      {type === 'success' && `${typeMessages.length} items validated`}
                      {type === 'info' && `${typeMessages.length} information items`}
                    </h4>
                  )}
                  
                  <div className="space-y-1">
                    {typeMessages.map((message, index) => (
                      <div key={index} className="flex items-start justify-between gap-2">
                        <div className={`text-sm ${colors.text}`}>
                          {message.field && (
                            <span className="font-medium">{message.field}: </span>
                          )}
                          {message.message}
                        </div>
                        
                        {onDismiss && (
                          <button
                            onClick={() => handleDismiss(message.originalIndex)}
                            className={`flex-shrink-0 p-1 rounded hover:bg-black hover:bg-opacity-10 ${colors.icon}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Inline field validation component
interface InlineValidationProps {
  message?: string
  type?: 'error' | 'warning' | 'success'
  className?: string
}

export function InlineValidation({ 
  message, 
  type = 'error', 
  className = '' 
}: InlineValidationProps) {
  if (!message) return null

  const colors = {
    error: 'text-red-600',
    warning: 'text-amber-600',
    success: 'text-green-600'
  }

  const icons = {
    error: <AlertCircle className="h-3 w-3" />,
    warning: <AlertTriangle className="h-3 w-3" />,
    success: <CheckCircle className="h-3 w-3" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`flex items-center gap-1 text-xs mt-1 ${colors[type]} ${className}`}
    >
      {icons[type]}
      <span>{message}</span>
    </motion.div>
  )
}

// Form validation summary component
interface ValidationSummaryProps {
  errors: Record<string, string>
  warnings?: Record<string, string>
  onFieldFocus?: (fieldName: string) => void
  className?: string
}

export function ValidationSummary({
  errors,
  warnings = {},
  onFieldFocus,
  className = ''
}: ValidationSummaryProps) {
  const errorMessages: ValidationMessage[] = Object.entries(errors).map(([field, message]) => ({
    type: 'error',
    field,
    message
  }))

  const warningMessages: ValidationMessage[] = Object.entries(warnings).map(([field, message]) => ({
    type: 'warning',
    field,
    message
  }))

  const allMessages = [...errorMessages, ...warningMessages]

  if (allMessages.length === 0) return null

  return (
    <div className={className}>
      <EnhancedValidation
        messages={allMessages}
        showSummary={true}
        onDismiss={onFieldFocus ? (index) => {
          const message = allMessages[index]
          if (message.field) {
            onFieldFocus(message.field)
          }
        } : undefined}
      />
    </div>
  )
}

// Real-time validation hook
export function useRealTimeValidation<T>(
  data: T,
  validationRules: Record<keyof T, (value: any) => string | null>,
  debounceMs: number = 500
) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    setIsValidating(true)
    
    const timer = setTimeout(() => {
      const newErrors: Record<string, string> = {}
      
      Object.entries(validationRules).forEach(([field, validator]) => {
        const value = data[field as keyof T]
        const error = validator(value)
        if (error) {
          newErrors[field] = error
        }
      })
      
      setErrors(newErrors)
      setIsValidating(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [data, validationRules, debounceMs])

  return {
    errors,
    isValidating,
    isValid: Object.keys(errors).length === 0
  }
}

// Field validation status indicator
interface ValidationStatusProps {
  isValid?: boolean
  isValidating?: boolean
  className?: string
}

export function ValidationStatus({ 
  isValid, 
  isValidating, 
  className = '' 
}: ValidationStatusProps) {
  if (isValidating) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isValid === true) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <CheckCircle className="h-3 w-3 text-green-500" />
      </div>
    )
  }

  if (isValid === false) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <AlertCircle className="h-3 w-3 text-red-500" />
      </div>
    )
  }

  return null
}
