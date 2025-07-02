'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/enhanced-components'
import { Building } from '@/lib/supabase/types'
import { 
  Building as BuildingIcon, 
  MapPin, 
  Users, 
  Home, 
  Wifi, 
  Car, 
  Shield,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react'

interface ViewBuildingModalProps {
  building: Building | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewBuildingModal({ building, open, onOpenChange }: ViewBuildingModalProps) {
  if (!building) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
              <BuildingIcon className="w-6 h-6 text-emerald-700" />
            </div>
            Building Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <BuildingIcon className="w-5 h-5" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-blue-700 font-medium">Building Name</label>
                  <p className="text-blue-900 font-semibold">{building.building_name}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Building ID</label>
                  <p className="text-blue-800 font-mono text-sm">{building.building_id}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={building.status || 'UNKNOWN'} />
                  </div>
                </div>
                {building.building_type && (
                  <div>
                    <label className="text-sm text-blue-700 font-medium">Type</label>
                    <p className="text-blue-900">{building.building_type}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h3>
              <div className="space-y-2">
                <p className="text-green-900">{building.address}</p>
                <p className="text-green-800">
                  {building.city}, {building.state} {building.zip_code}
                </p>
                {building.country && (
                  <p className="text-green-700">{building.country}</p>
                )}
              </div>
            </div>

            {/* Building Stats */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Building Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-purple-700 font-medium">Total Units</label>
                  <p className="text-purple-900 font-semibold text-lg">{building.total_units}</p>
                </div>
                <div>
                  <label className="text-sm text-purple-700 font-medium">Available Units</label>
                  <p className="text-purple-900 font-semibold text-lg">{building.available_units}</p>
                </div>
                {building.area && (
                  <div>
                    <label className="text-sm text-purple-700 font-medium">Area</label>
                    <p className="text-purple-900 font-semibold">{building.area}</p>
                  </div>
                )}
                {building.year_built && (
                  <div>
                    <label className="text-sm text-purple-700 font-medium">Year Built</label>
                    <p className="text-purple-900 font-semibold">{building.year_built}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amenities & Features */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Amenities & Features
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-orange-600" />
                  <span className={`text-sm ${building.wifi_included ? 'text-green-700' : 'text-gray-500'}`}>
                    WiFi {building.wifi_included ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-600" />
                  <span className={`text-sm ${building.secure_access ? 'text-green-700' : 'text-gray-500'}`}>
                    Secure Access {building.secure_access ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-orange-600" />
                  <span className={`text-sm ${building.bike_storage ? 'text-green-700' : 'text-gray-500'}`}>
                    Bike Storage {building.bike_storage ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className={`text-sm ${building.laundry_onsite ? 'text-green-700' : 'text-gray-500'}`}>
                    Laundry Onsite {building.laundry_onsite ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              {building.disability_access && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    ♿ Disability Accessible
                  </Badge>
                </div>
              )}
            </div>

            {/* Operator Information */}
            {building.operator_id && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Management
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-700 font-medium">Operator ID</label>
                    <p className="text-gray-900 font-mono text-sm">{building.operator_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Additional Information
              </h3>
              <div className="space-y-3">
                {building.min_lease_term && (
                  <div>
                    <label className="text-sm text-indigo-700 font-medium">Min Lease Term</label>
                    <p className="text-indigo-900">{building.min_lease_term} months</p>
                  </div>
                )}
                {building.pet_friendly && (
                  <div>
                    <label className="text-sm text-indigo-700 font-medium">Pet Policy</label>
                    <p className="text-indigo-900">{building.pet_friendly}</p>
                  </div>
                )}
                {building.virtual_tour_url && (
                  <div>
                    <label className="text-sm text-indigo-700 font-medium">Virtual Tour</label>
                    <a 
                      href={building.virtual_tour_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      View Virtual Tour
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        {building.building_images && building.building_images.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Building Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {building.building_images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${building.building_name} - Image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ))}
            </div>
            {building.building_images.length > 4 && (
              <p className="text-sm text-gray-500 mt-2">
                +{building.building_images.length - 4} more images
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}