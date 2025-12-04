/**
 * API Route: /api/places/nearby
 *
 * Proxies requests to Google Places Nearby Search API to avoid CORS issues.
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Cache for nearby places (in-memory, server-side)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

function getApiKey(): string | null {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const type = searchParams.get('type')
    const radius = searchParams.get('radius') || '1609' // 1 mile default

    // Validate required params
    if (!lat || !lon || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: lat, lon, type' },
        { status: 400 }
      )
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Places API key not configured' },
        { status: 503 }
      )
    }

    // Check cache
    const cacheKey = `${lat},${lon}:${type}:${radius}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, results: cached.data, cached: true })
    }

    // Build Google Places API URL
    const params = new URLSearchParams({
      location: `${lat},${lon}`,
      radius: radius,
      type: type,
      key: apiKey
    })

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    )

    if (!response.ok) {
      console.error('[Places Nearby API] Error:', response.status)
      return NextResponse.json(
        { success: false, error: `Google Places API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[Places Nearby API] Status:', data.status, data.error_message)
      return NextResponse.json(
        { success: false, error: data.error_message || data.status },
        { status: 400 }
      )
    }

    // Parse results
    const results = (data.results || []).map((place: any) => ({
      name: place.name,
      placeId: place.place_id,
      types: place.types,
      vicinity: place.vicinity,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total
    }))

    // Cache results
    cache.set(cacheKey, { data: results, timestamp: Date.now() })

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('[Places Nearby API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch nearby places' },
      { status: 500 }
    )
  }
}
