'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { LoadingSpinner } from '../ui/loading-spinner'
import { HelpTooltip } from '../ui/help-tooltip'
import { EnhancedCard, EnhancedInput, EnhancedSelect, QuickSelectButtons, StatusBadge, ProgressIndicator } from '../ui/enhanced-components'
import AddressAutocomplete, { AddressData } from '../ui/AddressAutocomplete'
import CopyFromPrevious from '../ui/CopyFromPrevious'
import { useFormSmartDefaults } from '../../hooks/useSmartDefaults'
import { BuildingFormData, MediaFile } from '../../types'
import { MediaUploadSection } from './MediaUploadSection'
import { createFormDataWithFiles } from '../../utils/fileUpload'
import {
  Building,
  MapPin,
  Ruler,
  Sparkles,
  FileText,
  Camera,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  CheckCircle,
  Home,
  Shield,
  Wifi,
  Car,
  Dumbbell,
  Users,
  Accessibility
} from 'lucide-react'
import '../../styles/design-system.css'

interface BuildingFormProps {
  initialData?: Partial<BuildingFormData>
  onSubmit: (data: BuildingFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  operators?: Array<{ operator_id: number; name: string; operator_type: string }>
}

const PET_FRIENDLY_OPTIONS = [
  { value: 'NO_PETS', label: 'No Pets Allowed', icon: '🚫' },
  { value: 'CATS_ONLY', label: 'Cats Only', icon: '🐱' },
  { value: 'DOGS_ONLY', label: 'Dogs Only', icon: '🐕' },
  { value: 'CATS_AND_DOGS', label: 'Cats & Dogs', icon: '🐱🐕' },
  { value: 'ALL_PETS', label: 'All Pets Welcome', icon: '🐾' }
]

const COMMON_KITCHEN_OPTIONS = [
  { value: 'NONE', label: 'No Common Kitchen' },
  { value: 'BASIC', label: 'Basic Kitchen' },
  { value: 'FULL', label: 'Full Kitchen' },
  { value: 'COMMERCIAL', label: 'Commercial Grade' }
]

// Smart suggestions for minimal typing
const BUILDING_NAME_SUGGESTIONS = [
  'Sunset Apartments', 'Downtown Lofts', 'Garden View Residences', 'Metro Heights',
  'University Commons', 'Riverside Towers', 'Oak Street Apartments', 'City Center Plaza',
  'Parkside Manor', 'Heritage Square', 'Maple Grove Apartments', 'Skyline Residences'
]

const NEIGHBORHOOD_SUGGESTIONS = [
  'Downtown', 'Midtown', 'Uptown', 'Financial District', 'Arts District',
  'University Area', 'Historic District', 'Waterfront', 'Business District',
  'Shopping District', 'Entertainment District', 'Residential Area'
]

const BUILDING_DESCRIPTION_TEMPLATES = [
  'Modern apartment building with contemporary amenities and convenient location.',
  'Historic building renovated with modern conveniences while maintaining original charm.',
  'Student-friendly housing with study areas and social spaces.',
  'Professional housing for working adults with business amenities.',
  'Family-oriented building with child-friendly facilities and safety features.'
]

const LEASE_TERM_OPTIONS = [
  { value: 6, label: '6 months' },
  { value: 9, label: '9 months (Academic Year)' },
  { value: 12, label: '12 months (Standard)' },
  { value: 18, label: '18 months' },
  { value: 24, label: '24 months' }
]

const CLEANING_SCHEDULE_OPTIONS = [
  'Daily cleaning service',
  'Weekly professional cleaning',
  'Bi-weekly cleaning service',
  'Monthly deep cleaning',
  'Tenant responsibility with supplies provided',
  'Tenant responsibility - own supplies'
]

const COMMON_CONVENIENCES = [
  'Grocery stores', 'Restaurants', 'Banks', 'Pharmacies', 'Coffee shops',
  'Shopping centers', 'Parks', 'Gyms', 'Libraries', 'Post office'
]

const TRANSPORTATION_OPTIONS = [
  'Bus stop (2 min walk)', 'Subway station (5 min walk)', 'Light rail (10 min walk)',
  'Bike sharing station', 'Taxi/Uber pickup point', 'Airport shuttle stop'
]

export default function BuildingForm({ initialData, onSubmit, onCancel, isLoading, operators = [] }: BuildingFormProps) {
  const { getSmartDefaults, saveToHistory } = useFormSmartDefaults('building')
  const smartDefaults = getSmartDefaults()

  // Convert initial data and smart defaults to ensure proper types
  const processInitialData = (data: any) => {
    if (!data) return {}
    return {
      ...data,
      // Ensure numeric fields are numbers
      min_lease_term: typeof data.min_lease_term === 'string'
        ? parseInt(data.min_lease_term) || undefined
        : data.min_lease_term,
      pref_min_lease_term: typeof data.pref_min_lease_term === 'string'
        ? parseInt(data.pref_min_lease_term) || undefined
        : data.pref_min_lease_term,
      year_built: typeof data.year_built === 'string'
        ? parseInt(data.year_built) || undefined
        : data.year_built,
      floors: typeof data.floors === 'string'
        ? parseInt(data.floors) || undefined
        : data.floors,
      total_rooms: typeof data.total_rooms === 'string'
        ? parseInt(data.total_rooms) || undefined
        : data.total_rooms,
      available_rooms: typeof data.available_rooms === 'string'
        ? parseInt(data.available_rooms) || undefined
        : data.available_rooms,
      priority: typeof data.priority === 'string'
        ? parseInt(data.priority) || undefined
        : data.priority,
      property_manager: typeof data.property_manager === 'string'
        ? parseInt(data.property_manager) || undefined
        : data.property_manager,
    }
  }

  const processedInitialData = processInitialData(initialData)
  const processedSmartDefaults = processInitialData(smartDefaults)

  const [formData, setFormData] = useState<BuildingFormData>({
    // Required fields from Building interface
    building_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA', // Default country
    operator_id: '',
    total_rooms: 0,
    available_rooms: 0,
    building_type: '',
    amenities: [],
    disability_access: true, // Smart default: accessibility compliance

    // Additional BuildingFormData fields
    available: true,
    wifi_included: true, // Smart default: most buildings have wifi
    laundry_onsite: true, // Smart default: common amenity
    secure_access: true, // Smart default: important for safety
    bike_storage: false,
    rooftop_access: false,
    utilities_included: false,
    fitness_area: false,
    work_study_area: true, // Smart default: popular with tenants
    social_events: false,

    ...processedSmartDefaults, // Apply smart defaults from history
    ...processedInitialData // Override with any provided initial data
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [amenitiesDetails, setAmenitiesDetails] = useState(
    initialData?.amenities_details
      ? (typeof initialData.amenities_details === 'string'
          ? JSON.parse(initialData.amenities_details)
          : initialData.amenities_details)
      : {}
  )
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(
    initialData?.media_files || []
  )

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: <Building className="w-5 h-5" /> },
    { id: 'location', title: 'Location & Address', icon: <MapPin className="w-5 h-5" /> },
    { id: 'specifications', title: 'Building Specs', icon: <Ruler className="w-5 h-5" /> },
    { id: 'amenities', title: 'Amenities & Features', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'policies', title: 'Policies & Rules', icon: <FileText className="w-5 h-5" /> },
    { id: 'media', title: 'Images & Tours', icon: <Camera className="w-5 h-5" /> }
  ]

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.building_name.trim()) {
      newErrors.building_name = 'Building name is required'
    }

