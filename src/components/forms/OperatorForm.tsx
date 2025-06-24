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
import { OperatorFormData } from '../../types'
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
  X
} from 'lucide-react'
import '../../styles/design-system.css'

interface OperatorFormProps {
  initialData?: Partial<OperatorFormData>
  onSubmit: (data: OperatorFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

const OPERATOR_TYPES = [
  {
    value: 'LEASING_AGENT',
    label: 'Leasing Agent',
    description: 'Handles tenant applications and showings',
    icon: <UserCheck className="w-5 h-5" />
  },
  {
    value: 'MAINTENANCE',
    label: 'Maintenance',
    description: 'Manages property maintenance and repairs',
    icon: <Settings className="w-5 h-5" />
  },
  {
    value: 'BUILDING_MANAGER',
    label: 'Building Manager',
    description: 'Oversees building operations',
    icon: <Shield className="w-5 h-5" />
  },
  {
    value: 'ADMIN',
    label: 'Administrator',
    description: 'Full system access and management',
    icon: <Shield className="w-5 h-5" />
  }
]

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
  'Senior Leasing Agent',
  'Property Manager',
  'Assistant Manager',
  'Maintenance Supervisor',
  'Leasing Consultant',
  'Community Manager',
  'Regional Manager'
]

const DEFAULT_WORKING_HOURS = {
  monday: { start: '09:00', end: '17:00', enabled: true },
  tuesday: { start: '09:00', end: '17:00', enabled: true },
  wednesday: { start: '09:00', end: '17:00', enabled: true },
  thursday: { start: '09:00', end: '17:00', enabled: true },
  friday: { start: '09:00', end: '17:00', enabled: true },
  saturday: { start: '10:00', end: '14:00', enabled: false },
  sunday: { start: '10:00', end: '14:00', enabled: false }
}

export default function OperatorForm({ initialData, onSubmit, onCancel, isLoading }: OperatorFormProps) {
  const [formData, setFormData] = useState<OperatorFormData>({
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

  // Validation function (doesn't automatically set errors)
  const validateField = (fieldName: string, value: any): string | null => {
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
    }
    return null
  }

  // Validate all fields (used on submit)
  const validateAllFields = (): Record<string, string> => {
    const newErrors: Record<string, string> = {}

    const fieldsToValidate = ['name', 'email', 'phone']

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof OperatorFormData])
      if (error) {
        newErrors[field] = error
      }
    })

    return newErrors
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

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setWorkingHours((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields on submit
    const allErrors = validateAllFields()
    setErrors(allErrors)

    // Mark all required fields as touched to show errors
    const requiredFields = ['name', 'email']
    setTouchedFields(prev => new Set([...prev, ...requiredFields]))

    if (Object.keys(allErrors).length > 0) {
      return
    }

    const submitData = {
      ...formData,
      working_hours: JSON.stringify(workingHours),
      date_joined: formData.date_joined || new Date().toISOString().split('T')[0]
    } as unknown as OperatorFormData

    await onSubmit(submitData)
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Header Section */}
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <EnhancedCard variant="premium" className="p-8 premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onChange={(value) => handleInputChange('role', value)}
                  placeholder="e.g., Senior Leasing Agent"
                  suggestions={COMMON_ROLES}
                />
              </div>

              {/* Quick Role Selection */}
              <div className="mt-6">
                <QuickSelectButtons
                  label="Quick Role Selection"
                  options={COMMON_ROLES.map(role => ({ value: role, label: role }))}
                  value={formData.role || ''}
                  onChange={(value) => handleInputChange('role', value)}
                />
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Operator Type & Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <EnhancedCard variant="premium" className="p-8 premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Role & Access Level</h2>
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

                {/* Visual Role Cards */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Quick Role Selection
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {OPERATOR_TYPES.map((type) => (
                      <motion.div
                        key={type.value}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.operator_type === type.value
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                        }`}
                        onClick={() => handleInputChange('operator_type', type.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            formData.operator_type === type.value
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {type.icon}
                          </div>
                          <div className="font-semibold text-gray-900">{type.label}</div>
                        </div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </motion.div>
                    ))}
                  </div>
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
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <EnhancedCard variant="premium" className="p-8 premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Communication Preferences</h2>
              </div>

              <QuickSelectButtons
                label="Notification Method"
                options={NOTIFICATION_PREFERENCES}
                value={formData.notification_preferences}
                onChange={(value) => handleInputChange('notification_preferences', value)}
              />
            </EnhancedCard>
          </motion.div>

        {/* Working Hours */}
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

        {/* Advanced Settings */}
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

          {/* Form Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex items-center justify-end gap-4 pt-8"
          >
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

            <motion.button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 premium-button relative overflow-hidden ${
                isLoading || Object.keys(errors).length > 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-blue-700 hover:to-purple-700 hover:-translate-y-1'
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
                  {initialData?.operator_id ? 'Update Operator' : 'Create Operator'}
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
    </div>
  )
}
