'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { EnhancedCard, EnhancedInput, EnhancedSelect, QuickSelectButtons, StatusBadge } from '@/components/ui/enhanced-components'
import { LeadFormData } from '@/types'
import {
  Target,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Home,
  TrendingUp,
  Save,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  FileText,
  Star,
  Zap,
  Users,
  Globe,
  Megaphone,
  Smartphone,
  HelpCircle,
  Plus,
  Minus,
  BarChart3
} from 'lucide-react'
import '@/styles/design-system.css'

interface LeadFormProps {
  initialData?: Partial<LeadFormData>
  onSubmit: (data: LeadFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  rooms?: Array<{ room_id: string; room_number: string; building_name: string; private_room_rent?: number; shared_room_rent_2?: number }>
}

const LEAD_STATUS_OPTIONS = [
  {
    value: 'EXPLORING',
    label: 'Exploring',
    color: 'from-gray-500 to-slate-500',
    icon: <Eye className="w-5 h-5" />,
    description: 'Just browsing options',
    score: 10
  },
  {
    value: 'INTERESTED',
    label: 'Interested',
    color: 'from-blue-500 to-cyan-500',
    icon: <Target className="w-5 h-5" />,
    description: 'Showing genuine interest',
    score: 25
  },
  {
    value: 'SCHEDULED_VIEWING',
    label: 'Viewing Scheduled',
    color: 'from-yellow-500 to-orange-500',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Has scheduled a viewing',
    score: 50
  },
  {
    value: 'APPLICATION_SUBMITTED',
    label: 'Applied',
    color: 'from-purple-500 to-indigo-500',
    icon: <FileText className="w-5 h-5" />,
    description: 'Submitted application',
    score: 75
  },
  {
    value: 'APPROVED',
    label: 'Approved',
    color: 'from-green-500 to-emerald-500',
    icon: <CheckCircle className="w-5 h-5" />,
    description: 'Application approved',
    score: 90
  },
  {
    value: 'REJECTED',
    label: 'Rejected',
    color: 'from-red-500 to-pink-500',
    icon: <XCircle className="w-5 h-5" />,
    description: 'Application rejected',
    score: 0
  },
  {
    value: 'CONVERTED',
    label: 'Converted',
    color: 'from-emerald-500 to-green-500',
    icon: <Star className="w-5 h-5" />,
    description: 'Became a tenant',
    score: 100
  }
]

const LEAD_SOURCES = [
  { value: 'WEBSITE', label: 'Website', icon: <Globe className="w-4 h-4" /> },
  { value: 'REFERRAL', label: 'Referral', icon: <Users className="w-4 h-4" /> },
  { value: 'ADVERTISEMENT', label: 'Advertisement', icon: <Megaphone className="w-4 h-4" /> },
  { value: 'SOCIAL_MEDIA', label: 'Social Media', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'OTHER', label: 'Other', icon: <HelpCircle className="w-4 h-4" /> }
]

const COMMUNICATION_PREFERENCES = [
  { value: 'EMAIL', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'SMS', label: 'SMS', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'PHONE', label: 'Phone Call', icon: <Phone className="w-4 h-4" /> }
]

const VISA_STATUS_OPTIONS = [
  'US Citizen',
  'Permanent Resident',
  'H1-B Visa',
  'F-1 Student Visa',
  'J-1 Visa',
  'L-1 Visa',
  'O-1 Visa',
  'Tourist Visa',
  'Other'
]

const LEASE_TERM_OPTIONS = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 9, label: '9 months' },
  { value: 12, label: '12 months' },
  { value: 18, label: '18 months' },
  { value: 24, label: '24 months' }
]

// Smart budget ranges for quick selection
const BUDGET_RANGES = [
  { min: 400, max: 600, label: '$400-600 (Student Budget)' },
  { min: 600, max: 800, label: '$600-800 (Shared Room)' },
  { min: 800, max: 1200, label: '$800-1200 (Private Room)' },
  { min: 1200, max: 1800, label: '$1200-1800 (Premium)' },
  { min: 1800, max: 2500, label: '$1800-2500 (Luxury)' }
]

