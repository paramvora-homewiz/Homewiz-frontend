/**
 * API Route: /api/places/autocomplete
 *
 * Proxies requests to Google Places Autocomplete API
 * with caching and rate limiting.
 *
 * Query Parameters:
 * - query: The search query (required, min 3 characters)
 * - country: Country code (optional, default: 'us')
 * - types: Place types (optional, default: 'address')
 *
 * Example: /api/places/autocomplete?query=175+Freeman&country=us
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  searchPlacesAutocomplete,
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
    const query = searchParams.get('query')
    const country = searchParams.get('country') || 'us'
    const types = searchParams.get('types') || 'address'

    // Validate query
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: query'
        },
        { status: 400 }
      )
    }

    if (query.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query must be at least 3 characters'
        },
        { status: 400 }
      )
    }

    // Sanitize input (basic XSS prevention)
    const sanitizedQuery = query
      .replace(/[<>]/g, '')
      .substring(0, 200) // Max 200 characters

    // Call Google Places API (with caching handled internally)
    const results = await searchPlacesAutocomplete(sanitizedQuery, {
      country,
      types
    })

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        results,
        count: results.length
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
          'X-RateLimit-Remaining': rateLimit.remaining.toString()
        }
      }
    )
  } catch (error) {
    console.error('[API /places/autocomplete] Error:', error)

    // Don't expose internal error details to client
    const message = error instanceof Error ? error.message : 'Unknown error'
    const isConfigError = message.includes('GOOGLE_PLACES_API_KEY')

    return NextResponse.json(
      {
        success: false,
        error: isConfigError
          ? 'Google Places API is not configured'
          : 'Failed to search addresses. Please try again.',
        results: []
      },
      { status: isConfigError ? 503 : 500 }
    )
  }
}
