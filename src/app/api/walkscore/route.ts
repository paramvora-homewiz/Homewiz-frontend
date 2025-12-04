/**
 * API Route: /api/walkscore
 *
 * Proxies requests to WalkScore API to avoid CORS issues.
 * Uses server-side API key (not exposed to browser).
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Cache for WalkScore responses (in-memory, server-side)
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

function getApiKey(): string | null {
  return process.env.NEXT_PUBLIC_WALKSCORE_API_KEY || process.env.WALKSCORE_API_KEY || null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get('address')
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    // Validate required params
    if (!address || !lat || !lon) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: address, lat, lon' },
        { status: 400 }
      )
    }

    const apiKey = getApiKey()
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'WalkScore API key not configured' },
        { status: 503 }
      )
    }

    // Check cache
    const cacheKey = `${lat},${lon}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ success: true, data: cached.data, cached: true })
    }

    // Build WalkScore API URL
    const params = new URLSearchParams({
      format: 'json',
      address: address,
      lat: lat,
      lon: lon,
      transit: '1',
      bike: '1',
      wsapikey: apiKey
    })

    const response = await fetch(
      `https://api.walkscore.com/score?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }
    )

    if (!response.ok) {
      console.error('[WalkScore API] Error:', response.status)
      return NextResponse.json(
        { success: false, error: `WalkScore API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Cache successful response
    if (data.status === 1) {
      cache.set(cacheKey, { data, timestamp: Date.now() })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[WalkScore API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch WalkScore data' },
      { status: 500 }
    )
  }
}
