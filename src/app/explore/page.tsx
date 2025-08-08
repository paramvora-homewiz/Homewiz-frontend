'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const PropertyExplorer = dynamic(() => import('@/components/property-explorer/PropertyExplorer'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Property Explorer...</p>
      </div>
    </div>
  )
})

export default function ExplorePage() {
  return <PropertyExplorer />
}