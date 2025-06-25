'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import CopyFromPrevious from '@/components/ui/CopyFromPrevious'
import TemplateSelector from './TemplateSelector'
import TemplateSaveDialog from './TemplateSaveDialog'
import FormGuidance from './FormGuidance'
import { ValidationSummary, InlineValidation } from './EnhancedValidation'
import { RoomFormData, FormTemplate, RecentSubmission } from '@/types'
import { useFormTemplates } from '@/hooks/useFormTemplates'
import {
  validateRoomFormData,
  transformRoomDataForBackend,
  BACKEND_ENUMS,
  ValidationResult
} from '@/lib/backend-sync'
import {
  Home,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  LayoutTemplate,
  Bookmark,
  Building,
  Calendar,
  Settings,
  FileText,
  Wrench
} from 'lucide-react'

// Multi-step form configuration
const FORM_STEPS = [
  {
    id: 'basic',
    title: 'Basic Information',
    subtitle: 'Room details and identification',
    icon: Home,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'specifications',
    title: 'Room Specifications',
    subtitle: 'Size, layout, and features',
    icon: Building,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'availability',
    title: 'Booking & Availability',
    subtitle: 'Dates and booking information',
    icon: Calendar,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'amenities',
    title: 'Amenities & Features',
    subtitle: 'Room amenities and environment',
    icon: Settings,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'maintenance',
    title: 'Maintenance & Notes',
    subtitle: 'Tracking and documentation',
    icon: Wrench,
    color: 'from-red-500 to-red-600'
  }
] as const

type FormStep = typeof FORM_STEPS[number]['id']

// Smart suggestions for room numbers
const ROOM_NUMBER_PATTERNS = [
  '101', '102', '103', '104', '105',
  '201', '202', '203', '204', '205',
  'A1', 'A2', 'A3', 'B1', 'B2', 'B3',
  'Room 1', 'Room 2', 'Room 3', 'Room 4'
]

// Use backend-validated room status options
const ROOM_STATUS_OPTIONS = BACKEND_ENUMS.ROOM_STATUS.map(status => ({
  value: status,
  label: status,
  color: 'green'
}))

interface RoomFormProps {
  initialData?: Partial<RoomFormData>
  onSubmit: (data: RoomFormData) => Promise<void>
  onCancel?: () => void
  onBack?: () => void
  isLoading?: boolean
  buildings?: Array<{ building_id: string; building_name: string }>
}

