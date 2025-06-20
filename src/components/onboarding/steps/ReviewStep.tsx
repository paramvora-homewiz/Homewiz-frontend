'use client'

import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ReviewStepProps {
  form: UseFormReturn<any>
  uploadedFiles: any[]
  onEditStep: (step: number) => void
}

export function ReviewStep({ form, uploadedFiles, onEditStep }: ReviewStepProps) {
  const formData = form.getValues()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <Button variant="outline" size="sm" onClick={() => onEditStep(0)}>
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
          </div>
          <div>
            <span className="font-medium">Email:</span> {formData.email}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {formData.phone}
          </div>
          <div>
            <span className="font-medium">Nationality:</span> {formData.nationality || 'Not specified'}
          </div>
          {formData.emergency_contact_name && (
            <div className="md:col-span-2">
              <span className="font-medium">Emergency Contact:</span> {formData.emergency_contact_name} 
              {formData.emergency_contact_phone && ` (${formData.emergency_contact_phone})`}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Professional Information</h3>
          <Button variant="outline" size="sm" onClick={() => onEditStep(1)}>
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Occupation:</span> {formData.occupation}
          </div>
          <div>
            <span className="font-medium">Company:</span> {formData.company || 'Not specified'}
          </div>
          <div>
            <span className="font-medium">Annual Income:</span> {formData.annual_income ? formatCurrency(formData.annual_income) : 'Not specified'}
          </div>
          <div>
            <span className="font-medium">Visa Status:</span> {formData.visa_status || 'Not specified'}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Housing Preferences</h3>
          <Button variant="outline" size="sm" onClick={() => onEditStep(2)}>
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Budget Range:</span> {formatCurrency(formData.budget_min)} - {formatCurrency(formData.budget_max)}
          </div>
          <div>
            <span className="font-medium">Move-in Date:</span> {formatDate(formData.preferred_move_in_date)}
          </div>
          <div>
            <span className="font-medium">Lease Term:</span> {formData.preferred_lease_term} months
          </div>
          <div>
            <span className="font-medium">Room Type:</span> {formData.room_type || 'No preference'}
          </div>
        </div>

        {/* Amenities */}
        <div className="mt-4">
          <span className="font-medium text-sm">Desired Amenities:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { key: 'amenity_wifi', label: 'WiFi' },
              { key: 'amenity_laundry', label: 'Laundry' },
              { key: 'amenity_parking', label: 'Parking' },
              { key: 'amenity_security', label: 'Security' },
              { key: 'amenity_gym', label: 'Gym' },
              { key: 'amenity_common_area', label: 'Common Area' },
              { key: 'amenity_rooftop', label: 'Rooftop' },
              { key: 'amenity_bike_storage', label: 'Bike Storage' }
            ].filter(amenity => formData[amenity.key]).map(amenity => (
              <Badge key={amenity.key} variant="outline">
                {amenity.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lifestyle */}
        <div className="mt-4">
          <span className="font-medium text-sm">Lifestyle:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.pets && <Badge variant="outline">Has Pets</Badge>}
            {formData.smoking && <Badge variant="outline">Smoker</Badge>}
            {formData.has_vehicles && <Badge variant="outline">Has Vehicles</Badge>}
            {formData.has_renters_insurance && <Badge variant="outline">Has Insurance</Badge>}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Property Selection</h3>
          <Button variant="outline" size="sm" onClick={() => onEditStep(3)}>
            Edit
          </Button>
        </div>
        
        <div className="text-sm">
          {formData.selected_building_id ? (
            <div>
              <div className="mb-2">
                <span className="font-medium">Selected Building:</span> {formData.selected_building_id}
              </div>
              {formData.selected_room_id && (
                <div>
                  <span className="font-medium">Selected Room:</span> {formData.room_number || formData.selected_room_id}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No property selected</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Documents</h3>
          <Button variant="outline" size="sm" onClick={() => onEditStep(4)}>
            Edit
          </Button>
        </div>
        
        {uploadedFiles.length > 0 ? (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{file.name}</span>
                <Badge variant="outline" className="text-xs">
                  {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No documents uploaded</p>
        )}
      </Card>

      <Card className="p-6 bg-green-50">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Ready to Submit</h3>
        <p className="text-green-800 text-sm">
          Please review all information above. Once you submit your application, 
          you will receive a confirmation email and our team will review your application.
        </p>
      </Card>
    </div>
  )
}
