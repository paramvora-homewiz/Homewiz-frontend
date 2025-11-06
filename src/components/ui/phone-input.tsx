'use client'

import { useState, useEffect } from 'react'
import { Input } from './input'
import { Phone } from 'lucide-react'

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  onChange?: (value: string) => void
  value?: string
}

export function PhoneInput({ 
  label = "Phone Number", 
  error, 
  onChange, 
  value = '', 
  ...props 
}: PhoneInputProps) {
  const [formattedValue, setFormattedValue] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (value !== formattedValue) {
      const formatted = formatPhoneNumber(value)
      setFormattedValue(formatted)
      validatePhone(formatted)
    }
  }, [value])

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '')
    
    // Handle different lengths
    if (digits.length === 0) return ''
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    
    // Handle 11 digits (with country code)
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`
    }
    
    // Truncate if too long
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    
    if (digits.length === 0) {
      setIsValid(null)
      return
    }
    
    // Valid if 10 digits or 11 digits starting with 1
    const isValidLength = digits.length === 10 || (digits.length === 11 && digits[0] === '1')
    setIsValid(isValidLength)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatPhoneNumber(inputValue)
    
    setFormattedValue(formatted)
    validatePhone(formatted)
    onChange?.(formatted)
  }

  const getValidationMessage = () => {
    if (isValid === false && formattedValue) {
      return 'Please enter a valid phone number'
    }
    return error
  }

  return (
    <Input
      {...props}
      label={label}
      type="tel"
      value={formattedValue}
      onChange={handleChange}
      error={getValidationMessage()}
      icon={<Phone className="h-4 w-4" />}
      placeholder="(555) 123-4567"
      className={isValid === true ? 'border-green-500' : isValid === false ? 'border-red-500' : ''}
    />
  )
}
