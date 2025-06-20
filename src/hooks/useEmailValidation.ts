import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { validateEmail } from '@/lib/form-utils'

interface EmailValidationResult {
  isValid: boolean
  isChecking: boolean
  error: string | null
  isUnique: boolean | null
}

export function useEmailValidation(email: string, debounceMs: number = 500) {
  const [result, setResult] = useState<EmailValidationResult>({
    isValid: false,
    isChecking: false,
    error: null,
    isUnique: null
  })

  const checkEmailUniqueness = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !validateEmail(emailToCheck)) {
      return
    }

    setResult(prev => ({ ...prev, isChecking: true, error: null }))

    try {
      const response = await api.checkEmailUniqueness(emailToCheck)
      
      if (response.success) {
        setResult(prev => ({
          ...prev,
          isChecking: false,
          isUnique: response.data,
          error: response.data ? null : 'This email is already registered'
        }))
      } else {
        setResult(prev => ({
          ...prev,
          isChecking: false,
          error: 'Unable to verify email availability'
        }))
      }
    } catch (error) {
      setResult(prev => ({
        ...prev,
        isChecking: false,
        error: 'Unable to verify email availability'
      }))
    }
  }, [])

  useEffect(() => {
    // Reset state when email changes
    setResult({
      isValid: validateEmail(email),
      isChecking: false,
      error: null,
      isUnique: null
    })

    if (!email) {
      return
    }

    if (!validateEmail(email)) {
      setResult(prev => ({
        ...prev,
        error: 'Please enter a valid email address'
      }))
      return
    }

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      checkEmailUniqueness(email)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [email, debounceMs, checkEmailUniqueness])

  return result
}

// Hook for budget validation
export function useBudgetValidation(minBudget: number, maxBudget: number) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (minBudget < 0 || maxBudget < 0) {
      setError('Budget cannot be negative')
      return
    }

    if (minBudget > 0 && minBudget < 100) {
      setError('Minimum budget seems unreasonably low')
      return
    }

    if (maxBudget > 10000) {
      setError('Maximum budget seems unreasonably high')
      return
    }

    if (minBudget > 0 && maxBudget > 0 && minBudget > maxBudget) {
      setError('Minimum budget cannot be greater than maximum budget')
      return
    }

    setError(null)
  }, [minBudget, maxBudget])

  return { error, isValid: !error }
}

// Hook for date validation
export function useDateValidation(dateString: string) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!dateString) {
      setError(null)
      return
    }

    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isNaN(date.getTime())) {
      setError('Please enter a valid date')
      return
    }

    if (date < today) {
      setError('Date cannot be in the past')
      return
    }

    // Check if date is too far in the future (more than 1 year)
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    if (date > oneYearFromNow) {
      setError('Date cannot be more than 1 year in the future')
      return
    }

    setError(null)
  }, [dateString])

  return { error, isValid: !error }
}

// Hook for phone number validation and formatting
export function usePhoneValidation(phone: string) {
  const [formattedPhone, setFormattedPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!phone) {
      setFormattedPhone('')
      setError(null)
      return
    }

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')

    if (digits.length < 10) {
      setError('Phone number must be at least 10 digits')
      setFormattedPhone(phone)
      return
    }

    if (digits.length > 11) {
      setError('Phone number is too long')
      setFormattedPhone(phone)
      return
    }

    // Format phone number
    let formatted = ''
    if (digits.length === 10) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    } else if (digits.length === 11 && digits[0] === '1') {
      formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    } else {
      formatted = phone
    }

    setFormattedPhone(formatted)
    setError(null)
  }, [phone])

  return { formattedPhone, error, isValid: !error }
}

// Hook for real-time form validation summary
export function useFormValidation(formData: any) {
  const [validationSummary, setValidationSummary] = useState({
    isValid: false,
    errors: [] as string[],
    warnings: [] as string[]
  })

  useEffect(() => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required fields
    if (!formData.firstName?.trim()) errors.push('First name is required')
    if (!formData.lastName?.trim()) errors.push('Last name is required')
    if (!formData.email?.trim()) errors.push('Email is required')
    if (!formData.occupation?.trim()) errors.push('Occupation is required')
    if (!formData.preferred_move_in_date) errors.push('Move-in date is required')

    // Check budget
    if (formData.budget_min <= 0 || formData.budget_max <= 0) {
      errors.push('Budget range is required')
    }

    // Check property selection for complete application
    if (!formData.selected_room_id || !formData.selected_building_id) {
      warnings.push('Property selection required for complete application')
    }

    // Check lease term
    if (!formData.preferred_lease_term || formData.preferred_lease_term < 1) {
      errors.push('Lease term is required')
    }

    setValidationSummary({
      isValid: errors.length === 0,
      errors,
      warnings
    })
  }, [formData])

  return validationSummary
}
