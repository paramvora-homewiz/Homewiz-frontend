'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Home,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Building,
  Calendar,
  Settings,
  FileText,
  Wrench
} from 'lucide-react'

// Types
interface RoomFormData {
  room_number: string
  building_id: string
  ready_to_rent: boolean
  status: string
  booked_from?: string
  booked_till?: string
  active_tenants: number
  maximum_people_in_room: number
  private_room_rent: number
  shared_room_rent_2?: number
  floor_number: number
  bed_count: number
  bathroom_type: string
  bed_size: string
  bed_type: string
  view?: string
  sq_footage?: number
  mini_fridge: boolean
  sink: boolean
  bedding_provided: boolean
  work_desk: boolean
  work_chair: boolean
  heating: boolean
  air_conditioning: boolean
  cable_tv: boolean
  room_storage?: string
  noise_level?: string
  sunlight?: string
  furnished?: boolean
  furniture_details?: string
  last_renovation_date?: string
  public_notes?: string
  internal_notes?: string
  virtual_tour_url?: string
  available_from?: string
  additional_features?: string
  room_photos?: File[]
  last_check?: string
  last_check_by?: number
  current_booking_types?: string
}

interface NewRoomFormProps {
  initialData?: Partial<RoomFormData>
  onSubmit: (data: RoomFormData) => Promise<void>
  onCancel?: () => void
  onBack?: () => void
  isLoading?: boolean
  buildings?: Array<{ building_id: string; building_name: string }>
}

const FORM_STEPS = [
  { id: 'basic', title: 'Basic Information', icon: Home, color: 'from-blue-500 to-blue-600' },
  { id: 'specifications', title: 'Room Specifications', icon: Building, color: 'from-purple-500 to-purple-600' },
  { id: 'availability', title: 'Booking & Availability', icon: Calendar, color: 'from-green-500 to-green-600' },
  { id: 'amenities', title: 'Amenities & Features', icon: Settings, color: 'from-orange-500 to-orange-600' },
  { id: 'maintenance', title: 'Maintenance & Notes', icon: Wrench, color: 'from-red-500 to-red-600' }
]

const ROOM_NUMBER_PATTERNS = ['101', '102', '103', '104', '105', '201', '202', '203', '204', '205']

