/**
 * Email Validation Hook
 *
 * Provides real-time email validation with uniqueness checking against the backend API.
 * Used in forms that require email validation with debounced API calls.
 */

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { validateEmail } from '@/lib/form-utils'

interface EmailValidationResult {
  isValid: boolean
  isChecking: boolean
  error: string | null
  isUnique: boolean | null
}

/**
 * Hook for email validation with debounced uniqueness checking
 * @param email - Email address to validate
 * @param debounceMs - Debounce delay for API calls (default: 500ms)
 * @returns Validation result with status and error information
 */
export function useEmailValidation(email: string, debounceMs: number = 500) {
  const [result, setResult] = useState<EmailValidationResult>({
    isValid: false,
    isChecking: false,
    error: null,
    isUnique: null
  })

  const checkEmailUniqueness = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !validateEmail(emailToCheck).valid) {
      return
    }

    setResult(prev => ({ ...prev, isChecking: true, error: null }))

    try {
      const response = await api.checkEmailUniqueness(emailToCheck)
      
      if (response.success) {
        setResult(prev => ({
          ...prev,
          isChecking: false,
          isUnique: response.data ?? null,
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
      isValid: validateEmail(email).valid,
      isChecking: false,
      error: null,
      isUnique: null
    })

    if (!email) {
      return
    }

    if (!validateEmail(email).valid) {
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


