/**
 * Server-side Google Places API Integration
 *
 * This file should ONLY be imported in server-side code (API routes, server components).
 * It uses the server-only GOOGLE_PLACES_API_KEY environment variable.
 *
 * Features:
 * - In-memory caching to reduce API costs
 * - Rate limiting to prevent abuse
 * - Proper error handling
 */

// ============================================
// TYPES
// ============================================

export interface PlaceAutocompleteResult {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

export interface PlaceDetailsResult {
  placeId: string
  formattedAddress: string
  streetNumber: string
  streetName: string
  fullStreetAddress: string
  city: string
  state: string
  stateCode: string
  zipCode: string
  country: string
  countryCode: string
  neighborhood: string
  sublocality: string
  lat: number
  lng: number
}

interface GoogleAutocompleteResponse {
  status: string
  predictions: Array<{
    place_id: string
    description: string
    structured_formatting: {
      main_text: string
      secondary_text: string
    }
  }>
  error_message?: string
}

interface GooglePlaceDetailsResponse {
  status: string
  result: {
    place_id: string
    formatted_address: string
    address_components: Array<{
      long_name: string
      short_name: string
      types: string[]
    }>
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
  }
  error_message?: string
}

// ============================================
// CONFIGURATION
// ============================================

const GOOGLE_PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place'

// Cache configuration
const AUTOCOMPLETE_CACHE_DURATION = 60 * 60 * 1000 // 1 hour
const DETAILS_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CACHE_SIZE = 1000 // Max entries per cache

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // per IP per minute

// ============================================
// CACHING LAYER
// ============================================

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private ttl: number

  constructor(maxSize: number, ttl: number) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    // Move to end (most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.data
  }

  set(key: string, data: T): void {
    // Delete if exists (to update position)
    this.cache.delete(key)

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    return this.cache.size
  }
}

// Initialize caches
const autocompleteCache = new LRUCache<PlaceAutocompleteResult[]>(MAX_CACHE_SIZE, AUTOCOMPLETE_CACHE_DURATION)
const detailsCache = new LRUCache<PlaceDetailsResult>(MAX_CACHE_SIZE, DETAILS_CACHE_DURATION)

// ============================================
// RATE LIMITING
// ============================================

const rateLimitMap = new Map<string, number[]>()

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Get existing timestamps for this IP
  let timestamps = rateLimitMap.get(ip) || []

  // Filter to only timestamps within the window
  timestamps = timestamps.filter(t => t > windowStart)

  // Check if over limit
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }

  // Add current timestamp
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)

  // Cleanup old IPs periodically (every 100 requests)
  if (Math.random() < 0.01) {
    cleanupRateLimitMap()
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - timestamps.length }
}

function cleanupRateLimitMap(): void {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const validTimestamps = timestamps.filter(t => t > windowStart)
    if (validTimestamps.length === 0) {
      rateLimitMap.delete(ip)
    } else {
      rateLimitMap.set(ip, validTimestamps)
    }
  }
}

// ============================================
// API KEY MANAGEMENT
// ============================================

function getApiKey(): string {
  // Server-only environment variable (no NEXT_PUBLIC_ prefix)
  const key = process.env.GOOGLE_PLACES_API_KEY

  if (!key) {
    throw new Error('GOOGLE_PLACES_API_KEY environment variable is not set')
  }

  return key
}

// ============================================
// AUTOCOMPLETE API
// ============================================