export default function RoomForm({ initialData, onSubmit, onCancel, onBack, isLoading, buildings = [] }: RoomFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set())
  const [formData, setFormData] = useState<RoomFormData>({
    room_number: '',
    building_id: '',
    ready_to_rent: true,
    status: 'AVAILABLE', // Backend validated
    booked_from: undefined,
    booked_till: undefined,
    active_tenants: 0,
    maximum_people_in_room: 1, // Required field
    private_room_rent: 0, // Required field
    shared_room_rent_2: undefined, // Backend field for shared room pricing
    floor_number: 1, // Required field
    bed_count: 1, // Required field
    bathroom_type: 'Shared', // Backend default
    bed_size: 'Twin', // Backend validated enum
    bed_type: 'Single', // Backend validated enum
    view: 'Street', // Backend validated enum
    sq_footage: 200, // Backend field with default
    mini_fridge: false,
    sink: false,
    bedding_provided: false,
    work_desk: false,
    work_chair: false,
    heating: false,
    air_conditioning: false,
    cable_tv: false,
    room_storage: 'Built-in Closet', // Backend field with default
    last_check: undefined, // Backend field for maintenance tracking
    last_check_by: undefined, // Backend field for operator tracking
    current_booking_types: undefined, // Backend field for booking types
    noise_level: undefined,
    sunlight: undefined,
    furnished: false,
    furniture_details: undefined,
    last_renovation_date: undefined,
    public_notes: undefined,
    internal_notes: undefined,
    virtual_tour_url: undefined,
    available_from: undefined,
    additional_features: undefined,
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showTemplateSaveDialog, setShowTemplateSaveDialog] = useState(false)

  // Template management
  const { saveRecentSubmission, saveTemplate } = useFormTemplates({ formType: 'room' })

  // Step navigation functions
  const getCurrentStepIndex = () => FORM_STEPS.findIndex(step => step.id === currentStep)
  const isFirstStep = getCurrentStepIndex() === 0
  const isLastStep = getCurrentStepIndex() === FORM_STEPS.length - 1

  const goToNextStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex < FORM_STEPS.length - 1) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(FORM_STEPS[currentIndex + 1].id)
    }
  }

  const goToPreviousStep = () => {
    const currentIndex = getCurrentStepIndex()
    if (currentIndex > 0) {
      setCurrentStep(FORM_STEPS[currentIndex - 1].id)
    }
  }

  const goToStep = (stepId: FormStep) => {
    setCurrentStep(stepId)
  }

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowLeft' && !isFirstStep) {
          e.preventDefault()
          goToPreviousStep()
        } else if (e.key === 'ArrowRight' && !isLastStep) {
          e.preventDefault()
          goToNextStep()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFirstStep, isLastStep])

  const handleInputChange = useCallback((field: keyof RoomFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleCopyFromPrevious = useCallback((copiedData: any) => {
    setFormData(prev => ({
      ...prev,
      ...copiedData,
      room_id: prev.room_id // Keep current room_id
    }))
  }, [])

  // Handle template selection
  const handleTemplateSelect = (template: FormTemplate) => {
    setFormData(prev => ({
      ...prev,
      ...template.data,
      room_id: prev.room_id, // Keep current room_id
      room_number: prev.room_number || template.data.room_number // Keep current room number if set
    }))

    // Show success message
    import('@/lib/error-handler').then(({ showSuccessMessage }) => {
      showSuccessMessage(
        'Template Applied',
        `Template "${template.name}" has been loaded successfully.`,
        {
          action: {
            label: 'View Details',
            onClick: () => console.log('Template details:', template)
          }
        }
      )
    })
  }

  // Handle recent submission selection
  const handleRecentSelect = (submission: RecentSubmission) => {
    setFormData(prev => ({
      ...prev,
      ...submission.data,
      room_id: prev.room_id, // Keep current room_id
      room_number: prev.room_number || submission.data.room_number // Keep current room number if set
    }))

    // Show info message
    import('@/lib/error-handler').then(({ showInfoMessage }) => {
      showInfoMessage(
        'Previous Data Loaded',
        'Your previous submission data has been applied to the form.'
      )
    })
  }

  // Handle template save
  const handleSaveTemplate = async (templateData: any) => {
    try {
      await saveTemplate(templateData)
      import('@/lib/error-handler').then(({ showSuccessMessage }) => {
        showSuccessMessage(
          'Template Saved',
          `Template "${templateData.name}" has been saved successfully.`,
          {
            action: {
              label: 'View Templates',
              onClick: () => console.log('Navigate to templates')
            }
          }
        )
      })
    } catch (error) {
      import('@/lib/error-handler').then(({ handleFormSubmissionError }) => {
        handleFormSubmissionError(error, {
          additionalInfo: {
            operation: 'save_template',
            templateName: templateData.name
          }
        })
      })
    }
  }

  // Generate preview text for recent submissions
  const generatePreviewText = (data: RoomFormData): string => {
    const parts = []
    if (data.room_number) parts.push(`Room ${data.room_number}`)
    if (data.bed_count) parts.push(`${data.bed_count} bed${data.bed_count > 1 ? 's' : ''}`)
    if (data.bathroom_type) parts.push(data.bathroom_type.toLowerCase())
    if (data.private_room_rent) parts.push(`$${data.private_room_rent}/month`)
    return parts.join(', ') || 'Room configuration'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate using backend-sync
    const validationResult = validateRoomFormData(formData)

    if (!validationResult.isValid) {
      setErrors(validationResult.errors)
      return
    }

    // Transform data for backend
    const transformedData = transformRoomDataForBackend(formData)

    try {
      await onSubmit(transformedData)

      // Save to recent submissions after successful submit
      const previewText = generatePreviewText(formData)
      await saveRecentSubmission(formData, previewText)
    } catch (error) {
      // Handle submission error
      console.error('Form submission error:', error)
    }
  }

  // Step content components
  const BasicInformationStep = () => (
    <div className="space-y-6">
      {/* Template Selector */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <LayoutTemplate className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Quick Start</h3>
            <p className="text-sm text-gray-600">Load a template or recent submission to get started faster</p>
          </div>
        </div>
        <TemplateSelector
          formType="room"
          onTemplateSelect={handleTemplateSelect}
          onRecentSelect={handleRecentSelect}
        />
      </Card>

      <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number *
            </label>
            <div className="relative">
              <Input
                value={formData.room_number}
                onChange={(e) => handleInputChange('room_number', e.target.value)}
                placeholder="Enter room number"
                list="room-numbers"
                required
                className={errors.room_number ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
              <datalist id="room-numbers">
                {ROOM_NUMBER_PATTERNS.map((pattern) => (
                  <option key={pattern} value={pattern} />
                ))}
              </datalist>
            </div>
            <InlineValidation message={errors.room_number} type="error" />

            <div className="mt-3 flex flex-wrap gap-2">
              {ROOM_NUMBER_PATTERNS.slice(0, 6).map((pattern) => (
                <button
                  key={pattern}
                  type="button"
                  onClick={() => handleInputChange('room_number', pattern)}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                >
                  {pattern}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building *
            </label>
            <select
              value={formData.building_id}
              onChange={(e) => handleInputChange('building_id', e.target.value)}
              className={`w-full p-3 border rounded-lg transition-colors ${
                errors.building_id
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              required
            >
              <option value="">Select a building</option>
              {buildings.map(building => (
                <option key={building.building_id} value={building.building_id}>
                  {building.building_name}
                </option>
              ))}
            </select>
            <InlineValidation message={errors.building_id} type="error" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
            >
              {ROOM_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Tenants
            </label>
            <Input
              type="number"
              value={formData.active_tenants || ''}
              onChange={(e) => handleInputChange('active_tenants', e.target.value ? parseInt(e.target.value) : 0)}
              placeholder="Number of current tenants"
              min="0"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={formData.ready_to_rent}
              onChange={(e) => handleInputChange('ready_to_rent', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Ready to Rent</span>
            <span className="text-xs text-gray-500">Mark this room as available for new tenants</span>
          </label>
        </div>
      </Card>
    </div>
  )

  const SpecificationsStep = () => (
    <div>
      <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Private Room Rent ($) *
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.private_room_rent || ''}
              onChange={(e) => handleInputChange('private_room_rent', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 800.00"
              min="0"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shared Room Rent ($)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.shared_room_rent_2 || ''}
              onChange={(e) => handleInputChange('shared_room_rent_2', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="e.g., 500.00"
              min="0"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor Number *
            </label>
            <Input
              type="number"
              value={formData.floor_number || ''}
              onChange={(e) => handleInputChange('floor_number', e.target.value ? parseInt(e.target.value) : 1)}
              placeholder="e.g., 1"
              min="1"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum People *
            </label>
            <Input
              type="number"
              value={formData.maximum_people_in_room || ''}
              onChange={(e) => handleInputChange('maximum_people_in_room', e.target.value ? parseInt(e.target.value) : 1)}
              placeholder="e.g., 2"
              min="1"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Count *
            </label>
            <Input
              type="number"
              value={formData.bed_count || ''}
              onChange={(e) => handleInputChange('bed_count', e.target.value ? parseInt(e.target.value) : 1)}
              placeholder="e.g., 1"
              min="1"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Square Footage
            </label>
            <Input
              type="number"
              value={formData.sq_footage || ''}
              onChange={(e) => handleInputChange('sq_footage', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 200"
              min="50"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathroom Type *
            </label>
            <select
              value={formData.bathroom_type}
              onChange={(e) => handleInputChange('bathroom_type', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
            >
              <option value="Shared">Shared</option>
              <option value="Private">Private</option>
              <option value="Semi-Private">Semi-Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Size *
            </label>
            <select
              value={formData.bed_size}
              onChange={(e) => handleInputChange('bed_size', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
            >
              <option value="Twin">Twin</option>
              <option value="Full">Full</option>
              <option value="Queen">Queen</option>
              <option value="King">King</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Type *
            </label>
            <select
              value={formData.bed_type}
              onChange={(e) => handleInputChange('bed_type', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
            >
              <option value="Single">Single</option>
              <option value="Bunk">Bunk</option>
              <option value="Loft">Loft</option>
              <option value="Murphy">Murphy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              View
            </label>
            <select
              value={formData.view}
              onChange={(e) => handleInputChange('view', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
            >
              <option value="Street">Street</option>
              <option value="Courtyard">Courtyard</option>
              <option value="Garden">Garden</option>
              <option value="City">City</option>
              <option value="Water">Water</option>
              <option value="Mountain">Mountain</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Storage
            </label>
            <select
              value={formData.room_storage}
              onChange={(e) => handleInputChange('room_storage', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
            >
              <option value="Built-in Closet">Built-in Closet</option>
              <option value="Wardrobe">Wardrobe</option>
              <option value="Under-bed Storage">Under-bed Storage</option>
              <option value="Wall Shelves">Wall Shelves</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  )

  const AvailabilityStep = () => (
    <div>
      <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📅 Booking Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booked From
                </label>
                <Input
                  type="date"
                  value={formData.booked_from || ''}
                  onChange={(e) => handleInputChange('booked_from', e.target.value || undefined)}
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booked Till
                </label>
                <Input
                  type="date"
                  value={formData.booked_till || ''}
                  onChange={(e) => handleInputChange('booked_till', e.target.value || undefined)}
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <Input
                  type="date"
                  value={formData.available_from || ''}
                  onChange={(e) => handleInputChange('available_from', e.target.value || undefined)}
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Booking Types
                </label>
                <Input
                  value={formData.current_booking_types || ''}
                  onChange={(e) => handleInputChange('current_booking_types', e.target.value || undefined)}
                  placeholder="e.g., Short-term, Long-term"
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              🌟 Room Environment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Noise Level
                </label>
                <select
                  value={formData.noise_level || ''}
                  onChange={(e) => handleInputChange('noise_level', e.target.value || undefined)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select noise level</option>
                  <option value="Quiet">Quiet</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Noisy">Noisy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sunlight
                </label>
                <select
                  value={formData.sunlight || ''}
                  onChange={(e) => handleInputChange('sunlight', e.target.value || undefined)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="">Select sunlight level</option>
                  <option value="Bright">Bright</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Dim">Dim</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-full">
                  <input
                    type="checkbox"
                    checked={formData.furnished || false}
                    onChange={(e) => handleInputChange('furnished', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Furnished</span>
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Virtual Tour URL
              </label>
              <Input
                type="url"
                value={formData.virtual_tour_url || ''}
                onChange={(e) => handleInputChange('virtual_tour_url', e.target.value || undefined)}
                placeholder="https://example.com/virtual-tour"
                className="transition-colors focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Furniture Details
              </label>
              <Input
                value={formData.furniture_details || ''}
                onChange={(e) => handleInputChange('furniture_details', e.target.value || undefined)}
                placeholder="Describe furniture included (if furnished)"
                className="transition-colors focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Features
              </label>
              <Input
                value={formData.additional_features || ''}
                onChange={(e) => handleInputChange('additional_features', e.target.value || undefined)}
                placeholder="Any additional features or amenities"
                className="transition-colors focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const AmenitiesStep = () => (
    <div>
      <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
        <div>
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Room Amenities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'mini_fridge', label: 'Mini Fridge', icon: '❄️', description: 'Personal refrigerator' },
              { key: 'sink', label: 'Sink', icon: '🚿', description: 'In-room sink' },
              { key: 'bedding_provided', label: 'Bedding Provided', icon: '🛏️', description: 'Sheets and pillows included' },
              { key: 'work_desk', label: 'Work Desk', icon: '🪑', description: 'Study/work area' },
              { key: 'work_chair', label: 'Work Chair', icon: '💺', description: 'Ergonomic chair' },
              { key: 'heating', label: 'Heating', icon: '🔥', description: 'Climate control' },
              { key: 'air_conditioning', label: 'Air Conditioning', icon: '❄️', description: 'Cooling system' },
              { key: 'cable_tv', label: 'Cable TV', icon: '📺', description: 'Television with cable' }
            ].map((amenity) => (
              <label
                key={amenity.key}
                className={`
                  flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]
                  ${formData[amenity.key as keyof RoomFormData]
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={formData[amenity.key as keyof RoomFormData] as boolean}
                  onChange={(e) => handleInputChange(amenity.key as keyof RoomFormData, e.target.checked)}
                  className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{amenity.icon}</span>
                    <span className="font-medium text-gray-900">{amenity.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{amenity.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )

  const MaintenanceStep = () => (
    <div>
      <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Maintenance & Tracking
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Check Date
                </label>
                <Input
                  type="date"
                  value={formData.last_check || ''}
                  onChange={(e) => handleInputChange('last_check', e.target.value || undefined)}
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Check By (Staff ID)
                </label>
                <Input
                  type="number"
                  value={formData.last_check_by || ''}
                  onChange={(e) => handleInputChange('last_check_by', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Staff member ID"
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Renovation Date
                </label>
                <Input
                  type="date"
                  value={formData.last_renovation_date || ''}
                  onChange={(e) => handleInputChange('last_renovation_date', e.target.value || undefined)}
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notes & Comments
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Notes
                </label>
                <textarea
                  value={formData.public_notes || ''}
                  onChange={(e) => handleInputChange('public_notes', e.target.value || undefined)}
                  placeholder="Notes visible to tenants and public"
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  value={formData.internal_notes || ''}
                  onChange={(e) => handleInputChange('internal_notes', e.target.value || undefined)}
                  placeholder="Internal notes for staff only"
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  // Step indicator component
  const StepIndicator = () => {
    const progress = ((getCurrentStepIndex() + 1) / FORM_STEPS.length) * 100

    return (
      <div className="mb-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {FORM_STEPS.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = completedSteps.has(step.id)
            const isAccessible = index <= getCurrentStepIndex() || isCompleted
            const IconComponent = step.icon

            return (
              <div key={step.id} className="flex items-center">
                <motion.button
                  type="button"
                  onClick={() => isAccessible && goToStep(step.id)}
                  disabled={!isAccessible}
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${isActive
                      ? `bg-gradient-to-r ${step.color} text-white border-transparent shadow-lg scale-110`
                      : isCompleted
                        ? 'bg-green-500 text-white border-green-500'
                        : isAccessible
                          ? 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }
                  `}
                  whileHover={isAccessible ? { scale: 1.05 } : {}}
                  whileTap={isAccessible ? { scale: 0.95 } : {}}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </motion.button>

                {index < FORM_STEPS.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2 rounded-full transition-colors duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {FORM_STEPS[getCurrentStepIndex()].title}
            {isLastStep && (
              <motion.span
                className="ml-2 text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                🎉
              </motion.span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            {isLastStep
              ? "Review your information and complete the room setup"
              : FORM_STEPS[getCurrentStepIndex()].subtitle
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {initialData?.room_id ? 'Edit Room' : 'Create New Room'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Follow the guided steps to configure your room with all the necessary details, amenities, and availability information
          </p>
        </motion.div>

        <StepIndicator />

        {/* Form Guidance */}
        <div className="mb-6">
          <FormGuidance
            formType="room"
            currentStep={getCurrentStepIndex()}
            totalSteps={FORM_STEPS.length}
            onStepClick={(stepIndex) => {
              if (stepIndex >= 0 && stepIndex < FORM_STEPS.length) {
                setCurrentStep(FORM_STEPS[stepIndex].id)
              }
            }}
          />
        </div>

        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <ValidationSummary
            errors={errors}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {currentStep === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BasicInformationStep />
              </motion.div>
            )}
            {currentStep === 'specifications' && (
              <motion.div
                key="specifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SpecificationsStep />
              </motion.div>
            )}
            {currentStep === 'availability' && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AvailabilityStep />
              </motion.div>
            )}
            {currentStep === 'amenities' && (
              <motion.div
                key="amenities"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AmenitiesStep />
              </motion.div>
            )}
            {currentStep === 'maintenance' && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MaintenanceStep />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Navigation */}
          <div className="flex items-center justify-between pt-6 border-t bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}

              {onBack && isFirstStep && (
                <Button type="button" variant="outline" onClick={onBack}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Forms
                </Button>
              )}

              {/* Save as Template Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTemplateSaveDialog(true)}
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Bookmark className="w-4 h-4" />
                Save as Template
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              Step {getCurrentStepIndex() + 1} of {FORM_STEPS.length}
            </div>

            <div className="flex items-center gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}

              {!isLastStep ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {isLoading && <LoadingSpinner size="sm" />}
                  <Save className="w-4 h-4" />
                  {initialData?.room_id ? 'Update Room' : 'Create Room'}
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Template Save Dialog */}
        <TemplateSaveDialog
          isOpen={showTemplateSaveDialog}
          onClose={() => setShowTemplateSaveDialog(false)}
          formType="room"
          formData={formData}
          onSave={handleSaveTemplate}
        />
      </div>
    </div>
  )
}
