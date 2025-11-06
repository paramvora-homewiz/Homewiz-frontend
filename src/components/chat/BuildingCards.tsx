import React from 'react'
import { Building, MapPin, Home, ExternalLink, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { parseBuildingImages } from '@/lib/backend-sync'

interface BuildingData {
  building_id: string
  building_name: string
  address?: string
  city: string
  state: string
  total_units?: number
  available_units?: number
  building_images?: any // Can be string, array, or null
}

interface BuildingCardsProps {
  buildings: BuildingData[]
  showExploreLink?: boolean
}

export default function BuildingCards({ buildings, showExploreLink = true }: BuildingCardsProps) {
  // Show only first 6 buildings to avoid congestion
  const displayBuildings = buildings.slice(0, 6)
  const hasMore = buildings.length > 6

  return (
    <div className="mt-4">
      {/* Grid of building cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {displayBuildings.map((building) => {
          const images = parseBuildingImages(building.building_images)
          const mainImage = images[0]
          
          return (
            <div
              key={building.building_id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Building Image */}
              {mainImage && (
                <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={mainImage}
                    alt={building.building_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide image on error and show placeholder
                      const imgElement = e.currentTarget
                      const parent = imgElement.parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>'
                      }
                    }}
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      +{images.length - 1} more
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                      <Building className="w-4 h-4 text-blue-500" />
                      {building.building_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {building.city}, {building.state}
                    </p>
                  </div>
                  {building.available_units !== undefined && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {building.available_units}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">available</p>
                    </div>
                  )}
                </div>
                
                {building.total_units && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total units</span>
                      <span className="font-medium text-gray-900 dark:text-white">{building.total_units}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Show more indicator */}
      {hasMore && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
          ... and {buildings.length - 6} more buildings
        </p>
      )}

      {/* Explore link */}
      {showExploreLink && (
        <Link 
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Explore All Properties Interactively
          <ExternalLink className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}