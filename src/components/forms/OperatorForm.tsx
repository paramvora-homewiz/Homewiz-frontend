'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { LoadingSpinner } from '../ui/loading-spinner'
import { HelpTooltip } from '../ui/help-tooltip'
import { EnhancedCard, EnhancedInput, EnhancedSelect, QuickSelectButtons, StatusBadge } from '../ui/enhanced-components'
import { ValidationSummary } from './ValidationSummary'
import { OperatorFormData } from '../../types'
import { 
  validateOperatorFormData, 
  transformOperatorDataForBackend,
  BACKEND_ENUMS,
  ValidationResult 
} from '../../lib/backend-sync'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Bell,
  Clock,
  Settings,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  ChevronLeft
} from 'lucide-react'
import '../../styles/design-system.css'

interface AddedOperator {
  name: string
  email: string
  operator_type: string
}

interface OperatorFormProps {
  initialData?: Partial<OperatorFormData>
  onSubmit: (data: OperatorFormData) => Promise<void>
  onSaveAndAddAnother?: (data: OperatorFormData) => Promise<boolean> // Returns true if successful
  onCancel?: () => void
  onBack?: () => void
  onFinish?: () => void // Called when done adding multiple operators
  isLoading?: boolean
  mode?: 'single' | 'batch' | 'drawer' // drawer mode for inline creation
  showHeader?: boolean // Hide header in drawer mode
}

// Use backend-validated operator types with detailed descriptions and tooltips
const OPERATOR_TYPES = BACKEND_ENUMS.OPERATOR_TYPES.map(type => {
  const typeDetails: Record<string, { label: string; description: string; tooltip: string; icon: React.ReactNode }> = {
    'LEASING_AGENT': {
      label: 'Leasing Agent',
      description: 'Handles tenant applications and showings',
      tooltip: 'Responsible for showing properties to prospective tenants, processing rental applications, conducting background checks, and managing the lease signing process. Can view tenant information and property listings.',
      icon: <UserCheck className="w-5 h-5" />
    },
    'MAINTENANCE': {
      label: 'Maintenance',
      description: 'Manages property maintenance and repairs',
      tooltip: 'Handles maintenance requests, schedules repairs, coordinates with vendors, and ensures properties are well-maintained. Can view and update work orders, but has limited access to tenant financial data.',
      icon: <Settings className="w-5 h-5" />
    },
    'BUILDING_MANAGER': {
      label: 'Building Manager',
      description: 'Oversees building operations',
      tooltip: 'Manages day-to-day building operations, supervises on-site staff, handles tenant relations, and ensures compliance with building regulations. Has access to building-specific data and reports.',
      icon: <Shield className="w-5 h-5" />
    },
    'ADMIN': {
      label: 'Administrator',
      description: 'Full system access and management',
      tooltip: 'Has complete access to all system features including user management, financial reports, system settings, and audit logs. Can create, edit, and delete any records in the system.',
      icon: <Shield className="w-5 h-5" />
    },
    'OWNER': {
      label: 'Owner',
      description: 'Property owner with full oversight',
      tooltip: 'Property owner with executive access to all properties, financial reports, and strategic data. Can view performance metrics, approve major decisions, and access investment-related information.',
      icon: <User className="w-5 h-5" />
    }
  }

  const details = typeDetails[type] || {
    label: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    description: `${type} role`,
    tooltip: `Permissions and access for ${type} role`,
    icon: <User className="w-5 h-5" />
  }

  return {
    value: type,
    ...details
  }
})

const NOTIFICATION_PREFERENCES = [
  { value: 'EMAIL', label: 'Email Only', icon: <Mail className="w-4 h-4" /> },
  { value: 'SMS', label: 'SMS Only', icon: <Phone className="w-4 h-4" /> },
  { value: 'BOTH', label: 'Email & SMS', icon: <Bell className="w-4 h-4" /> },
  { value: 'NONE', label: 'No Notifications', icon: <X className="w-4 h-4" /> }
]

// Common company names for auto-complete
const COMMON_COMPANIES = [
  'ABC Property Management',
  'Premier Real Estate',
  'Urban Living Solutions',
  'Metro Property Group',
  'Residential Management Inc.',
  'City Properties LLC',
  'Downtown Apartments',
  'Skyline Property Management'
]

