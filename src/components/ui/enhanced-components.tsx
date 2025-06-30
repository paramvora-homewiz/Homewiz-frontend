'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Search, X, Star, TrendingUp, Users, Building, Home, Save, Wifi, WifiOff, Eye, AlertCircle } from 'lucide-react'

// Enhanced Card Component
interface EnhancedCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'premium' | 'gradient' | 'glass'
  hover?: boolean
  onClick?: () => void
}

export function EnhancedCard({ 
  children, 
  className = '', 
  variant = 'default', 
  hover = true,
  onClick 
}: EnhancedCardProps) {
  const baseClasses = 'rounded-xl transition-all duration-300'
  const variantClasses = {
    default: 'bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-xl',
    premium: 'bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-2xl',
    gradient: 'bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none shadow-xl hover:shadow-2xl',
    glass: 'bg-white/85 backdrop-blur-md border border-gray-200/40 shadow-lg hover:shadow-xl'
  }
  
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : ''
  const clickClasses = onClick ? 'cursor-pointer' : ''

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${clickClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

// Enhanced Input Component
interface EnhancedInputProps {
  label?: string
  name?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  type?: string
  error?: string
  icon?: React.ReactNode
  suggestions?: string[]
  required?: boolean
  disabled?: boolean
  className?: string
}

export function EnhancedInput({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  type = 'text',
  error,
  icon,
  suggestions = [],
  required = false,
  disabled = false,
  className = ''
}: EnhancedInputProps) {
  const [focused, setFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(value.toLowerCase()) && s !== value
  ).slice(0, 5)

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <motion.input
          ref={inputRef}
          name={name}
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setFocused(true)
            setShowSuggestions(true)
          }}
          onBlur={() => {
            setFocused(false)
            setTimeout(() => setShowSuggestions(false), 200)
            onBlur?.()
          }}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''}
            border-2 rounded-lg transition-all duration-200
            ${disabled
              ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
              : focused
                ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg'
                : error
                  ? 'border-red-300 ring-4 ring-red-100 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }
            ${error && !disabled ? 'bg-red-50' : disabled ? 'bg-gray-100' : 'bg-white/90 backdrop-blur-sm'}
            focus:outline-none text-gray-900 placeholder-gray-500
          `}
          whileFocus={{ scale: 1.02 }}
        />

        {/* Auto-complete suggestions */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    onChange(suggestion)
                    setShowSuggestions(false)
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-red-600 text-sm mt-1 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  )
}

// Enhanced Select Component
interface EnhancedSelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: Array<{ value: string; label: string; icon?: React.ReactNode; description?: string }>
  placeholder?: string
  error?: string
  required?: boolean
  searchable?: boolean
  disabled?: boolean
  className?: string
}

export function EnhancedSelect({
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select an option',
  error,
  required = false,
  searchable = false,
  disabled = false,
  className = ''
}: EnhancedSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const selectRef = useRef<HTMLDivElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const selectedOption = options.find(opt => opt.value === value)

  // Calculate dropdown position to avoid viewport cutoff
  const calculateDropdownPosition = () => {
    if (!selectRef.current) return

    const rect = selectRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 320 // max-h-80 = 20rem = 320px
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDropdownPosition('top')
    } else {
      setDropdownPosition('bottom')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    // Only add listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  // Handle dropdown opening with position calculation
  const handleToggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return

    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }

    if (!isOpen) {
      calculateDropdownPosition()
    }
    setIsOpen(!isOpen)
  }

  // Handle blur event - only close if not clicking within dropdown
  const handleBlur = (e: React.FocusEvent) => {
    // Clear any existing timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }

    // Check if the new focus target is within our dropdown
    const relatedTarget = e.relatedTarget as HTMLElement
    if (selectRef.current && relatedTarget && selectRef.current.contains(relatedTarget)) {
      return // Don't close if focus is moving within our component
    }

    // Increased timeout to give users more time to interact with dropdown
    blurTimeoutRef.current = setTimeout(() => {
      // Double-check that we should still close (user might have clicked back in)
      if (!selectRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
        setSearchTerm('')
        onBlur?.()
      }
      blurTimeoutRef.current = null
    }, 200)
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <motion.button
          type="button"
          disabled={disabled}
          onClick={handleToggleDropdown}
          onBlur={handleBlur}
          className={`
            w-full px-4 py-3 text-left border-2 rounded-lg transition-all duration-200
            ${disabled
              ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
              : isOpen
                ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg'
                : error
                  ? 'border-red-300 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }
            ${error && !disabled ? 'bg-red-50' : disabled ? 'bg-gray-100' : 'bg-white/90 backdrop-blur-sm'}
            focus:outline-none flex items-center justify-between
          `}
          whileTap={disabled ? {} : { scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dropdownPosition === 'bottom' ? -10 : 10 }}
              className={`absolute z-[9999] w-full bg-white border border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-hidden ${
                dropdownPosition === 'bottom' ? 'mt-1 top-full' : 'mb-1 bottom-full'
              }`}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}
              onMouseDown={(e) => e.preventDefault()}
              onMouseUp={(e) => e.preventDefault()}
            >
              {searchable && (
                <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search options..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto bg-white">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                  <motion.div
                    key={option.value}
                    onMouseDown={(e) => {
                      // Prevent blur event from firing when clicking on option
                      e.preventDefault()
                    }}
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                      setSearchTerm('')
                    }}
                    className={`
                      px-4 py-4 cursor-pointer transition-colors duration-150
                      hover:bg-blue-50 border-b border-gray-100 last:border-b-0
                      ${value === option.value ? 'bg-blue-100 text-blue-900' : 'text-gray-700'}
                    `}
                    whileHover={{ backgroundColor: 'rgb(239 246 255)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {option.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-5 break-words">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500 mt-1 leading-4 break-words">{option.description}</div>
                        )}
                      </div>
                      {value === option.value && (
                        <div className="flex-shrink-0">
                          <Check className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-red-600 text-sm mt-1 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  )
}

// Quick Select Buttons Component
interface QuickSelectButtonsProps {
  label?: string
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>
  value: string
  onChange: (value: string) => void
  multiple?: boolean
  className?: string
}

export function QuickSelectButtons({
  label,
  options,
  value,
  onChange,
  multiple = false,
  className = ''
}: QuickSelectButtonsProps) {
  const selectedValues = multiple ? value.split(',').filter(Boolean) : [value]

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = selectedValues
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
      onChange(newValues.join(','))
    } else {
      onChange(optionValue)
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          {label}
        </label>
      )}
      
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value)
          
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all duration-200
                flex items-center gap-2 font-medium text-sm
                ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg hover:shadow-xl'
                  : 'bg-white/90 backdrop-blur-sm text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {option.icon}
              {option.label}
              {isSelected && <Check className="w-4 h-4" />}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Status Badge Component
interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'large'
  icon?: React.ReactNode
  className?: string
}

export function StatusBadge({ status, variant = 'default', icon, className = '' }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    const statusMap: Record<string, string> = {
      'AVAILABLE': 'bg-green-100 text-green-800 border-green-200',
      'OCCUPIED': 'bg-red-100 text-red-800 border-red-200',
      'MAINTENANCE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'RESERVED': 'bg-blue-100 text-blue-800 border-blue-200',
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'INACTIVE': 'bg-gray-100 text-gray-800 border-gray-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'TERMINATED': 'bg-red-100 text-red-800 border-red-200',
      'EXPLORING': 'bg-gray-100 text-gray-800 border-gray-200',
      'INTERESTED': 'bg-blue-100 text-blue-800 border-blue-200',
      'CONVERTED': 'bg-green-100 text-green-800 border-green-200'
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const sizeClasses = variant === 'large' 
    ? 'px-4 py-2 text-sm font-semibold' 
    : 'px-3 py-1 text-xs font-medium'

  return (
    <motion.span
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${getStatusStyles(status)} ${sizeClasses} ${className}
      `}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {icon}
      {status.replace('_', ' ')}
    </motion.span>
  )
}

