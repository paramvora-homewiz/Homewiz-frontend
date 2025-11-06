'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { EnhancedCard, EnhancedInput, EnhancedSelect, QuickSelectButtons, StatusBadge } from '@/components/ui/enhanced-components'
import CopyFromPrevious from '@/components/ui/CopyFromPrevious'
import TemplateSelector from './TemplateSelector'
import TemplateSaveDialog from './TemplateSaveDialog'
import FormGuidance from './FormGuidance'
import { ValidationSummary, InlineValidation } from './EnhancedValidation'
import { RoomFormData, FormTemplate, RecentSubmission } from '@/types'
import { useFormTemplates } from '@/hooks/useFormTemplates'
import {
  validateRoomFormData,
  validateRoomFormDataForUpdate,
  transformRoomDataForBackend,
  BACKEND_ENUMS,
  ValidationResult,
  parseBuildingImages
} from '@/lib/backend-sync'
import { showSuccessMessage, showInfoMessage } from '@/lib/error-handler'
import { uploadRoomImages } from '@/lib/supabase/storage'
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
  Wrench,
  Camera
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
    subtitle: 'Room amenities and fixtures',
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

// Use backend-validated room type options
const ROOM_TYPE_OPTIONS = BACKEND_ENUMS.ROOM_TYPES.map(type => ({
  value: type,
  label: type,
  description: getRoomTypeDescription(type)
}))

// Helper function for room type descriptions
function getRoomTypeDescription(type: string): string {
  switch (type) {
    case 'Standard': return 'Basic room with essential amenities'
    case 'Suite': return 'Larger room with additional living space'
    case 'Studio': return 'Self-contained room with kitchenette'
    case 'Deluxe': return 'Premium room with upgraded features'
    case 'Penthouse': return 'Top-floor room with premium amenities'
    default: return 'Standard room configuration'
  }
}

// Configuration variants for different form complexities
type RoomFormVariant = 'full' | 'streamlined' | 'simple'

interface RoomFormConfig {
  // Visual configuration
  variant?: RoomFormVariant
  showProgressBar?: boolean
  showStepIndicators?: boolean
  theme?: 'premium' | 'standard' | 'minimal'
  
  // Feature toggles
  enableTemplates?: boolean
  enablePhotos?: boolean
  enableValidation?: boolean
  enableGuidance?: boolean
  enableKeyboardNav?: boolean
  enableStepNavigation?: boolean
  
  // Form configuration
  steps?: string[]
  requiredFields?: (keyof RoomFormData)[]
  maxSteps?: number
}

interface RoomFormProps {
  initialData?: Partial<RoomFormData>
  onSubmit: (data: RoomFormData) => Promise<void>
  onCancel?: () => void
  onBack?: () => void
  onSuccess?: () => void
  isLoading?: boolean
  buildings?: Array<{ building_id: string; building_name: string }>
  
  // Configuration for different variants
  config?: RoomFormConfig
}

// Step component props
interface StepProps {
  formData: RoomFormData;
  handleInputChange: (field: keyof RoomFormData, value: any) => void;
}

// Extended props for AmenitiesStep
interface AmenitiesStepProps extends StepProps {
  existingImages: string[];
  deletedImages: string[];
  setDeletedImages: React.Dispatch<React.SetStateAction<string[]>>;
}

interface BasicInformationStepProps extends StepProps {
  errors: Record<string, string>;
  buildings: Array<{ building_id: string; building_name: string }>;
  handleTemplateSelect: (template: FormTemplate) => void;
  handleRecentSelect: (submission: RecentSubmission) => void;
}