    if (formData.year_built && (formData.year_built < 1800 || formData.year_built > new Date().getFullYear())) {
      newErrors.year_built = 'Please enter a valid year'
    }

    if (formData.floors && formData.floors < 1) {
      newErrors.floors = 'Building must have at least 1 floor'
    }

    if (formData.total_rooms && formData.total_rooms < 1) {
      newErrors.total_rooms = 'Building must have at least 1 room'
    }

    setErrors(newErrors)
  }, [formData])

  const handleInputChange = (field: keyof BuildingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressSelect = (addressData: AddressData) => {
    setFormData(prev => ({
      ...prev,
      full_address: addressData.fullAddress,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      zip: addressData.zip
    }))
  }

  const handleCopyFromPrevious = (copiedData: any) => {
    setFormData(prev => ({
      ...prev,
      ...copiedData,
      building_id: prev.building_id // Keep current building_id
    }))

    // Also copy amenities details if available
    if (copiedData.amenities_details) {
      try {
        const parsedAmenities = JSON.parse(copiedData.amenities_details)
        setAmenitiesDetails(parsedAmenities)
      } catch (error) {
        console.warn('Failed to parse amenities details:', error)
      }
    }
  }

  const handleAmenityDetailChange = (amenity: string, detail: string) => {
    setAmenitiesDetails((prev: any) => ({
      ...prev,
      [amenity]: detail
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (Object.keys(errors).length > 0) {
      return
    }

    const submitData = {
      ...formData,
      amenities_details: JSON.stringify(amenitiesDetails),
      building_id: formData.building_id || `bldg_${Date.now()}`,
      media_files: mediaFiles
    } as unknown as BuildingFormData

    // Save to history for smart defaults (excluding media files for storage efficiency)
    const historyData = { ...submitData }
    delete historyData.media_files
    saveToHistory(historyData)

    // Note: If you need to send files to backend, you can use:
    // const formDataWithFiles = createFormDataWithFiles(submitData, mediaFiles)
    // Then send formDataWithFiles instead of submitData to your API endpoint

    await onSubmit(submitData)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Name *
                </label>
                <div className="relative">
                  <Input
                    value={formData.building_name}
                    onChange={(e) => handleInputChange('building_name', e.target.value)}
                    placeholder="Enter building name or select from suggestions"
                    className={errors.building_name ? 'border-red-500' : ''}
                    list="building-names"
                  />
                  <datalist id="building-names">
                    {BUILDING_NAME_SUGGESTIONS.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                {errors.building_name && <p className="text-red-500 text-sm mt-1">{errors.building_name}</p>}

                {/* Quick selection buttons */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {BUILDING_NAME_SUGGESTIONS.slice(0, 4).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleInputChange('building_name', name)}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Manager
                </label>
                <select
                  value={formData.operator_id || ''}
                  onChange={(e) => handleInputChange('operator_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a manager</option>
                  {operators.filter(op => op.operator_type === 'BUILDING_MANAGER' || op.operator_type === 'ADMIN').map(operator => (
                    <option key={operator.operator_id} value={operator.operator_id}>
                      {operator.name} ({operator.operator_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Manager
                </label>
                <select
                  value={formData.property_manager || ''}
                  onChange={(e) => handleInputChange('property_manager', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select property manager</option>
                  {operators.map(operator => (
                    <option key={operator.operator_id} value={operator.operator_id}>
                      {operator.name} ({operator.operator_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built
                </label>
                <Input
                  type="number"
                  value={formData.year_built || ''}
                  onChange={(e) => handleInputChange('year_built', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 2020"
                  min="1800"
                  max={new Date().getFullYear()}
                  className={errors.year_built ? 'border-red-500' : ''}
                />
                {errors.year_built && <p className="text-red-500 text-sm mt-1">{errors.year_built}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Renovation
                </label>
                <Input
                  type="number"
                  value={formData.last_renovation || ''}
                  onChange={(e) => handleInputChange('last_renovation', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 2023"
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => handleInputChange('available', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Building Available for Rent</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Description
              </label>

              {/* Template selection */}
              <div className="mb-2">
                <label className="text-xs text-gray-500 mb-1 block">Quick Templates:</label>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_DESCRIPTION_TEMPLATES.map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleInputChange('building_description', template)}
                      className="px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                    >
                      Template {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={formData.building_description || ''}
                onChange={(e) => handleInputChange('building_description', e.target.value)}
                placeholder="Describe the building, its character, and what makes it special..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={4}
              />
            </div>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address
              </label>
              <AddressAutocomplete
                value={formData.full_address || ''}
                onChange={(value) => handleInputChange('full_address', value)}
                onAddressSelect={handleAddressSelect}
                placeholder="Start typing address for suggestions..."
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Start typing to see address suggestions that auto-fill all location fields
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <Input
                  value={formData.street || ''}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area/Neighborhood
                </label>
                <div className="relative">
                  <Input
                    value={formData.area || ''}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    placeholder="Select or type neighborhood"
                    list="neighborhoods"
                  />
                  <datalist id="neighborhoods">
                    {NEIGHBORHOOD_SUGGESTIONS.map((area) => (
                      <option key={area} value={area} />
                    ))}
                  </datalist>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {NEIGHBORHOOD_SUGGESTIONS.slice(0, 6).map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleInputChange('area', area)}
                      className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <Input
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State or province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code
                </label>
                <Input
                  value={formData.zip || ''}
                  onChange={(e) => handleInputChange('zip', e.target.value)}
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  value={formData.priority || ''}
                  onChange={(e) => handleInputChange('priority', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select priority</option>
                  <option value="1">High Priority</option>
                  <option value="2">Medium Priority</option>
                  <option value="3">Low Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Neighborhood Description
              </label>
              <textarea
                value={formData.neighborhood_description || ''}
                onChange={(e) => handleInputChange('neighborhood_description', e.target.value)}
                placeholder="Describe the neighborhood, local attractions, safety, etc..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nearby Conveniences (Walking Distance)
                </label>

                {/* Quick add buttons */}
                <div className="mb-2">
                  <label className="text-xs text-gray-500 mb-1 block">Quick Add:</label>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_CONVENIENCES.map((convenience) => (
                      <button
                        key={convenience}
                        type="button"
                        onClick={() => {
                          const current = formData.nearby_conveniences_walk || ''
                          const newValue = current ? `${current}, ${convenience}` : convenience
                          handleInputChange('nearby_conveniences_walk', newValue)
                        }}
                        className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                      >
                        + {convenience}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={formData.nearby_conveniences_walk || ''}
                  onChange={(e) => handleInputChange('nearby_conveniences_walk', e.target.value)}
                  placeholder="Click buttons above or type manually..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transportation Options
                </label>

                {/* Quick add buttons */}
                <div className="mb-2">
                  <label className="text-xs text-gray-500 mb-1 block">Quick Add:</label>
                  <div className="flex flex-wrap gap-1">
                    {TRANSPORTATION_OPTIONS.map((transport) => (
                      <button
                        key={transport}
                        type="button"
                        onClick={() => {
                          const current = formData.nearby_transportation || ''
                          const newValue = current ? `${current}, ${transport}` : transport
                          handleInputChange('nearby_transportation', newValue)
                        }}
                        className="px-2 py-0.5 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
                      >
                        + {transport}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={formData.nearby_transportation || ''}
                  onChange={(e) => handleInputChange('nearby_transportation', e.target.value)}
                  placeholder="Click buttons above or type manually..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public Transit Information
              </label>
              <textarea
                value={formData.public_transit_info || ''}
                onChange={(e) => handleInputChange('public_transit_info', e.target.value)}
                placeholder="Detailed public transportation information..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>
        )

      case 'specifications':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Floors
                </label>
                <Input
                  type="number"
                  value={formData.floors || ''}
                  onChange={(e) => handleInputChange('floors', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 5"
                  min="1"
                  className={errors.floors ? 'border-red-500' : ''}
                />
                {errors.floors && <p className="text-red-500 text-sm mt-1">{errors.floors}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Rooms
                </label>
                <Input
                  type="number"
                  value={formData.total_rooms || ''}
                  onChange={(e) => handleInputChange('total_rooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 20"
                  min="1"
                  className={errors.total_rooms ? 'border-red-500' : ''}
                />
                {errors.total_rooms && <p className="text-red-500 text-sm mt-1">{errors.total_rooms}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Bathrooms
                </label>
                <Input
                  type="number"
                  value={formData.total_bathrooms || ''}
                  onChange={(e) => handleInputChange('total_bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 10"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms per Floor
                </label>
                <Input
                  type="number"
                  value={formData.bathrooms_on_each_floor || ''}
                  onChange={(e) => handleInputChange('bathrooms_on_each_floor', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 2"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Lease Term (months)
                </label>
                <select
                  value={formData.min_lease_term || ''}
                  onChange={(e) => handleInputChange('min_lease_term', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select lease term</option>
                  {LEASE_TERM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Min Lease (months)
                </label>
                <select
                  value={formData.pref_min_lease_term || ''}
                  onChange={(e) => handleInputChange('pref_min_lease_term', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select preferred term</option>
                  {LEASE_TERM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Common Kitchen Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {COMMON_KITCHEN_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                      formData.common_kitchen === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('common_kitchen', option.value)}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Common Area Description
              </label>
              <textarea
                value={formData.common_area || ''}
                onChange={(e) => handleInputChange('common_area', e.target.value)}
                placeholder="Describe common areas like lounges, study rooms, etc..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cleaning of Common Spaces
              </label>
              <select
                value={formData.cleaning_common_spaces || ''}
                onChange={(e) => handleInputChange('cleaning_common_spaces', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select cleaning schedule</option>
                {CLEANING_SCHEDULE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      case 'amenities':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: 'wifi_included', label: 'WiFi Included', icon: '📶' },
                { key: 'laundry_onsite', label: 'Laundry On-Site', icon: '🧺' },
                { key: 'secure_access', label: 'Secure Access', icon: '🔐' },
                { key: 'bike_storage', label: 'Bike Storage', icon: '🚲' },
                { key: 'rooftop_access', label: 'Rooftop Access', icon: '🏙️' },
                { key: 'utilities_included', label: 'Utilities Included', icon: '💡' },
                { key: 'fitness_area', label: 'Fitness Area', icon: '💪' },
                { key: 'work_study_area', label: 'Work/Study Area', icon: '📚' },
                { key: 'social_events', label: 'Social Events', icon: '🎉' },
                { key: 'disability_access', label: 'Disability Access', icon: '♿' }
              ].map((amenity) => (
                <label key={amenity.key} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData[amenity.key as keyof BuildingFormData] as boolean}
                    onChange={(e) => handleInputChange(amenity.key as keyof BuildingFormData, e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-lg">{amenity.icon}</span>
                  <span className="text-sm font-medium">{amenity.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Policy
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PET_FRIENDLY_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                      formData.pet_friendly === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('pet_friendly', option.value)}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progressive Disclosure: Show disability features only if accessibility is enabled */}
            <AnimatePresence>
              {formData.disability_access && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      🦽 Accessibility Features
                    </label>
                    <textarea
                      value={formData.disability_features || ''}
                      onChange={(e) => handleInputChange('disability_features', e.target.value)}
                      placeholder="Describe accessibility features (ramps, elevators, wide doorways, accessible bathrooms, etc.)..."
                      className="w-full p-3 border border-blue-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      rows={3}
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      💡 Detailed accessibility information helps tenants with specific needs
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Security Features
              </label>
              <textarea
                value={formData.security_features || ''}
                onChange={(e) => handleInputChange('security_features', e.target.value)}
                placeholder="Security cameras, keycard access, security guard, etc..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parking Information
              </label>
              <textarea
                value={formData.parking_info || ''}
                onChange={(e) => handleInputChange('parking_info', e.target.value)}
                placeholder="Available parking spaces, costs, restrictions..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
          </div>
        )

      case 'policies':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Rules & Policies
              </label>
              <textarea
                value={formData.building_rules || ''}
                onChange={(e) => handleInputChange('building_rules', e.target.value)}
                placeholder="Quiet hours, guest policies, smoking rules, etc..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={6}
              />
            </div>
          </div>
        )

      case 'media':
        return (
          <MediaUploadSection
            virtualTourUrl={formData.virtual_tour_url}
            uploadedFiles={mediaFiles}
            onVirtualTourUrlChange={(url) => handleInputChange('virtual_tour_url', url)}
            onFilesChange={setMediaFiles}
          />
        )

      default:
        return <div>Step content for {steps[currentStep].title}</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Building className="w-4 h-4" />
            Building Configuration
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-blue-900 bg-clip-text text-transparent mb-3">
            {initialData?.building_id ? 'Edit Building' : 'Add New Building'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Configure building details, amenities, and policies with our comprehensive multi-step form
          </p>
          <div className="flex items-center justify-center mt-4">
            <StatusBadge
              status={formData.available ? 'AVAILABLE' : 'UNAVAILABLE'}
              variant="large"
              icon={formData.available ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
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

        {/* Copy from Previous */}
        <CopyFromPrevious
          formType="building"
          onCopyData={handleCopyFromPrevious}
        />

        <form onSubmit={handleSubmit}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <EnhancedCard variant="premium" className="p-8 premium-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg text-white">
                  {steps[currentStep].icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h2>
                <div className="ml-auto">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
              disabled={currentStep === 0}
              className={`px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                currentStep === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-gray-400 hover:bg-gray-50'
              }`}
              whileHover={currentStep !== 0 ? { scale: 1.02 } : {}}
              whileTap={currentStep !== 0 ? { scale: 0.98 } : {}}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </motion.button>

            <div className="flex items-center gap-4">
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

              {currentStep === steps.length - 1 ? (
                <motion.button
                  type="submit"
                  disabled={isLoading || Object.keys(errors).length > 0}
                  className={`px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
                    isLoading || Object.keys(errors).length > 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-emerald-700 hover:to-blue-700'
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
                      {initialData?.building_id ? 'Update Building' : 'Create Building'}
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
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