// Common job titles for quick selection
const COMMON_ROLES = [
  'Owner',
  'Senior Leasing Agent',
  'Property Manager',
  'Assistant Manager',
  'Maintenance Supervisor',
  'Leasing Consultant',
  'Community Manager',
  'Regional Manager'
]

// Mapping from Job Title to Operator Type and Access Levels
// When a job title is selected, auto-populate the operator type and access level
const JOB_TITLE_TO_ROLE_MAPPING: Record<string, { operatorType: string; accessLevels: string[] }> = {
  'Owner': { operatorType: 'OWNER', accessLevels: ['OWNER'] },
  'Senior Leasing Agent': { operatorType: 'LEASING_AGENT', accessLevels: ['LEASING_AGENT'] },
  'Property Manager': { operatorType: 'BUILDING_MANAGER', accessLevels: ['BUILDING_MANAGER'] },
  'Assistant Manager': { operatorType: 'BUILDING_MANAGER', accessLevels: ['BUILDING_MANAGER'] },
  'Maintenance Supervisor': { operatorType: 'MAINTENANCE', accessLevels: ['MAINTENANCE'] },
  'Leasing Consultant': { operatorType: 'LEASING_AGENT', accessLevels: ['LEASING_AGENT'] },
  'Community Manager': { operatorType: 'BUILDING_MANAGER', accessLevels: ['BUILDING_MANAGER'] },
  'Regional Manager': { operatorType: 'ADMIN', accessLevels: ['ADMIN', 'BUILDING_MANAGER'] },
}

const DEFAULT_WORKING_HOURS = {
  monday: { start: '09:00', end: '17:00', enabled: true },
  tuesday: { start: '09:00', end: '17:00', enabled: true },
  wednesday: { start: '09:00', end: '17:00', enabled: true },
  thursday: { start: '09:00', end: '17:00', enabled: true },
  friday: { start: '09:00', end: '17:00', enabled: true },
  saturday: { start: '10:00', end: '14:00', enabled: false },
  sunday: { start: '10:00', end: '14:00', enabled: false }
}

