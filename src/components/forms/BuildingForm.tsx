'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EnhancedCard, EnhancedInput, EnhancedSelect, QuickSelectButtons, StatusBadge, ProgressIndicator } from '@/components/ui/enhanced-components'
import AddressAutocomplete, { AddressData } from '@/components/ui/AddressAutocomplete'
import CopyFromPrevious from '@/components/ui/CopyFromPrevious'
import WalkScoreDisplay from '@/components/ui/WalkScoreDisplay'
import GoogleDrivePicker from '@/components/ui/GoogleDrivePicker'
import { useFormSmartDefaults } from '@/hooks/useSmartDefaults'
import { useFormStepNavigation } from '@/hooks/useFormStepNavigation'
import { useAutoWalkScore } from '@/hooks/useWalkScore'
import { BuildingFormData, MediaFile, WalkScoreData } from '@/types'
import { 
  validateBuildingFormData, 
  transformBuildingDataForBackend, 
  BACKEND_ENUMS,
  ValidationResult,
  validatePhoneFormatStrict,
  validateEmailFormatStrict
} from '@/lib/backend-sync'
import { MediaUploadSection } from './MediaUploadSection'
import { ValidationSummary } from './ValidationSummary'
import OperatorDrawer from './OperatorDrawer'
import { createFormDataWithFiles } from '@/utils/fileUpload'
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
  Accessibility,
  AlertCircle,
  UserPlus
} from 'lucide-react'
import '@/styles/design-system.css'

interface BuildingFormProps {
  initialData?: Partial<BuildingFormData>
  onSubmit: (data: any) => Promise<void>  // Accept any data type for backend compatibility
  onCancel?: () => void
  isLoading?: boolean
  operators?: Array<{ operator_id: number; name: string; operator_type: string }>
}

