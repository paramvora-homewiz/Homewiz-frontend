'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface HousingPreferencesStepProps {
  form: UseFormReturn<any>
}

export function HousingPreferencesStep({ form }: HousingPreferencesStepProps) {
  const { register, formState: { errors }, watch } = form

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Budget & Timeline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Budget ($) *
            </label>
            <Input
              type="number"
              {...register('budget_min', { valueAsNumber: true })}
              placeholder="500"
              className={errors.budget_min ? 'border-red-500' : ''}
            />
            {errors.budget_min && (
              <p className="text-red-500 text-sm mt-1">{errors.budget_min.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Budget ($) *
            </label>
            <Input
              type="number"
              {...register('budget_max', { valueAsNumber: true })}
              placeholder="1500"
              className={errors.budget_max ? 'border-red-500' : ''}
            />
            {errors.budget_max && (
              <p className="text-red-500 text-sm mt-1">{errors.budget_max.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Move-in Date *
            </label>
            <Input
              type="date"
              {...register('preferred_move_in_date')}
              className={errors.preferred_move_in_date ? 'border-red-500' : ''}
            />
            {errors.preferred_move_in_date && (
              <p className="text-red-500 text-sm mt-1">{errors.preferred_move_in_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Lease Term (months) *
            </label>
            <select
              {...register('preferred_lease_term', { valueAsNumber: true })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={9}>9 months</option>
              <option value={12}>12 months</option>
              <option value={18}>18 months</option>
              <option value={24}>24 months</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Room Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type
            </label>
            <select
              {...register('room_type')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">No preference</option>
              <option value="private">Private Room</option>
              <option value="shared">Shared Room</option>
              <option value="either">Either</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathroom Type
            </label>
            <select
              {...register('bathroom_type')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">No preference</option>
              <option value="private">Private Bathroom</option>
              <option value="shared">Shared Bathroom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Preference
            </label>
            <select
              {...register('floor_preference')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">No preference</option>
              <option value="low">Lower floors</option>
              <option value="high">Higher floors</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Amenities</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'amenity_wifi', label: 'WiFi' },
            { key: 'amenity_laundry', label: 'Laundry' },
            { key: 'amenity_parking', label: 'Parking' },
            { key: 'amenity_security', label: 'Security' },
            { key: 'amenity_gym', label: 'Gym' },
            { key: 'amenity_common_area', label: 'Common Area' },
            { key: 'amenity_rooftop', label: 'Rooftop' },
            { key: 'amenity_bike_storage', label: 'Bike Storage' }
          ].map((amenity) => (
            <label key={amenity.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register(amenity.key)}
                className="rounded"
              />
              <span className="text-sm">{amenity.label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lifestyle</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('pets')}
                className="rounded"
              />
              <span className="text-sm">I have pets</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('smoking')}
                className="rounded"
              />
              <span className="text-sm">I smoke</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('has_vehicles')}
                className="rounded"
              />
              <span className="text-sm">I have vehicles</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('has_renters_insurance')}
                className="rounded"
              />
              <span className="text-sm">I have renter's insurance</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Preferences
            </label>
            <textarea
              {...register('additional_preferences')}
              placeholder="Any other preferences or requirements..."
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
