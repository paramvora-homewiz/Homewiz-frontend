'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'

interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
  smartValidation?: boolean
  validationRules?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    custom?: (value: string) => string | null
  }
}

export function SmartInput({
  label,
  error,
  icon,
  suggestions = [],
  onSuggestionSelect,
  smartValidation = false,
  validationRules,
  value,
  onChange,
  onBlur,
  className,
  ...props
}: SmartInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const inputValue = value as string || ''

  useEffect(() => {
    if (inputValue && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        suggestion.toLowerCase() !== inputValue.toLowerCase()
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
      setFilteredSuggestions([])
    }
    setSelectedIndex(-1)
  }, [inputValue, suggestions])

  useEffect(() => {
    if (smartValidation && validationRules && inputValue) {
      validateInput(inputValue)
    } else {
      setValidationMessage(null)
      setIsValid(null)
    }
  }, [inputValue, smartValidation, validationRules])

  const validateInput = (value: string) => {
    if (!validationRules) return

    // Min length validation
    if (validationRules.minLength && value.length < validationRules.minLength) {
      setValidationMessage(`Minimum ${validationRules.minLength} characters required`)
      setIsValid(false)
      return
    }

    // Max length validation
    if (validationRules.maxLength && value.length > validationRules.maxLength) {
      setValidationMessage(`Maximum ${validationRules.maxLength} characters allowed`)
      setIsValid(false)
      return
    }

    // Pattern validation
    if (validationRules.pattern && !validationRules.pattern.test(value)) {
      setValidationMessage('Invalid format')
      setIsValid(false)
      return
    }

    // Custom validation
    if (validationRules.custom) {
      const customError = validationRules.custom(value)
      if (customError) {
        setValidationMessage(customError)
        setIsValid(false)
        return
      }
    }

    setValidationMessage(null)
    setIsValid(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
    onBlur?.(e)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect?.(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const getValidationIcon = () => {
    if (isValid === true) {
      return <Check className="h-4 w-4 text-green-500" />
    }
    return null
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          label={label}
          error={error || validationMessage || undefined}
          icon={icon}
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            className,
            isValid === true && 'border-green-500 focus-visible:ring-green-500',
            isValid === false && 'border-red-500 focus-visible:ring-red-500'
          )}
          {...props}
        />
        {smartValidation && (
          <div className="absolute right-3 top-9 transform -translate-y-1/2">
            {getValidationIcon()}
          </div>
        )}
        {suggestions.length > 0 && (
          <div className="absolute right-3 top-9 transform -translate-y-1/2">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                index === selectedIndex && "bg-blue-50 text-blue-700"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
