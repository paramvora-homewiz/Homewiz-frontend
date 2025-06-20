'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface ProfessionalInfoStepProps {
  form: UseFormReturn<any>
}

export function ProfessionalInfoStep({ form }: ProfessionalInfoStepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation *
            </label>
            <Input
              {...register('occupation')}
              placeholder="Your job title"
              className={errors.occupation ? 'border-red-500' : ''}
            />
            {errors.occupation && (
              <p className="text-red-500 text-sm mt-1">{errors.occupation.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <Input
              {...register('company')}
              placeholder="Company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Income
            </label>
            <Input
              type="number"
              {...register('annual_income', { valueAsNumber: true })}
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visa Status
            </label>
            <select
              {...register('visa_status')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select visa status</option>
              <option value="US Citizen">US Citizen</option>
              <option value="Permanent Resident">Permanent Resident</option>
              <option value="H1-B Visa">H1-B Visa</option>
              <option value="F-1 Student Visa">F-1 Student Visa</option>
              <option value="J-1 Visa">J-1 Visa</option>
              <option value="L-1 Visa">L-1 Visa</option>
              <option value="O-1 Visa">O-1 Visa</option>
              <option value="Tourist Visa">Tourist Visa</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              How did you hear about us?
            </label>
            <select
              {...register('lead_source')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="ADVERTISEMENT">Advertisement</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking Type
            </label>
            <select
              {...register('booking_type')}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="LEASE">Standard Lease</option>
              <option value="SHORT_TERM">Short Term</option>
              <option value="MONTH_TO_MONTH">Month-to-Month</option>
              <option value="CORPORATE">Corporate Housing</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  )
}