export default function NewRoomForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  onBack, 
  isLoading, 
  buildings = [] 
}: NewRoomFormProps) {
  console.log('🆕 NEW ROOM FORM IS LOADING!')
  
  // Add a mount effect to confirm this component is actually rendering
  React.useEffect(() => {
    console.log('🚀 NewRoomForm component mounted successfully!')
  }, [])
  // Simple state management - no complex hooks
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState<RoomFormData>({
    room_number: '',
    building_id: '',
    ready_to_rent: true,
    status: 'AVAILABLE',
    active_tenants: 0,
    maximum_people_in_room: 1,
    private_room_rent: 0,
    floor_number: 1,
    bed_count: 1,
    bathroom_type: 'Shared',
    bed_size: 'Twin',
    bed_type: 'Single',
    view: 'Street',
    sq_footage: 200,
    mini_fridge: false,
    sink: false,
    bedding_provided: false,
    work_desk: false,
    work_chair: false,
    heating: false,
    air_conditioning: false,
    cable_tv: false,
    room_storage: 'Built-in Closet',
    furnished: false,
    room_photos: [],
    ...initialData
  })

  // Simple handlers with no dependencies
  const updateField = (field: keyof RoomFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting || isLoading) return
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step content components
  const BasicInformationStep = () => (
    <Card className="p-6 bg-white shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Number *
          </label>
          <Input
            value={formData.room_number}
            onChange={(e) => updateField('room_number', e.target.value)}
            placeholder="Enter room number"
            className={errors.room_number ? 'border-red-300' : ''}
          />
          {errors.room_number && (
            <p className="text-red-500 text-sm mt-1">{errors.room_number}</p>
          )}
          
          <div className="mt-3 flex flex-wrap gap-2">
            {ROOM_NUMBER_PATTERNS.slice(0, 6).map((pattern) => (
              <button
                key={pattern}
                type="button"
                onClick={() => updateField('room_number', pattern)}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100"
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
            onChange={(e) => updateField('building_id', e.target.value)}
            className={`w-full p-3 border rounded-lg ${
              errors.building_id ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select a building</option>
            {buildings.map(building => (
              <option key={building.building_id} value={building.building_id}>
                {building.building_name}
              </option>
            ))}
          </select>
          {errors.building_id && (
            <p className="text-red-500 text-sm mt-1">{errors.building_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Room Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Tenants
          </label>
          <Input
            type="number"
            value={formData.active_tenants || ''}
            onChange={(e) => updateField('active_tenants', parseInt(e.target.value) || 0)}
            placeholder="Number of current tenants"
            min="0"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ready_to_rent}
            onChange={(e) => updateField('ready_to_rent', e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">Ready to Rent</span>
          <span className="text-xs text-gray-500">Mark this room as available for new tenants</span>
        </label>
      </div>

      {/* Room Photos Upload */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Room Photos
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              updateField('room_photos', files)
            }}
            className="hidden"
            id="room-photos"
          />
          <label htmlFor="room-photos" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload room photos</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB each</p>
            </div>
          </label>
        </div>
        
        {formData.room_photos && formData.room_photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.room_photos.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Room photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPhotos = formData.room_photos?.filter((_, i) => i !== index) || []
                    updateField('room_photos', newPhotos)
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )

  const SpecificationsStep = () => (
    <Card className="p-6 bg-white shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Room Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Private Room Rent ($) *
          </label>
          <Input
            type="number"
            step="0.01"
            value={formData.private_room_rent || ''}
            onChange={(e) => updateField('private_room_rent', parseFloat(e.target.value) || 0)}
            placeholder="e.g., 800.00"
            min="0"
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
            onChange={(e) => updateField('shared_room_rent_2', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="e.g., 500.00"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Floor Number *
          </label>
          <Input
            type="number"
            value={formData.floor_number || ''}
            onChange={(e) => updateField('floor_number', parseInt(e.target.value) || 1)}
            placeholder="e.g., 1"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum People *
          </label>
          <Input
            type="number"
            value={formData.maximum_people_in_room || ''}
            onChange={(e) => updateField('maximum_people_in_room', parseInt(e.target.value) || 1)}
            placeholder="e.g., 2"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bed Count *
          </label>
          <Input
            type="number"
            value={formData.bed_count || ''}
            onChange={(e) => updateField('bed_count', parseInt(e.target.value) || 1)}
            placeholder="e.g., 1"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Square Footage
          </label>
          <Input
            type="number"
            value={formData.sq_footage || ''}
            onChange={(e) => updateField('sq_footage', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g., 200"
            min="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathroom Type *
          </label>
          <select
            value={formData.bathroom_type}
            onChange={(e) => updateField('bathroom_type', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
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
            onChange={(e) => updateField('bed_size', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
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
            onChange={(e) => updateField('bed_type', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
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
            onChange={(e) => updateField('view', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
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
            onChange={(e) => updateField('room_storage', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
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
  )

  const AvailabilityStep = () => (
    <Card className="p-6 bg-white shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Booking & Availability</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booked From
            </label>
            <Input
              type="date"
              value={formData.booked_from || ''}
              onChange={(e) => updateField('booked_from', e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booked Till
            </label>
            <Input
              type="date"
              value={formData.booked_till || ''}
              onChange={(e) => updateField('booked_till', e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available From
            </label>
            <Input
              type="date"
              value={formData.available_from || ''}
              onChange={(e) => updateField('available_from', e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Booking Types
            </label>
            <Input
              value={formData.current_booking_types || ''}
              onChange={(e) => updateField('current_booking_types', e.target.value || undefined)}
              placeholder="e.g., Short-term, Long-term"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Noise Level
            </label>
            <select
              value={formData.noise_level || ''}
              onChange={(e) => updateField('noise_level', e.target.value || undefined)}
              className="w-full p-3 border border-gray-300 rounded-lg"
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
              onChange={(e) => updateField('sunlight', e.target.value || undefined)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select sunlight level</option>
              <option value="Bright">Bright</option>
              <option value="Moderate">Moderate</option>
              <option value="Dim">Dim</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.furnished || false}
                onChange={(e) => updateField('furnished', e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">Furnished</span>
            </label>
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
              onChange={(e) => updateField('virtual_tour_url', e.target.value || undefined)}
              placeholder="https://example.com/virtual-tour"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Furniture Details
            </label>
            <Input
              value={formData.furniture_details || ''}
              onChange={(e) => updateField('furniture_details', e.target.value || undefined)}
              placeholder="Describe furniture included (if furnished)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Features
            </label>
            <Input
              value={formData.additional_features || ''}
              onChange={(e) => updateField('additional_features', e.target.value || undefined)}
              placeholder="Any additional features or amenities"
            />
          </div>
        </div>
      </div>
    </Card>
  )

  const AmenitiesStep = () => (
    <Card className="p-6 bg-white shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Room Amenities</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { key: 'mini_fridge', label: 'Mini Fridge', icon: '❄️' },
          { key: 'sink', label: 'Sink', icon: '🚿' },
          { key: 'bedding_provided', label: 'Bedding Provided', icon: '🛏️' },
          { key: 'work_desk', label: 'Work Desk', icon: '🪑' },
          { key: 'work_chair', label: 'Work Chair', icon: '💺' },
          { key: 'heating', label: 'Heating', icon: '🔥' },
          { key: 'air_conditioning', label: 'Air Conditioning', icon: '❄️' },
          { key: 'cable_tv', label: 'Cable TV', icon: '📺' }
        ].map((amenity) => (
          <label
            key={amenity.key}
            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              formData[amenity.key as keyof RoomFormData]
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={formData[amenity.key as keyof RoomFormData] as boolean}
              onChange={(e) => updateField(amenity.key as keyof RoomFormData, e.target.checked)}
              className="rounded text-blue-600"
            />
            <span className="text-xl">{amenity.icon}</span>
            <span className="font-medium text-gray-900">{amenity.label}</span>
          </label>
        ))}
      </div>
    </Card>
  )

  const MaintenanceStep = () => (
    <Card className="p-6 bg-white shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Maintenance & Notes</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Check Date
            </label>
            <Input
              type="date"
              value={formData.last_check || ''}
              onChange={(e) => updateField('last_check', e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Check By (Staff ID)
            </label>
            <Input
              type="number"
              value={formData.last_check_by || ''}
              onChange={(e) => updateField('last_check_by', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Staff member ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Renovation Date
            </label>
            <Input
              type="date"
              value={formData.last_renovation_date || ''}
              onChange={(e) => updateField('last_renovation_date', e.target.value || undefined)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Notes
            </label>
            <textarea
              value={formData.public_notes || ''}
              onChange={(e) => updateField('public_notes', e.target.value || undefined)}
              placeholder="Notes visible to tenants and public"
              className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes
            </label>
            <textarea
              value={formData.internal_notes || ''}
              onChange={(e) => updateField('internal_notes', e.target.value || undefined)}
              placeholder="Internal notes for staff only"
              className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
            />
          </div>
        </div>
      </div>
    </Card>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return <BasicInformationStep />
      case 1: return <SpecificationsStep />
      case 2: return <AvailabilityStep />
      case 3: return <AmenitiesStep />
      case 4: return <MaintenanceStep />
      default: return <BasicInformationStep />
    }
  }

  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
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
            🆕 NEW ROOM FORM - {initialData ? 'Edit Room' : 'Create New Room'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Follow the guided steps to configure your room with all the necessary details, amenities, and availability information
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
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
        <div className="flex items-center justify-between mb-8">
          {FORM_STEPS.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            const IconComponent = step.icon

            return (
              <div key={step.id} className="flex items-center">
                <motion.button
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${step.color} text-white border-transparent shadow-lg scale-110`
                      : isCompleted
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </motion.button>

                {index < FORM_STEPS.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-4 text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {FORM_STEPS[currentStep].title}
            {currentStep === FORM_STEPS.length - 1 && (
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
            {currentStep === FORM_STEPS.length - 1
              ? "Review your information and complete the room setup"
              : "Fill in the required information below"
            }
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} noValidate>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}

              {onBack && currentStep === 0 && (
                <Button type="button" variant="outline" onClick={onBack}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Forms
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              Step {currentStep + 1} of {FORM_STEPS.length}
            </div>

            <div className="flex items-center gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}

              {currentStep < FORM_STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {(isLoading || isSubmitting) && <LoadingSpinner size="sm" />}
                  <Save className="w-4 h-4" />
                  {initialData ? 'Update Room' : 'Create Room'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}