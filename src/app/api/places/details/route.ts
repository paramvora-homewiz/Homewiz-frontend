/**
 * API Route: /api/places/details
 *
 * Proxies requests to Google Places Details API
 * with caching and rate limiting.
 *
 * Query Parameters:
 * - placeId: The Google Place ID (required)
 *
 * Example: /api/places/details?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getPlaceDetails,
  checkRateLimit
} from '@/lib/google-places-server'

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const placeId = searchParams.get('placeId')

    // Validate placeId
    if (!placeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: placeId'
        },
        { status: 400 }
      )
    }

    // Basic validation of placeId format
    if (placeId.length < 10 || placeId.length > 300) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid placeId format'
        },
        { status: 400 }
      )
    }

    // Call Google Places API (with caching handled internally)
    const result = await getPlaceDetails(placeId)

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: 'Place not found',
          result: null
        },
        { status: 404 }
      )
    }

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        result
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'X-RateLimit-Remaining': rateLimit.remaining.toString()
        }
      }
    )
  } catch (error) {
    console.error('[API /places/details] Error:', error)

    // Don't expose internal error details to client
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isConfigError = message.includes('GOOGLE_PLACES_API_KEY')

    return NextResponse.json(
      {
        success: false,
        error: isConfigError
          ? 'Google Places API is not configured'
          : 'Failed to get place details. Please try again.',
        result: null
      },
      { status: isConfigError ? 503 : 500 }
    )
  }
}
