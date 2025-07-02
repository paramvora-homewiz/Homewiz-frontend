'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import {
  EditBuildingModal,
  EditRoomModal,
  EditTenantModal,
  EditOperatorModal
} from '@/components/admin'
import { Building, Home, UserCheck, Users, Check } from 'lucide-react'
import type { Building as BuildingType, Room, Tenant, Operator } from '@/lib/supabase/types'

export default function TestEditModalsPage() {
  // Test data
  const testBuilding: BuildingType = {
    building_id: 'TEST_BLD_001',
    building_name: 'Test Building',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zip_code: '12345',
    country: 'USA',
    operator_id: 1,
    total_rooms: 10,
    available_rooms: 5,
    building_type: 'APARTMENT',
    amenities: ['WIFI', 'LAUNDRY', 'GYM'],
    disability_access: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const testRoom: Room = {
    room_id: 'TEST_ROOM_001',
    building_id: 'TEST_BLD_001',
    room_type: 'PRIVATE',
    availability_status: 'AVAILABLE',
    total_beds: 1,
    available_beds: 1,
    private_room_rent: 1000,
    amenities: ['AC', 'HEATING', 'FURNISHED'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const testTenant: Tenant = {
    tenant_id: 'TEST_TENANT_001',
    tenant_name: 'John Doe',
    tenant_email: 'john.doe@test.com',
    phone: '+1234567890',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const testOperator: Operator = {
    operator_id: 1,
    name: 'Test Operator',
    email: 'operator@test.com',
    phone: '+1234567890',
    operator_type: 'BUILDING_MANAGER',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const [showBuildingModal, setShowBuildingModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showTenantModal, setShowTenantModal] = useState(false)
  const [showOperatorModal, setShowOperatorModal] = useState(false)

  const handleSubmit = async (data: any) => {
    console.log('Form submitted with data:', data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Edit Modals</h1>
          <p className="text-gray-600">Click the buttons below to test each edit modal</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Building Modal Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
                  <Building className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold">Building Edit Modal</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Test the building edit form with pre-filled data
              </p>
              <Button 
                onClick={() => setShowBuildingModal(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                Open Building Modal
              </Button>
            </EnhancedCard>
          </motion.div>

          {/* Room Modal Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                  <Home className="w-5 h-5 text-purple-700" />
                </div>
                <h3 className="text-lg font-semibold">Room Edit Modal</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Test the room edit form with pre-filled data
              </p>
              <Button 
                onClick={() => setShowRoomModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Open Room Modal
              </Button>
            </EnhancedCard>
          </motion.div>

          {/* Tenant Modal Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                  <UserCheck className="w-5 h-5 text-orange-700" />
                </div>
                <h3 className="text-lg font-semibold">Tenant Edit Modal</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Test the tenant edit form with pre-filled data
              </p>
              <Button 
                onClick={() => setShowTenantModal(true)}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                Open Tenant Modal
              </Button>
            </EnhancedCard>
          </motion.div>

          {/* Operator Modal Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                  <Users className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-lg font-semibold">Operator Edit Modal</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Test the operator edit form with pre-filled data
              </p>
              <Button 
                onClick={() => setShowOperatorModal(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Open Operator Modal
              </Button>
            </EnhancedCard>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <EnhancedCard variant="premium" className="p-6">
            <h3 className="text-lg font-semibold mb-4">Features Implemented</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Pre-filled form fields with existing data',
                'Form validation on save',
                'Loading states during save',
                'Success messages after update',
                'Smooth modal animations',
                'Cancel and Save buttons',
                'Data refresh after successful update',
                'Reuses existing form components'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </EnhancedCard>
        </motion.div>
      </div>

      {/* Modals */}
      <EditBuildingModal
        building={showBuildingModal ? testBuilding : null}
        open={showBuildingModal}
        onOpenChange={setShowBuildingModal}
        onSuccess={() => console.log('Building updated successfully')}
        operators={[testOperator]}
      />

      <EditRoomModal
        room={showRoomModal ? testRoom : null}
        open={showRoomModal}
        onOpenChange={setShowRoomModal}
        onSuccess={() => console.log('Room updated successfully')}
        buildings={[{ building_id: 'TEST_BLD_001', building_name: 'Test Building' }]}
      />

      <EditTenantModal
        tenant={showTenantModal ? testTenant : null}
        open={showTenantModal}
        onOpenChange={setShowTenantModal}
        onSuccess={() => console.log('Tenant updated successfully')}
        buildings={[{ building_id: 'TEST_BLD_001', building_name: 'Test Building' }]}
        rooms={[{ room_id: 'TEST_ROOM_001', building_id: 'TEST_BLD_001' }]}
      />

      <EditOperatorModal
        operator={showOperatorModal ? testOperator : null}
        open={showOperatorModal}
        onOpenChange={setShowOperatorModal}
        onSuccess={() => console.log('Operator updated successfully')}
      />
    </div>
  )
}