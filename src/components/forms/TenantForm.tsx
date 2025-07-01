'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EnhancedCard, EnhancedInput, EnhancedSelect, QuickSelectButtons, StatusBadge, ProgressIndicator } from '@/components/ui/enhanced-components'
import { useFormStepNavigation } from '@/hooks/useFormStepNavigation'
import { TenantFormData } from '@/types'
import { 
  validateTenantFormData, 
  transformTenantDataForBackend, 
  BACKEND_ENUMS,
  ValidationResult 
} from '@/lib/backend-sync'
import {
  UserCheck,
  Mail,
  Phone,
  AlertTriangle,
  Home,
  FileText,
  CreditCard,
  Settings,
  Save,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Pause,
  Building,
  Calendar,
  DollarSign,
  Shield,
  Bell,
  Users,
  Heart,
  Car,
  PawPrint,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import '@/styles/design-system.css'

interface TenantFormProps {
  initialData?: Partial<TenantFormData>
  onSubmit: (data: TenantFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  buildings?: Array<{ building_id: string; building_name: string }>
  rooms?: Array<{ room_id: string; room_number: string; building_id: string; private_room_rent?: number; shared_room_rent_2?: number }>
  operators?: Array<{ operator_id: number; name: string; operator_type: string }>
}

// Use backend-validated tenant status options
const TENANT_STATUS_OPTIONS = BACKEND_ENUMS.TENANT_STATUS.map(status => ({
  value: status,
  label: status.charAt(0) + status.slice(1).toLowerCase(),
  color: getStatusColor(status),
  icon: getStatusIcon(status)
}))

function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'from-green-500 to-emerald-500'
    case 'INACTIVE': return 'from-gray-500 to-slate-500'
    case 'PENDING': return 'from-yellow-500 to-orange-500'
    case 'TERMINATED': return 'from-red-500 to-pink-500'
    default: return 'from-gray-500 to-slate-500'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'ACTIVE': return <CheckCircle className="w-5 h-5" />
    case 'INACTIVE': return <Pause className="w-5 h-5" />
    case 'PENDING': return <Clock className="w-5 h-5" />
    case 'TERMINATED': return <XCircle className="w-5 h-5" />
    default: return <Clock className="w-5 h-5" />
  }
}

const ACCOUNT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active Account', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'INACTIVE', label: 'Inactive Account', icon: <Pause className="w-4 h-4" /> },
  { value: 'PENDING', label: 'Pending Activation', icon: <Clock className="w-4 h-4" /> }
]

const COMMUNICATION_PREFERENCES = [
  { value: 'EMAIL', label: 'Email Only', icon: <Mail className="w-4 h-4" /> },
  { value: 'SMS', label: 'SMS Only', icon: <Phone className="w-4 h-4" /> },
  { value: 'BOTH', label: 'Email & SMS', icon: <Bell className="w-4 h-4" /> }
]

// Use backend-validated booking types to ensure sync
const BOOKING_TYPES = BACKEND_ENUMS.BOOKING_TYPES.map(type => ({
  value: type,
  label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
  description: getBookingTypeDescription(type),
  icon: getBookingTypeIcon(type)
}))

function getBookingTypeDescription(type: string): string {
  switch (type) {
    case 'LEASE': return 'Traditional rental agreement'
    case 'SHORT_TERM': return 'Less than 6 months'
    case 'MONTH_TO_MONTH': return 'Flexible monthly terms'
    case 'CORPORATE': return 'Company-sponsored housing'
    default: return ''
  }
}

function getBookingTypeIcon(type: string) {
  switch (type) {
    case 'LEASE': return <FileText className="w-5 h-5" />
    case 'SHORT_TERM': return <Calendar className="w-5 h-5" />
    case 'MONTH_TO_MONTH': return <Calendar className="w-5 h-5" />
    case 'CORPORATE': return <Building className="w-5 h-5" />
    default: return <FileText className="w-5 h-5" />
  }
}

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: <Building className="w-4 h-4" /> },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: <CreditCard className="w-4 h-4" /> },
  { value: 'CHECK', label: 'Check', icon: <FileText className="w-4 h-4" /> },
  { value: 'CASH', label: 'Cash', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'ONLINE_PAYMENT', label: 'Online Payment', icon: <CreditCard className="w-4 h-4" /> }
]

