'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface PersonalInfoStepProps {
  form: UseFormReturn<any>
}

export function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <Input
              {...register('firstName')}
              placeholder="Enter your first name"
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <Input
              {...register('lastName')}
              placeholder="Enter your last name"
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              {...register('email')}
              placeholder="your.email@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <Input
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <Input
              type="date"
              {...register('dateOfBirth')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nationality
            </label>
            <Input
              {...register('nationality')}
              placeholder="e.g., American, Canadian"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Communication Method
          </label>
          <select
            {...register('preferred_communication')}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="PHONE">Phone</option>
            <option value="BOTH">Email & SMS</option>
          </select>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Name
            </label>
            <Input
              {...register('emergency_contact_name')}
              placeholder="Emergency contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <Input
              {...register('emergency_contact_phone')}
              placeholder="+1 (555) 987-6543"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <Input
              {...register('emergency_contact_relation')}
              placeholder="e.g., Parent, Spouse"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