export default function LeadForm({ initialData, onSubmit, onCancel, isLoading, rooms = [] }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    email: '',
    status: 'EXPLORING',
    interaction_count: 0,
    lead_score: 0,
    preferred_communication: 'EMAIL',
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [interestedRooms, setInterestedRooms] = useState<string[]>(
    initialData?.rooms_interested ? JSON.parse(initialData.rooms_interested) : []
  )
  const [showingDates, setShowingDates] = useState<string[]>(
    initialData?.showing_dates ? JSON.parse(initialData.showing_dates) : []
  )

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.budget_min && formData.budget_max && formData.budget_min > formData.budget_max) {
      newErrors.budget_max = 'Maximum budget must be greater than minimum'
    }

    if (formData.preferred_move_in_date) {
      const moveInDate = new Date(formData.preferred_move_in_date)
      const today = new Date()
      if (moveInDate < today) {
        newErrors.preferred_move_in_date = 'Move-in date cannot be in the past'
      }
    }

    if (formData.planned_move_in && formData.planned_move_out) {
      const moveIn = new Date(formData.planned_move_in)
      const moveOut = new Date(formData.planned_move_out)
      if (moveOut <= moveIn) {
        newErrors.planned_move_out = 'Move-out date must be after move-in date'
      }
    }

    setErrors(newErrors)
  }, [formData])

  const handleInputChange = (field: keyof LeadFormData, value: any) => {
    // Auto-calculate lead score when relevant fields change
    if (['status', 'email', 'budget_min', 'budget_max', 'preferred_move_in_date', 'visa_status'].includes(field)) {
      setTimeout(() => {
        const newScore = calculateLeadScore()
        setFormData(prev => ({ ...prev, [field]: value, lead_score: newScore }))
      }, 100)
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleRoomInterestToggle = (roomId: string) => {
    setInterestedRooms(prev => {
      const updated = prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
      return updated
    })
  }

  const addShowingDate = () => {
    const today = new Date().toISOString().split('T')[0]
    setShowingDates(prev => [...prev, today])
  }

  const removeShowingDate = (index: number) => {
    setShowingDates(prev => prev.filter((_, i) => i !== index))
  }

  const updateShowingDate = (index: number, date: string) => {
    setShowingDates(prev => prev.map((d, i) => i === index ? date : d))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (Object.keys(errors).length > 0) {
      return
    }

    const submitData = {
      ...formData,
      lead_id: formData.lead_id || `lead_${Date.now()}`,
      rooms_interested: JSON.stringify(interestedRooms),
      showing_dates: JSON.stringify(showingDates)
    }

    await onSubmit(submitData)
  }

  const getStatusBadge = (status: string) => {
    const statusOption = LEAD_STATUS_OPTIONS.find(opt => opt.value === status)
    return statusOption ? (
      <Badge className={statusOption.color}>
        {statusOption.icon} {statusOption.label}
      </Badge>
    ) : null
  }

  const calculateLeadScore = () => {
    let score = 0

    // Status-based scoring
    const statusOption = LEAD_STATUS_OPTIONS.find(opt => opt.value === formData.status)
    if (statusOption) score += statusOption.score * 0.4 // 40% weight

    // Basic information completeness (30% weight)
    if (formData.email) score += 8
    if (formData.budget_min && formData.budget_max) score += 12
    if (formData.preferred_move_in_date) score += 8
    if (formData.visa_status) score += 2

    // Interest level (30% weight)
    if (interestedRooms.length > 0) score += 10 + (interestedRooms.length * 2)
    if (formData.selected_room_id) score += 8
    if (showingDates.length > 0) score += 5 + (showingDates.length * 2)

    return Math.min(score, 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    if (score >= 40) return 'from-blue-500 to-cyan-500'
    return 'from-gray-500 to-slate-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Hot Lead'
    if (score >= 60) return 'Warm Lead'
    if (score >= 40) return 'Interested'
    return 'Cold Lead'
  }

  // Update lead score when relevant fields change
  useEffect(() => {
    const newScore = calculateLeadScore()
    if (newScore !== formData.lead_score) {
      handleInputChange('lead_score', newScore)
    }
  }, [formData.email, formData.budget_min, formData.budget_max, formData.preferred_move_in_date, 
      formData.visa_status, formData.selected_room_id, interestedRooms, showingDates])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50 to-purple-100">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Target className="w-4 h-4" />
            Lead Management
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-purple-900 bg-clip-text text-transparent mb-3">
            {initialData?.lead_id ? 'Edit Lead' : 'Add New Lead'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Intelligent lead tracking with conversion optimization and smart scoring algorithms
          </p>

          {/* Lead Score Visualization */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatusBadge
              status={formData.status}
              variant="large"
              icon={LEAD_STATUS_OPTIONS.find(opt => opt.value === formData.status)?.icon}
            />

            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${getScoreColor(formData.lead_score)} rounded-full`}
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + (formData.lead_score / 100) * 50}% 0%, 100% 100%, 0% 100%)`
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
                <div className="relative z-10 text-center">
                  <div className="text-2xl font-bold text-gray-900">{formData.lead_score}</div>
                  <div className="text-xs text-gray-600">Score</div>
                </div>
              </div>
              <div className="text-center mt-2">
                <div className={`text-sm font-semibold bg-gradient-to-r ${getScoreColor(formData.lead_score)} bg-clip-text text-transparent`}>
                  {getScoreLabel(formData.lead_score)}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <EnhancedCard variant="premium" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedInput
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(value) => handleInputChange('email', value)}
                  placeholder="prospect@example.com"
                  error={errors.email}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />

                <EnhancedSelect
                  label="Visa Status"
                  value={formData.visa_status || ''}
                  onChange={(value) => handleInputChange('visa_status', value)}
                  options={VISA_STATUS_OPTIONS.map(status => ({
                    value: status,
                    label: status
                  }))}
                  placeholder="Select visa status"
                  searchable
                />
              </div>

              {/* Communication Preferences */}
              <div className="mt-6">
                <QuickSelectButtons
                  label="Preferred Communication Method"
                  options={COMMUNICATION_PREFERENCES}
                  value={formData.preferred_communication}
                  onChange={(value) => handleInputChange('preferred_communication', value)}
                />
              </div>

              {/* Lead Source */}
              <div className="mt-6">
                <QuickSelectButtons
                  label="Lead Source"
                  options={LEAD_SOURCES}
                  value={formData.lead_source}
                  onChange={(value) => handleInputChange('lead_source', value)}
                />
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Lead Status Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <EnhancedCard variant="premium" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Lead Status & Progression</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LEAD_STATUS_OPTIONS.map((status) => (
                  <motion.div
                    key={status.value}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden ${
                      formData.status === status.value
                        ? 'border-pink-500 bg-pink-50 shadow-md'
                        : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                    }`}
                    onClick={() => handleInputChange('status', status.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Score indicator */}
                    <div className="absolute top-2 right-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${status.color} flex items-center justify-center text-white text-xs font-bold`}>
                        {status.score}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${status.color} flex items-center justify-center text-white`}>
                        {status.icon}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">{status.label}</div>
                      <div className="text-xs text-gray-600">{status.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Budget & Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <EnhancedCard variant="premium" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Budget & Housing Preferences</h2>
              </div>

              {/* Quick Budget Range Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Quick Budget Selection
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BUDGET_RANGES.map((range) => (
                    <button
                      key={`${range.min}-${range.max}`}
                      type="button"
                      onClick={() => {
                        handleInputChange('budget_min', range.min)
                        handleInputChange('budget_max', range.max)
                      }}
                      className={`p-3 border-2 rounded-lg text-left transition-all duration-200 ${
                        formData.budget_min === range.min && formData.budget_max === range.max
                          ? 'border-green-500 bg-green-50 text-green-900'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                      }`}
                    >
                      <div className="font-semibold text-sm">{range.label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        ${range.min} - ${range.max}/month
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EnhancedInput
                  label="Minimum Budget ($)"
                  type="number"
                  value={formData.budget_min?.toString() || ''}
                  onChange={(value) => handleInputChange('budget_min', value ? parseFloat(value) : undefined)}
                  placeholder="500"
                  icon={<DollarSign className="w-4 h-4" />}
                />

                <EnhancedInput
                  label="Maximum Budget ($)"
                  type="number"
                  value={formData.budget_max?.toString() || ''}
                  onChange={(value) => handleInputChange('budget_max', value ? parseFloat(value) : undefined)}
                  placeholder="1500"
                  error={errors.budget_max}
                  icon={<DollarSign className="w-4 h-4" />}
                />

                <EnhancedInput
                  label="Preferred Move-in Date"
                  type="date"
                  value={formData.preferred_move_in_date || ''}
                  onChange={(value) => handleInputChange('preferred_move_in_date', value)}
                  error={errors.preferred_move_in_date}
                  icon={<Calendar className="w-4 h-4" />}
                />

                <EnhancedSelect
                  label="Preferred Lease Term"
                  value={formData.preferred_lease_term?.toString() || ''}
                  onChange={(value) => handleInputChange('preferred_lease_term', value ? parseInt(value) : undefined)}
                  options={LEASE_TERM_OPTIONS.map(term => ({
                    value: term.value.toString(),
                    label: term.label
                  }))}
                  placeholder="Select lease term"
                />

                <EnhancedInput
                  label="Planned Move-in Date"
                  type="date"
                  value={formData.planned_move_in || ''}
                  onChange={(value) => handleInputChange('planned_move_in', value)}
                  icon={<Calendar className="w-4 h-4" />}
                />

                <EnhancedInput
                  label="Planned Move-out Date"
                  type="date"
                  value={formData.planned_move_out || ''}
                  onChange={(value) => handleInputChange('planned_move_out', value)}
                  error={errors.planned_move_out}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Budget Range Visualization */}
              {formData.budget_min && formData.budget_max && (
                <motion.div
                  className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Budget Range Summary
                  </h3>
                  <div className="text-sm text-green-700">
                    Budget: ${formData.budget_min} - ${formData.budget_max} per month
                    <span className="ml-2 text-green-600">
                      (Range: ${formData.budget_max - formData.budget_min})
                    </span>
                  </div>
                </motion.div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Preferences
                </label>
                <textarea
                  value={formData.additional_preferences || ''}
                  onChange={(e) => handleInputChange('additional_preferences', e.target.value)}
                  placeholder="Any specific requirements or preferences..."
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-200"
                  rows={4}
                />
              </div>
            </EnhancedCard>
          </motion.div>

        {/* Room Interests */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🏠 Room Interests
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selected Room (Primary Interest)
              </label>
              <select
                value={formData.selected_room_id || ''}
                onChange={(e) => handleInputChange('selected_room_id', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.building_name} - Room {room.room_number}
                    {room.private_room_rent && ` - $${room.private_room_rent}/month`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Rooms of Interest
                <HelpTooltip content="Select multiple rooms the lead has shown interest in" />
              </label>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {rooms.map(room => (
                  <label key={room.room_id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={interestedRooms.includes(room.room_id)}
                      onChange={() => handleRoomInterestToggle(room.room_id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{room.building_name} - Room {room.room_number}</div>
                      <div className="text-sm text-gray-600">
                        {room.private_room_rent && `Private: $${room.private_room_rent}/month`}
                        {room.private_room_rent && room.shared_room_rent_2 && ' | '}
                        {room.shared_room_rent_2 && `Shared: $${room.shared_room_rent_2}/month`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {interestedRooms.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {interestedRooms.length} room{interestedRooms.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Showing Schedule */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📅 Showing Schedule
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Scheduled Showing Dates
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addShowingDate}
              >
                Add Date
              </Button>
            </div>

            {showingDates.map((date, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => updateShowingDate(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeShowingDate(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}

            {showingDates.length === 0 && (
              <p className="text-gray-500 text-sm italic">No showing dates scheduled</p>
            )}
          </div>
        </Card>

        {/* Follow-up & Notes */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📝 Follow-up & Notes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Contacted
              </label>
              <Input
                type="datetime-local"
                value={formData.last_contacted || ''}
                onChange={(e) => handleInputChange('last_contacted', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Follow-up
              </label>
              <Input
                type="datetime-local"
                value={formData.next_follow_up || ''}
                onChange={(e) => handleInputChange('next_follow_up', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interaction Count
              </label>
              <Input
                type="number"
                value={formData.interaction_count}
                onChange={(e) => handleInputChange('interaction_count', parseInt(e.target.value) || 0)}
                min="0"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Automatically tracked based on communications
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Score
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.lead_score}
                  readOnly
                  className="bg-gray-50"
                />
                <div className="text-sm text-gray-600">
                  {formData.lead_score >= 80 ? '🔥 Hot' :
                   formData.lead_score >= 60 ? '🌡️ Warm' :
                   formData.lead_score >= 40 ? '❄️ Cool' : '🧊 Cold'}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Automatically calculated based on engagement and completeness
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add notes about conversations, preferences, concerns, etc..."
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={4}
            />
          </div>
        </Card>

          {/* Enhanced Form Actions */}
          <motion.div
            className="flex items-center justify-end gap-4 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {onCancel && (
              <motion.button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            )}

            <motion.button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className={`px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
                isLoading || Object.keys(errors).length > 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-pink-700 hover:to-purple-700'
              }`}
              whileHover={!(isLoading || Object.keys(errors).length > 0) ? { scale: 1.02 } : {}}
              whileTap={!(isLoading || Object.keys(errors).length > 0) ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {initialData?.lead_id ? 'Update Lead' : 'Create Lead'}
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
