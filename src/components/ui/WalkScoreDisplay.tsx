'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Train,
  Bike,
  Bus,
  Coffee,
  ShoppingBag,
  Utensils,
  Dumbbell,
  Trees,
  GraduationCap,
  Film,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  Loader2,
  Store
} from 'lucide-react'
import { WalkScoreData, WalkScoreAmenity, TransitOption } from '@/types'
import { getScoreGradient, getScoreColor, isWalkScoreConfigured } from '@/lib/walkscore-api'

interface WalkScoreDisplayProps {
  data: WalkScoreData | null
  isLoading: boolean
  error?: string
  onRetry?: () => void
  compact?: boolean
  showAmenities?: boolean
  className?: string
}

// Score Circle Component
function ScoreCircle({
  score,
  label,
  description,
  icon: Icon,
  size = 'default'
}: {
  score: number
  label: string
  description: string
  icon: React.ElementType
  size?: 'default' | 'small'
}) {
  const gradient = getScoreGradient(score)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  const sizeClasses = size === 'small' ? 'w-20 h-20' : 'w-28 h-28'
  const textSize = size === 'small' ? 'text-xl' : 'text-3xl'

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`relative ${sizeClasses}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`text-${gradient.split(' ')[0].replace('from-', '')}`} stopColor="currentColor" />
              <stop offset="100%" className={`text-${gradient.split(' ')[1].replace('to-', '')}`} stopColor="currentColor" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${textSize} font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-xs text-gray-500 max-w-[100px]">{description}</p>
      </div>
    </motion.div>
  )
}

// Amenity category icon mapping
const amenityIcons: Record<string, React.ElementType> = {
  dining: Utensils,
  grocery: Store,
  coffee: Coffee,
  shopping: ShoppingBag,
  entertainment: Film,
  fitness: Dumbbell,
  parks: Trees,
  schools: GraduationCap,
  other: MapPin
}

// Transit type icon mapping
const transitIcons: Record<string, React.ElementType> = {
  bus: Bus,
  subway: Train,
  rail: Train,
  light_rail: Train,
  ferry: MapPin,
  cable_car: MapPin,
  other: MapPin
}

// Amenity Category Card
function AmenityCategory({
  category,
  amenities,
  icon: Icon
}: {
  category: string
  amenities: WalkScoreAmenity[]
  icon: React.ElementType
}) {
  const [expanded, setExpanded] = useState(false)

  if (amenities.length === 0) return null

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Icon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 capitalize text-sm">{category}</p>
            <p className="text-xs text-gray-500">{amenities.length} places</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate max-w-[150px]">{amenity.name}</span>
                  <span className="text-gray-400 text-xs">{amenity.distance} mi</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Transit type labels
const transitTypeLabels: Record<string, string> = {
  bus: 'Bus',
  subway: 'Subway',
  rail: 'Rail',
  light_rail: 'Light Rail',
  ferry: 'Ferry'
}

// Transit Option Card
function TransitOptionCard({ option }: { option: TransitOption }) {
  const Icon = transitIcons[option.type] || MapPin
  const typeLabel = transitTypeLabels[option.type] || 'Transit'

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
      <div className="p-1.5 bg-purple-100 rounded-lg">
        <Icon className="w-4 h-4 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{option.name}</p>
        <p className="text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">{typeLabel}</span>
            {option.routes && option.routes.length > 0 && (
              <span className="truncate">{option.routes.join(', ')}</span>
            )}
          </span>
        </p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{option.distance} mi</span>
    </div>
  )
}

// Loading State
function LoadingState() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <div>
          <p className="font-medium text-gray-900">Fetching location data...</p>
          <p className="text-sm text-gray-500">Analyzing walkability, transit, and nearby amenities</p>
        </div>
      </div>
    </div>
  )
}

// Error State
function ErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 rounded-xl p-6 border border-red-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-red-900">Unable to fetch location data</p>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Empty State (no address entered)
function EmptyState() {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 border-dashed">
      <div className="flex items-center justify-center gap-3 text-gray-500">
        <MapPin className="w-6 h-6" />
        <div>
          <p className="font-medium">Enter a complete address</p>
          <p className="text-sm">Walk Score, Transit Score, and nearby amenities will appear here</p>
        </div>
      </div>
    </div>
  )
}

// Not Configured State
function NotConfiguredState() {
  return (
    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900 text-sm">WalkScore API not configured</p>
          <p className="text-xs text-amber-700 mt-1">
            Add NEXT_PUBLIC_WALKSCORE_API_KEY to your environment variables.
            Showing simulated data for preview.
          </p>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function WalkScoreDisplay({
  data,
  isLoading,
  error,
  onRetry,
  compact = false,
  showAmenities = true,
  className = ''
}: WalkScoreDisplayProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false)

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />
  }

  if (!data) {
    return <EmptyState />
  }

  if (data.status === 'error') {
    return <ErrorState error={data.error_message || 'Unknown error'} onRetry={onRetry} />
  }

  const isConfigured = isWalkScoreConfigured()

  return (
    <motion.div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Location Scores</h3>
              <p className="text-xs text-gray-500 truncate max-w-[250px]">{data.address_used}</p>
            </div>
          </div>
          <a
            href={data.more_info_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <img
              src={data.logo_url}
              alt="Walk Score"
              className="h-5"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* API Not Configured Warning */}
      {!isConfigured && (
        <div className="px-4 pt-3">
          <NotConfiguredState />
        </div>
      )}

      {/* Scores Section */}
      <div className="p-4">
        <div className={`flex justify-center gap-6 ${compact ? 'gap-4' : 'gap-8'}`}>
          <ScoreCircle
            score={data.walk_score.score}
            label="Walk Score"
            description={data.walk_score.description}
            icon={MapPin}
            size={compact ? 'small' : 'default'}
          />
          {data.transit_score && (
            <ScoreCircle
              score={data.transit_score.score}
              label="Transit Score"
              description={data.transit_score.description}
              icon={Train}
              size={compact ? 'small' : 'default'}
            />
          )}
          {data.bike_score && (
            <ScoreCircle
              score={data.bike_score.score}
              label="Bike Score"
              description={data.bike_score.description}
              icon={Bike}
              size={compact ? 'small' : 'default'}
            />
          )}
        </div>
      </div>

      {/* Amenities Section */}
      {showAmenities && (
        <div className="border-t border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                Nearby Amenities
              </h4>
              <button
                type="button"
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {showAllAmenities ? 'Show Less' : 'Show All'}
                {showAllAmenities ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(data.nearby_amenities)
                .filter(([_, amenities]) => amenities.length > 0)
                .slice(0, showAllAmenities ? undefined : 4)
                .map(([category, amenities]) => (
                  <AmenityCategory
                    key={category}
                    category={category}
                    amenities={amenities}
                    icon={amenityIcons[category] || MapPin}
                  />
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Transit Options Section */}
      {data.transit_options.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <Bus className="w-4 h-4 text-purple-600" />
            Transit Options
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.transit_options.map((option, index) => (
              <TransitOptionCard key={index} option={option} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Data fetched {new Date(data.fetched_at).toLocaleDateString()} via Walk Score
        </p>
      </div>
    </motion.div>
  )
}
