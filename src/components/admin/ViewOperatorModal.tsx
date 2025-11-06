'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/enhanced-components'
import { Operator } from '@/lib/supabase/types'
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar,
  Building,
  Settings,
  Clock
} from 'lucide-react'

interface ViewOperatorModalProps {
  operator: Operator | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewOperatorModal({ operator, open, onOpenChange }: ViewOperatorModalProps) {
  if (!operator) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg">
              <User className="w-6 h-6 text-indigo-700" />
            </div>
            Operator Details - {operator.name}
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
                  <p className="text-blue-900 font-semibold">{operator.name}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Operator ID</label>
                  <p className="text-blue-800 font-mono text-sm">{operator.operator_id}</p>
                </div>
                <div>
                  <label className="text-sm text-blue-700 font-medium">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={operator.active ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                </div>
                {operator.operator_type && (
                  <div>
                    <label className="text-sm text-blue-700 font-medium">Role</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        {operator.operator_type.replace('_', ' ')}
                      </Badge>
                    </div>
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
                    <p className="text-green-900">{operator.email}</p>
                  </div>
                </div>
                {operator.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-green-600" />
                    <div>
                      <label className="text-sm text-green-700 font-medium">Phone</label>
                      <p className="text-green-900">{operator.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role & Permissions
              </h3>
              <div className="space-y-3">
                {operator.operator_type && (
                  <div>
                    <label className="text-sm text-purple-700 font-medium">Operator Type</label>
                    <p className="text-purple-900 font-semibold">{operator.operator_type}</p>
                  </div>
                )}
                {operator.role && (
                  <div>
                    <label className="text-sm text-purple-700 font-medium">System Role</label>
                    <p className="text-purple-900">{operator.role}</p>
                  </div>
                )}
                
                {/* Role-based capabilities */}
                <div className="pt-2">
                  <label className="text-sm text-purple-700 font-medium block mb-2">Capabilities</label>
                  <div className="flex flex-wrap gap-2">
                    {operator.operator_type === 'ADMIN' && (
                      <>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                          🔧 System Admin
                        </Badge>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          👥 User Management
                        </Badge>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                          📊 Full Access
                        </Badge>
                      </>
                    )}
                    {operator.operator_type === 'BUILDING_MANAGER' && (
                      <>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                          🏢 Building Management
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          👥 Tenant Management
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          🔧 Maintenance
                        </Badge>
                      </>
                    )}
                    {operator.operator_type === 'LEASING_AGENT' && (
                      <>
                        <Badge variant="outline" className="bg-cyan-100 text-cyan-800 border-cyan-300">
                          📄 Lease Management
                        </Badge>
                        <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
                          🏠 Room Assignments
                        </Badge>
                      </>
                    )}
                    {operator.operator_type === 'MAINTENANCE' && (
                      <>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                          🔧 Maintenance Tasks
                        </Badge>
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                          ⚡ Emergency Response
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Timeline */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Activity Timeline
              </h3>
              <div className="space-y-3">
                {operator.date_joined && (
                  <div>
                    <label className="text-sm text-orange-700 font-medium">Date Joined</label>
                    <p className="text-orange-900 font-semibold">
                      {new Date(operator.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {operator.last_active && (
                  <div>
                    <label className="text-sm text-orange-700 font-medium">Last Active</label>
                    <p className="text-orange-900">
                      {new Date(operator.last_active).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {operator.date_joined && (
                  <div>
                    <label className="text-sm text-orange-700 font-medium">Tenure</label>
                    <p className="text-orange-900">
                      {Math.ceil((Date.now() - new Date(operator.date_joined).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Access
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <label className="text-sm text-indigo-700 font-medium block">Account Status</label>
                    <div className="mt-1">
                      <StatusBadge status={operator.active ? 'ACTIVE' : 'INACTIVE'} />
                    </div>
                  </div>
                  <div className="text-center">
                    <label className="text-sm text-indigo-700 font-medium block">Access Level</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
                        {operator.operator_type === 'ADMIN' ? 'Full' : 
                         operator.operator_type === 'BUILDING_MANAGER' ? 'Manager' : 
                         operator.operator_type === 'LEASING_AGENT' ? 'Limited' : 'Basic'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Account Health */}
                <div className="pt-3 border-t border-indigo-200">
                  <label className="text-sm text-indigo-700 font-medium block mb-2">Account Health</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${operator.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-indigo-900">
                      {operator.active ? 'Account Active & Healthy' : 'Account Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Quick Info
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Can Manage Buildings</span>
                  <StatusBadge status={['ADMIN', 'BUILDING_MANAGER'].includes(operator.operator_type) ? 'YES' : 'NO'} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Can Manage Tenants</span>
                  <StatusBadge status={['ADMIN', 'BUILDING_MANAGER', 'LEASING_AGENT'].includes(operator.operator_type) ? 'YES' : 'NO'} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">System Administrator</span>
                  <StatusBadge status={operator.operator_type === 'ADMIN' ? 'YES' : 'NO'} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Communication Preferences */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-900 mb-2">Communication</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-600" />
                <span className="text-sm text-cyan-900">Email notifications enabled</span>
              </div>
              {operator.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm text-cyan-900">Phone contact available</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Responsibilities</h3>
            <div className="text-sm text-yellow-900">
              {operator.operator_type === 'ADMIN' && 'Full system administration and oversight'}
              {operator.operator_type === 'BUILDING_MANAGER' && 'Building operations and tenant relations'}
              {operator.operator_type === 'LEASING_AGENT' && 'Lease processing and room assignments'}
              {operator.operator_type === 'MAINTENANCE' && 'Property maintenance and repairs'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}