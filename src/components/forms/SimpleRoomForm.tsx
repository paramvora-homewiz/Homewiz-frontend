'use client'

import React, { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SimpleRoomFormData {
  room_number: string
  building_id: string
  private_room_rent: number
  floor_number: number
  bed_count: number
}

interface SimpleRoomFormProps {
  onSubmit: (data: SimpleRoomFormData) => void
  onCancel?: () => void
}

export default function SimpleRoomForm({ onSubmit, onCancel }: SimpleRoomFormProps) {
  const [formData, setFormData] = useState<SimpleRoomFormData>({
    room_number: '',
    building_id: '',
    private_room_rent: 0,
    floor_number: 1,
    bed_count: 1
  })

  const handleInputChange = useCallback((field: keyof SimpleRoomFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }, [formData, onSubmit])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Simple Room Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <Input
                value={formData.room_number}
                onChange={(e) => handleInputChange('room_number', e.target.value)}
                placeholder="Enter room number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building ID *
              </label>
              <Input
                value={formData.building_id}
                onChange={(e) => handleInputChange('building_id', e.target.value)}
                placeholder="Enter building ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Private Room Rent ($) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.private_room_rent || ''}
                onChange={(e) => handleInputChange('private_room_rent', e.target.value ? parseFloat(e.target.value) : 0)}
                placeholder="e.g., 800.00"
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
                onChange={(e) => handleInputChange('floor_number', e.target.value ? parseInt(e.target.value) : 1)}
                placeholder="e.g., 1"
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
                onChange={(e) => handleInputChange('bed_count', e.target.value ? parseInt(e.target.value) : 1)}
                placeholder="e.g., 1"
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              Create Room
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
