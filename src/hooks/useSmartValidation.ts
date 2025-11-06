import { useState, useEffect, useCallback, useMemo } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  min?: number
  max?: number
  custom?: (value: any, formData: any) => string | null
  dependsOn?: string[]
  message?: string
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
  fieldValidation: Record<string, boolean>
}

export function useSmartValidation<T extends Record<string, any>>(
  formData: T,
  schema: ValidationSchema,
  options: {
    validateOnChange?: boolean
    debounceMs?: number
    skipEmptyFields?: boolean
  } = {}
) {
  const { validateOnChange = true, debounceMs = 300, skipEmptyFields = true } = options
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Validate a single field
  const validateField = useCallback((
    fieldName: string,
    value: any,
    currentFormData: T
  ): { error: string | null; warning: string | null } => {
    const rule = schema[fieldName]
    if (!rule) return { error: null, warning: null }

    // Skip validation for empty fields if configured
    if (skipEmptyFields && (value === '' || value === null || value === undefined)) {
      if (rule.required) {
        return { error: rule.message || `${fieldName} is required`, warning: null }
      }
      return { error: null, warning: null }
    }

    // Required validation
    if (rule.required && (value === '' || value === null || value === undefined)) {
      return { error: rule.message || `${fieldName} is required`, warning: null }
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return { error: `${fieldName} must be at least ${rule.minLength} characters`, warning: null }
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return { error: `${fieldName} must be no more than ${rule.maxLength} characters`, warning: null }
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return { error: rule.message || `${fieldName} format is invalid`, warning: null }
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return { error: `${fieldName} must be at least ${rule.min}`, warning: null }
      }
      if (rule.max !== undefined && value > rule.max) {
        return { error: `${fieldName} must be no more than ${rule.max}`, warning: null }
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value, currentFormData)
      if (customError) {
        return { error: customError, warning: null }
      }
    }

    return { error: null, warning: null }
  }, [schema, skipEmptyFields])

  // Validate all fields
  const validateAll = useCallback((data: T = formData): ValidationResult => {
    const newErrors: Record<string, string> = {}
    const newWarnings: Record<string, string> = {}
    const fieldValidation: Record<string, boolean> = {}

    Object.keys(schema).forEach(fieldName => {
      const value = data[fieldName]
      const { error, warning } = validateField(fieldName, value, data)
      
      if (error) {
        newErrors[fieldName] = error
        fieldValidation[fieldName] = false
      } else {
        fieldValidation[fieldName] = true
      }
      
      if (warning) {
        newWarnings[fieldName] = warning
      }
    })

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
      warnings: newWarnings,
      fieldValidation
    }
  }, [formData, schema, validateField])

  // Validate fields with dependencies
  const validateWithDependencies = useCallback((changedField: string, data: T) => {
    const fieldsToValidate = new Set([changedField])
    
    // Find fields that depend on the changed field
    Object.entries(schema).forEach(([fieldName, rule]) => {
      if (rule.dependsOn?.includes(changedField)) {
        fieldsToValidate.add(fieldName)
      }
    })

    const newErrors = { ...errors }
    const newWarnings = { ...warnings }

    fieldsToValidate.forEach(fieldName => {
      const value = data[fieldName]
      const { error, warning } = validateField(fieldName, value, data)
      
      if (error) {
        newErrors[fieldName] = error
      } else {
        delete newErrors[fieldName]
      }
      
      if (warning) {
        newWarnings[fieldName] = warning
      } else {
        delete newWarnings[fieldName]
      }
    })

    setErrors(newErrors)
    setWarnings(newWarnings)
  }, [errors, warnings, schema, validateField])

  // Mark field as touched
  const touchField = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]))
  }, [])

  // Validate on form data change
  useEffect(() => {
    if (!validateOnChange) return

    const timeoutId = setTimeout(() => {
      const result = validateAll(formData)
      setErrors(result.errors)
      setWarnings(result.warnings)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [formData, validateOnChange, debounceMs, validateAll])

  // Get validation state for a specific field
  const getFieldValidation = useCallback((fieldName: string) => {
    const hasError = fieldName in errors
    const hasWarning = fieldName in warnings
    const isTouched = touchedFields.has(fieldName)
    
    return {
      isValid: !hasError,
      error: errors[fieldName] || null,
      warning: warnings[fieldName] || null,
      isTouched,
      showError: hasError && isTouched,
      showWarning: hasWarning && !hasError && isTouched
    }
  }, [errors, warnings, touchedFields])

  // Clear validation for specific field
  const clearFieldValidation = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
    setWarnings(prev => {
      const newWarnings = { ...prev }
      delete newWarnings[fieldName]
      return newWarnings
    })
  }, [])

  // Overall validation state
  const validationState = useMemo(() => ({
    isValid: Object.keys(errors).length === 0,
    hasErrors: Object.keys(errors).length > 0,
    hasWarnings: Object.keys(warnings).length > 0,
    errorCount: Object.keys(errors).length,
    warningCount: Object.keys(warnings).length,
    errors,
    warnings
  }), [errors, warnings])

  return {
    validationState,
    validateAll,
    validateField,
    validateWithDependencies,
    getFieldValidation,
    touchField,
    clearFieldValidation,
    setErrors,
    setWarnings
  }
}