// Common nationalities for auto-complete - Expanded list
const COMMON_NATIONALITIES = [
  // North America
  'American', 'Canadian', 'Mexican',

  // Europe
  'British', 'German', 'French', 'Italian', 'Spanish', 'Dutch', 'Swedish', 'Norwegian',
  'Danish', 'Finnish', 'Swiss', 'Austrian', 'Belgian', 'Portuguese', 'Irish', 'Polish',
  'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Croatian', 'Serbian', 'Slovenian',
  'Slovak', 'Estonian', 'Latvian', 'Lithuanian', 'Greek', 'Turkish', 'Russian', 'Ukrainian',

  // Asia
  'Chinese', 'Japanese', 'Korean', 'Indian', 'Pakistani', 'Bangladeshi', 'Sri Lankan',
  'Thai', 'Vietnamese', 'Filipino', 'Indonesian', 'Malaysian', 'Singaporean', 'Taiwanese',
  'Hong Kong', 'Nepalese', 'Burmese', 'Cambodian', 'Laotian', 'Mongolian', 'Afghan',

  // Middle East
  'Iranian', 'Iraqi', 'Israeli', 'Lebanese', 'Syrian', 'Jordanian', 'Saudi Arabian',
  'Emirati', 'Kuwaiti', 'Qatari', 'Bahraini', 'Omani', 'Yemeni',

  // Africa
  'South African', 'Nigerian', 'Kenyan', 'Ethiopian', 'Egyptian', 'Moroccan', 'Tunisian',
  'Algerian', 'Ghanaian', 'Ugandan', 'Tanzanian', 'Zimbabwean', 'Botswanan', 'Namibian',

  // Oceania
  'Australian', 'New Zealand', 'Fijian', 'Papua New Guinean',

  // South America
  'Brazilian', 'Argentinian', 'Chilean', 'Colombian', 'Peruvian', 'Venezuelan', 'Ecuadorian',
  'Uruguayan', 'Paraguayan', 'Bolivian', 'Guyanese', 'Surinamese',

  // Central America & Caribbean
  'Guatemalan', 'Costa Rican', 'Panamanian', 'Honduran', 'Nicaraguan', 'Belizean',
  'Jamaican', 'Cuban', 'Dominican', 'Haitian', 'Puerto Rican', 'Trinidadian', 'Barbadian'
].sort()

// Emergency contact relationships
const EMERGENCY_RELATIONSHIPS = [
  'Parent', 'Spouse', 'Partner', 'Sibling', 'Child', 'Friend', 'Colleague', 'Other Family'
]

