'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Bed } from 'lucide-react'
import { BedData, BedType, ViewType, BookingStatus } from '@/types'

interface BedSectionProps {
  bedIndex: number
  bedData: BedData
  onChange: (index: number, data: BedData) => void
}

const BED_TYPES: BedType[] = ['Single', 'Double', 'Queen', 'King', 'Bunk']
const VIEW_TYPES: ViewType[] = ['Street', 'Garden', 'Courtyard', 'None']
const BOOKING_STATUSES: BookingStatus[] = ['Available', 'Reserved', 'Occupied']

export default function BedSection({ bedIndex, bedData, onChange }: BedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(bedIndex === 0) // First bed expanded by default

  const handleFieldChange = (field: keyof BedData, value: any) => {
    onChange(bedIndex, { ...bedData, [field]: value })
  }

  const handleBookingChange = (field: keyof BedData['bookingInfo'], value: any) => {
    onChange(bedIndex, {
      ...bedData,
      bookingInfo: {
        ...bedData.bookingInfo,
        [field]: value
      }
    })
  }

  const hasData = bedData.bedName || bedData.bedType || bedData.view || bedData.rent || bedData.maxOccupancy

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Bed className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">
              Bed {bedIndex + 1} {hasData && '✓'}
            </h3>
            <p className="text-sm text-gray-500">
              {bedData.bedName || 'Optional - Click to configure'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 bg-white">
          {/* Bed Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Name <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={bedData.bedName || ''}
              onChange={(e) => handleFieldChange('bedName', e.target.value)}
              placeholder={`e.g., Master Bed, Bed ${bedIndex + 1}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bed Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bed Type <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                value={bedData.bedType || ''}
                onChange={(e) => handleFieldChange('bedType', e.target.value as BedType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select bed type</option>
                {BED_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* View */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                View <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                value={bedData.view || ''}
                onChange={(e) => handleFieldChange('view', e.target.value as ViewType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select view</option>
                {VIEW_TYPES.map(view => (
                  <option key={view} value={view}>{view}</option>
                ))}
              </select>
            </div>

            {/* Rent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rent ($/month) <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                value={bedData.rent || ''}
                onChange={(e) => handleFieldChange('rent', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g., 800"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                step="50"
              />
            </div>

            {/* Max Occupancy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Occupancy <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                value={bedData.maxOccupancy || ''}
                onChange={(e) => handleFieldChange('maxOccupancy', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 1 or 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                max="4"
              />
              <p className="text-xs text-gray-500 mt-1">How many people can this bed accommodate?</p>
            </div>
          </div>

          {/* Booking Information */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">
              📅 Booking Information <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Available From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="date"
                  value={bedData.bookingInfo?.availableFrom || ''}
                  onChange={(e) => handleBookingChange('availableFrom', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Available Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Until
                </label>
                <input
                  type="date"
                  value={bedData.bookingInfo?.availableUntil || ''}
                  onChange={(e) => handleBookingChange('availableUntil', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Booking Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={bedData.bookingInfo?.status || ''}
                  onChange={(e) => handleBookingChange('status', e.target.value as BookingStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  {BOOKING_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