const PET_FRIENDLY_OPTIONS = [
  { value: 'NO_PETS', label: 'No Pets Allowed', icon: '🚫' },
  { value: 'ESA_ONLY', label: 'Only ESA Allowed', icon: '🐕' },
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

const NEIGHBORHOOD_SUGGESTIONS = [
  'University District', 'Downtown Core', 'Arts District', 'Financial District',
  'Historic Downtown', 'Tech Corridor', 'Shopping District', 'Waterfront',
  'Uptown', 'Midtown', 'Old Town', 'Business District'
]

const COMMON_CONVENIENCES = [
  'Grocery stores', 'Restaurants', 'Coffee shops', 'Banks/ATMs',
  'Pharmacies', 'Post office', 'Gym/Fitness center', 'Shopping mall',
  'Libraries', 'Parks', 'Entertainment venues', 'Medical facilities'
]

const TRANSPORTATION_OPTIONS = [
  'Bus stop', 'Subway/Metro station', 'Light rail', 'Train station',
  'Bike lanes', 'Car sharing', 'Taxi stand', 'Uber/Lyft pickup',
  'Airport shuttle', 'Ferry terminal', 'Highway access', 'Parking garage'
]


export default function BuildingForm({ initialData, onSubmit, onCancel, isLoading, operators = [] }: BuildingFormProps) {
  const { getSmartDefaults, saveToHistory } = useFormSmartDefaults('building')
  const smartDefaults = getSmartDefaults()
  
  // Determine if we're in edit mode based on initial data
  const isEditMode = !!initialData?.building_id

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
    building_id: initialData?.building_id || `BLD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
    building_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA', // Default country
    operator_id: undefined, // Initialize as undefined instead of empty string
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
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [fileValidationErrors, setFileValidationErrors] = useState<Array<{ file: File; error: string }>>([])
  const [amenitiesDetails, setAmenitiesDetails] = useState(() => {
    if (!initialData?.amenities_details) return {}
    
    if (typeof initialData.amenities_details === 'string') {
      try {
        return JSON.parse(initialData.amenities_details)
      } catch (error) {
        console.warn('Failed to parse amenities_details JSON:', error)
        return {}
      }
    }
    
    return initialData.amenities_details
  })
  
  // Contact information structure for better data organization
  const [contactInfo, setContactInfo] = useState(() => {
    const defaults = {
      office_phone: '',
      emergency_phone: '',
      leasing_email: '',
      maintenance_email: '',
      office_hours: ''
    }
    
    if (!initialData?.contact_info) return defaults
    
    if (typeof initialData.contact_info === 'string') {
      try {
        return { ...defaults, ...JSON.parse(initialData.contact_info) }
      } catch (error) {
        console.warn('Failed to parse contact_info JSON:', error)
        return defaults
      }
    }
    
    return { ...defaults, ...initialData.contact_info }
  })
  
  // Amenities array for better JSON structure compatibility
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    if (!initialData?.amenities) return []
    
    if (Array.isArray(initialData.amenities)) {
      return initialData.amenities
    }
    
    if (typeof initialData.amenities === 'string') {
      try {
        const parsed = JSON.parse(initialData.amenities)
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {
        console.warn('Failed to parse amenities JSON:', error)
        return []
      }
    }
    
    return []
  })
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(
    initialData?.media_files || []
  )

  // Categorized media state for new upload system
  const [categorizedMedia, setCategorizedMedia] = useState<{
    outside: MediaFile[]
    common_areas: MediaFile[]
    amenities: MediaFile[]
    kitchen_bathrooms: MediaFile[]
    videos: MediaFile[]
  }>({
    outside: [],
    common_areas: [],
    amenities: [],
    kitchen_bathrooms: [],
    videos: []
  })

  // Drag-drop state for image upload zones
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null)

  // Drag-to-reorder state for uploaded images
  const [draggedImage, setDraggedImage] = useState<{ category: string; index: number } | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // State for inline operator creation
  const [isOperatorDrawerOpen, setIsOperatorDrawerOpen] = useState(false)
  const [localOperators, setLocalOperators] = useState(operators)

  // Update local operators when prop changes
  useEffect(() => {
    setLocalOperators(operators)
  }, [operators])

  // Handle new operator created from drawer
  const handleOperatorCreated = (newOperator: any) => {
    setLocalOperators(prev => [...prev, {
      operator_id: newOperator.operator_id,
      name: newOperator.name,
      operator_type: newOperator.operator_type
    }])
    // Auto-select the newly created operator as building manager
    handleInputChange('operator_id', newOperator.operator_id)
  }

  // WalkScore integration - auto-fetch when address is complete
  const {
    data: walkScoreData,
    isLoading: walkScoreLoading,
    error: walkScoreError,
    retry: retryWalkScore,
    isAddressComplete: hasCompleteAddress
  } = useAutoWalkScore({
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zip: formData.zip_code,
    enabled: true,
    debounceMs: 1500 // Wait 1.5s after last keystroke
  })

  // Store WalkScore data in form when fetched
  useEffect(() => {
    if (walkScoreData && walkScoreData.status === 'success') {
      // Store as JSON string for backend compatibility
      handleInputChange('walkscore_data', JSON.stringify(walkScoreData))

      // Also update nearby_conveniences_walk and nearby_transportation for backward compatibility
      const amenitiesSummary = Object.entries(walkScoreData.nearby_amenities)
        .filter(([_, items]) => items.length > 0)
        .map(([category, items]) => `${category}: ${items.map(i => i.name).join(', ')}`)
        .join('; ')

      const transitSummary = walkScoreData.transit_options
        .map(t => `${t.name} (${t.distance} mi)`)
        .join(', ')

      if (amenitiesSummary) {
        handleInputChange('nearby_conveniences_walk', amenitiesSummary)
      }
      if (transitSummary) {
        handleInputChange('nearby_transportation', transitSummary)
      }
    }
  }, [walkScoreData])

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: <Building className="w-5 h-5" /> },
    { id: 'location', title: 'Location & Address', icon: <MapPin className="w-5 h-5" /> },
    { id: 'specifications', title: 'Building Specs', icon: <Ruler className="w-5 h-5" /> },
    { id: 'amenities', title: 'Amenities & Features', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'media', title: 'Images & Tours', icon: <Camera className="w-5 h-5" /> }
  ]

  // Use form step navigation hook
  const { currentStep, nextStep, prevStep, goToStep, resetSteps, canGoNext, canGoPrev } = useFormStepNavigation({
    totalSteps: steps.length
  })

  // Comprehensive validation using backend-sync utilities
  const validateField = (field: string, value: any): string | null => {
    // Use comprehensive backend validation
    const validationResult = validateBuildingFormData(formData)
    
    // Return specific field error if exists
    if (validationResult.errors[field]) {
      return validationResult.errors[field]
    }
    
    // Additional real-time validations for UX
    switch (field) {
      case 'building_name':
        return !value?.trim() ? 'Building name is required' : null
      case 'year_built':
        if (value && (value < 1800 || value > new Date().getFullYear())) {
          return 'Please enter a valid year'
        }
        return null
      case 'floors':
        return value && value < 1 ? 'Building must have at least 1 floor' : null
      case 'total_rooms':
        return value && value < 1 ? 'Building must have at least 1 room' : null
      case 'operator_id':
        if (!value) return 'Operator selection is required'
        return null
      default:
        return null
    }
  }

  // Use comprehensive backend validation
  const validateAllFields = (): ValidationResult => {
    // Create the data object that will be sent to backend
    const dataForValidation = {
      ...formData,
      amenities_details: JSON.stringify(amenitiesDetails),
      categorized_media: categorizedMedia
    }
    
    const result = validateBuildingFormData(dataForValidation)
    
    // Debug specific validation issues
    if (!result.isValid || result.missingRequired.length > 0) {
      console.log('🔍 Validation Details:', {
        formData: dataForValidation,
        transformedData: transformBuildingDataForBackend(dataForValidation),
        missingRequired: result.missingRequired,
        errors: result.errors
      })
    }
    
    return result
  }

  // Real-time validation only for touched fields
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    touchedFields.forEach(field => {
      const error = validateField(field, formData[field as keyof BuildingFormData])
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
  }, [formData, touchedFields])

  // Prevent accidental browser navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep > 0 || Object.keys(formData).some(key => formData[key as keyof BuildingFormData])) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentStep, formData])

  const handleInputChange = (field: keyof BuildingFormData, value: any) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value }
      
      // Real-time validation with updated data
      validateFieldInRealTime(field, value, updatedData)
      
      return updatedData
    })
    
    // Mark field as touched when user interacts with it
    setTouchedFields(prev => new Set([...prev, field]))
  }

  // Real-time validation function
  const validateFieldInRealTime = (field: keyof BuildingFormData, value: any, updatedData: BuildingFormData) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      
      // Check if the field is now valid and remove error if so
      switch (field) {
        case 'building_name':
          if (value?.trim()) {
            delete newErrors.building_name
          } else {
            newErrors.building_name = 'Building name is required'
          }
          break
          
        case 'address':
        case 'full_address':
        case 'street':
          // If any address field has value, clear street error (database field)
          if (updatedData.address?.trim() || updatedData.full_address?.trim() || updatedData.street?.trim()) {
            delete newErrors.street
            delete newErrors.address // Clear legacy error too
          } else {
            newErrors.street = 'Street address is required'
          }
          break
          
        case 'city':
          if (value?.trim()) {
            delete newErrors.city
          } else {
            newErrors.city = 'City is required'
          }
          break
          
        case 'state':
          if (value?.trim()) {
            delete newErrors.state
          } else {
            newErrors.state = 'State is required'
          }
          break
          
        case 'zip_code':
        case 'zip':
          // If any zip field has value, clear zip error (database field)
          if (updatedData.zip_code?.trim() || updatedData.zip?.trim()) {
            delete newErrors.zip
            delete newErrors.zip_code // Clear legacy error too
          } else {
            newErrors.zip = 'ZIP code is required'
          }
          break
          
      }
      
      return newErrors
    })
  }

  // Prevent Enter key from submitting form when not on final step
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep !== steps.length - 1) {
      e.preventDefault()
    }
  }

  const handleAddressSelect = (addressData: AddressData) => {
    console.log('📍 Address selected:', addressData)

    setFormData(prev => {
      const updatedData = {
        ...prev,
        full_address: addressData.fullAddress,
        address: addressData.street, // Map to address field for validation
        street: addressData.street, // Keep for compatibility
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zip, // Map to zip_code field for validation
        zip: addressData.zip, // Keep for compatibility
        // Auto-fill neighborhood from Google Places if available
        area: addressData.neighborhood || addressData.sublocality || prev.area || ''
      }

      // Clear all address-related validation errors
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors }
        delete newErrors.street
        delete newErrors.address // Clear legacy error too
        delete newErrors.city
        delete newErrors.state
        delete newErrors.zip
        delete newErrors.zip_code // Clear legacy error too
        return newErrors
      })

      return updatedData
    })

    // Show success feedback with neighborhood info
    const neighborhoodInfo = addressData.neighborhood
      ? ` | Neighborhood: ${addressData.neighborhood}`
      : ''

    import('@/lib/error-handler').then(({ showSuccessMessage }) => {
      showSuccessMessage(
        'Address Auto-filled! ✅',
        `All location fields populated: ${addressData.street}, ${addressData.city}, ${addressData.state}${neighborhoodInfo}`,
        { duration: 3000 }
      )
    })
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
  
  // Handler for contact info changes with validation
  const handleContactInfoChange = (field: string, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear errors when user starts typing
    if (errors[`contact_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`contact_${field}`]
        return newErrors
      })
    }
    
    // Real-time validation for phone and email fields
    if (field.includes('phone') && value.trim()) {
      const phoneValidation = validatePhoneFormatStrict(value)
      if (!phoneValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          [`contact_${field}`]: phoneValidation.error || 'Invalid phone number format'
        }))
      }
    } else if (field.includes('email') && value.trim()) {
      const emailValidation = validateEmailFormatStrict(value)
      if (!emailValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          [`contact_${field}`]: emailValidation.error || 'Invalid email format'
        }))
      }
    }
  }
  
  // Handler for amenity selection with improved JSON structure
  const handleAmenityToggle = (amenityKey: string, amenityLabel: string) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenityLabel)) {
        return prev.filter(a => a !== amenityLabel)
      } else {
        return [...prev, amenityLabel]
      }
    })
    
    // Also update boolean field for backward compatibility
    const currentValue = formData[amenityKey as keyof BuildingFormData] as boolean
    handleInputChange(amenityKey as keyof BuildingFormData, !currentValue)
  }

  // Categorized media handlers
  const handleCategorizedImageUpload = (e: React.ChangeEvent<HTMLInputElement>, category: keyof typeof categorizedMedia) => {
    const files = Array.from(e.target.files || [])
    
    // Clear previous image validation errors for this category when new files are selected
    clearImageValidationErrors(category)
    
    if (files.length === 0) {
      // User cancelled file selection, errors already cleared above
      return
    }

    // Validate image files
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
    const validFiles: File[] = []
    const newErrors: Array<{ file: File; error: string }> = []

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        newErrors.push({
          file,
          error: 'Only image files are allowed in this section'
        })
      } else if (file.size > MAX_IMAGE_SIZE) {
        newErrors.push({
          file,
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds maximum allowed size (10 MB)`
        })
      } else {
        validFiles.push(file)
      }
    })

    // Update file validation errors if any
    if (newErrors.length > 0) {
      setFileValidationErrors(prev => [...prev, ...newErrors])
      
      // Show user-friendly error message
      import('@/lib/error-handler').then(({ showWarningMessage }) => {
        showWarningMessage(
          'Image Upload Error',
          newErrors.map(err => `${err.file.name}: ${err.error}`).join('\n'),
          { duration: 6000 }
        )
      })
      
      // Reset the file input to allow immediate retry
      resetImageInput(e.target)
    }

    // Only process valid files
    if (validFiles.length === 0) {
      // Reset the file input since no valid files were processed
      resetImageInput(e.target)
      return
    }

    // Create MediaFile objects with category tagging
    const mediaFilePromises = validFiles.map(async (file) => {
      return new Promise<MediaFile>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            id: `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            preview: reader.result as string,
            category: 'building_image',
            metadata: { category, tag: category }
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(mediaFilePromises).then((newFiles) => {
      if (category === 'videos') return // Videos handled separately

      setCategorizedMedia(prev => ({
        ...prev,
        [category]: [...prev[category], ...newFiles]
      }))

      // Reset the file input after successful upload
      resetImageInput(e.target)
    })
  }

  // Drag-drop handlers for image upload zones
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, category: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCategory(category)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, category: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCategory(category)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Only clear if we're actually leaving the drop zone (not entering a child)
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!e.currentTarget.contains(relatedTarget)) {
      setDragOverCategory(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, category: keyof typeof categorizedMedia) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCategory(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Clear previous image validation errors for this category
    clearImageValidationErrors(category)

    // Validate image files
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
    const validFiles: File[] = []
    const newErrors: Array<{ file: File; error: string }> = []

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        newErrors.push({
          file,
          error: 'Only image files are allowed in this section'
        })
      } else if (file.size > MAX_IMAGE_SIZE) {
        newErrors.push({
          file,
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds maximum allowed size (10 MB)`
        })
      } else {
        validFiles.push(file)
      }
    })

    // Update file validation errors if any
    if (newErrors.length > 0) {
      setFileValidationErrors(prev => [...prev, ...newErrors])

      // Show user-friendly error message
      import('@/lib/error-handler').then(({ showWarningMessage }) => {
        showWarningMessage(
          'Image Upload Error',
          newErrors.map(err => `${err.file.name}: ${err.error}`).join('\n'),
          { duration: 6000 }
        )
      })
    }

    // Only process valid files
    if (validFiles.length === 0) return

    // Create MediaFile objects with category tagging
    const mediaFilePromises = validFiles.map(async (file) => {
      return new Promise<MediaFile>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            id: `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            preview: reader.result as string,
            category: 'building_image',
            metadata: { category, tag: category }
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(mediaFilePromises).then((newFiles) => {
      setCategorizedMedia(prev => ({
        ...prev,
        [category]: [...prev[category], ...newFiles]
      }))
    })
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Clear previous video validation errors when new files are selected or cancelled
    clearVideoValidationErrors()
    
    if (files.length === 0) {
      // User cancelled file selection, errors already cleared above
      return
    }

    // Limit to 3 videos total
    const currentVideoCount = categorizedMedia.videos.length
    const availableSlots = 3 - currentVideoCount
    const filesToProcess = files.slice(0, availableSlots)

    // Validate video files
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB
    const validFiles: File[] = []
    const newErrors: Array<{ file: File; error: string }> = []

    filesToProcess.forEach(file => {
      if (file.size > MAX_VIDEO_SIZE) {
        newErrors.push({
          file,
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds maximum allowed size (500 MB)`
        })
      } else {
        validFiles.push(file)
      }
    })

    // Update file validation errors
    if (newErrors.length > 0) {
      setFileValidationErrors(prev => [...prev, ...newErrors])
      
      // Show user-friendly error message
      import('@/lib/error-handler').then(({ showWarningMessage }) => {
        showWarningMessage(
          'Video Upload Error',
          newErrors.map(err => `${err.file.name}: ${err.error}`).join('\n'),
          { duration: 8000 }
        )
      })
      
      // Reset the file input to allow immediate retry
      resetVideoInput(e.target)
    }

    // Only process valid files
    if (validFiles.length === 0) {
      // Reset the file input since no valid files were processed
      resetVideoInput(e.target)
      return
    }

    const mediaFilePromises = validFiles.map(async (file) => {
      return new Promise<MediaFile>((resolve) => {
        resolve({
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
          preview: '', // Videos don't need preview URLs
          category: 'building_video',
          metadata: { category: 'videos', tag: 'video' }
        })
      })
    })

    Promise.all(mediaFilePromises).then((newFiles) => {
      setCategorizedMedia(prev => ({
        ...prev,
        videos: [...prev.videos, ...newFiles]
      }))

      // Reset the file input after successful upload
      resetVideoInput(e.target)
    })
  }

  // Video drag-drop handler
  const handleVideoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCategory(null)

    // Check if we've already reached the video limit
    if (categorizedMedia.videos.length >= 3) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Clear previous video validation errors
    clearVideoValidationErrors()

    // Limit to remaining available slots
    const availableSlots = 3 - categorizedMedia.videos.length
    const filesToProcess = files.slice(0, availableSlots)

    // Validate video files
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB
    const validFiles: File[] = []
    const newErrors: Array<{ file: File; error: string }> = []

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('video/')) {
        newErrors.push({
          file,
          error: 'Only video files are allowed in this section'
        })
      } else if (file.size > MAX_VIDEO_SIZE) {
        newErrors.push({
          file,
          error: `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds maximum allowed size (500 MB)`
        })
      } else {
        validFiles.push(file)
      }
    })

    // Update file validation errors if any
    if (newErrors.length > 0) {
      setFileValidationErrors(prev => [...prev, ...newErrors])

      // Show user-friendly error message
      import('@/lib/error-handler').then(({ showWarningMessage }) => {
        showWarningMessage(
          'Video Upload Error',
          newErrors.map(err => `${err.file.name}: ${err.error}`).join('\n'),
          { duration: 8000 }
        )
      })
    }

    // Only process valid files
    if (validFiles.length === 0) return

    const mediaFilePromises = validFiles.map(async (file) => {
      return new Promise<MediaFile>((resolve) => {
        resolve({
          id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
          preview: '',
          category: 'building_video',
          metadata: { category: 'videos', tag: 'video' }
        })
      })
    })

    Promise.all(mediaFilePromises).then((newFiles) => {
      setCategorizedMedia(prev => ({
        ...prev,
        videos: [...prev.videos, ...newFiles]
      }))
    })
  }

  // Helper function to clear video validation errors
  const clearVideoValidationErrors = () => {
    setFileValidationErrors(prev => 
      prev.filter(err => !err.file.type.startsWith('video/'))
    )
  }

  // Helper function to clear image validation errors for a specific category
  const clearImageValidationErrors = (category: keyof typeof categorizedMedia) => {
    setFileValidationErrors(prev => 
      prev.filter(err => {
        // Keep errors that are not images or not from the current category
        return !err.file.type.startsWith('image/') || 
               !err.file.name.includes(category) // Simple check, could be improved with metadata
      })
    )
  }

  // Helper function to reset video file input
  const resetVideoInput = (input: HTMLInputElement) => {
    input.value = ''
  }

  // Helper function to reset image file input
  const resetImageInput = (input: HTMLInputElement) => {
    input.value = ''
  }

  // Handle files imported from Google Drive
  const handleGoogleDriveFiles = async (files: File[], category: keyof typeof categorizedMedia) => {
    const isVideoCategory = category === 'videos'
    const MAX_SIZE = isVideoCategory ? 500 * 1024 * 1024 : 10 * 1024 * 1024
    const validFiles: File[] = []

    files.forEach(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')

      if (isVideoCategory && !isVideo) {
        return // Skip non-video files in video category
      } else if (!isVideoCategory && !isImage) {
        return // Skip non-image files in image category
      } else if (file.size > MAX_SIZE) {
        return // Skip files that are too large
      } else {
        validFiles.push(file)
      }
    })

    if (validFiles.length === 0) return

    // Create MediaFile objects
    const mediaFilePromises = validFiles.map(async (file) => {
      return new Promise<MediaFile>((resolve) => {
        if (isVideoCategory) {
          resolve({
            id: `video_gdrive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            file: file,
            preview: '',
            category: 'building_video',
            metadata: { category: 'videos', tag: 'video', source: 'google_drive' }
          })
        } else {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              id: `${category}_gdrive_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type: file.type,
              size: file.size,
              file: file,
              preview: reader.result as string,
              category: 'building_image',
              metadata: { category, tag: category, source: 'google_drive' }
            })
          }
          reader.readAsDataURL(file)
        }
      })
    })

    const newFiles = await Promise.all(mediaFilePromises)

    // For videos, check max limit
    if (isVideoCategory) {
      const availableSlots = 3 - categorizedMedia.videos.length
      const filesToAdd = newFiles.slice(0, availableSlots)
      setCategorizedMedia(prev => ({ ...prev, videos: [...prev.videos, ...filesToAdd] }))
    } else {
      setCategorizedMedia(prev => ({ ...prev, [category]: [...prev[category], ...newFiles] }))
    }
  }

  const removeMedia = (category: keyof typeof categorizedMedia, fileId: string) => {
    setCategorizedMedia(prev => ({
      ...prev,
      [category]: prev[category].filter(file => file.id !== fileId)
    }))

    // Also remove any validation errors for this file
    const removedFile = categorizedMedia[category].find(file => file.id === fileId)
    if (removedFile) {
      setFileValidationErrors(prev =>
        prev.filter(err => err.file.name !== removedFile.name)
      )
    }
  }

  // Reorder images within a category
  const reorderImages = (category: keyof typeof categorizedMedia, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setCategorizedMedia(prev => {
      const images = [...prev[category]]
      const [movedImage] = images.splice(fromIndex, 1)
      images.splice(toIndex, 0, movedImage)
      return { ...prev, [category]: images }
    })
  }

  // Drag handlers for reordering images
  const handleImageDragStart = (e: React.DragEvent<HTMLDivElement>, category: string, index: number) => {
    setDraggedImage({ category, index })
    e.dataTransfer.effectAllowed = 'move'
    // Add a visual cue
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleImageDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedImage(null)
    setDragOverIndex(null)
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleImageDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>, category: keyof typeof categorizedMedia, toIndex: number) => {
    e.preventDefault()
    if (draggedImage && draggedImage.category === category) {
      reorderImages(category, draggedImage.index, toIndex)
    }
    setDraggedImage(null)
    setDragOverIndex(null)
  }

  const renderImagePreview = (category: keyof typeof categorizedMedia) => {
    if (category === 'videos') return null

    const images = categorizedMedia[category]
    if (images.length === 0) return null

    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {images.map((file, index) => (
          <div
            key={file.id}
            draggable
            onDragStart={(e) => handleImageDragStart(e, category, index)}
            onDragEnd={handleImageDragEnd}
            onDragOver={(e) => handleImageDragOver(e, index)}
            onDragLeave={handleImageDragLeave}
            onDrop={(e) => handleImageDrop(e, category, index)}
            className={`relative cursor-grab active:cursor-grabbing transition-all duration-200 ${
              draggedImage?.category === category && dragOverIndex === index
                ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
                : ''
            } ${
              draggedImage?.category === category && draggedImage?.index === index
                ? 'opacity-50'
                : ''
            }`}
          >
            <img
              src={file.preview}
              alt={file.name}
              className="w-full h-20 object-cover rounded border pointer-events-none"
            />
            <button
              type="button"
              onClick={() => removeMedia(category, file.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
            >
              <X className="w-3 h-3" />
            </button>
            {/* Drag handle indicator */}
            <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white rounded px-1 py-0.5 text-xs flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
              </svg>
              {index + 1}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
              {file.name}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderVideoPreview = () => {
    const videos = categorizedMedia.videos
    if (videos.length === 0) return null

    return (
      <div className="mt-4 space-y-2">
        {videos.map((file) => (
          <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
            <button
              type="button"
              onClick={() => removeMedia('videos', file.id)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only allow submission on the final step
    if (currentStep !== steps.length - 1) {
      console.warn(`Form submission blocked - not on final step. Current step: ${currentStep + 1}, Final step: ${steps.length}`)
      return
    }

    // Comprehensive validation using backend-sync utilities
    const validationResult = validateAllFields()
    
    // Debug logging
    console.log('🔍 Validation Debug:', {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      missingRequired: validationResult.missingRequired,
      formData: formData
    })
    
    // Set form errors
    setErrors(validationResult.errors)

    // Mark all fields as touched to show validation errors
    const allFieldNames = Object.keys(formData)
    setTouchedFields(new Set(allFieldNames))

    // Show missing required fields error
    if (validationResult.missingRequired.length > 0) {
      const missingFieldNames = validationResult.missingRequired.join(', ')
      console.error('❌ Missing required fields:', missingFieldNames)
      import('@/lib/error-handler').then(({ showWarningMessage }) => {
        showWarningMessage(
          'Required Fields Missing',
          `Please complete all required fields: ${missingFieldNames}`,
          { duration: 6000 }
        )
      })
      return
    }

    // Show validation errors
    if (!validationResult.isValid) {
      console.error('❌ Validation errors:', validationResult.errors)
      
      // Set validation attempted to show summary
      setValidationAttempted(true)
      
      // Scroll to validation summary at top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Find which step contains the first error
      const errorFields = Object.keys(validationResult.errors)
      let errorStepIndex = currentStep
      
      if (errorFields.some(field => ['building_name', 'operator_id'].includes(field))) {
        errorStepIndex = 0 // Basic Information
      } else if (errorFields.some(field => ['address', 'city', 'state', 'zip_code'].includes(field))) {
        errorStepIndex = 1 // Location & Address
      } else if (errorFields.some(field => ['floors', 'total_rooms'].includes(field))) {
        errorStepIndex = 2 // Building Specs
      }
      
      // Navigate to the step with the first error if not already there
      if (errorStepIndex !== currentStep) {
        goToStep(errorStepIndex)
      }
      
      return
    }

    // Check for file validation errors
    if (fileValidationErrors.length > 0) {
      // Set validation attempted to show summary
      setValidationAttempted(true)
      
      // Scroll to validation summary at top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      return
    }

    try {
      // Transform data to match backend expectations with enhanced JSON structures
      const backendData = transformBuildingDataForBackend({
        ...formData,
        amenities: selectedAmenities, // Structured amenities array
        amenities_details: JSON.stringify(amenitiesDetails),
        contact_info: JSON.stringify(contactInfo), // Structured contact information
        media_files: mediaFiles,
        categorized_media: categorizedMedia
      })
      
      console.log('🔍 Form data before transform:', formData)
      console.log('🏢 Building ID in form data:', formData.building_id)
      console.log('🚀 Submitting transformed building data:', backendData)
      console.log('🏢 Building ID in transformed data:', backendData.building_id)

      // Save to history for smart defaults (excluding media files for storage efficiency)
      const historyData = { ...backendData }
      // Note: media_files is not included in backendData from transformBuildingDataForBackend
      saveToHistory(historyData)

      // NEW BACKEND: Two-step process (create/update building, then upload images)
      
      console.log(isEditMode ? '🏢 Step 1: Updating building without images...' : '🏢 Step 1: Creating building without images...')
      // First, create/update building (JSON only, no images)
      const buildingResponse = await onSubmit(backendData)
      
      // Check if submission was successful
      const response = buildingResponse as any
      if (!response || !response.success) {
        console.error('❌ Building submission failed:', response)
        
        // Handle validation errors
        if (response?.validationErrors) {
          setErrors(response.validationErrors)
          console.error('Validation errors:', response.validationErrors)
          return // Stop here - don't proceed with image upload
        }
        
        // Handle other errors
        if (response?.error) {
          console.error('Submission error:', response.error)
          return // Stop here
        }
        
        console.error('Unknown submission failure')
        return
      }
      
      // Extract building_id from successful response
      // In edit mode, building_id might be in the initial data or backend data
      const buildingId = response.data?.building_id || initialData?.building_id || backendData.building_id
      
      if (!buildingId) {
        console.error('❌ No building ID found for image upload')
        import('@/lib/error-handler').then(({ showWarningMessage }) => {
          showWarningMessage(
            'Image Upload Issue',
            'Building was saved but images could not be uploaded. Please try uploading images again.'
          )
        })
        return
      }
      
      console.log(isEditMode ? `✅ Building updated successfully with ID: ${buildingId}` : `✅ Building created successfully with ID: ${buildingId}`)
      
      // Step 2: Upload categorized media to Supabase
      const hasMedia = Object.values(categorizedMedia).some(arr => arr.length > 0)
      if (hasMedia) {
        console.log(`📸 Step 2: Uploading categorized media to Supabase...`)

        try {
          // Import upload functions
          const { uploadBuildingImages, uploadBuildingVideo } = await import('@/lib/supabase/storage')

          const uploadedImageUrls: string[] = []
          const categorizedUrls: Record<string, string[]> = {
            outside: [],
            common_areas: [],
            amenities: [],
            kitchen_bathrooms: [],
            videos: []
          }

          // Import metadata utilities
          const { generateStoragePath, createImageMetadata } = await import('@/lib/supabase/image-metadata')
          const imageMetadataArray: any[] = []

          // Upload images by category with proper folder structure
          for (const [category, files] of Object.entries(categorizedMedia)) {
            if (category === 'videos') continue // Handle videos separately
            
            const categoryFiles = files as MediaFile[]
            if (categoryFiles.length > 0) {
              console.log(`📸 Uploading ${categoryFiles.length} ${category} images...`)
              
              // Create files with categorized storage paths
              const filesWithPaths = categoryFiles.map((f, index) => {
                const storagePath = generateStoragePath(buildingId, category, f.file.name)
                return {
                  file: f.file,
                  storagePath,
                  originalMetadata: f,
                  sortOrder: index
                }
              })
              
              // Upload with custom paths
              const uploadPromises = filesWithPaths.map(async ({ file, storagePath, originalMetadata, sortOrder }) => {
                try {
                  console.log(`📤 Uploading ${file.name} to ${storagePath}...`)
                  const { uploadFile } = await import('@/lib/supabase/storage')
                  const result = await uploadFile({
                    bucket: 'BUILDING_IMAGES',
                    path: storagePath,
                    file,
                    metadata: {
                      category,
                      building_id: buildingId,
                      original_name: file.name,
                      uploaded_at: new Date().toISOString()
                    }
                  })
                  
                  if (!result.success) {
                    console.error(`❌ Failed to upload ${file.name}:`, result.error)
                    return result
                  }
                  
                  if (result.success && result.url) {
                    // Create detailed metadata
                    const imageMetadata = createImageMetadata(
                      buildingId,
                      category as any,
                      file,
                      storagePath,
                      result.url,
                      sortOrder
                    )
                    imageMetadataArray.push(imageMetadata)
                    uploadedImageUrls.push(result.url)
                    categorizedUrls[category].push(result.url)
                    console.log(`✅ ${category} image uploaded: ${result.url}`)
                  }
                  
                  return result
                } catch (error) {
                  console.error(`❌ Error uploading ${file.name}:`, error)
                  return { success: false, error }
                }
              })
              
              await Promise.all(uploadPromises)
            }
          }

          // Upload videos with metadata
          const videoMetadataArray: any[] = []
          if (categorizedMedia.videos.length > 0) {
            console.log(`🎥 Uploading ${categorizedMedia.videos.length} videos...`)
            
            const { createVideoMetadata } = await import('@/lib/supabase/image-metadata')
            
            for (const [index, videoFile] of categorizedMedia.videos.entries()) {
              const storagePath = generateStoragePath(buildingId, 'videos', videoFile.file.name)
              
              const { uploadFile } = await import('@/lib/supabase/storage')
              const videoResult = await uploadFile({
                bucket: 'BUILDING_IMAGES',
                path: storagePath,
                file: videoFile.file,
                metadata: {
                  category: 'video',
                  building_id: buildingId,
                  original_name: videoFile.file.name,
                  uploaded_at: new Date().toISOString(),
                  sort_order: index
                }
              })

              if (videoResult.success && videoResult.url) {
                const videoMetadata = createVideoMetadata(
                  buildingId,
                  videoFile.file,
                  storagePath,
                  videoResult.url,
                  index
                )
                videoMetadataArray.push(videoMetadata)
                uploadedImageUrls.push(videoResult.url)
                categorizedUrls.videos.push(videoResult.url)
                console.log(`✅ Video uploaded: ${videoResult.url}`)
              } else {
                // Video upload failed - already validated at selection time
                // Error was already shown to user via ValidationSummary
              }
            }
          }

          // Update building with uploaded image URLs
          if (uploadedImageUrls.length > 0) {
            console.log(`🔗 Step 3: Updating building with ${uploadedImageUrls.length} Supabase URLs...`)

            // Import the database service to update building with image URLs
            const { databaseService } = await import('@/lib/supabase/database')

            // Update building with just the image URLs - categories are embedded in paths!
            const updateResponse = await databaseService.buildings.update(buildingId, {
              building_images: uploadedImageUrls // Category info is in the URL path!
            } as any)

            if (updateResponse.success) {
              console.log('✅ Building updated with Supabase image URLs:', updateResponse.data)
              console.log(`📸 Total images linked: ${uploadedImageUrls.length}`)
            } else {
              console.error('❌ Failed to update building with image URLs:', updateResponse.error)
            }
          } else {
            console.log(isEditMode ? '⚠️ No images were successfully uploaded to Supabase - building updated without new images' : '⚠️ No images were successfully uploaded to Supabase - building created without images')
          }

        } catch (imageError) {
          console.error(isEditMode ? '❌ Failed to upload images to Supabase (building was updated successfully):' : '❌ Failed to upload images to Supabase (building was created successfully):', imageError)
          import('@/lib/error-handler').then(({ handleFileUploadError }) => {
            handleFileUploadError(imageError, {
              additionalInfo: {
                context: 'building_images',
                buildingCreated: !isEditMode,
                buildingUpdated: isEditMode
              }
            })
          })
        }
      } else if (mediaFiles && mediaFiles.length > 0) {
        // Fallback to legacy mediaFiles if no categorized media
        console.log(`📸 Step 2 (Legacy): Uploading ${mediaFiles.length} files to Supabase...`)
        
        try {
          const { uploadBuildingImages, uploadBuildingVideo } = await import('@/lib/supabase/storage')
          const uploadedImageUrls: string[] = []

          // Upload images
          const imageFiles = mediaFiles.filter(file => file.type.startsWith('image/'))
          if (imageFiles.length > 0) {
            console.log(`📤 Uploading ${imageFiles.length} images for building ${buildingId}...`)
            const imageResults = await uploadBuildingImages(buildingId, imageFiles.map(f => f.file))
            imageResults.forEach((result, index) => {
              if (result.success && result.url) {
                uploadedImageUrls.push(result.url)
                console.log(`✅ Image ${index + 1} uploaded successfully`)
              } else {
                console.error(`❌ Failed to upload image ${index + 1}:`, result.error)
              }
            })
          }

          // Upload videos
          const videoFiles = mediaFiles.filter(file => file.type.startsWith('video/'))
          for (const videoFile of videoFiles) {
            const videoResult = await uploadBuildingVideo(buildingId, videoFile.file)
            if (videoResult.success && videoResult.url) {
              uploadedImageUrls.push(videoResult.url)
            }
          }

          // Update building with URLs
          if (uploadedImageUrls.length > 0) {
            const { databaseService } = await import('@/lib/supabase/database')
            await databaseService.buildings.update(buildingId, {
              building_images: uploadedImageUrls
            } as any)
          }
        } catch (error) {
          console.error('Failed to upload legacy media files:', error)
        }
      } else {
        console.log(isEditMode ? '📄 No images to upload - building update complete' : '📄 No images to upload - building creation complete')
      }

      // Show success message and reset form
      console.log('✅ Building submission completed successfully')
      import('@/lib/error-handler').then(({ showSuccessMessage }) => {
        showSuccessMessage(
          'Building Created Successfully!',
          `Building "${formData.building_name}" has been saved with all details and images.`,
          { duration: 5000 }
        )
      })

      // Reset form step to 0 to prevent URL step parameter persistence
      // Use the navigation hook's goToStep function to properly reset
      setTimeout(() => {
        goToStep(0) // This will remove the step parameter from URL
      }, 1000) // Small delay to let success message show
      
    } catch (error) {
      console.error('Error submitting building data:', error)
      import('@/lib/error-handler').then(({ handleFormSubmissionError }) => {
        handleFormSubmissionError(error, {
          additionalInfo: {
            formType: 'building',
            operation: 'submit',
            hasImages: mediaFiles.length > 0
          }
        })
      })
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
                  Building Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={formData.building_name}
                    onChange={(e) => handleInputChange('building_name', e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter building name or select from suggestions"
                    className={errors.building_name ? 'border-red-500 bg-red-50' : ''}
                    list="building-names"
                  />
                  <datalist id="building-names">
                    {BUILDING_NAME_SUGGESTIONS.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  {errors.building_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {errors.building_name}
                    </p>
                  )}
                </div>

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
                  Building Manager <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.operator_id?.toString() || ''}
                    onChange={(e) => handleInputChange('operator_id', e.target.value ? parseInt(e.target.value) : undefined)}
                    className={`flex-1 p-2 border rounded-md ${
                      errors.operator_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a manager</option>
                    {localOperators.filter(op => op.operator_type === 'BUILDING_MANAGER' || op.operator_type === 'ADMIN' || op.operator_type === 'OWNER').map(operator => (
                      <option key={operator.operator_id} value={operator.operator_id}>
                        {operator.name} ({operator.operator_type.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsOperatorDrawerOpen(true)}
                    className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    title="Add new operator"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add New</span>
                  </button>
                </div>
                {errors.operator_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.operator_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Manager
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.property_manager || ''}
                    onChange={(e) => handleInputChange('property_manager', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select property manager</option>
                    {localOperators.map(operator => (
                      <option key={operator.operator_id} value={operator.operator_id}>
                        {operator.name} ({operator.operator_type.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsOperatorDrawerOpen(true)}
                    className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    title="Add new operator"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add New</span>
                  </button>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built
                </label>
                <Input
                  type="number"
                  value={formData.year_built || ''}
                  onChange={(e) => handleInputChange('year_built', e.target.value ? parseInt(e.target.value) : undefined)}
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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

          </div>
        )

      case 'location':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Address <span className="text-red-500">*</span>
              </label>
              <AddressAutocomplete
                value={formData.full_address || ''}
                onChange={(value) => handleInputChange('full_address', value)}
                onAddressSelect={handleAddressSelect}
                placeholder="Start typing address (e.g. 123 Main St, Boston)"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Type 3+ characters to search real addresses. Selecting an address auto-fills all fields below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.address || formData.street || ''}
                  onChange={(e) => {
                    handleInputChange('address', e.target.value)
                    handleInputChange('street', e.target.value) // Keep both for compatibility
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="123 Main Street"
                  className={errors.street || errors.address ? 'border-red-500 bg-red-50' : ''}
                />
                {(errors.street || errors.address) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.street || errors.address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area/Neighborhood
                </label>
                <div className="relative">
                  <Input
                    value={formData.area || ''}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    onKeyDown={handleKeyDown}
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
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="City name"
                  className={errors.city ? 'border-red-500 bg-red-50' : ''}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="State or province"
                  className={errors.state ? 'border-red-500 bg-red-50' : ''}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.state}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.zip_code || formData.zip || ''}
                  onChange={(e) => {
                    handleInputChange('zip_code', e.target.value)
                    handleInputChange('zip', e.target.value) // Keep both for compatibility
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="12345"
                  className={errors.zip || errors.zip_code ? 'border-red-500 bg-red-50' : ''}
                />
                {(errors.zip || errors.zip_code) && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="text-red-500">⚠</span>
                    {errors.zip || errors.zip_code}
                  </p>
                )}
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
            
            {/* Contact Information Section */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                📞 Contact Information
              </h3>
              <p className="text-sm text-blue-700 mb-4">
               
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Office Phone
                  </label>
                  <Input
                    value={contactInfo.office_phone}
                    onChange={(e) => handleContactInfoChange('office_phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className={`border-blue-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.contact_office_phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.contact_office_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_office_phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Emergency Phone
                  </label>
                  <Input
                    value={contactInfo.emergency_phone}
                    onChange={(e) => handleContactInfoChange('emergency_phone', e.target.value)}
                    placeholder="(555) 999-0000"
                    className={`border-blue-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.contact_emergency_phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.contact_emergency_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_emergency_phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Leasing Email
                  </label>
                  <Input
                    type="email"
                    value={contactInfo.leasing_email}
                    onChange={(e) => handleContactInfoChange('leasing_email', e.target.value)}
                    placeholder="leasing@building.com"
                    className={`border-blue-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.contact_leasing_email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.contact_leasing_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_leasing_email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Maintenance Email
                  </label>
                  <Input
                    type="email"
                    value={contactInfo.maintenance_email}
                    onChange={(e) => handleContactInfoChange('maintenance_email', e.target.value)}
                    placeholder="maintenance@building.com"
                    className={`border-blue-300 focus:border-blue-500 focus:ring-blue-500 ${
                      errors.contact_maintenance_email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.contact_maintenance_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_maintenance_email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Office Hours
                  </label>
                  <Input
                    value={contactInfo.office_hours}
                    onChange={(e) => handleContactInfoChange('office_hours', e.target.value)}
                    placeholder="Monday - Friday: 9 AM - 6 PM, Saturday: 10 AM - 4 PM"
                    className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* WalkScore Integration - Auto-fetched location data */}
            <WalkScoreDisplay
              data={walkScoreData}
              isLoading={walkScoreLoading}
              error={walkScoreError || undefined}
              onRetry={retryWalkScore}
              showAmenities={true}
              className="mt-4"
            />

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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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
                <label 
                  key={amenity.key} 
                  className={`
                    flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                    ${selectedAmenities.includes(amenity.label)
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.label)}
                    onChange={(e) => handleAmenityToggle(amenity.key, amenity.label)}
                    className="rounded text-blue-600 focus:ring-blue-500"
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

            {/* Enhanced Accessibility Features - Structured Boolean Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ♿ Accessibility Features
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.disability_access || false}
                    onChange={(e) => handleInputChange('disability_access', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg">♿</span>
                  <span className="text-sm font-medium text-gray-900">Disability Access Available</span>
                </label>
                
                <AnimatePresence>
                  {formData.disability_access && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-6 space-y-4"
                    >
                      {/* Accessibility Features Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { key: 'wheelchair_ramp', label: 'Wheelchair Ramps', icon: '🦽' },
                          { key: 'elevator_access', label: 'Elevator Access', icon: '🛗' },
                          { key: 'wide_doorways', label: 'Wide Doorways', icon: '🚪' },
                          { key: 'accessible_bathrooms', label: 'Accessible Bathrooms', icon: '🚿' },
                          { key: 'hearing_loop', label: 'Hearing Loop System', icon: '🦻' },
                          { key: 'braille_signage', label: 'Braille Signage', icon: '👆' },
                          { key: 'accessible_parking', label: 'Accessible Parking', icon: '🅿️' },
                          { key: 'grab_bars', label: 'Grab Bars', icon: '🤏' },
                          { key: 'lowered_counters', label: 'Lowered Counters', icon: '📏' },
                          { key: 'accessible_entrance', label: 'Accessible Entrance', icon: '🚶' },
                          { key: 'emergency_alerts', label: 'Visual/Audio Emergency Alerts', icon: '🚨' },
                          { key: 'accessible_kitchen', label: 'Accessible Kitchen Features', icon: '🍽️' }
                        ].map((feature) => (
                          <label
                            key={feature.key}
                            className={`
                              flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-all
                              ${formData[feature.key as keyof BuildingFormData]
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={formData[feature.key as keyof BuildingFormData] as boolean || false}
                              onChange={(e) => handleInputChange(feature.key as keyof BuildingFormData, e.target.checked)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm">{feature.icon}</span>
                            <span className="text-xs font-medium text-gray-900">{feature.label}</span>
                          </label>
                        ))}
                      </div>

                 
            
            
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Security Features - Structured Boolean Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Security Features
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'security_cameras', label: 'Security Cameras', icon: '📹' },
                  { key: 'keycard_access', label: 'Keycard Access', icon: '🗝️' },
                  { key: 'keycode_entry', label: 'Keycode Entry', icon: '🔢' },
                  { key: 'security_guard', label: 'Security Guard', icon: '👮' },
                  { key: 'onsite_manager', label: 'Onsite Manager', icon: '🏠' },
                  { key: 'gated_community', label: 'Gated Community', icon: '🚪' },
                  { key: 'intercom_system', label: 'Intercom System', icon: '📞' },
                  { key: 'building_alarm', label: 'Building Alarm', icon: '🚨' }
                ].map((feature) => (
                  <label
                    key={feature.key}
                    className={`
                      flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                      ${formData[feature.key as keyof BuildingFormData]
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData[feature.key as keyof BuildingFormData] as boolean || false}
                      onChange={(e) => handleInputChange(feature.key as keyof BuildingFormData, e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Parking - Boolean with additional options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Parking Available
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.parking_available || false}
                    onChange={(e) => handleInputChange('parking_available', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg">🅿️</span>
                  <span className="text-sm font-medium text-gray-900">Parking Available</span>
                </label>
                
                {formData.parking_available && (
                  <div className="ml-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'covered_parking', label: 'Covered Parking', icon: '🏠' },
                      { key: 'garage_parking', label: 'Garage Parking', icon: '🚗' },
                      { key: 'street_parking', label: 'Street Parking', icon: '🛣️' },
                      { key: 'visitor_parking', label: 'Visitor Parking', icon: '👥' },
                      { key: 'handicap_parking', label: 'Handicap Accessible', icon: '♿' },
                      { key: 'electric_charging', label: 'EV Charging', icon: '⚡' }
                    ].map((option) => (
                      <label
                        key={option.key}
                        className={`
                          flex items-center gap-2 p-2 border rounded-md cursor-pointer transition-all
                          ${formData[option.key as keyof BuildingFormData]
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={formData[option.key as keyof BuildingFormData] as boolean || false}
                          onChange={(e) => handleInputChange(option.key as keyof BuildingFormData, e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{option.icon}</span>
                        <span className="text-xs font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )


      case 'media':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <Camera className="w-5 h-5" />
                <h3 className="font-semibold">Final Step: Upload Categorized Media</h3>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Upload images by category and videos (max 3). Categories help AI agents understand building features better.
              </p>
            </div>

            {/* Image Upload Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Outside Building Images */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Outside Building
                </h4>
                <div className="flex gap-2">
                  <div
                    className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragOverCategory === 'outside'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'outside')}
                    onDragEnter={(e) => handleDragEnter(e, 'outside')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'outside')}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleCategorizedImageUpload(e, 'outside')}
                      className="hidden"
                      id="outside-images"
                    />
                    <label htmlFor="outside-images" className="cursor-pointer">
                      <Camera className={`w-8 h-8 mx-auto mb-2 ${dragOverCategory === 'outside' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <p className={`text-sm ${dragOverCategory === 'outside' ? 'text-blue-600' : 'text-gray-600'}`}>
                        {dragOverCategory === 'outside' ? 'Drop images here' : 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB • JPEG, PNG, WebP</p>
                    </label>
                  </div>
                  <GoogleDrivePicker
                    fileTypes="images"
                    maxFiles={10}
                    variant="icon-only"
                    onFilesDownloaded={(files) => handleGoogleDriveFiles(files, 'outside')}
                  />
                </div>
                {renderImagePreview('outside')}
              </div>

              {/* Common Areas Images */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Common Areas
                </h4>
                <div className="flex gap-2">
                  <div
                    className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragOverCategory === 'common_areas'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'common_areas')}
                    onDragEnter={(e) => handleDragEnter(e, 'common_areas')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'common_areas')}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleCategorizedImageUpload(e, 'common_areas')}
                      className="hidden"
                      id="common-images"
                    />
                    <label htmlFor="common-images" className="cursor-pointer">
                      <Camera className={`w-8 h-8 mx-auto mb-2 ${dragOverCategory === 'common_areas' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <p className={`text-sm ${dragOverCategory === 'common_areas' ? 'text-blue-600' : 'text-gray-600'}`}>
                        {dragOverCategory === 'common_areas' ? 'Drop images here' : 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB • JPEG, PNG, WebP</p>
                    </label>
                  </div>
                  <GoogleDrivePicker
                    fileTypes="images"
                    maxFiles={10}
                    variant="icon-only"
                    onFilesDownloaded={(files) => handleGoogleDriveFiles(files, 'common_areas')}
                  />
                </div>
                {renderImagePreview('common_areas')}
              </div>

              {/* Amenity-Specific Images */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4" />
                  Amenities
                </h4>
                <div className="flex gap-2">
                  <div
                    className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragOverCategory === 'amenities'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'amenities')}
                    onDragEnter={(e) => handleDragEnter(e, 'amenities')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'amenities')}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleCategorizedImageUpload(e, 'amenities')}
                      className="hidden"
                      id="amenity-images"
                    />
                    <label htmlFor="amenity-images" className="cursor-pointer">
                      <Camera className={`w-8 h-8 mx-auto mb-2 ${dragOverCategory === 'amenities' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <p className={`text-sm ${dragOverCategory === 'amenities' ? 'text-blue-600' : 'text-gray-600'}`}>
                        {dragOverCategory === 'amenities' ? 'Drop images here' : 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB • JPEG, PNG, WebP</p>
                    </label>
                  </div>
                  <GoogleDrivePicker
                    fileTypes="images"
                    maxFiles={10}
                    variant="icon-only"
                    onFilesDownloaded={(files) => handleGoogleDriveFiles(files, 'amenities')}
                  />
                </div>
                {renderImagePreview('amenities')}
              </div>

              {/* Common Kitchen/Bathrooms */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Kitchen & Bathrooms
                </h4>
                <div className="flex gap-2">
                  <div
                    className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragOverCategory === 'kitchen_bathrooms'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'kitchen_bathrooms')}
                    onDragEnter={(e) => handleDragEnter(e, 'kitchen_bathrooms')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'kitchen_bathrooms')}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleCategorizedImageUpload(e, 'kitchen_bathrooms')}
                      className="hidden"
                      id="kitchen-images"
                    />
                    <label htmlFor="kitchen-images" className="cursor-pointer">
                      <Camera className={`w-8 h-8 mx-auto mb-2 ${dragOverCategory === 'kitchen_bathrooms' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <p className={`text-sm ${dragOverCategory === 'kitchen_bathrooms' ? 'text-blue-600' : 'text-gray-600'}`}>
                        {dragOverCategory === 'kitchen_bathrooms' ? 'Drop images here' : 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB • JPEG, PNG, WebP</p>
                    </label>
                  </div>
                  <GoogleDrivePicker
                    fileTypes="images"
                    maxFiles={10}
                    variant="icon-only"
                    onFilesDownloaded={(files) => handleGoogleDriveFiles(files, 'kitchen_bathrooms')}
                  />
                </div>
                {renderImagePreview('kitchen_bathrooms')}
              </div>
            </div>

            {/* Video Upload Section */}
            <div className="mt-8">
              <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4" />
                Videos (Maximum 3)
              </h4>
              <div className="flex gap-2">
                <div
                  className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    categorizedMedia.videos.length >= 3
                      ? 'border-gray-200 bg-gray-50'
                      : dragOverCategory === 'videos'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragOver={(e) => categorizedMedia.videos.length < 3 && handleDragOver(e, 'videos')}
                  onDragEnter={(e) => categorizedMedia.videos.length < 3 && handleDragEnter(e, 'videos')}
                  onDragLeave={handleDragLeave}
                  onDrop={handleVideoDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                    disabled={categorizedMedia.videos.length >= 3}
                  />
                  <label htmlFor="video-upload" className={`cursor-pointer ${categorizedMedia.videos.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <FileText className={`w-8 h-8 mx-auto mb-2 ${dragOverCategory === 'videos' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <p className={`text-sm ${dragOverCategory === 'videos' ? 'text-blue-600' : 'text-gray-600'}`}>
                      {categorizedMedia.videos.length >= 3
                        ? 'Maximum 3 videos reached'
                        : dragOverCategory === 'videos'
                          ? 'Drop videos here'
                          : `Click or drag to upload (${categorizedMedia.videos.length}/3)`}
                    </p>
                    {categorizedMedia.videos.length < 3 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Max 500MB per video • MP4, WebM, QuickTime, AVI
                      </p>
                    )}
                  </label>
                </div>
                <GoogleDrivePicker
                  fileTypes="videos"
                  maxFiles={3 - categorizedMedia.videos.length}
                  variant="icon-only"
                  onFilesDownloaded={(files) => handleGoogleDriveFiles(files, 'videos')}
                  disabled={categorizedMedia.videos.length >= 3}
                />
              </div>
              {renderVideoPreview()}
            </div>

            {/* Virtual Tour URLs - Multiple URLs supported */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video/Virtual Tour URLs (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Add YouTube, Vimeo, Matterport, or other video/tour URLs
              </p>

              {/* List of existing URLs */}
              <div className="space-y-2 mb-3">
                {(formData.virtual_tour_urls || []).map((url: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const urls = [...(formData.virtual_tour_urls || [])]
                        urls[index] = e.target.value
                        handleInputChange('virtual_tour_urls', urls)
                      }}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const urls = (formData.virtual_tour_urls || []).filter((_: string, i: number) => i !== index)
                        handleInputChange('virtual_tour_urls', urls)
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove URL"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new URL button */}
              <button
                type="button"
                onClick={() => {
                  const urls = [...(formData.virtual_tour_urls || []), '']
                  handleInputChange('virtual_tour_urls', urls)
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-lg">+</span>
                Add Video/Tour URL
              </button>

              {/* Legacy single URL field - hidden but maintains backward compatibility */}
              {formData.virtual_tour_url && !formData.virtual_tour_urls?.length && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Existing URL (click to convert to new format):</p>
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('virtual_tour_urls', [formData.virtual_tour_url])
                      handleInputChange('virtual_tour_url', '')
                    }}
                    className="text-sm text-blue-600 hover:underline truncate block max-w-full"
                  >
                    {formData.virtual_tour_url}
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return <div>Step content for {steps[currentStep].title}</div>
    }
  }

  // State for validation summary
  const [showValidationSummary, setShowValidationSummary] = useState(false)
  const [validationAttempted, setValidationAttempted] = useState(false)

  return (
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
            Configure building details, amenities, and features with our comprehensive multi-step form
          </p>
          <div className="flex items-center justify-center mt-4">
            <StatusBadge
              status={formData.available ? 'AVAILABLE' : 'UNAVAILABLE'}
              variant="large"
              icon={formData.available ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
            />
          </div>
        </motion.div>

        {/* Validation Summary - Only show after validation attempt */}
        <ValidationSummary 
          errors={errors}
          fileValidationErrors={fileValidationErrors}
          show={validationAttempted}
        />

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

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && currentStep !== steps.length - 1) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        >
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
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                prevStep()
              }}
              disabled={!canGoPrev}
              className={`px-6 py-3 border-2 border-blue-300 text-blue-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                !canGoPrev
                  ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-500'
                  : 'hover:border-blue-400 hover:bg-blue-50 bg-blue-25'
              }`}
              whileHover={canGoPrev ? { scale: 1.02 } : {}}
              whileTap={canGoPrev ? { scale: 0.98 } : {}}
              title={!canGoPrev ? 'Already at first step' : 'Go to previous step'}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Step
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
                <>
                  <motion.button
                    type="submit"
                    disabled={isLoading || Object.keys(errors).length > 0 || fileValidationErrors.length > 0}
                    className={`px-8 py-3 bg-gradient-to-r text-white rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 ${
                      isLoading || Object.keys(errors).length > 0 || fileValidationErrors.length > 0
                        ? 'from-gray-400 to-gray-500 cursor-not-allowed opacity-75'
                        : 'from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 hover:shadow-xl'
                    }`}
                    whileHover={!(isLoading || Object.keys(errors).length > 0 || fileValidationErrors.length > 0) ? { scale: 1.02 } : {}}
                    whileTap={!(isLoading || Object.keys(errors).length > 0 || fileValidationErrors.length > 0) ? { scale: 0.98 } : {}}
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

                  {/* Remove inline validation text - using validation summary instead */}
                </>
              ) : (
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    nextStep()
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={`Continue to ${steps[currentStep + 1]?.title || 'next step'}`}
                >
                  {currentStep === steps.length - 2 ? 'Continue to Media Upload' : 'Next Step'}
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </form>

        {/* Operator Drawer for inline creation */}
        <OperatorDrawer
          isOpen={isOperatorDrawerOpen}
          onClose={() => setIsOperatorDrawerOpen(false)}
          onOperatorCreated={handleOperatorCreated}
        />
    </div>
  )
}
