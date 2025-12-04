'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Building as BuildingIcon, Bed as BedIcon, Home, Wrench, Camera, Refrigerator, Droplets, BedDouble, Monitor, Armchair, Flame, Snowflake, Tv, Zap, Droplet, Fuel, Wifi, Trash2, CheckCircle, DoorOpen } from 'lucide-react'
import { RoomPoCFormData, RoomPoCFormProps, BedData, RoomPoCType, BathroomType } from '@/types'
import BedSection from './BedSection'
import { Button } from '@/components/ui/button'
import { DraggableFileImageGrid } from '@/components/ui/DraggableImageGrid'

const BATHROOM_TYPES: BathroomType[] = ['Private', 'Shared', 'En-Suite']

const CLEANING_FREQUENCIES = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'As needed']

const ROOM_AMENITIES_CONFIG = [
  { key: 'miniFridge', label: 'Mini Fridge', description: 'Personal refrigerator', icon: Refrigerator },
  { key: 'sink', label: 'Sink', description: 'Sink available', icon: Droplets },
  { key: 'beddingProvided', label: 'Bedding Provided', description: 'Sheets and pillows included', icon: BedDouble },
  { key: 'workDesk', label: 'Work Desk', description: 'Desk in room', icon: Monitor },
  { key: 'workChair', label: 'Work Chair', description: 'Chair provided', icon: Armchair },
  { key: 'heating', label: 'Heating', description: 'Climate control', icon: Flame },
  { key: 'airConditioning', label: 'Air Conditioning', description: 'Cooling system', icon: Snowflake },
  { key: 'cableTv', label: 'Cable TV', description: 'Television with cable', icon: Tv },
] as const

const UTILITIES_CONFIG = [
  { key: 'electricity', label: 'Electricity', icon: Zap },
  { key: 'water', label: 'Water', icon: Droplet },
  { key: 'gas', label: 'Gas', icon: Fuel },
  { key: 'internet', label: 'Internet', icon: Wifi },
  { key: 'cableTv', label: 'Cable TV', icon: Tv },
  { key: 'trash', label: 'Trash', icon: Trash2 },
  { key: 'heating', label: 'Heating', icon: Flame },
  { key: 'ac', label: 'AC', icon: Snowflake },
] as const