const BasicInformationStep = React.memo(({ 
  formData, 
  errors, 
  buildings, 
  handleInputChange, 
  handleTemplateSelect, 
  handleRecentSelect,
  config 
}: BasicInformationStepProps & { config: Required<RoomFormConfig> }) => (
    <div className="space-y-6">
      {/* Template Selector - conditionally rendered */}
      {config.enableTemplates && (
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
      )}

      <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Building field moved to first position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Select the building where this room is located</p>
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
              Room Type <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Select the type of room configuration</p>
            <select
              value={formData.room_type}
              onChange={(e) => handleInputChange('room_type', e.target.value)}
              className={`w-full p-3 border rounded-lg transition-colors ${
                errors.room_type
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
              required
            >
              {ROOM_TYPE_OPTIONS.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
            <InlineValidation message={errors.room_type} type="error" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Unique identifier for this room (e.g., 101, A2, Room 1)</p>
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Description
            </label>
            <p className="text-xs text-gray-500 mb-2">Brief description of the room features and layout</p>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="e.g., Spacious room with large windows, hardwood floors, and built-in storage..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors resize-vertical"
            />
          </div>

          {/* Maximum Tenants moved before Active Tenants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Beds/Occupancy <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Maximum number of beds this room can accommodate</p>
            <Input
              type="number"
              value={formData.maximum_people_in_room || ''}
              onChange={(e) => handleInputChange('maximum_people_in_room', e.target.value ? parseInt(e.target.value) : 1)}
              placeholder="Number of beds"
              min="1"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Tenants
            </label>
            <p className="text-xs text-gray-500 mb-2">Current number of tenants occupying this room</p>
            <Input
              type="number"
              value={formData.active_tenants || ''}
              onChange={(e) => handleInputChange('active_tenants', e.target.value ? parseInt(e.target.value) : 0)}
              placeholder="Number of current tenants"
              min="0"
              max={formData.maximum_people_in_room || undefined}
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Status
            </label>
            <p className="text-xs text-gray-500 mb-2">Current availability status of the room</p>
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
              Room Access Type
            </label>
            <p className="text-xs text-gray-500 mb-2">How tenants access this room</p>
            <select
              value={formData.room_access_type || 'KEY'}
              onChange={(e) => handleInputChange('room_access_type', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
            >
              <option value="KEY">Traditional Key</option>
              <option value="KEYCARD">Keycard</option>
              <option value="DIGITAL">Digital Lock</option>
              <option value="CODE">Access Code</option>
            </select>
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
  ));

const SpecificationsStep = React.memo(({ formData, handleInputChange }: StepProps) => (
    <div>
      <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Private Room Rent ($) <span className="text-red-500">*</span>
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
              Floor Number
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
              Number of Beds <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Total number of beds in this room</p>
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
              value={formData.square_footage || formData.sq_footage || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined
                handleInputChange('square_footage', value) // Backend field name
                handleInputChange('sq_footage', value)     // Frontend compatibility
              }}
              placeholder="e.g., 200"
              min="50"
              className="transition-colors focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathroom Type
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
              Bed Size
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
              Bed Type
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
  ));

const AvailabilityStep = React.memo(({ formData, handleInputChange }: StepProps) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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


          </div>
        </div>
      </Card>
    </div>
  ));

const AmenitiesStep = React.memo(({ formData, handleInputChange, existingImages, deletedImages, setDeletedImages }: AmenitiesStepProps) => (
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
              { key: 'sink', label: 'Shower', icon: '🚿', description: 'Private shower in room' },
              { key: 'bedding_provided', label: 'Bedding Provided', icon: '🛏️', description: 'Sheets and pillows included' },
              { key: 'work_desk', label: 'Work Desk', icon: '🪑', description: 'Desk provided in room' },
              { key: 'work_chair', label: 'Work Chair', icon: '💺', description: 'Chair provided in room' },
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

      {/* Room Photos Upload Section */}
      <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 mt-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Room Photos
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload photos of this room. Images will be saved to the building's room folder.
          </p>
          
          {/* Display existing images if in edit mode */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Current Photos ({existingImages.filter(img => !deletedImages.includes(img)).length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((imageUrl, index) => {
                  const isDeleted = deletedImages.includes(imageUrl)
                  // Debug logging for image URLs
                  if (index === 0 || !imageUrl.startsWith('http')) {
                    console.log(`🖼️ Rendering image [${index}]:`, {
                      imageUrl,
                      type: typeof imageUrl,
                      startsWithHttp: imageUrl.startsWith('http'),
                      length: imageUrl.length
                    })
                  }
                  return (
                    <div key={index} className={`relative group ${isDeleted ? 'opacity-50' : ''}`}>
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Room photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`❌ Failed to load image [${index}]:`, imageUrl)
                            e.currentTarget.src = '/placeholder-room.svg'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isDeleted) {
                            setDeletedImages(prev => prev.filter(img => img !== imageUrl))
                          } else {
                            setDeletedImages(prev => [...prev, imageUrl])
                          }
                        }}
                        className={`absolute top-2 right-2 w-6 h-6 ${
                          isDeleted 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        {isDeleted ? '↺' : <X className="w-4 h-4" />}
                      </button>
                      {isDeleted && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <span className="text-red-700 font-medium">Marked for deletion</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <div className="mb-4">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            </div>
            <div className="mb-4">
              <label htmlFor="room-photos-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  Click to upload room photos
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="room-photos-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files
                  if (files) {
                    const fileArray = Array.from(files)
                    handleInputChange('room_photos', fileArray)
                  }
                }}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500">
              Supported formats: JPEG, PNG, WebP, GIF up to 10MB each
            </p>
          </div>

          {/* Display selected photos */}
          {formData.room_photos && formData.room_photos.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Selected Photos ({formData.room_photos.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(formData.room_photos || []).map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Room photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newPhotos = formData.room_photos.filter((_, i) => i !== index)
                        handleInputChange('room_photos', newPhotos)
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg">
                      <p className="text-xs truncate">{file.name}</p>
                      <p className="text-xs text-gray-300">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  ));


const MaintenanceStep = React.memo(({ formData, handleInputChange }: StepProps) => (
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
                  Who did the last maintenance? (Staff ID)
                </label>
                <p className="text-xs text-gray-500 mb-2">ID of the staff member who performed the last maintenance</p>
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
              Room Condition & Utilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Condition Score
                </label>
                <p className="text-xs text-gray-500 mb-2">Overall condition rating (1-10, 10 being excellent)</p>
                <Input
                  type="number"
                  value={formData.room_condition_score || ''}
                  onChange={(e) => handleInputChange('room_condition_score', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="1-10"
                  min="1"
                  max="10"
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cleaning Frequency
                </label>
                <p className="text-xs text-gray-500 mb-2">How often is this room professionally cleaned</p>
                <select
                  value={formData.cleaning_frequency || 'WEEKLY'}
                  onChange={(e) => handleInputChange('cleaning_frequency', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-colors"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="ON_REQUEST">On Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilities Meter ID
                </label>
                <p className="text-xs text-gray-500 mb-2">Unique identifier for utilities metering (if applicable)</p>
                <Input
                  value={formData.utilities_meter_id || ''}
                  onChange={(e) => handleInputChange('utilities_meter_id', e.target.value || undefined)}
                  placeholder="e.g., ELEC-101-A"
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Cleaning Date
                </label>
                <p className="text-xs text-gray-500 mb-2">When was this room last professionally cleaned</p>
                <Input
                  type="date"
                  value={formData.last_cleaning_date || ''}
                  onChange={(e) => handleInputChange('last_cleaning_date', e.target.value || undefined)}
                  className="transition-colors focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Utilities Included Section - JSON structured */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              ⚡ Utilities Included
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which utilities are included in the rent for better pricing transparency
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'electricity', label: 'Electricity', icon: '⚡' },
                { key: 'water', label: 'Water', icon: '💧' },
                { key: 'gas', label: 'Gas', icon: '🔥' },
                { key: 'internet', label: 'Internet', icon: '🌐' },
                { key: 'cable_tv', label: 'Cable TV', icon: '📺' },
                { key: 'trash', label: 'Trash', icon: '🗑️' },
                { key: 'heating', label: 'Heating', icon: '🔥' },
                { key: 'air_conditioning', label: 'AC', icon: '❄️' }
              ].map((utility) => {
                const isIncluded = typeof formData.utilities_included === 'object' 
                  ? formData.utilities_included?.[utility.key] || false
                  : false
                  
                return (
                  <label
                    key={utility.key}
                    className={`
                      flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200
                      ${isIncluded
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={(e) => {
                        const currentUtilities = typeof formData.utilities_included === 'object' 
                          ? formData.utilities_included || {}
                          : {}
                        handleInputChange('utilities_included', {
                          ...currentUtilities,
                          [utility.key]: e.target.checked
                        })
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-lg">{utility.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{utility.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  ));

/**
 * Unified RoomForm component supporting multiple variants and configurations
 * 
 * This component consolidates the functionality of RoomForm, NewRoomForm, and SimpleRoomForm
 * into a single configurable component that can adapt to different use cases.
 * 
 * Supported Variants:
 * - 'full': Complete multi-step form with all features (templates, photos, validation)
 * - 'streamlined': Multi-step form without advanced features like templates
 * - 'simple': Single-step form with only essential fields
 * 
 * Configuration Options:
 * - Visual: Progress bars, step indicators, themes
 * - Features: Templates, photos, validation, guidance, keyboard navigation
 * - Form: Custom steps, required fields, step limits
 */
function RoomForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  onBack, 
  onSuccess,
  isLoading, 
  buildings = [],
  config 
}: RoomFormProps) {
  
  // Default configuration based on variant
  const getDefaultConfig = (variant: RoomFormVariant = 'full'): Required<RoomFormConfig> => {
    const configs = {
      full: {
        variant: 'full' as const,
        showProgressBar: true,
        showStepIndicators: true,
        theme: 'premium' as const,
        enableTemplates: true,
        enablePhotos: true,
        enableValidation: true,
        enableGuidance: true,
        enableKeyboardNav: true,
        enableStepNavigation: true,
        steps: ['basic', 'specifications', 'availability', 'amenities', 'maintenance'],
        requiredFields: ['room_number', 'building_id', 'room_type'] as (keyof RoomFormData)[],
        maxSteps: 5
      },
      streamlined: {
        variant: 'streamlined' as const,
        showProgressBar: true,
        showStepIndicators: true,
        theme: 'standard' as const,
        enableTemplates: false,
        enablePhotos: true,
        enableValidation: true,
        enableGuidance: false,
        enableKeyboardNav: false,
        enableStepNavigation: true,
        steps: ['basic', 'specifications', 'availability', 'amenities', 'maintenance'],
        requiredFields: ['room_number', 'building_id', 'room_type'] as (keyof RoomFormData)[],
        maxSteps: 5
      },
      simple: {
        variant: 'simple' as const,
        showProgressBar: false,
        showStepIndicators: false,
        theme: 'minimal' as const,
        enableTemplates: false,
        enablePhotos: false,
        enableValidation: false,
        enableGuidance: false,
        enableKeyboardNav: false,
        enableStepNavigation: false,
        steps: ['basic'],
        requiredFields: ['room_number', 'building_id', 'room_type', 'private_room_rent', 'floor_number', 'bed_count'] as (keyof RoomFormData)[],
        maxSteps: 1
      }
    }
    return configs[variant]
  }
  
  // Merge user config with defaults
  const finalConfig = {
    ...getDefaultConfig(config?.variant),
    ...config
  }

  const [currentStep, setCurrentStep] = useState<FormStep>('basic')
  const [completedSteps, setCompletedSteps] = useState<Set<FormStep>>(new Set())
  const [formData, setFormData] = useState<RoomFormData>({
    room_number: '',
    building_id: '',
    room_type: 'Standard', // Critical: Required field for database schema compliance
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
    last_renovation_date: undefined,
    virtual_tour_url: undefined,
    available_from: undefined,
    additional_features: undefined,
    room_photos: [], // Add room photos array
    // New fields
    room_access_type: 'KEY',
    internet_speed: undefined,
    room_condition_score: undefined,
    cleaning_frequency: 'WEEKLY',
    utilities_meter_id: undefined,
    last_cleaning_date: undefined,
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showTemplateSaveDialog, setShowTemplateSaveDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Handle existing images
  const [existingImages, setExistingImages] = useState<string[]>(() => {
    console.log('🖼️ Initializing existing images:', {
      hasInitialData: !!initialData,
      roomId: initialData?.room_id,
      room_images: initialData?.room_images,
      images: initialData?.images,
      type_room_images: typeof initialData?.room_images,
      type_images: typeof initialData?.images,
      initialDataKeys: initialData ? Object.keys(initialData) : []
    })
    
    // Check both room_images and images fields
    let parsed: string[] = []
    
    // First check if images array is already parsed (from EditRoomModal)
    if (initialData?.images && Array.isArray(initialData.images)) {
      console.log('🖼️ Using pre-parsed images array:', initialData.images)
      console.log('🖼️ Image URLs in array:')
      initialData.images.forEach((img, idx) => {
        console.log(`  [${idx}]: "${img}" (type: ${typeof img}, valid: ${img.startsWith('http') || img.startsWith('/')})`)
      })
      parsed = initialData.images
    } else if (initialData?.room_images) {
      console.log('🖼️ Parsing room_images:', initialData.room_images)
      parsed = parseBuildingImages(initialData.room_images)
      console.log('🖼️ Parsed from room_images:', parsed)
    } else if (initialData?.images) {
      console.log('🖼️ Parsing images:', initialData.images)
      parsed = parseBuildingImages(initialData.images)
      console.log('🖼️ Parsed from images:', parsed)
    }
    
    // Update existingImages if we found any during initialization
    if (parsed.length > 0) {
      console.log('🖼️ Found existing images during initialization:', parsed)
    } else {
      console.log('⚠️ No existing images found during initialization')
    }
    
    return parsed
  })
  const [deletedImages, setDeletedImages] = useState<string[]>([])

  // Template management
  const { saveRecentSubmission, saveTemplate } = useFormTemplates({ formType: 'room' })

  // Get active steps based on configuration
  const activeSteps = useMemo(() => {
    return FORM_STEPS.filter(step => finalConfig.steps.includes(step.id))
  }, [finalConfig.steps])

  // Update step index calculation to use active steps
  const currentStepIndex = useMemo(() => 
    activeSteps.findIndex(step => step.id === currentStep), 
    [activeSteps, currentStep]
  )
  const isFirstStep = useMemo(() => currentStepIndex === 0, [currentStepIndex])
  const isLastStep = useMemo(() => currentStepIndex === activeSteps.length - 1, [currentStepIndex, activeSteps.length])

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < activeSteps.length - 1) {
      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(activeSteps[currentStepIndex + 1].id)
    }
  }, [currentStep, currentStepIndex, activeSteps])

  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(activeSteps[currentStepIndex - 1].id)
    }
  }, [currentStepIndex, activeSteps])

  const goToStep = useCallback((stepId: FormStep) => {
    setCurrentStep(stepId)
  }, [])



  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with form inputs
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement || 
          e.target instanceof HTMLSelectElement) {
        return
      }

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
  }, [isFirstStep, isLastStep, goToPreviousStep, goToNextStep])

  // Building selection pre-population logic
  React.useEffect(() => {
    if (formData.building_id && buildings.length > 0) {
      const selectedBuilding = buildings.find(b => b.building_id === formData.building_id)
      
      if (selectedBuilding) {
        console.log('🏢 Building selected:', selectedBuilding.building_name)
        console.log('🔄 Pre-populating room amenities from building data...')
        
        // Pre-populate amenities based on building features
        const updates: Partial<RoomFormData> = {}
        
        // Check building amenities and pre-populate room amenities accordingly
        if (selectedBuilding.amenities && Array.isArray(selectedBuilding.amenities)) {
          // Convert building amenities to room-specific features
          if (selectedBuilding.amenities.includes('WiFi')) {
            // Building has WiFi, assume rooms also have good internet
          }
          
          if (selectedBuilding.amenities.includes('Fitness Center') || selectedBuilding.amenities.includes('Gym')) {
            // Building has fitness facilities
          }
          
          if (selectedBuilding.amenities.includes('Study Areas') || selectedBuilding.amenities.includes('Work Areas')) {
            updates.work_desk = true
            updates.work_chair = true
          }
          
          if (selectedBuilding.amenities.includes('Air Conditioning')) {
            updates.air_conditioning = true
          }
          
          if (selectedBuilding.amenities.includes('Heating')) {
            updates.heating = true
          }
          
          if (selectedBuilding.amenities.includes('Cable TV')) {
            updates.cable_tv = true
          }
        }
        
        // Check specific building features from BuildingFormData
        const buildingData = selectedBuilding as any // Cast to access BuildingFormData fields
        
        if (buildingData.wifi_included === true) {
          // Building includes WiFi
        }
        
        if (buildingData.work_study_area === true) {
          updates.work_desk = true
          updates.work_chair = true
        }
        
        if (buildingData.utilities_included === true) {
          updates.heating = true
          updates.air_conditioning = true
        }
        
        // Only update if we have actual changes to make
        if (Object.keys(updates).length > 0) {
          console.log('📝 Applying building-based pre-population:', updates)
          setFormData(prev => ({ 
            ...prev, 
            ...updates 
          }))
        }
      }
    }
  }, [formData.building_id, buildings])

  const handleInputChange = useCallback((field: keyof RoomFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear any existing errors for this field
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
      return prev
    })
  }, []) // Keep empty dependency array since we use functional updates

  const handleCopyFromPrevious = useCallback((copiedData: any) => {
    setFormData(prev => ({
      ...prev,
      ...copiedData,
      room_id: prev.room_id // Keep current room_id
    }))
  }, [])

  // Handle template selection
  const handleTemplateSelect = useCallback((template: FormTemplate) => {
    setFormData(prev => ({
      ...prev,
      ...template.data,
      room_id: prev.room_id, // Keep current room_id
      room_number: prev.room_number || template.data.room_number // Keep current room number if set
    }))

    // Temporarily disable message to test
    console.log('Template applied:', template.name)
    // showSuccessMessage(
    //   'Template Applied',
    //   `Template "${template.name}" has been loaded successfully.`,
    //   {
    //     action: {
    //       label: 'View Details',
    //       onClick: () => console.log('Template details:', template)
    //     }
    //   }
    // )
  }, [])

  // Handle recent submission selection
  const handleRecentSelect = useCallback((submission: RecentSubmission) => {
    setFormData(prev => ({
      ...prev,
      ...submission.data,
      room_id: prev.room_id, // Keep current room_id
      room_number: prev.room_number || submission.data.room_number // Keep current room number if set
    }))

    // Temporarily disable message to test
    console.log('Previous data loaded from recent submission')
    // showInfoMessage(
    //   'Previous Data Loaded',
    //   'Your previous submission data has been applied to the form.'
    // )
  }, [])

  // Handle template save
  const handleSaveTemplate = useCallback(async (templateData: any) => {
    try {
      await saveTemplate(templateData)
      console.log('Template saved successfully:', templateData.name)
      // Temporarily disable message to test
      // showSuccessMessage(
      //   'Template Saved',
      //   `Template "${templateData.name}" has been saved successfully.`,
      //   {
      //     action: {
      //       label: 'View Templates',
      //       onClick: () => console.log('Navigate to templates')
      //     }
      //   }
      // )
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }, [saveTemplate])

  // Generate preview text for recent submissions
  const generatePreviewText = (data: RoomFormData): string => {
    const parts = []
    if (data.room_number) parts.push(`Room ${data.room_number}`)
    if (data.bed_count) parts.push(`${data.bed_count} bed${data.bed_count > 1 ? 's' : ''}`)
    if (data.bathroom_type) parts.push(data.bathroom_type.toLowerCase())
    if (data.private_room_rent) parts.push(`${data.private_room_rent}/month`)
    return parts.join(', ') || 'Room configuration'
  }

  // Check if any non-image fields have changed
  const hasNonImageChanges = (currentData: RoomFormData, originalData: any): boolean => {
    // List of fields to check (excluding image-related fields)
    const fieldsToCheck = [
      'room_number', 'room_type', 'status', 'ready_to_rent',
      'private_room_rent', 'shared_room_rent_2', 'shared_room_rent_3', 'shared_room_rent_4',
      'floor_number', 'bed_count', 'bathroom_type', 'bed_size', 'bed_type',
      'view', 'sq_footage', 'square_footage', 'maximum_people_in_room',
      'mini_fridge', 'sink', 'bedding_provided', 'work_desk', 'work_chair',
      'heating', 'air_conditioning', 'cable_tv', 'furnished',
      'room_storage', 'noise_level', 'sunlight', 'active_tenants',
      'booked_from', 'booked_till', 'available_from',
      'last_check', 'last_check_by', 'last_renovation_date',
      'virtual_tour_url', 'description', 'additional_features',
      'room_access_type', 'internet_speed', 'room_condition_score',
      'cleaning_frequency', 'utilities_meter_id', 'last_cleaning_date',
      'utilities_included'
    ]

    // Check each field for changes
    for (const field of fieldsToCheck) {
      const currentValue = (currentData as any)[field]
      const originalValue = originalData[field]
      
      // Handle different types of comparisons
      if (typeof currentValue === 'boolean' || typeof originalValue === 'boolean') {
        if (Boolean(currentValue) !== Boolean(originalValue)) {
          console.log(`Field ${field} changed: ${originalValue} → ${currentValue}`)
          return true
        }
      } else if (typeof currentValue === 'number' || typeof originalValue === 'number') {
        if (Number(currentValue || 0) !== Number(originalValue || 0)) {
          console.log(`Field ${field} changed: ${originalValue} → ${currentValue}`)
          return true
        }
      } else if (typeof currentValue === 'object' && currentValue !== null) {
        // For objects like utilities_included, compare JSON strings
        if (JSON.stringify(currentValue) !== JSON.stringify(originalValue || {})) {
          console.log(`Field ${field} changed: ${JSON.stringify(originalValue)} → ${JSON.stringify(currentValue)}`)
          return true
        }
      } else {
        // String comparison (treat empty string, null, and undefined as equivalent)
        const current = String(currentValue || '').trim()
        const original = String(originalValue || '').trim()
        if (current !== original) {
          console.log(`Field ${field} changed: "${original}" → "${current}"`)
          return true
        }
      }
    }

    return false
  }

  /**
   * Complex form submission handler with multi-step validation and image upload coordination
   * 
   * This function orchestrates the complete room creation workflow including:
   * 
   * Submission Control:
   * - Double-submission prevention using state flags
   * - Step-based submission control (currently disabled for debugging)
   * - Form event handling and propagation control
   * 
   * Validation Pipeline:
   * - Frontend validation using backend-sync validation rules
   * - Business rule validation (room numbers, occupancy limits, etc.)
   * - Required field checking with user-friendly error messages
   * 
   * Data Processing:
   * - Form data transformation from frontend to backend format
   * - Image upload coordination with progress tracking
   * - Backend API submission with error handling
   * 
   * User Experience:
   * - Loading state management during submission
   * - Progress feedback for image uploads
   * - Success/error message display
   * - Form state cleanup after successful submission
   * 
   * Error Recovery:
   * - Validation error display with field-level highlighting
   * - Network error handling with retry opportunities
   * - State restoration on submission failure
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    console.log('🚀 handleSubmit called', {
      eventType: e.type,
      target: e.target,
      currentTarget: e.currentTarget,
      isSubmitting,
      isLoading,
      timestamp: new Date().toISOString(),
      hasRoomPhotos: !!formData.room_photos,
      roomPhotoCount: formData.room_photos?.length || 0,
      hasInitialData: !!initialData,
      roomId: initialData?.room_id,
      buildingId: initialData?.building_id || formData.building_id
    })

    e.preventDefault()
    e.stopPropagation()

    // Critical: Prevent double submission which could create duplicate records
    if (isSubmitting || isLoading) {
      console.log('⚠️ Submission blocked - already submitting or loading')
      return
    }

    // Multi-step form control: Ensure submission only happens on final step
    console.log('🔍 Step debug:', {
      currentStep,
      currentStepIndex,
      isLastStep,
      totalSteps: FORM_STEPS.length,
      lastStepIndex: FORM_STEPS.length - 1
    })

    // Temporarily remove step restriction to show validation errors
    // TODO: Re-enable step restriction once validation flow is optimized
    // if (!isLastStep) {
    //   console.log('⚠️ Submission blocked - not on last step')
    //   return
    // }

    console.log('✅ Proceeding with form submission')
    setIsSubmitting(true)

    try {
      // Handle existing images - filter out deleted ones
      const remainingExistingImages = existingImages.filter(img => !deletedImages.includes(img))

      // Store room photos for upload
      const roomPhotos = formData.room_photos && formData.room_photos.length > 0 ? formData.room_photos : null

      // Check if this is an image-only update BEFORE validation
      const isImageOnlyUpdate = initialData?.room_id && 
        (deletedImages.length > 0 || roomPhotos) &&
        !hasNonImageChanges(formData, initialData)

      if (isImageOnlyUpdate) {
        console.log('📸 Detected image-only update - skipping validation')
        console.log('📸 Image update details:', {
          hasDeletedImages: deletedImages.length > 0,
          deletedCount: deletedImages.length,
          hasNewPhotos: !!roomPhotos,
          newPhotoCount: roomPhotos?.length || 0,
          existingImageCount: existingImages.length,
          remainingExistingCount: remainingExistingImages.length,
          remainingImages: remainingExistingImages,
          newPhotos: roomPhotos?.map(f => f.name)
        })
        
        try {
          // Upload new images if any
          let newImageUrls: string[] = []
          if (roomPhotos && initialData.building_id) {
            console.log(`📸 Uploading ${roomPhotos.length} new room images...`)
            console.log(`📸 Using building_id from initialData: ${initialData.building_id}`)
            console.log(`📸 Using room_id: ${initialData.room_id}`)
            const uploadResults = await uploadRoomImages(initialData.building_id, initialData.room_id, roomPhotos)
            console.log('📸 Upload results:', uploadResults)
            const successfulUploads = uploadResults.filter(result => result.success)
            newImageUrls = successfulUploads.map(result => result.url).filter(Boolean)
            
            if (successfulUploads.length < roomPhotos.length) {
              const failedCount = roomPhotos.length - successfulUploads.length
              showInfoMessage(`${successfulUploads.length} images uploaded successfully, ${failedCount} failed.`)
            }
          }
          
          // Combine existing (non-deleted) images with new uploads
          const allImageUrls = [...remainingExistingImages, ...newImageUrls]
          console.log('📸 All image URLs to save:', {
            count: allImageUrls.length,
            urls: allImageUrls
          })
          
          // Use the dedicated image update function from RoomFormIntegration
          const { RoomFormIntegration } = await import('@/lib/supabase/form-integration')
          const updateResult = await RoomFormIntegration.updateRoomImages(
            initialData.room_id,
            allImageUrls.length > 0 ? allImageUrls : null
          )
          console.log('📸 Database update result:', updateResult)
          
          if (updateResult.success) {
            showSuccessMessage(updateResult.message || 'Room images updated successfully!')
            // Save to recent submissions even for image-only updates
            const previewText = generatePreviewText(formData)
            await saveRecentSubmission(formData, previewText)
            
            // Call onSuccess to trigger parent component refresh
            if (onSuccess) {
              setTimeout(() => {
                onSuccess()
              }, 1000) // Small delay to ensure database update is complete
            }
          } else {
            showWarningMessage(updateResult.error || 'Failed to update room images')
          }
          
          return // Exit early for image-only updates
        } catch (error) {
          console.error('❌ Error during image-only update:', error)
          showWarningMessage('Failed to update room images. Please try again.')
          return
        } finally {
          setIsSubmitting(false)
        }
      }

      // Regular update/creation flow - validate first
      // Use less strict validation for updates
      const validationResult = initialData?.room_id 
        ? validateRoomFormDataForUpdate(formData)
        : validateRoomFormData(formData)
        
      if (!validationResult.isValid) {
        console.error('❌ Room form validation failed:', validationResult)
        console.error('❌ Missing required fields:', validationResult.missingRequired)
        console.error('❌ Validation errors:', validationResult.errors)
        console.error('❌ Current form data:', formData)
        setErrors(validationResult.errors)
        setIsSubmitting(false)

        // Provide specific feedback about what needs to be fixed
        showInfoMessage(`Please fill in all required fields. Missing: ${validationResult.missingRequired?.join(', ') || 'Unknown fields'}`)
        return
      }

      // Transform frontend form data to backend database format
      const transformedData = transformRoomDataForBackend(formData)

      // If editing and we have existing images, include them in the transformed data
      if (initialData?.room_id && remainingExistingImages.length > 0) {
        transformedData.room_images = JSON.stringify(remainingExistingImages)
      }

      // Submit room data (with existing images if editing)
      const submitResult = await onSubmit(transformedData)
      
      // Extract room data from result
      const createdRoom = submitResult?.data || submitResult

      // Standard room update/creation flow continues here...
      // Upload room images after room creation/update if we have photos
      const isEditMode = !!initialData?.room_id
      const roomId = createdRoom?.room_id || initialData?.room_id
      const buildingId = createdRoom?.building_id || initialData?.building_id || formData.building_id
      
      if (roomPhotos && roomId && buildingId) {
        try {
          // Log the context
          console.log('📸 Image upload context:', {
            isEditMode,
            roomId,
            buildingId,
            photoCount: roomPhotos.length,
            hasCreatedRoom: !!createdRoom,
            createdRoomId: createdRoom?.room_id,
            initialRoomId: initialData?.room_id
          })
          
          console.log(`📸 Uploading ${roomPhotos.length} room images...`)
          console.log(`📸 Room ID: ${roomId}`)
          console.log(`📸 Building ID: ${buildingId}`)
          console.log(`📸 Is Edit Mode: ${!!initialData?.room_id}`)

          // Use Supabase storage to upload images
          const uploadResults = await uploadRoomImages(buildingId, roomId, roomPhotos)

          // Check if any uploads were successful
          const successfulUploads = uploadResults.filter(result => result.success)
          const failedUploads = uploadResults.filter(result => !result.success)

          if (successfulUploads.length > 0) {
            console.log(`✅ Successfully uploaded ${successfulUploads.length} room images`)
            console.log('📸 Upload results:', successfulUploads)

            // Extract image URLs from successful uploads
            const newImageUrls = successfulUploads.map(result => result.url).filter(Boolean)

            // Combine existing images with new uploads
            const allImageUrls = [...remainingExistingImages, ...newImageUrls]

            if (allImageUrls.length > 0) {
              try {
                // Update room record in database with combined image URLs
                console.log(`🔗 Updating room ${roomId} with ${allImageUrls.length} image URLs (${remainingExistingImages.length} existing, ${newImageUrls.length} new)...`)

                // Use the dedicated image update function
                const { RoomFormIntegration } = await import('@/lib/supabase/form-integration')
                const updateResult = await RoomFormIntegration.updateRoomImages(
                  roomId,
                  allImageUrls
                )

                if (updateResult.success) {
                  console.log(`✅ Room database record updated with ${allImageUrls.length} image URLs`)

                  if (failedUploads.length > 0) {
                    showInfoMessage(`${successfulUploads.length} images uploaded and saved successfully, ${failedUploads.length} failed.`)
                  } else {
                    showSuccessMessage('All room images uploaded and saved successfully!')
                  }
                  
                  // Call onSuccess to trigger parent component refresh
                  if (onSuccess) {
                    setTimeout(() => {
                      onSuccess()
                    }, 1000) // Small delay to ensure database update is complete
                  }
                } else {
                  console.error('❌ Failed to update room record with image URLs:', updateResult.error)
                  showInfoMessage(`${successfulUploads.length} images uploaded to storage, but failed to save URLs to database.`)
                }
              } catch (dbError) {
                console.error('❌ Error updating room record with image URLs:', dbError)
                showInfoMessage(`${successfulUploads.length} images uploaded to storage, but failed to save URLs to database.`)
              }
            }
          } else {
            console.error('❌ All room image uploads failed:', failedUploads)
            showInfoMessage('Room created successfully, but images could not be uploaded.')
          }
        } catch (error) {
          console.error('❌ Error uploading room images:', error)
          showInfoMessage('Room created successfully, but images could not be uploaded.')
        }
      } else if (roomPhotos && !buildingId) {
        console.warn('⚠️ Cannot upload room images: missing building_id')
        console.warn('Debug info:', {
          formDataBuildingId: formData.building_id,
          initialDataBuildingId: initialData?.building_id,
          createdRoomBuildingId: createdRoom?.building_id
        })
        showInfoMessage('Room saved successfully, but images could not be uploaded (missing building ID).')
      } else if (roomPhotos) {
        console.log('📸 Room photos selected but conditions not met:', {
          hasRoomPhotos: !!roomPhotos,
          photoCount: roomPhotos?.length,
          hasRoomId: !!roomId,
          hasBuildingId: !!buildingId,
          roomId,
          buildingId
        })
      }

      // Save to recent submissions after successful submit
      const previewText = generatePreviewText(formData)
      await saveRecentSubmission(formData, previewText)
      
      // If no photos were uploaded but the room was updated, still call onSuccess
      if (!roomPhotos && submitResult?.success && onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 500) // Small delay to ensure database update is complete
      }
      
      // Call onComplete callback if provided in the submit result
      if (submitResult?.onComplete) {
        setTimeout(() => {
          submitResult.onComplete()
        }, 1500) // Delay to ensure all operations are complete
      }
    } catch (error) {
      // Handle submission error
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSubmit, onSuccess, saveRecentSubmission, isSubmitting, isLoading, existingImages, deletedImages, initialData])


  // Step indicator component with conditional rendering
  const StepIndicator = useCallback(() => {
    if (!finalConfig.showStepIndicators) return null
    
    const progress = ((currentStepIndex + 1) / activeSteps.length) * 100

    return (
      <div className="mb-8">
        {/* Progress Bar - conditionally rendered */}
        {finalConfig.showProgressBar && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  finalConfig.theme === 'premium' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                    : finalConfig.theme === 'standard'
                    ? 'bg-blue-500'
                    : 'bg-gray-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {activeSteps.map((step, index) => {
            const isActive = step.id === currentStep
            const isCompleted = completedSteps.has(step.id)
            const isAccessible = index <= currentStepIndex || isCompleted
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
            {FORM_STEPS[currentStepIndex].title}
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
              : FORM_STEPS[currentStepIndex].subtitle
            }
          </p>
        </div>
      </div>
    )
  }, [currentStepIndex, currentStep, completedSteps, isLastStep, goToStep])

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
            currentStep={currentStepIndex}
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

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Prevent Enter key from auto-submitting the form unless it's the submit button
            if (e.key === 'Enter') {
              const target = e.target as HTMLElement
              // Only allow submission if Enter is pressed on the submit button
              if ((target as any).type !== 'submit' && target.tagName !== 'BUTTON') {
                e.preventDefault()
                e.stopPropagation()
              }
            }
          }}
          className="space-y-6"
          noValidate
        >
          <AnimatePresence mode="wait">
            {currentStep === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BasicInformationStep
                  formData={formData}
                  errors={errors}
                  buildings={buildings}
                  handleInputChange={handleInputChange}
                  handleTemplateSelect={handleTemplateSelect}
                  handleRecentSelect={handleRecentSelect}
                  config={finalConfig}
                />
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
                <SpecificationsStep formData={formData} handleInputChange={handleInputChange} />
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
                <AvailabilityStep formData={formData} handleInputChange={handleInputChange} />
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
                <AmenitiesStep 
                  formData={formData} 
                  handleInputChange={handleInputChange}
                  existingImages={existingImages}
                  deletedImages={deletedImages}
                  setDeletedImages={setDeletedImages}
                />
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
                <MaintenanceStep formData={formData} handleInputChange={handleInputChange} />
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
              Step {currentStepIndex + 1} of {FORM_STEPS.length}
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
                  type="button"
                  disabled={isLoading || isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  onClick={(e) => {
                    // Ensure this is an intentional click, not an accidental trigger
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('🔘 Create Room button clicked intentionally')

                    // Manually trigger form submission
                    const form = e.currentTarget.closest('form')
                    if (form) {
                      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                      form.dispatchEvent(submitEvent)
                    }
                  }}
                >
                  {(isLoading || isSubmitting) && <LoadingSpinner size="sm" />}
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

// Compatibility wrapper for NewRoomForm (streamlined variant)
export const NewRoomForm = React.memo((props: Omit<RoomFormProps, 'config'>) => {
  return (
    <RoomForm 
      {...props} 
      config={{ 
        variant: 'streamlined',
        enableTemplates: false,
        enablePhotos: true,
        enableValidation: true
      }} 
    />
  )
})

// Compatibility wrapper for SimpleRoomForm (simple variant)
interface SimpleRoomFormData {
  room_number: string
  building_id: string
  room_type: string
  private_room_rent: number
  floor_number: number
  bed_count: number
}

interface SimpleRoomFormProps {
  onSubmit: (data: SimpleRoomFormData) => void
  onCancel?: () => void
}

export const SimpleRoomForm = React.memo(({ onSubmit, onCancel }: SimpleRoomFormProps) => {
  // Wrapper to convert synchronous onSubmit to async
  const handleSubmit = async (data: RoomFormData) => {
    // Extract only the simple form fields
    const simpleData: SimpleRoomFormData = {
      room_number: data.room_number,
      building_id: data.building_id,
      room_type: data.room_type,
      private_room_rent: data.private_room_rent,
      floor_number: data.floor_number,
      bed_count: data.bed_count
    }
    onSubmit(simpleData)
  }

  return (
    <RoomForm 
      onSubmit={handleSubmit}
      onCancel={onCancel}
      config={{ 
        variant: 'simple',
        enableTemplates: false,
        enablePhotos: false,
        enableValidation: false,
        enableStepNavigation: false,
        steps: ['basic'],
        requiredFields: ['room_number', 'building_id', 'room_type', 'private_room_rent', 'floor_number', 'bed_count']
      }} 
    />
  )
})

export default React.memo(RoomForm)