// Progress Indicator Component
interface ProgressIndicatorProps {
  steps: Array<{ id: string; title: string; icon?: React.ReactNode }>
  currentStep: number
  className?: string
}

export function ProgressIndicator({ steps, currentStep, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
              ${index <= currentStep
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : 'bg-white border-gray-300 text-gray-400'
              }
            `}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {index < currentStep ? (
              <Check className="w-5 h-5" />
            ) : (
              step.icon || <span className="text-sm font-semibold">{index + 1}</span>
            )}
          </motion.div>

          <div className="ml-3 hidden md:block">
            <div className={`text-sm font-medium ${
              index <= currentStep ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step.title}
            </div>
          </div>

          {index < steps.length - 1 && (
            <div className={`
              w-8 h-0.5 mx-4 transition-all duration-300
              ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}
            `} />
          )}
        </div>
      ))}
    </div>
  )
}

// Auto-Save Indicator Component
interface AutoSaveIndicatorProps {
  status: 'saving' | 'saved' | 'error' | 'offline'
  lastSaved?: Date
  className?: string
}

export function AutoSaveIndicator({ status, lastSaved, className = '' }: AutoSaveIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Save className="w-4 h-4 animate-pulse" />,
          text: 'Saving...',
          color: 'text-blue-600'
        }
      case 'saved':
        return {
          icon: <Check className="w-4 h-4" />,
          text: 'Saved',
          color: 'text-green-600'
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Save failed',
          color: 'text-red-600'
        }
      case 'offline':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Offline',
          color: 'text-gray-500'
        }
      default:
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connected',
          color: 'text-gray-500'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <motion.div
      className={`flex items-center gap-2 text-sm ${config.color} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {config.icon}
      <span>{config.text}</span>
      {lastSaved && status === 'saved' && (
        <span className="text-gray-500 text-xs">
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </motion.div>
  )
}

// Collaboration Indicator Component
interface CollaborationIndicatorProps {
  collaborators: Array<{
    id: string
    name: string
    color: string
    avatar?: string
  }>
  className?: string
}

export function CollaborationIndicator({ collaborators, className = '' }: CollaborationIndicatorProps) {
  if (collaborators.length === 0) return null

  return (
    <motion.div
      className={`flex items-center gap-1 ${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex -space-x-2">
        {collaborators.slice(0, 3).map((collaborator, index) => (
          <motion.div
            key={collaborator.id}
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {collaborator.avatar ? (
              <img
                src={collaborator.avatar}
                alt={collaborator.name}
                className="w-6 h-6 rounded-full border-2 border-white"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white"
              style={{ backgroundColor: collaborator.color }}
            />
          </motion.div>
        ))}
      </div>

      {collaborators.length > 3 && (
        <div className="text-xs text-gray-500 ml-1">
          +{collaborators.length - 3} more
        </div>
      )}

      <Eye className="w-4 h-4 text-gray-400 ml-1" />
    </motion.div>
  )
}

// Field Validation Indicator Component
interface FieldValidationIndicatorProps {
  isValid: boolean
  error?: string
  warning?: string
  isRequired?: boolean
  className?: string
}

export function FieldValidationIndicator({
  isValid,
  error,
  warning,
  isRequired,
  className = ''
}: FieldValidationIndicatorProps) {
  if (isValid && !warning) return null

  return (
    <motion.div
      className={`flex items-center gap-1 text-sm ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {error && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {warning && !error && (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertCircle className="w-4 h-4" />
          <span>{warning}</span>
        </div>
      )}

      {isRequired && (
        <span className="text-red-500 text-xs">*</span>
      )}
    </motion.div>
  )
}
