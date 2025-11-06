'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Copy, ChevronDown, ChevronUp, Clock, Building, Home, Users } from 'lucide-react'

interface CopyFromPreviousProps {
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  onCopyData: (data: any) => void
  className?: string
}

interface PreviousEntry {
  id: string
  name: string
  createdAt: string
  data: any
  preview: string
}

// Mock previous entries (in real app, this would come from API/localStorage)
const MOCK_PREVIOUS_ENTRIES: Record<string, PreviousEntry[]> = {
  building: [
    {
      id: '1',
      name: 'Sunset Apartments',
      createdAt: '2024-01-15',
      preview: '123 Main St, 5 floors, 20 rooms',
      data: {
        building_name: 'Sunset Apartments',
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        floors: 5,
        total_rooms: 20,
        wifi_included: true,
        laundry_onsite: true,
        secure_access: true
      }
    },
    {
      id: '2',
      name: 'Downtown Lofts',
      createdAt: '2024-01-10',
      preview: '456 Oak Ave, 3 floors, 12 rooms',
      data: {
        building_name: 'Downtown Lofts',
        street: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        floors: 3,
        total_rooms: 12,
        wifi_included: true,
        laundry_onsite: false,
        secure_access: true
      }
    }
  ],
  room: [
    {
      id: '1',
      name: 'Room 101',
      createdAt: '2024-01-15',
      preview: 'Private room, $800/month, furnished',
      data: {
        room_number: '101',
        private_room_rent: 800,
        work_desk: true,
        work_chair: true,
        heating: true,
        furnished: true
      }
    },
    {
      id: '2',
      name: 'Room 102',
      createdAt: '2024-01-14',
      preview: 'Shared room, $600/month, basic amenities',
      data: {
        room_number: '102',
        shared_room_rent_2: 600,
        work_desk: true,
        heating: true,
        furnished: false
      }
    }
  ],
  operator: [
    {
      id: '1',
      name: 'John Smith',
      createdAt: '2024-01-12',
      preview: 'Leasing Agent, john@company.com',
      data: {
        name: 'John Smith',
        email: 'john@company.com',
        operator_type: 'LEASING_AGENT',
        notification_preferences: 'EMAIL',
        active: true
      }
    }
  ],
  tenant: [],
  lead: []
}

const getFormIcon = (formType: string) => {
  switch (formType) {
    case 'building': return <Building className="w-4 h-4" />
    case 'room': return <Home className="w-4 h-4" />
    case 'operator': return <Users className="w-4 h-4" />
    default: return <Copy className="w-4 h-4" />
  }
}

export default function CopyFromPrevious({ formType, onCopyData, className = "" }: CopyFromPreviousProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  const previousEntries = MOCK_PREVIOUS_ENTRIES[formType] || []

  if (previousEntries.length === 0) {
    return null
  }

  const handleCopyData = (entry: PreviousEntry) => {
    setSelectedEntry(entry.id)
    onCopyData(entry.data)
    
    // Show feedback
    setTimeout(() => {
      setSelectedEntry(null)
      setIsExpanded(false)
    }, 1000)
  }

  return (
    <div className={`mb-6 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
      >
        <div className="flex items-center gap-2">
          <Copy className="w-4 h-4" />
          <span>Copy from Previous {formType.charAt(0).toUpperCase() + formType.slice(1)}</span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {previousEntries.length} available
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            <Card className="p-4 bg-gradient-to-br from-purple-25 to-blue-25 border-purple-200">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Select an entry to copy its data to the current form
                </div>
                
                {previousEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedEntry === entry.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }`}
                    onClick={() => handleCopyData(entry)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFormIcon(formType)}
                        <div>
                          <div className="font-medium text-gray-900">{entry.name}</div>
                          <div className="text-sm text-gray-600">{entry.preview}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created: {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {selectedEntry === entry.id ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600 font-semibold text-sm"
                        >
                          ✓ Copied!
                        </motion.div>
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  💡 <strong>Pro Tip:</strong> Copying will fill in all matching fields. You can still edit any field after copying.
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