export default function RoomPoCForm({
  onSubmit,
  onCancel,
  isLoading,
  buildings,
  initialData,
  mode = 'create',
  roomId
}: RoomPoCFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const isSubmitIntentionalRef = useRef(false)

  // Default form state
  const defaultFormData: RoomPoCFormData = {
    roomNumber: '',
    buildingId: '',
    roomType: 'Shared',
    maxBeds: 2,
    bathroomType: undefined,
    floorNumber: undefined,
    beds: [{}, {}],
    roomAmenities: {
      miniFridge: false,
      sink: false,
      beddingProvided: false,
      workDesk: false,
      workChair: false,
      heating: false,
      airConditioning: false,
      cableTv: false,
    },
    roomPhotos: [],
    customAmenities: '',
    maintenance: {
      lastCheckDate: undefined,
      lastMaintenanceStaffId: undefined,
      lastRenovationDate: undefined,
    },
    condition: {
      roomConditionScore: undefined,
      cleaningFrequency: undefined,
      utilitiesMeterId: undefined,
      lastCleaningDate: undefined,
    },
    utilitiesIncluded: {
      electricity: false,
      water: false,
      gas: false,
      internet: false,
      cableTv: false,
      trash: false,
      heating: false,
      ac: false,
    },
  }

  // Merge initialData with defaults for edit mode
  const [formData, setFormData] = useState<RoomPoCFormData>(() => {
    if (initialData) {
      return {
        ...defaultFormData,
        ...initialData,
        roomAmenities: {
          ...defaultFormData.roomAmenities,
          ...(initialData.roomAmenities || {})
        },
        maintenance: {
          ...defaultFormData.maintenance,
          ...(initialData.maintenance || {})
        },
        condition: {
          ...defaultFormData.condition,
          ...(initialData.condition || {})
        },
        utilitiesIncluded: {
          ...defaultFormData.utilitiesIncluded,
          ...(initialData.utilitiesIncluded || {})
        },
        beds: initialData.beds?.length ? initialData.beds : defaultFormData.beds,
        roomPhotos: initialData.roomPhotos || []
      }
    }
    return defaultFormData
  })

  const isEditMode = mode === 'edit'

  // Update maxBeds when roomType changes
  useEffect(() => {
    if (formData.roomType === 'Private' && formData.maxBeds !== 1) {
      setFormData(prev => ({ ...prev, maxBeds: 1 }))
    } else if (formData.roomType === 'Shared' && formData.maxBeds < 2) {
      setFormData(prev => ({ ...prev, maxBeds: 2 }))
    }
  }, [formData.roomType])

  // Update beds array when maxBeds changes
  useEffect(() => {
    if (formData.maxBeds !== formData.beds.length) {
      const newBeds: BedData[] = Array(formData.maxBeds)
        .fill(null)
        .map((_, index) => formData.beds[index] || {})

      setFormData(prev => ({ ...prev, beds: newBeds }))
    }
  }, [formData.maxBeds])

  const handleBedChange = (index: number, bedData: BedData) => {
    const newBeds = [...formData.beds]
    newBeds[index] = bedData
    setFormData({ ...formData, beds: newBeds })
  }

  const handleAmenityToggle = (key: keyof typeof formData.roomAmenities) => {
    setFormData({
      ...formData,
      roomAmenities: {
        ...formData.roomAmenities,
        [key]: !formData.roomAmenities[key]
      }
    })
  }

  const handleUtilityToggle = (key: keyof typeof formData.utilitiesIncluded) => {
    setFormData({
      ...formData,
      utilitiesIncluded: {
        ...formData.utilitiesIncluded,
        [key]: !formData.utilitiesIncluded[key]
      }
    })
  }

  // Photo handling
  const handlePhotoUpload = (files: FileList | null) => {
    if (files) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
      setFormData(prev => ({
        ...prev,
        roomPhotos: [...prev.roomPhotos, ...imageFiles]
      }))
    }
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roomPhotos: prev.roomPhotos.filter((_, i) => i !== index)
    }))
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handlePhotoUpload(e.dataTransfer.files)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.roomNumber && formData.buildingId && formData.maxBeds >= 1 && formData.maxBeds <= 6
      case 2:
        return true // All beds are optional
      case 3:
        return true // All amenities are optional
      case 4:
        return true // All maintenance fields are optional
      default:
        return false
    }
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only submit if the user intentionally clicked the submit button
    if (!isSubmitIntentionalRef.current) {
      console.log('Form submission blocked - not intentional')
      return
    }

    if (currentStep === 4 && canProceed()) {
      isSubmitIntentionalRef.current = false // Reset after submission attempt
      onSubmit(formData)
    }
  }

  const handleSubmitClick = () => {
    // Mark this as an intentional submission before the form submits (synchronous)
    isSubmitIntentionalRef.current = true
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Get the target element
      const target = e.target as HTMLElement
      const tagName = target.tagName.toLowerCase()

      // Allow Enter in textareas for multi-line input
      if (tagName === 'textarea') {
        return
      }

      // Prevent default form submission from Enter key in input fields
      e.preventDefault()

      // If not on the last step, move to next step
      if (currentStep < 4 && canProceed()) {
        setCurrentStep(currentStep + 1)
      }
      // On step 4, do nothing - user must click the submit button
    }
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="max-w-5xl mx-auto">
      {/* Header Section */}
      <motion.div
        className="text-center py-8 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={`inline-flex items-center gap-2 ${isEditMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-purple-600 to-violet-600'} text-white px-4 py-2 rounded-full text-sm font-semibold mb-4`}>
          <DoorOpen className="w-4 h-4" />
          {isEditMode ? 'Edit Room' : 'Room Configuration'}
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent mb-3">
          {isEditMode ? `Edit Room ${formData.roomNumber || roomId || ''}` : 'Add New Room'}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {isEditMode
            ? 'Update room details, beds, amenities, and maintenance information'
            : 'Configure room details, beds, amenities, and maintenance with our intelligent form system'}
        </p>
        {!isEditMode && (
          <div className="flex items-center justify-center mt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              AVAILABLE
            </div>
          </div>
        )}
      </motion.div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Basic Info', icon: BuildingIcon },
            { num: 2, label: 'Beds', icon: BedIcon },
            { num: 3, label: 'Amenities', icon: Home },
            { num: 4, label: 'Maintenance', icon: Wrench }
          ].map((step, index) => (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    currentStep >= step.num
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > step.num ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">{step.label}</span>
              </div>
              {index < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors ${
                    currentStep > step.num ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Room Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g., 201"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.buildingId}
                onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select a building</option>
                {buildings.map((building) => (
                  <option key={building.building_id} value={building.building_id}>
                    {building.building_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor Number</label>
              <input
                type="number"
                value={formData.floorNumber || ''}
                onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g., 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathroom Type</label>
              <select
                value={formData.bathroomType || ''}
                onChange={(e) => setFormData({ ...formData, bathroomType: e.target.value as BathroomType || undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select bathroom type</option>
                {BATHROOM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.roomType}
              onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomPoCType })}
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Private">Private (1 bed)</option>
              <option value="Shared">Shared (2-6 beds)</option>
            </select>
            <p className="text-sm text-gray-600 mt-2">
              {formData.roomType === 'Private'
                ? 'Private rooms have exactly 1 bed.'
                : 'Shared rooms can have 2-6 beds configured individually.'}
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Beds in Room <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                required
                value={formData.maxBeds}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  const minBeds = formData.roomType === 'Shared' ? 2 : 1
                  if (value >= minBeds && value <= 6) {
                    setFormData({ ...formData, maxBeds: value })
                  }
                }}
                min={formData.roomType === 'Shared' ? 2 : 1}
                max="6"
                disabled={formData.roomType === 'Private'}
                className={`w-32 px-4 py-3 text-2xl font-bold border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center ${
                  formData.roomType === 'Private' ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
              <p className="text-sm text-gray-600">
                {formData.roomType === 'Private'
                  ? 'Private rooms have exactly 1 bed.'
                  : 'This determines how many bed configuration sections appear (2-6).'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Bed Configuration */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Individual Beds</h2>
            <p className="text-gray-600">
              You have <span className="font-bold text-purple-600">{formData.maxBeds}</span> bed{formData.maxBeds > 1 ? 's' : ''} to configure. All fields are optional.
            </p>
          </div>

          <div className="space-y-4">
            {formData.beds.map((bed, index) => (
              <BedSection
                key={index}
                bedIndex={index}
                bedData={bed}
                onChange={handleBedChange}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Room Amenities & Photos */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Room Amenities */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Room Amenities</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROOM_AMENITIES_CONFIG.map((amenity) => (
                <label
                  key={amenity.key}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.roomAmenities[amenity.key]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.roomAmenities[amenity.key]}
                    onChange={() => handleAmenityToggle(amenity.key)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <amenity.icon className={`w-5 h-5 ${formData.roomAmenities[amenity.key] ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{amenity.label}</p>
                    <p className="text-xs text-gray-500">{amenity.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Room Photos */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Room Photos</h2>
            </div>
            <p className="text-gray-600 mb-4">Upload photos of this room. Images will be saved to the building's room folder.</p>

            {/* Current Photos - Draggable */}
            {formData.roomPhotos.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Photos ({formData.roomPhotos.length}) - <span className="text-gray-500 font-normal">Drag to reorder</span>
                </p>
                <DraggableFileImageGrid
                  files={formData.roomPhotos}
                  onReorder={(reorderedFiles) => {
                    setFormData(prev => ({ ...prev, roomPhotos: reorderedFiles }))
                  }}
                  onRemove={removePhoto}
                  columns={4}
                  imageHeight="h-32"
                />
              </div>
            )}

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Camera className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              {isDragging ? (
                <p className="text-blue-600 font-medium">Drop images here</p>
              ) : (
                <div>
                  <label htmlFor="room-photos" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500 font-medium">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </label>
                  <input
                    id="room-photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB each</p>
            </div>
          </div>

          {/* Custom Amenities */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="font-semibold text-gray-900 mb-2">Additional Amenities</h3>
            <p className="text-sm text-gray-600 mb-3">Add any amenities not listed above.</p>
            <textarea
              value={formData.customAmenities}
              onChange={(e) => setFormData({ ...formData, customAmenities: e.target.value })}
              placeholder="Example: Standing desk, Smart TV, Balcony with city view..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 4: Maintenance & Utilities */}
      {currentStep === 4 && (
        <div className="space-y-6">
          {/* Maintenance & Tracking */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Check className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Maintenance & Tracking</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Check Date</label>
                <input
                  type="date"
                  value={formData.maintenance.lastCheckDate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    maintenance: { ...formData.maintenance, lastCheckDate: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Who did the last maintenance? (Staff ID)</label>
                <input
                  type="text"
                  value={formData.maintenance.lastMaintenanceStaffId || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    maintenance: { ...formData.maintenance, lastMaintenanceStaffId: e.target.value }
                  })}
                  placeholder="ID of the staff member"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Renovation Date</label>
                <input
                  type="date"
                  value={formData.maintenance.lastRenovationDate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    maintenance: { ...formData.maintenance, lastRenovationDate: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Room Condition & Utilities */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Room Condition & Utilities</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Condition Score</label>
                <p className="text-xs text-gray-500 mb-2">Overall condition rating (1-10, 10 being excellent)</p>
                <input
                  type="number"
                  value={formData.condition.roomConditionScore || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    condition: { ...formData.condition, roomConditionScore: e.target.value ? parseInt(e.target.value) : undefined }
                  })}
                  placeholder="1-10"
                  min="1"
                  max="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cleaning Frequency</label>
                <p className="text-xs text-gray-500 mb-2">How often is this room professionally cleaned</p>
                <select
                  value={formData.condition.cleaningFrequency || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    condition: { ...formData.condition, cleaningFrequency: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  {CLEANING_FREQUENCIES.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Utilities Meter ID</label>
                <p className="text-xs text-gray-500 mb-2">Unique identifier for utilities metering (if applicable)</p>
                <input
                  type="text"
                  value={formData.condition.utilitiesMeterId || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    condition: { ...formData.condition, utilitiesMeterId: e.target.value }
                  })}
                  placeholder="e.g., ELEC-101-A"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Cleaning Date</label>
                <p className="text-xs text-gray-500 mb-2">When was this room last professionally cleaned</p>
                <input
                  type="date"
                  value={formData.condition.lastCleaningDate || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    condition: { ...formData.condition, lastCleaningDate: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Utilities Included */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Utilities Included</h2>
            </div>
            <p className="text-gray-600 mb-6">Select which utilities are included in the rent for better pricing transparency</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {UTILITIES_CONFIG.map((utility) => (
                <label
                  key={utility.key}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.utilitiesIncluded[utility.key]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.utilitiesIncluded[utility.key]}
                    onChange={() => handleUtilityToggle(utility.key)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <utility.icon className={`w-5 h-5 ${formData.utilitiesIncluded[utility.key] ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-gray-900">{utility.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              onClick={handlePrevious}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!canProceed() || isLoading}
              onClick={handleSubmitClick}
              className={`flex items-center gap-2 ${isEditMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'}`}
            >
              <Check className="w-4 h-4" />
              {isLoading
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update Room' : 'Create Room')}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
