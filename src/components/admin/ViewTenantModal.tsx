'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/enhanced-components'
import { Tenant } from '@/lib/supabase/types'
import { 
  User, 
  Mail, 
  Phone, 
  Home, 
  Calendar,
  DollarSign,
  MapPin,
  Shield,
  FileText
} from 'lucide-react'

interface ViewTenantModalProps {
  tenant: Tenant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewTenantModal({ tenant, open, onOpenChange }: ViewTenantModalProps) {
  if (!tenant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
              <User className="w-6 h-6 text-orange-700" />
            </div>
            Tenant Details - {tenant.tenant_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-blue-700 font-medium">Full Name</label>
                  <p className="text-blue-900 font-semibold">{tenant.tenant_name}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Tenant ID</label>
                  <p className="text-blue-800 font-mono text-sm">{tenant.tenant_id}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={tenant.status} />
                  </div>
                </div>
                {tenant.tenant_nationality && (
                  <div>
                    <label className="text-sm text-blue-700 font-medium">Nationality</label>
                    <p className="text-blue-900">{tenant.tenant_nationality}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-green-600" />
                  <div>
                    <label className="text-sm text-green-700 font-medium">Email</label>
                    <p className="text-green-900">{tenant.tenant_email}</p>
                  </div>
                </div>
                {tenant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-green-600" />
                    <div>
                      <label className="text-sm text-green-700 font-medium">Phone</label>
                      <p className="text-green-900">{tenant.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Emergency Contact
                </h3>
                <div className="space-y-2">
                  {tenant.emergency_contact_name && (
                    <div>
                      <label className="text-sm text-red-700 font-medium">Name</label>
                      <p className="text-red-900">{tenant.emergency_contact_name}</p>
                    </div>
                  )}
                  {tenant.emergency_contact_phone && (
                    <div>
                      <label className="text-sm text-red-700 font-medium">Phone</label>
                      <p className="text-red-900">{tenant.emergency_contact_phone}</p>
                    </div>
                  )}
                  {tenant.emergency_contact_relation && (
                    <div>
                      <label className="text-sm text-red-700 font-medium">Relationship</label>
                      <p className="text-red-900">{tenant.emergency_contact_relation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Lease & Housing Information */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Housing Assignment
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-purple-700 font-medium">Room Number</label>
                  <p className="text-purple-900 font-semibold">{tenant.room_number}</p>
                </div>
                <div>
                  <label className="text-sm text-purple-700 font-medium">Room ID</label>
                  <p className="text-purple-800 font-mono text-sm">{tenant.room_id}</p>
                </div>
                <div>
                  <label className="text-sm text-purple-700 font-medium">Building ID</label>
                  <p className="text-purple-800 font-mono text-sm">{tenant.building_id}</p>
                </div>
                {tenant.booking_type && (
                  <div>
                    <label className="text-sm text-purple-700 font-medium">Booking Type</label>
                    <p className="text-purple-900">{tenant.booking_type}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lease Dates */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Lease Information
              </h3>
              <div className="space-y-3">
                {tenant.lease_start_date && (
                  <div>
                    <label className="text-sm text-orange-700 font-medium">Lease Start</label>
                    <p className="text-orange-900 font-semibold">
                      {new Date(tenant.lease_start_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {tenant.lease_end_date && (
                  <div>
                    <label className="text-sm text-orange-700 font-medium">Lease End</label>
                    <p className="text-orange-900 font-semibold">
                      {new Date(tenant.lease_end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {tenant.lease_start_date && tenant.lease_end_date && (
                  <div>
                    <label className="text-sm text-orange-700 font-medium">Lease Duration</label>
                    <p className="text-orange-900">
                      {Math.ceil((new Date(tenant.lease_end_date).getTime() - new Date(tenant.lease_start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Details
              </h3>
              <div className="space-y-3">
                {tenant.deposit_amount && (
                  <div>
                    <label className="text-sm text-green-700 font-medium">Security Deposit</label>
                    <p className="text-green-900 font-semibold text-lg">${tenant.deposit_amount}</p>
                  </div>
                )}
                {tenant.operator_id && (
                  <div>
                    <label className="text-sm text-green-700 font-medium">Managed by Operator</label>
                    <p className="text-green-800 font-mono text-sm">{tenant.operator_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {tenant.special_requests && (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
                <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Special Requests
                </h3>
                <p className="text-indigo-900 text-sm leading-relaxed">{tenant.special_requests}</p>
              </div>
            )}
          </div>
        </div>

        {/* Application Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {tenant.has_guarantor !== undefined && (
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg text-center">
              <label className="text-sm text-yellow-700 font-medium block">Has Guarantor</label>
              <StatusBadge status={tenant.has_guarantor ? 'YES' : 'NO'} />
            </div>
          )}
          
          {tenant.has_pets !== undefined && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg text-center">
              <label className="text-sm text-purple-700 font-medium block">Has Pets</label>
              <StatusBadge status={tenant.has_pets ? 'YES' : 'NO'} />
            </div>
          )}
          
          {tenant.has_renters_insurance !== undefined && (
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-3 rounded-lg text-center">
              <label className="text-sm text-cyan-700 font-medium block">Renters Insurance</label>
              <StatusBadge status={tenant.has_renters_insurance ? 'YES' : 'NO'} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}