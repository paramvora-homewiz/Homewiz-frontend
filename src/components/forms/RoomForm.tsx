'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import CopyFromPrevious from '@/components/ui/CopyFromPrevious'
import { RoomFormData } from '@/types'
import { Home, Save, X } from 'lucide-react'

// Smart suggestions for room numbers
const ROOM_NUMBER_PATTERNS = [
  '101', '102', '103', '104', '105',
  '201', '202', '203', '204', '205',
  'A1', 'A2', 'A3', 'B1', 'B2', 'B3',
  'Room 1', 'Room 2', 'Room 3', 'Room 4'
]

// Common room status options
const ROOM_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available for Rent', color: 'green' },
  { value: 'OCCUPIED', label: 'Currently Occupied', color: 'blue' },
  { value: 'MAINTENANCE', label: 'Under Maintenance', color: 'yellow' },
  { value: 'RESERVED', label: 'Reserved', color: 'purple' }
]

interface RoomFormProps {
  initialData?: Partial<RoomFormData>
  onSubmit: (data: RoomFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  buildings?: Array<{ building_id: string; building_name: string }>
}

export default function RoomForm({ initialData, onSubmit, onCancel, isLoading, buildings = [] }: RoomFormProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    room_number: '',
    building_id: '',
    ready_to_rent: true,
    status: 'AVAILABLE',
    active_tenants: 0,
    mini_fridge: false,
    sink: false,
    bedding_provided: false,
    work_desk: false,
    work_chair: false,
    heating: false,
    air_conditioning: false,
    cable_tv: false,
    furnished: false,
    ...initialData
  })

  const handleInputChange = (field: keyof RoomFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCopyFromPrevious = (copiedData: any) => {
    setFormData(prev => ({
      ...prev,
      ...copiedData,
      room_id: prev.room_id // Keep current room_id
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      room_id: formData.room_id || `room_${Date.now()}`
    }

    await onSubmit(submitData)
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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {initialData?.room_id ? 'Edit Room' : 'Add New Room'}
          </h1>
          <p className="text-xl text-gray-600">
            Configure room details and amenities
          </p>
        </motion.div>

        {/* Copy from Previous */}
        <CopyFromPrevious
          formType="room"
          onCopyData={handleCopyFromPrevious}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number *
                </label>
                <div className="relative">
                  <Input
                    value={formData.room_number}
                    onChange={(e) => handleInputChange('room_number', e.target.value)}
                    placeholder="Enter room number or select suggestion"
                    list="room-numbers"
                    required
                  />
                  <datalist id="room-numbers">
                    {ROOM_NUMBER_PATTERNS.map((pattern) => (
                      <option key={pattern} value={pattern} />
                    ))}
                  </datalist>
                </div>

                {/* Quick selection buttons */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {ROOM_NUMBER_PATTERNS.slice(0, 8).map((pattern) => (
                    <button
                      key={pattern}
                      type="button"
                      onClick={() => handleInputChange('room_number', pattern)}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                    >
                      {pattern}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building *
                </label>
                <select
                  value={formData.building_id}
                  onChange={(e) => handleInputChange('building_id', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a building</option>
                  {buildings.map(building => (
                    <option key={building.building_id} value={building.building_id}>
                      {building.building_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {ROOM_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Private Room Rent ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.private_room_rent || ''}
                  onChange={(e) => handleInputChange('private_room_rent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g., 800.00"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shared Room Rent ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.shared_room_rent_2 || ''}
                  onChange={(e) => handleInputChange('shared_room_rent_2', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g., 500.00"
                  min="0"
                />
              </div>
            </div>

            {/* Room Amenities */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Room Amenities
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'mini_fridge', label: 'Mini Fridge', icon: '❄️' },
                  { key: 'sink', label: 'Sink', icon: '🚿' },
                  { key: 'bedding_provided', label: 'Bedding Provided', icon: '🛏️' },
                  { key: 'work_desk', label: 'Work Desk', icon: '🪑' },
                  { key: 'work_chair', label: 'Work Chair', icon: '💺' },
                  { key: 'heating', label: 'Heating', icon: '🔥' },
                  { key: 'air_conditioning', label: 'A/C', icon: '❄️' },
                  { key: 'cable_tv', label: 'Cable TV', icon: '📺' },
                  { key: 'furnished', label: 'Furnished', icon: '🏠' }
                ].map((amenity) => (
                  <label key={amenity.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData[amenity.key as keyof RoomFormData] as boolean}
                      onChange={(e) => handleInputChange(amenity.key as keyof RoomFormData, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-lg">{amenity.icon}</span>
                    <span className="text-sm font-medium">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.ready_to_rent}
                  onChange={(e) => handleInputChange('ready_to_rent', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Ready to Rent</span>
              </label>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              <Save className="w-4 h-4 mr-2" />
              {initialData?.room_id ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