export default function TenantForm({ initialData, onSubmit, onCancel, isLoading, buildings = [], rooms = [], operators = [] }: TenantFormProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    tenant_name: '',
    tenant_email: '',
    tenant_nationality: '',
    room_id: '',
    room_number: '',
    building_id: '',
    operator_id: undefined,
    booking_type: '',
    lease_start_date: '',
    lease_end_date: '',
    deposit_amount: undefined,
    status: 'ACTIVE',
    payment_reminders_enabled: true,
    communication_preferences: 'EMAIL',
    account_status: 'ACTIVE',
    has_pets: false,
    has_vehicles: false,
    has_renters_insurance: false,
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)

  const steps = [
    { id: 'personal', title: 'Personal Info', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'emergency', title: 'Emergency Contact', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'property', title: 'Property Assignment', icon: <Home className="w-5 h-5" /> },
    { id: 'lease', title: 'Lease Details', icon: <FileText className="w-5 h-5" /> },
    { id: 'payment', title: 'Payment & Preferences', icon: <CreditCard className="w-5 h-5" /> }
  ]

  // Use form step navigation hook
  const { currentStep, nextStep, prevStep, resetSteps, canGoNext, canGoPrev } = useFormStepNavigation({
    totalSteps: steps.length
  })

  // Filter rooms based on selected building
  useEffect(() => {
    if (formData.building_id) {
      const filteredRooms = rooms.filter(room => room.building_id === formData.building_id)
      setAvailableRooms(filteredRooms)
    } else {
      setAvailableRooms(rooms)
    }
  }, [formData.building_id, rooms])

  // Find selected room details
  useEffect(() => {
    if (formData.room_id) {
      const room = rooms.find(r => r.room_id === formData.room_id)
      setSelectedRoom(room)
      if (room) {
        setFormData(prev => ({ ...prev, room_number: room.room_number }))
      }
    }
  }, [formData.room_id, rooms])

  // Validation function for real-time field validation
  const validateField = (fieldName: string, value: any): string | null => {
    // Create a temporary form data object with the current field value
    const tempFormData = { ...formData, [fieldName]: value }

    // Use comprehensive backend validation
    const validationResult = validateTenantFormData(tempFormData)

    // Return specific field error if exists
    if (validationResult.errors[fieldName]) {
      return validationResult.errors[fieldName]
    }

    // Additional real-time validations for better UX
    switch (fieldName) {
      case 'tenant_name':
        if (!value?.trim()) return 'Full name is required'
        if (value?.trim().length < 2) return 'Name must be at least 2 characters'
        break
      case 'tenant_email':
        if (!value?.trim()) return 'Email address is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
        break
      case 'tenant_nationality':
        if (!value?.trim()) return 'Nationality is required'
        break
      case 'phone':
        if (value && value.trim()) {
          const digitsOnly = value.replace(/\D/g, '')
          if (digitsOnly.length < 10) return 'Phone number must be at least 10 digits'
          if (digitsOnly.length > 15) return 'Phone number is too long'
        }
        break
      case 'deposit_amount':
        if (value !== undefined && value !== null && value !== '') {
          if (isNaN(Number(value))) return 'Deposit amount must be a valid number'
          if (Number(value) < 0) return 'Deposit amount must be positive'
        }
        break
      case 'lease_start_date':
        if (value && formData.lease_end_date) {
          const startDate = new Date(value)
          const endDate = new Date(formData.lease_end_date)
          if (startDate >= endDate) return 'Start date must be before end date'
        }
        break
      case 'lease_end_date':
        if (value && formData.lease_start_date) {
          const startDate = new Date(formData.lease_start_date)
          const endDate = new Date(value)
          if (endDate <= startDate) return 'End date must be after start date'
        }
        break
      case 'operator_id':
        if (!value) return 'Operator selection is required'
        break
      case 'room_id':
        if (!value) return 'Room selection is required'
        break
      case 'building_id':
        if (!value) return 'Building selection is required'
        break
      case 'booking_type':
        if (!value) return 'Booking type is required'
        if (!BACKEND_ENUMS.BOOKING_TYPES.includes(value)) return 'Invalid booking type'
        break
      case 'status':
        if (value && !BACKEND_ENUMS.TENANT_STATUS.includes(value)) return 'Invalid tenant status'
        break
    }
    return null
  }

  // Comprehensive validation using backend-sync utilities
  const validateAllFields = (): ValidationResult => {
    return validateTenantFormData(formData)
  }

  // Update errors only for touched fields
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    touchedFields.forEach(field => {
      const error = validateField(field, formData[field as keyof TenantFormData])
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
  }, [formData, touchedFields])

  const handleInputChange = (field: keyof TenantFormData, value: any) => {
    // Auto-format phone number
    if (field === 'phone' && typeof value === 'string') {
      const digits = value.replace(/\D/g, '')
      if (digits.length >= 10) {
        value = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
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

  const handleFieldBlur = (field: keyof TenantFormData) => {
    setTouchedFields(prev => new Set([...prev, field]))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Comprehensive validation using backend-sync utilities
    const validationResult = validateAllFields()

    // Set form errors
    setErrors(validationResult.errors)

    // Mark all fields as touched to show validation errors
    const allFieldNames = Object.keys(formData)
    setTouchedFields(new Set(allFieldNames))

    // Show validation errors with better user feedback
    if (!validationResult.isValid) {
      // Debug logging to help identify the issue
      console.log('🔍 Form Validation Debug Info:')
      console.log('Form Data:', formData)
      console.log('Validation Errors:', validationResult.errors)
      console.log('Missing Required Fields:', validationResult.missingRequired)
      console.log('Transformed Backend Data:', transformTenantDataForBackend(formData))

      // Focus on the first field with an error
      const firstErrorField = Object.keys(validationResult.errors)[0]
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement
        if (element) {
          element.focus()
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }

      // Show comprehensive error message with specific field details
      const errorCount = Object.keys(validationResult.errors).length
      const missingCount = validationResult.missingRequired.length

      let errorMessage = ''
      if (missingCount > 0) {
        errorMessage += `${missingCount} required field${missingCount > 1 ? 's' : ''} missing: ${validationResult.missingRequired.join(', ')}. `
      }
      if (errorCount > 0) {
        errorMessage += `${errorCount} validation error${errorCount > 1 ? 's' : ''} found.`
      }

      import('@/lib/error-handler').then(({ showWarningMessage }) => {
        showWarningMessage(
          'Form Validation Failed',
          errorMessage + ' Please review the highlighted fields and correct the errors.',
          { duration: 8000 }
        )
      })
      return
    }

    try {
      // Transform data to match backend expectations
      const backendData = transformTenantDataForBackend(formData)

      // Ensure required IDs are generated if missing
      if (!backendData.tenant_id) {
        backendData.tenant_id = `TNT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      console.log('Submitting transformed tenant data:', backendData)

      // Show success feedback
      import('@/lib/error-handler').then(({ showSuccessMessage }) => {
        showSuccessMessage(
          'Submitting Form',
          'Processing tenant information...',
          { duration: 3000 }
        )
      })

      await onSubmit(backendData)
      
    } catch (error) {
      console.error('Error submitting tenant data:', error)
      import('@/lib/error-handler').then(({ handleFormSubmissionError }) => {
        handleFormSubmissionError(error, {
          additionalInfo: {
            formType: 'tenant',
            operation: 'submit',
            formData: Object.keys(formData)
          }
        })
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusOption = TENANT_STATUS_OPTIONS.find(opt => opt.value === status)
    return statusOption ? (
      <Badge className={statusOption.color}>
        {statusOption.icon} {statusOption.label}
      </Badge>
    ) : null
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedInput
          label="Full Name"
          name="tenant_name"
          value={formData.tenant_name || ''}
          onChange={(value) => handleInputChange('tenant_name', value)}
          onBlur={() => handleFieldBlur('tenant_name')}
          placeholder="Enter tenant's full name"
          error={touchedFields.has('tenant_name') ? errors.tenant_name : undefined}
          icon={<UserCheck className="w-4 h-4" />}
          required
        />

        <EnhancedInput
          label="Email Address"
          name="tenant_email"
          type="email"
          value={formData.tenant_email || ''}
          onChange={(value) => handleInputChange('tenant_email', value)}
          onBlur={() => handleFieldBlur('tenant_email')}
          placeholder="tenant@example.com"
          error={touchedFields.has('tenant_email') ? errors.tenant_email : undefined}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <EnhancedInput
          label="Phone Number"
          name="phone"
          value={formData.phone || ''}
          onChange={(value) => handleInputChange('phone', value)}
          onBlur={() => handleFieldBlur('phone')}
          placeholder="+1 (555) 123-4567"
          error={touchedFields.has('phone') ? errors.phone : undefined}
          icon={<Phone className="w-4 h-4" />}
        />

        <EnhancedInput
          label="Nationality"
          name="tenant_nationality"
          value={formData.tenant_nationality || ''}
          onChange={(value) => handleInputChange('tenant_nationality', value)}
          onBlur={() => handleFieldBlur('tenant_nationality')}
          placeholder="e.g., American, Canadian"
          error={touchedFields.has('tenant_nationality') ? errors.tenant_nationality : undefined}
          suggestions={COMMON_NATIONALITIES}
          required
        />
      </div>

      {/* Tenant Status Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Tenant Status
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TENANT_STATUS_OPTIONS.map((status) => (
            <motion.div
              key={status.value}
              className={`p-4 border-2 rounded-xl cursor-pointer text-center transition-all duration-200 ${
                formData.status === status.value
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
              }`}
              onClick={() => handleInputChange('status', status.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br ${status.color} flex items-center justify-center text-white`}>
                {status.icon}
              </div>
              <div className="text-sm font-semibold text-gray-900">{status.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderEmergencyContact = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Emergency Contact Information</h3>
        <p className="text-gray-600">Provide contact details for emergency situations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnhancedInput
          label="Contact Name"
          value={formData.emergency_contact_name || ''}
          onChange={(value) => handleInputChange('emergency_contact_name', value)}
          placeholder="Emergency contact name"
          icon={<UserCheck className="w-4 h-4" />}
        />

        <EnhancedInput
          label="Contact Phone"
          value={formData.emergency_contact_phone || ''}
          onChange={(value) => handleInputChange('emergency_contact_phone', value)}
          placeholder="+1 (555) 987-6543"
          icon={<Phone className="w-4 h-4" />}
        />

        <EnhancedInput
          label="Relationship"
          value={formData.emergency_contact_relation || ''}
          onChange={(value) => handleInputChange('emergency_contact_relation', value)}
          placeholder="e.g., Parent, Spouse, Friend"
          suggestions={EMERGENCY_RELATIONSHIPS}
          icon={<Heart className="w-4 h-4" />}
        />
      </div>

      {/* Quick Relationship Selection */}
      <div>
        <QuickSelectButtons
          label="Quick Relationship Selection"
          options={EMERGENCY_RELATIONSHIPS.map(rel => ({ value: rel, label: rel }))}
          value={formData.emergency_contact_relation || ''}
          onChange={(value) => handleInputChange('emergency_contact_relation', value)}
        />
      </div>
    </div>
  )

  const renderPropertyAssignment = () => (
    <div className="space-y-6 overflow-visible">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
        <EnhancedSelect
          label="Building"
          value={formData.building_id || ''}
          onChange={(value) => {
            handleInputChange('building_id', value)
            // Clear room selection when building changes
            if (formData.room_id) {
              handleInputChange('room_id', '')
            }
          }}
          onBlur={() => handleFieldBlur('building_id')}
          options={buildings.map(building => ({
            value: building.building_id,
            label: building.building_name,
            icon: <Building className="w-4 h-4" />
          }))}
          placeholder="Select a building"
          error={touchedFields.has('building_id') ? errors.building_id : undefined}
          required
          searchable
        />

        <EnhancedSelect
          label="Room"
          value={formData.room_id || ''}
          onChange={(value) => handleInputChange('room_id', value)}
          onBlur={() => handleFieldBlur('room_id')}
          options={availableRooms.map(room => ({
            value: room.room_id,
            label: `Room ${room.room_number}${room.private_room_rent ? ` - $${room.private_room_rent}/month` : ''}`,
            icon: <Home className="w-4 h-4" />
          }))}
          placeholder={formData.building_id ? "Select a room" : "Select a building first"}
          error={touchedFields.has('room_id') ? errors.room_id : undefined}
          required
          searchable
          disabled={!formData.building_id}
        />

        <EnhancedSelect
          label="Assigned Operator"
          value={formData.operator_id?.toString() || ''}
          onChange={(value) => handleInputChange('operator_id', value ? parseInt(value) : undefined)}
          onBlur={() => handleFieldBlur('operator_id')}
          options={operators
            .filter(op => op.operator_type === 'LEASING_AGENT' || op.operator_type === 'BUILDING_MANAGER')
            .map(operator => ({
              value: operator.operator_id.toString(),
              label: `${operator.name} (${operator.operator_type})`,
              icon: <UserCheck className="w-4 h-4" />
            }))}
          placeholder="Select an operator"
          error={touchedFields.has('operator_id') ? errors.operator_id : undefined}
          required
          searchable
        />

        <EnhancedSelect
          label="Booking Type"
          value={formData.booking_type || ''}
          onChange={(value) => handleInputChange('booking_type', value)}
          onBlur={() => handleFieldBlur('booking_type')}
          options={BOOKING_TYPES}
          placeholder="Select booking type"
          error={touchedFields.has('booking_type') ? errors.booking_type : undefined}
          required
        />
      </div>

      {selectedRoom && (
        <motion.div
          className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Selected Room Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Room Number:</span>
              <div className="text-blue-900">{selectedRoom.room_number}</div>
            </div>
            {selectedRoom.private_room_rent && (
              <div>
                <span className="text-blue-700 font-medium">Private Rent:</span>
                <div className="text-blue-900">${selectedRoom.private_room_rent}/month</div>
              </div>
            )}
            {selectedRoom.shared_room_rent_2 && (
              <div>
                <span className="text-blue-700 font-medium">Shared Rent:</span>
                <div className="text-blue-900">${selectedRoom.shared_room_rent_2}/month per person</div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )

  const renderLeaseInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedInput
          label="Lease Start Date"
          name="lease_start_date"
          type="date"
          value={formData.lease_start_date || ''}
          onChange={(value) => handleInputChange('lease_start_date', value)}
          onBlur={() => handleFieldBlur('lease_start_date')}
          error={touchedFields.has('lease_start_date') ? errors.lease_start_date : undefined}
          icon={<Calendar className="w-4 h-4" />}
          required
        />

        <EnhancedInput
          label="Lease End Date"
          name="lease_end_date"
          type="date"
          value={formData.lease_end_date || ''}
          onChange={(value) => handleInputChange('lease_end_date', value)}
          onBlur={() => handleFieldBlur('lease_end_date')}
          error={touchedFields.has('lease_end_date') ? errors.lease_end_date : undefined}
          icon={<Calendar className="w-4 h-4" />}
          required
        />

        <EnhancedInput
          label="Security Deposit ($)"
          name="deposit_amount"
          type="number"
          value={formData.deposit_amount?.toString() || ''}
          onChange={(value) => handleInputChange('deposit_amount', value ? parseFloat(value) : undefined)}
          onBlur={() => handleFieldBlur('deposit_amount')}
          placeholder="0.00"
          error={touchedFields.has('deposit_amount') ? errors.deposit_amount : undefined}
          icon={<DollarSign className="w-4 h-4" />}
          required
        />

        <EnhancedInput
          label="Payment Status"
          value={formData.payment_status || ''}
          onChange={(value) => handleInputChange('payment_status', value)}
          placeholder="e.g., Current, Late, Pending"
          icon={<Shield className="w-4 h-4" />}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Special Requests
        </label>
        <textarea
          value={formData.special_requests || ''}
          onChange={(e) => handleInputChange('special_requests', e.target.value)}
          placeholder="Any special accommodations or requests..."
          className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
          rows={4}
        />
      </div>
    </div>
  )

  const renderPaymentAndPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedSelect
          label="Payment Method"
          value={formData.rent_payment_method || ''}
          onChange={(value) => handleInputChange('rent_payment_method', value)}
          options={PAYMENT_METHODS}
          placeholder="Select payment method"
        />

        <EnhancedSelect
          label="Account Status"
          value={formData.account_status || ''}
          onChange={(value) => handleInputChange('account_status', value)}
          options={ACCOUNT_STATUS_OPTIONS}
          placeholder="Select account status"
        />
      </div>

      {/* Communication Preferences */}
      <div>
        <QuickSelectButtons
          label="Communication Preferences"
          options={COMMUNICATION_PREFERENCES}
          value={formData.communication_preferences}
          onChange={(value) => handleInputChange('communication_preferences', value)}
        />
      </div>

      {/* Preferences Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200"
          whileHover={{ scale: 1.02 }}
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.payment_reminders_enabled}
              onChange={(e) => handleInputChange('payment_reminders_enabled', e.target.checked)}
              className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
            />
            <div>
              <div className="font-semibold text-green-900 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Payment Reminders
              </div>
              <div className="text-sm text-green-700">Enable payment notifications</div>
            </div>
          </label>
        </motion.div>

        <motion.div
          className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
          whileHover={{ scale: 1.02 }}
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.has_pets}
              onChange={(e) => handleInputChange('has_pets', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <div className="font-semibold text-blue-900 flex items-center gap-2">
                <PawPrint className="w-4 h-4" />
                Has Pets
              </div>
              <div className="text-sm text-blue-700">Tenant has pets</div>
            </div>
          </label>
        </motion.div>

        <motion.div
          className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200"
          whileHover={{ scale: 1.02 }}
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.has_vehicles}
              onChange={(e) => handleInputChange('has_vehicles', e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <div>
              <div className="font-semibold text-purple-900 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Has Vehicles
              </div>
              <div className="text-sm text-purple-700">Tenant has vehicles</div>
            </div>
          </label>
        </motion.div>
      </div>

      <motion.div
        className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200"
        whileHover={{ scale: 1.02 }}
      >
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.has_renters_insurance}
            onChange={(e) => handleInputChange('has_renters_insurance', e.target.checked)}
            className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
          />
          <div>
            <div className="font-semibold text-orange-900 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Has Renter's Insurance
            </div>
            <div className="text-sm text-orange-700">Tenant has valid renter's insurance</div>
          </div>
        </label>
      </motion.div>
    </div>
  )

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'personal':
        return renderPersonalInfo()
      case 'emergency':
        return renderEmergencyContact()
      case 'property':
        return renderPropertyAssignment()
      case 'lease':
        return renderLeaseInformation()
      case 'payment':
        return renderPaymentAndPreferences()
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-100">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <UserCheck className="w-4 h-4" />
            Tenant Management
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-red-900 bg-clip-text text-transparent mb-3">
            {initialData?.tenant_id ? 'Edit Tenant' : 'Add New Tenant'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tenant management with smart automation and seamless lease processing
          </p>
          <div className="flex items-center justify-center mt-4">
            <StatusBadge
              status={formData.status}
              variant="large"
              icon={TENANT_STATUS_OPTIONS.find(opt => opt.value === formData.status)?.icon}
            />
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ProgressIndicator
            steps={steps}
            currentStep={currentStep}
            className="mb-8"
          />
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedCard variant="premium" className="p-8 premium-card overflow-visible">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white">
                  {steps[currentStep].icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h2>
                <div className="ml-auto">
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Step {currentStep + 1} of {steps.length}
                  </Badge>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-visible"
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </EnhancedCard>
          </motion.div>

          {/* Enhanced Navigation */}
          <motion.div
            className="flex items-center justify-between pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.button
              type="button"
              onClick={prevStep}
              disabled={!canGoPrev}
              className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                !canGoPrev
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-gray-400 hover:bg-gray-50'
              }`}
              whileHover={canGoPrev ? { scale: 1.02 } : {}}
              whileTap={canGoPrev ? { scale: 0.98 } : {}}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </motion.button>

            <div className="flex items-center gap-4">
              {onCancel && (
                <motion.button
                  type="button"
                  onClick={() => {
                    // Reset step navigation before canceling
                    resetSteps()
                    // Call parent cancel handler
                    onCancel()
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>
              )}

              {!canGoNext ? (
                <motion.button
                  type="submit"
                  disabled={isLoading || Object.keys(errors).length > 0}
                  className={`px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
                    isLoading || Object.keys(errors).length > 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-orange-700 hover:to-red-700'
                  }`}
                  whileHover={!(isLoading || Object.keys(errors).length > 0) ? { scale: 1.02 } : {}}
                  whileTap={!(isLoading || Object.keys(errors).length > 0) ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {initialData?.tenant_id ? 'Update Tenant' : 'Create Tenant'}
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