export async function searchPlacesAutocomplete(
  query: string,
  options?: {
    country?: string
    types?: string
  }
): Promise<PlaceAutocompleteResult[]> {
  // Validate input
  if (!query || query.trim().length < 3) {
    return []
  }

  const normalizedQuery = query.trim().toLowerCase()
  const cacheKey = `${normalizedQuery}:${options?.country || 'us'}:${options?.types || 'address'}`

  // Check cache first
  const cached = autocompleteCache.get(cacheKey)
  if (cached) {
    console.log(`[Places API] Cache HIT for autocomplete: "${query.substring(0, 20)}..."`)
    return cached
  }

  console.log(`[Places API] Cache MISS for autocomplete: "${query.substring(0, 20)}..."`)

  try {
    const apiKey = getApiKey()

    const params = new URLSearchParams({
      input: query,
      key: apiKey,
      types: options?.types || 'address',
      components: `country:${options?.country || 'us'}`
    })

    const response = await fetch(
      `${GOOGLE_PLACES_API_BASE}/autocomplete/json?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Cache for 1 hour on the edge
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      console.error(`[Places API] HTTP error: ${response.status}`)
      throw new Error(`Google API returned ${response.status}`)
    }

    const data: GoogleAutocompleteResponse = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`[Places API] Error status: ${data.status} - ${data.error_message}`)
      throw new Error(data.error_message || `Google API error: ${data.status}`)
    }

    const results: PlaceAutocompleteResult[] = (data.predictions || []).map(prediction => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || '',
      secondaryText: prediction.structured_formatting?.secondary_text || ''
    }))

    // Cache the results
    autocompleteCache.set(cacheKey, results)

    return results
  } catch (error) {
    console.error('[Places API] Autocomplete error:', error)
    throw error
  }
}

// ============================================
// PLACE DETAILS API
// ============================================

export async function getPlaceDetails(placeId: string): Promise<PlaceDetailsResult | null> {
  // Validate input
  if (!placeId || placeId.trim().length === 0) {
    return null
  }

  // Check cache first
  const cached = detailsCache.get(placeId)
  if (cached) {
    console.log(`[Places API] Cache HIT for details: ${placeId.substring(0, 20)}...`)
    return cached
  }

  console.log(`[Places API] Cache MISS for details: ${placeId.substring(0, 20)}...`)

  try {
    const apiKey = getApiKey()

    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields: 'place_id,formatted_address,address_components,geometry'
    })

    const response = await fetch(
      `${GOOGLE_PLACES_API_BASE}/details/json?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // Cache for 24 hours on the edge
        next: { revalidate: 86400 }
      }
    )

    if (!response.ok) {
      console.error(`[Places API] HTTP error: ${response.status}`)
      throw new Error(`Google API returned ${response.status}`)
    }

    const data: GooglePlaceDetailsResponse = await response.json()

    if (data.status !== 'OK') {
      console.error(`[Places API] Error status: ${data.status} - ${data.error_message}`)
      throw new Error(data.error_message || `Google API error: ${data.status}`)
    }

    const result = parseAddressComponents(data.result)

    // Cache the results
    detailsCache.set(placeId, result)

    return result
  } catch (error) {
    console.error('[Places API] Details error:', error)
    throw error
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseAddressComponents(result: GooglePlaceDetailsResponse['result']): PlaceDetailsResult {
  const components = result.address_components || []

  const parsed: PlaceDetailsResult = {
    placeId: result.place_id,
    formattedAddress: result.formatted_address || '',
    streetNumber: '',
    streetName: '',
    fullStreetAddress: '',
    city: '',
    state: '',
    stateCode: '',
    zipCode: '',
    country: '',
    countryCode: '',
    neighborhood: '',
    sublocality: '',
    lat: result.geometry?.location?.lat || 0,
    lng: result.geometry?.location?.lng || 0
  }

  for (const component of components) {
    const types = component.types || []

    if (types.includes('street_number')) {
      parsed.streetNumber = component.long_name
    }
    if (types.includes('route')) {
      parsed.streetName = component.long_name
    }
    if (types.includes('locality')) {
      parsed.city = component.long_name
    }
    if (types.includes('administrative_area_level_1')) {
      parsed.state = component.long_name
      parsed.stateCode = component.short_name
    }
    if (types.includes('postal_code')) {
      parsed.zipCode = component.long_name
    }
    if (types.includes('country')) {
      parsed.country = component.long_name
      parsed.countryCode = component.short_name
    }
    if (types.includes('neighborhood')) {
      parsed.neighborhood = component.long_name
    }
    if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
      parsed.sublocality = component.long_name
    }
  }

  // Combine street number and name
  parsed.fullStreetAddress = [parsed.streetNumber, parsed.streetName]
    .filter(Boolean)
    .join(' ')

  return parsed
}

// ============================================
// CACHE MANAGEMENT
// ============================================

export function clearAllCaches(): void {
  autocompleteCache.clear()
  detailsCache.clear()
  console.log('[Places API] All caches cleared')
}

export function getCacheStats(): { autocomplete: number; details: number } {
  return {
    autocomplete: autocompleteCache.size,
    details: detailsCache.size
  }
}