export default function OperatorForm({
  initialData,
  onSubmit,
  onSaveAndAddAnother,
  onCancel,
  onBack,
  onFinish,
  isLoading,
  mode = 'single',
  showHeader = true
}: OperatorFormProps) {
  // Debug: Log props on every render
  console.log('🔵 OperatorForm RENDER [v3]:', {
    hasOnSaveAndAddAnother: !!onSaveAndAddAnother,
    hasOnSubmit: !!onSubmit,
    hasOnCancel: !!onCancel,
    mode
  })

  const getInitialFormData = (): OperatorFormData => ({
    name: '',
    email: '',
    phone: '',
    role: '',
    active: true,
    operator_type: 'LEASING_AGENT',
    notification_preferences: 'EMAIL',
    emergency_contact: false,
    calendar_sync_enabled: false,
    ...initialData
  })

  const [formData, setFormData] = useState<OperatorFormData>(getInitialFormData())
  const [addedOperators, setAddedOperators] = useState<AddedOperator[]>([])
  const [isSavingAnother, setIsSavingAnother] = useState(false)

  const [workingHours, setWorkingHours] = useState(
    initialData?.working_hours
      ? (typeof initialData.working_hours === 'string'
          ? JSON.parse(initialData.working_hours)
          : initialData.working_hours)
      : DEFAULT_WORKING_HOURS
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [validationAttempted, setValidationAttempted] = useState(false)

  // State for multiple operator type selection
  const [selectedOperatorTypes, setSelectedOperatorTypes] = useState<string[]>(
    initialData?.operator_type ? [initialData.operator_type] : ['LEASING_AGENT']
  )

  // Validation function (doesn't automatically set errors)
  const validateField = (fieldName: string, value: any): string | null => {
    // Use comprehensive backend validation
    const validationResult = validateOperatorFormData(formData)
    
    // Return specific field error if exists
    if (validationResult.errors[fieldName]) {
      return validationResult.errors[fieldName]
    }
    
    // Additional real-time validations for UX
    switch (fieldName) {
      case 'name':
        if (!value?.trim()) return 'Name is required'
        break
      case 'email':
        if (!value?.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
        break
      case 'phone':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) return 'Please enter a valid phone number'
        break
      case 'operator_type':
        if (!value) return 'Operator type is required'
        if (!BACKEND_ENUMS.OPERATOR_TYPES.includes(value)) return 'Invalid operator type'
        break
    }
    return null
  }

  // Use comprehensive backend validation
  const validateAllFields = (): ValidationResult => {
    return validateOperatorFormData(formData)
  }

  // Update errors only for touched fields
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    touchedFields.forEach(field => {
      const error = validateField(field, formData[field as keyof OperatorFormData])
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
  }, [formData, touchedFields])

  const handleInputChange = (field: keyof OperatorFormData, value: any) => {
    // Auto-format phone number
    if (field === 'phone' && typeof value === 'string') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '')

      // Format as (XXX) XXX-XXXX
      if (digits.length >= 10) {
        const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
        value = formatted
      } else if (digits.length >= 6) {
        value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
      } else if (digits.length >= 3) {
        value = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      } else {
        value = digits
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFieldBlur = (field: keyof OperatorFormData) => {
    setTouchedFields(prev => new Set([...prev, field]))
  }

  // Handle Job Title selection - auto-populate Operator Type and Access Levels
  const handleJobTitleSelection = (jobTitle: string) => {
    // Look up the mapping for this job title
    const mapping = JOB_TITLE_TO_ROLE_MAPPING[jobTitle]

    if (mapping) {
      // Update role AND operator_type in a single state update to avoid batching issues
      setFormData(prev => ({
        ...prev,
        role: jobTitle,
        operator_type: mapping.operatorType
      }))

      // Auto-set the access levels (selectedOperatorTypes)
      setSelectedOperatorTypes(mapping.accessLevels)
    } else {
      // No mapping found, just set the role
      setFormData(prev => ({
        ...prev,
        role: jobTitle
      }))
    }
  }

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setWorkingHours((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  // Toggle operator type selection (multi-select)
  const handleOperatorTypeToggle = (typeValue: string) => {
    setSelectedOperatorTypes(prev => {
      let newTypes: string[]
      if (prev.includes(typeValue)) {
        // Remove if already selected (but keep at least one)
        newTypes = prev.filter(t => t !== typeValue)
        if (newTypes.length === 0) {
          newTypes = [typeValue] // Keep at least one selected
        }
      } else {
        // Add to selection
        newTypes = [...prev, typeValue]
      }
      // Update formData with first selected type as primary
      handleInputChange('operator_type', newTypes[0])
      return newTypes
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Set validation attempted
    setValidationAttempted(true)

    // Validate all fields on submit
    const validationResult = validateAllFields()
    setErrors(validationResult.errors)

    // Mark all required fields as touched to show errors
    const requiredFields = ['name', 'email']
    setTouchedFields(prev => new Set([...prev, ...requiredFields]))

    if (!validationResult.isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Transform data for backend
    const transformedData = transformOperatorDataForBackend({
      ...formData,
      working_hours: JSON.stringify(workingHours),
      date_joined: formData.date_joined || new Date().toISOString().split('T')[0]
    })

    await onSubmit(transformedData as OperatorFormData)
  }

  // Reset form for adding another operator
  const resetForm = () => {
    setFormData(getInitialFormData())
    setSelectedOperatorTypes(['LEASING_AGENT'])
    setWorkingHours(DEFAULT_WORKING_HOURS)
    setErrors({})
    setTouchedFields(new Set())
    setValidationAttempted(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Save & Add Another
  const handleSaveAndAddAnother = async () => {
    console.log('📝 OperatorForm: handleSaveAndAddAnother called')
    // Set validation attempted
    setValidationAttempted(true)

    // Validate all fields
    const validationResult = validateAllFields()
    setErrors(validationResult.errors)

    const requiredFields = ['name', 'email']
    setTouchedFields(prev => new Set([...prev, ...requiredFields]))

    if (!validationResult.isValid) {
      console.log('📝 OperatorForm: Validation failed', validationResult.errors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    console.log('📝 OperatorForm: Validation passed, setting isSavingAnother')
    setIsSavingAnother(true)

    try {
      // Transform data for backend
      const transformedData = transformOperatorDataForBackend({
        ...formData,
        working_hours: JSON.stringify(workingHours),
        date_joined: formData.date_joined || new Date().toISOString().split('T')[0]
      })

      let success = false
      console.log('📝 OperatorForm [v2]: onSaveAndAddAnother exists?', !!onSaveAndAddAnother, 'prop value:', onSaveAndAddAnother)
      if (onSaveAndAddAnother) {
        console.log('📝 OperatorForm: Calling onSaveAndAddAnother')
        success = await onSaveAndAddAnother(transformedData as OperatorFormData)
        console.log('📝 OperatorForm: onSaveAndAddAnother returned', success)
      } else {
        // Fallback to onSubmit if onSaveAndAddAnother not provided
        console.log('📝 OperatorForm: Falling back to onSubmit')
        await onSubmit(transformedData as OperatorFormData)
        success = true
      }

      console.log('📝 OperatorForm: Success =', success, ', will reset form?', success)
      if (success) {
        // Track added operator
        setAddedOperators(prev => [...prev, {
          name: formData.name,
          email: formData.email,
          operator_type: formData.operator_type
        }])
        // Reset form for next entry
        console.log('📝 OperatorForm: Resetting form')
        resetForm()
      }
    } finally {
      console.log('📝 OperatorForm: Setting isSavingAnother to false')
      setIsSavingAnother(false)
    }
  }

  return (
    <div className={mode === 'drawer' ? 'p-4 space-y-6' : 'max-w-5xl mx-auto p-6 space-y-8'}>
        {/* Header Section - Hidden in drawer mode */}
        {showHeader && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <User className="w-4 h-4" />
              Operator Management
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
              {initialData?.operator_id ? 'Edit Operator' : 'Add New Operator'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Configure operator details, permissions, and working hours with our intelligent form system
            </p>
            <div className="flex items-center justify-center mt-4">
              <StatusBadge
                status={formData.active ? 'ACTIVE' : 'INACTIVE'}
                variant="large"
                icon={formData.active ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              />
            </div>
          </motion.div>
        )}

        {/* Added Operators Summary - Show when in batch mode and operators have been added */}
        {addedOperators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">
                {addedOperators.length} Operator{addedOperators.length > 1 ? 's' : ''} Added This Session
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {addedOperators.map((op, index) => (
                <div
                  key={index}
                  className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-green-200 text-sm"
                >
                  <User className="w-3.5 h-3.5 text-green-600" />
                  <span className="font-medium text-gray-900">{op.name}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{op.operator_type.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Validation Summary */}
        <ValidationSummary
          errors={errors}
          show={validationAttempted}
          className="mb-6"
        />

        <form onSubmit={handleSubmit} className={mode === 'drawer' ? 'space-y-4 sm:space-y-6' : 'space-y-8'}>
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: mode === 'drawer' ? 0 : 0.1 }}
          >
            <EnhancedCard variant="premium" className={mode === 'drawer' ? 'p-4 sm:p-6' : 'p-8 premium-card'}>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className={`bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg ${mode === 'drawer' ? 'p-1.5' : 'p-2'}`}>
                  <User className={mode === 'drawer' ? 'w-5 h-5 text-white' : 'w-6 h-6 text-white'} />
                </div>
                <h2 className={mode === 'drawer' ? 'text-lg sm:text-xl font-bold text-gray-900' : 'text-2xl font-bold text-gray-900'}>Basic Information</h2>
              </div>

              <div className={`grid gap-4 sm:gap-6 ${mode === 'drawer' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                <EnhancedInput
                  label="Full Name"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  onBlur={() => handleFieldBlur('name')}
                  placeholder="Enter full name"
                  error={errors.name}
                  icon={<User className="w-4 h-4" />}
                  required
                />

                <EnhancedInput
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  onBlur={() => handleFieldBlur('email')}
                  placeholder="operator@company.com"
                  error={errors.email}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />

                <EnhancedInput
                  label="Phone Number"
                  value={formData.phone || ''}
                  onChange={(value) => handleInputChange('phone', value)}
                  onBlur={() => handleFieldBlur('phone')}
                  placeholder="+1 (555) 123-4567"
                  error={errors.phone}
                  icon={<Phone className="w-4 h-4" />}
                />

                <EnhancedInput
                  label="Job Title/Role"
                  value={formData.role || ''}
                  onChange={(value) => {
                    // Check if value matches a known job title for auto-population
                    if (JOB_TITLE_TO_ROLE_MAPPING[value]) {
                      handleJobTitleSelection(value)
                    } else {
                      handleInputChange('role', value)
                    }
                  }}
                  placeholder="e.g., Senior Leasing Agent"
                  suggestions={COMMON_ROLES}
                />
              </div>

              {/* Quick Job Title Selection */}
              <div className="mt-6">
                <QuickSelectButtons
                  label="Quick Job title selection"
                  options={COMMON_ROLES.map(role => ({ value: role, label: role }))}
                  value={formData.role || ''}
                  onChange={(value) => handleJobTitleSelection(value)}
                />
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Operator Type & Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: mode === 'drawer' ? 0 : 0.2 }}
          >
            <EnhancedCard variant="premium" className={mode === 'drawer' ? 'p-4 sm:p-6' : 'p-8 premium-card'}>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className={`bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg ${mode === 'drawer' ? 'p-1.5' : 'p-2'}`}>
                  <Shield className={mode === 'drawer' ? 'w-5 h-5 text-white' : 'w-6 h-6 text-white'} />
                </div>
                <h2 className={mode === 'drawer' ? 'text-lg sm:text-xl font-bold text-gray-900' : 'text-2xl font-bold text-gray-900'}>Role & Access Level</h2>
              </div>

              <div className="space-y-6">
                <EnhancedSelect
                  label="Operator Type"
                  value={formData.operator_type}
                  onChange={(value) => handleInputChange('operator_type', value)}
                  options={OPERATOR_TYPES}
                  placeholder="Select operator type"
                  required
                  searchable
                />

                {/* Visual Role Cards - Multi-select with Checkboxes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Access Level Selection
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Select one or more roles. {mode !== 'drawer' && 'Hover over each role for more details.'}
                  </p>
                  <div className={`grid gap-3 ${
                    mode === 'drawer'
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  }`}>
                    {OPERATOR_TYPES.map((type) => {
                      const isSelected = selectedOperatorTypes.includes(type.value)
                      return (
                        <motion.div
                          key={type.value}
                          className={`relative border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                            mode === 'drawer' ? 'p-3' : 'p-4'
                          } ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handleOperatorTypeToggle(type.value)}
                          whileHover={mode !== 'drawer' ? { scale: 1.02 } : {}}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Checkbox indicator */}
                          <div className="absolute top-3 right-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-2 pr-8">
                            <div className={`p-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                              {type.icon}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{type.label}</span>
                              <HelpTooltip title={type.label} content={type.tooltip} />
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">{type.description}</div>

                          {/* Selected indicator badge */}
                          {isSelected && selectedOperatorTypes[0] === type.value && (
                            <div className="absolute bottom-2 right-2">
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                Primary
                              </span>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                  {selectedOperatorTypes.length > 1 && (
                    <p className="mt-2 text-sm text-blue-600">
                      {selectedOperatorTypes.length} roles selected. First selected role is set as primary.
                    </p>
                  )}
                </div>

                {/* Status Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => handleInputChange('active', e.target.checked)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <div>
                        <div className="font-semibold text-green-900">Active Operator</div>
                        <div className="text-sm text-green-700">Operator can access the system</div>
                      </div>
                    </label>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emergency_contact}
                        onChange={(e) => handleInputChange('emergency_contact', e.target.checked)}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <div>
                        <div className="font-semibold text-orange-900 flex items-center gap-2">
                          Emergency Contact
                          <HelpTooltip title="Emergency Contact" content="Can be contacted for urgent building issues" />
                        </div>
                        <div className="text-sm text-orange-700">Available for urgent issues</div>
                      </div>
                    </label>
                  </motion.div>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: mode === 'drawer' ? 0 : 0.3 }}
          >
            <EnhancedCard variant="premium" className={mode === 'drawer' ? 'p-4 sm:p-6' : 'p-8 premium-card'}>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg ${mode === 'drawer' ? 'p-1.5' : 'p-2'}`}>
                  <Bell className={mode === 'drawer' ? 'w-5 h-5 text-white' : 'w-6 h-6 text-white'} />
                </div>
                <h2 className={mode === 'drawer' ? 'text-lg sm:text-xl font-bold text-gray-900' : 'text-2xl font-bold text-gray-900'}>Communication Preferences</h2>
              </div>

              <QuickSelectButtons
                label="Notification Method"
                options={NOTIFICATION_PREFERENCES}
                value={formData.notification_preferences}
                onChange={(value) => handleInputChange('notification_preferences', value)}
              />
            </EnhancedCard>
          </motion.div>

        {/* Working Hours - Hidden in drawer mode */}
        {mode !== 'drawer' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🕒 Working Hours
          </h2>

          <div className="space-y-3">
            {Object.entries(workingHours).map(([day, hours]: [string, any]) => (
              <div key={day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-20">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours.enabled}
                      onChange={(e) => handleWorkingHoursChange(day, 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium capitalize">{day}</span>
                  </label>
                </div>

                {hours.enabled && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={hours.start}
                      onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={hours.end}
                      onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
        )}

        {/* Advanced Settings - Hidden in drawer mode */}
        {mode !== 'drawer' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              ⚙️ Advanced Settings
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Joined
                  </label>
                  <Input
                    type="date"
                    value={formData.date_joined || ''}
                    onChange={(e) => handleInputChange('date_joined', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calendar External ID
                  </label>
                  <Input
                    value={formData.calendar_external_id || ''}
                    onChange={(e) => handleInputChange('calendar_external_id', e.target.value)}
                    placeholder="External calendar integration ID"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.calendar_sync_enabled}
                    onChange={(e) => handleInputChange('calendar_sync_enabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Enable Calendar Sync</span>
                  <HelpTooltip title="Calendar Sync" content="Sync with external calendar systems" />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissions (JSON)
                </label>
                <textarea
                  value={typeof formData.permissions === 'string' ? formData.permissions : JSON.stringify(formData.permissions || {}, null, 2)}
                  onChange={(e) => handleInputChange('permissions', e.target.value)}
                  placeholder='{"can_edit_buildings": true, "can_manage_tenants": true}'
                  className="w-full p-2 border border-gray-300 rounded-md text-sm font-mono"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON object defining specific permissions for this operator
                </p>
              </div>
            </div>
          )}
        </Card>
        )}

          {/* Form Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={`flex items-center ${onBack ? 'justify-between' : 'justify-end'} pt-8`}
          >
            {/* Previous Button */}
            {onBack && (
              <motion.button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-lg font-semibold hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Go to previous form"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </motion.button>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              {onCancel && (
                <motion.button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>
              )}

              {/* Save & Add Another Button - Only show for new operators, not editing */}
              {!initialData?.operator_id && mode !== 'drawer' && (
                <motion.button
                  type="button"
                  onClick={handleSaveAndAddAnother}
                  disabled={isLoading || isSavingAnother}
                  className={`px-6 py-3 border-2 border-green-500 text-green-700 bg-green-50 rounded-lg font-semibold hover:bg-green-100 hover:border-green-600 transition-all duration-200 flex items-center gap-2 ${
                    isLoading || isSavingAnother ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={!(isLoading || isSavingAnother) ? { scale: 1.02 } : {}}
                  whileTap={!(isLoading || isSavingAnother) ? { scale: 0.98 } : {}}
                >
                  {isSavingAnother ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save & Add Another
                    </>
                  )}
                </motion.button>
              )}

              {/* Done Button - Show when operators have been added in batch mode */}
              {addedOperators.length > 0 && onFinish && (
                <motion.button
                  type="button"
                  onClick={onFinish}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Done ({addedOperators.length} Added)
                </motion.button>
              )}

              {/* Main Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || isSavingAnother || Object.keys(errors).length > 0}
                className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 premium-button relative overflow-hidden ${
                  isLoading || isSavingAnother || Object.keys(errors).length > 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-blue-700 hover:to-purple-700 hover:-translate-y-1'
                }`}
                whileHover={!(isLoading || isSavingAnother || Object.keys(errors).length > 0) ? { scale: 1.02 } : {}}
                whileTap={!(isLoading || isSavingAnother || Object.keys(errors).length > 0) ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {initialData?.operator_id
                      ? 'Update Operator'
                      : mode === 'drawer'
                        ? 'Create & Close'
                        : addedOperators.length > 0
                          ? 'Save & Finish'
                          : 'Create Operator'
                    }
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </form>
    </div>
  )
}
