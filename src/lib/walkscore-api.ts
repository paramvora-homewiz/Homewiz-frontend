/**
 * WalkScore API Integration - OPTIMIZED VERSION
 *
 * Fetches Walk Score, Transit Score, and Bike Score data for addresses.
 * Requires NEXT_PUBLIC_WALKSCORE_API_KEY environment variable.
 *
 * Optimizations implemented:
 * - localStorage caching for geocoding (eliminates repeated geocoding calls)
 * - localStorage caching for WalkScore results (persists across page refreshes)
 * - Support for LocationIQ (much faster than Nominatim - 200ms vs 2-3s)
 * - AbortController for request cancellation
 * - Timeout handling to prevent hanging
 * - Parallel processing where possible
 *
 * API Documentation: https://www.walkscore.com/professional/api.php
 */

import {
  WalkScoreData,
  WalkScoreApiResponse,
  CategorizedAmenities,
  TransitOption,
  WalkScoreAmenity
} from '@/types'
import { fetchNearbyAmenities, isGooglePlacesConfigured } from './google-places-api'

// API Configuration
const WALKSCORE_API_BASE = 'https://api.walkscore.com'
const WALKSCORE_SCORE_ENDPOINT = '/score'

// Cache configuration - v2 invalidates old cache with empty amenities
const GEOCODE_CACHE_KEY = 'homewiz_geocode_cache'
const WALKSCORE_CACHE_KEY = 'homewiz_walkscore_cache_v2'
const GEOCODE_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days (coordinates don't change)
const WALKSCORE_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days (scores change slowly)

// Timeout configuration
const GEOCODE_TIMEOUT = 8000 // 8 seconds
const WALKSCORE_TIMEOUT = 10000 // 10 seconds

// In-memory cache as fallback (also faster for same-session lookups)
const memoryCache = new Map<string, { data: any; timestamp: number }>()

// Active request tracking for cancellation
const activeRequests = new Map<string, AbortController>()

/**
 * Get the WalkScore API key from environment
 */
function getApiKey(): string | null {
  return process.env.NEXT_PUBLIC_WALKSCORE_API_KEY || null
}

/**
 * Get the LocationIQ API key from environment (optional, for faster geocoding)
 */
function getLocationIQKey(): string | null {
  return process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY || null
}

/**
 * Check if WalkScore API is configured
 */
export function isWalkScoreConfigured(): boolean {
  return !!getApiKey()
}

/**
 * Generate a cache key from address components
 */
function getCacheKey(address: string, city: string, state: string, zip: string): string {
  return `${address.toLowerCase().trim()}-${city.toLowerCase().trim()}-${state.toLowerCase().trim()}-${zip.trim()}`
}

/**
 * Get data from localStorage cache
 */
function getFromLocalStorage<T>(storageKey: string, cacheKey: string, maxAge: number): T | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return null

    const cache = JSON.parse(stored) as Record<string, { data: T; timestamp: number }>
    const entry = cache[cacheKey]

    if (entry && Date.now() - entry.timestamp < maxAge) {
      return entry.data
    }

    // Clean up expired entry
    if (entry) {
      delete cache[cacheKey]
      localStorage.setItem(storageKey, JSON.stringify(cache))
    }

    return null
  } catch (error) {
    console.warn('localStorage read error:', error)
    return null
  }
}

/**
 * Save data to localStorage cache
 */
function saveToLocalStorage<T>(storageKey: string, cacheKey: string, data: T): void {
  if (typeof window === 'undefined') return

  try {
    const stored = localStorage.getItem(storageKey)
    const cache = stored ? JSON.parse(stored) : {}

    // Limit cache size to prevent localStorage overflow (keep last 100 entries)
    const keys = Object.keys(cache)
    if (keys.length > 100) {
      // Remove oldest entries
      const sortedKeys = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp)
      sortedKeys.slice(0, 20).forEach(key => delete cache[key])
    }

    cache[cacheKey] = { data, timestamp: Date.now() }
    localStorage.setItem(storageKey, JSON.stringify(cache))
  } catch (error) {
    console.warn('localStorage write error:', error)
    // If storage is full, clear it and try again
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        localStorage.removeItem(storageKey)
        const newCache = { [cacheKey]: { data, timestamp: Date.now() } }
        localStorage.setItem(storageKey, JSON.stringify(newCache))
      } catch {
        // Give up on localStorage
      }
    }
  }
}

/**
 * Fetch with timeout and abort support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
  signal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Forward external abort signal to our controller
  if (signal) {
    signal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Get description based on walk score value
 */
function getWalkScoreDescription(score: number): string {
  if (score >= 90) return "Walker's Paradise"
  if (score >= 70) return "Very Walkable"
  if (score >= 50) return "Somewhat Walkable"
  if (score >= 25) return "Car-Dependent"
  return "Almost All Errands Require a Car"
}

/**
 * Get description based on transit score value
 */
function getTransitScoreDescription(score: number): string {
  if (score >= 90) return "Excellent Transit"
  if (score >= 70) return "Excellent Transit"
  if (score >= 50) return "Good Transit"
  if (score >= 25) return "Some Transit"
  return "Minimal Transit"
}

/**
 * Get description based on bike score value
 */
function getBikeScoreDescription(score: number): string {
  if (score >= 90) return "Biker's Paradise"
  if (score >= 70) return "Very Bikeable"
  if (score >= 50) return "Bikeable"
  return "Somewhat Bikeable"
}

/**
 * Get color class based on score value
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-green-500'
  if (score >= 50) return 'text-yellow-500'
  if (score >= 25) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * Get background color class based on score value
 */
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-green-100'
  if (score >= 70) return 'bg-green-50'
  if (score >= 50) return 'bg-yellow-50'
  if (score >= 25) return 'bg-orange-50'
  return 'bg-red-50'
}

/**
 * Get gradient color for score circle
 */
export function getScoreGradient(score: number): string {
  if (score >= 90) return 'from-green-500 to-emerald-500'
  if (score >= 70) return 'from-green-400 to-green-500'
  if (score >= 50) return 'from-yellow-400 to-yellow-500'
  if (score >= 25) return 'from-orange-400 to-orange-500'
  return 'from-red-400 to-red-500'
}

/**
 * Geocode using LocationIQ (FAST - ~200ms)
 * Requires NEXT_PUBLIC_LOCATIONIQ_API_KEY environment variable
 */
async function geocodeWithLocationIQ(
  fullAddress: string,
  signal?: AbortSignal
): Promise<{ lat: number; lon: number } | null> {
  const apiKey = getLocationIQKey()
  if (!apiKey) return null

  try {
    const encodedAddress = encodeURIComponent(fullAddress)
    const response = await fetchWithTimeout(
      `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodedAddress}&format=json&limit=1`,
      {
        headers: { 'Accept': 'application/json' }
      },
      GEOCODE_TIMEOUT,
      signal
    )

    if (!response.ok) return null

    const data = await response.json()
    if (data && data.length > 0) {
      console.log('Geocoded via LocationIQ (fast)')
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error // Re-throw abort errors
    }
    console.warn('LocationIQ geocoding failed, will try Nominatim:', error)
    return null
  }
}

/**
 * Geocode using Nominatim (SLOW - ~1-3s, but free and no API key)
 */
async function geocodeWithNominatim(
  fullAddress: string,
  signal?: AbortSignal
): Promise<{ lat: number; lon: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(fullAddress)
    const response = await fetchWithTimeout(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'HomeWiz Property Management',
          'Accept': 'application/json'
        }
      },
      GEOCODE_TIMEOUT,
      signal
    )

    if (!response.ok) {
      console.error('Nominatim geocoding failed:', response.status)
      return null
    }

    const data = await response.json()
    if (data && data.length > 0) {
      console.log('Geocoded via Nominatim')
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    console.error('Nominatim geocoding error:', error)
    return null
  }
}

/**
 * Geocode an address to get latitude and longitude
 * Uses cache first, then LocationIQ (fast), then Nominatim (fallback)
 */
async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip: string,
  signal?: AbortSignal
): Promise<{ lat: number; lon: number } | null> {
  const fullAddress = `${address}, ${city}, ${state} ${zip}`
  const cacheKey = getCacheKey(address, city, state, zip)

  // Check localStorage cache first (instant!)
  const cachedCoords = getFromLocalStorage<{ lat: number; lon: number }>(
    GEOCODE_CACHE_KEY,
    cacheKey,
    GEOCODE_CACHE_DURATION
  )
  if (cachedCoords) {
    console.log('Geocoding: cache hit (instant)')
    return cachedCoords
  }

  // Check memory cache
  const memCached = memoryCache.get(`geo:${cacheKey}`)
  if (memCached && Date.now() - memCached.timestamp < GEOCODE_CACHE_DURATION) {
    console.log('Geocoding: memory cache hit')
    return memCached.data
  }

  // Try LocationIQ first (much faster if configured)
  let coords = await geocodeWithLocationIQ(fullAddress, signal)

  // Fall back to Nominatim
  if (!coords) {
    coords = await geocodeWithNominatim(fullAddress, signal)
  }

  // Cache successful result
  if (coords) {
    saveToLocalStorage(GEOCODE_CACHE_KEY, cacheKey, coords)
    memoryCache.set(`geo:${cacheKey}`, { data: coords, timestamp: Date.now() })
  }

  return coords
}

/**
 * Fetch WalkScore data from the API (via server-side proxy to avoid CORS)
 */
async function fetchFromWalkScoreApi(
  address: string,
  city: string,
  state: string,
  zip: string,
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<WalkScoreApiResponse | null> {
  const fullAddress = `${address}, ${city}, ${state} ${zip}`

  const params = new URLSearchParams({
    address: fullAddress,
    lat: lat.toString(),
    lon: lon.toString()
  })

  try {
    // Use server-side proxy to avoid CORS issues
    const response = await fetchWithTimeout(
      `/api/walkscore?${params.toString()}`,
      {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      },
      WALKSCORE_TIMEOUT,
      signal
    )

    if (!response.ok) {
      console.error('WalkScore API error:', response.status)
      return null
    }

    const json = await response.json()

    if (!json.success) {
      console.error('WalkScore API error:', json.error)
      return null
    }

    return json.data as WalkScoreApiResponse
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    console.error('WalkScore API fetch error:', error)
    return null
  }
}

/**
 * Generate mock nearby amenities based on walk score
 */
function generateMockAmenities(walkScore: number): CategorizedAmenities {
  const amenityCount = Math.floor(walkScore / 10)

  const generateAmenities = (type: string, names: string[], maxCount: number): WalkScoreAmenity[] => {
    const count = Math.min(Math.floor(Math.random() * maxCount) + 1, amenityCount)
    return names.slice(0, count).map((name) => ({
      name,
      type,
      distance: parseFloat((0.1 + Math.random() * 0.5).toFixed(2))
    }))
  }

  return {
    dining: generateAmenities('restaurant', [
      'Local Bistro', 'Pizza Palace', 'Thai Garden', 'Burger Joint', 'Sushi Express'
    ], 5),
    grocery: generateAmenities('grocery', [
      'Fresh Market', 'Whole Foods', 'Trader Joe\'s', 'Local Grocery'
    ], 3),
    coffee: generateAmenities('coffee', [
      'Starbucks', 'Local Coffee Co', 'Blue Bottle', 'Peet\'s Coffee'
    ], 4),
    shopping: generateAmenities('shopping', [
      'Target', 'CVS Pharmacy', 'Local Boutique', 'Bookstore'
    ], 3),
    entertainment: generateAmenities('entertainment', [
      'Movie Theater', 'Comedy Club', 'Art Gallery'
    ], 2),
    fitness: generateAmenities('fitness', [
      '24 Hour Fitness', 'Planet Fitness', 'Yoga Studio'
    ], 2),
    parks: generateAmenities('parks', [
      'Central Park', 'Community Garden', 'Dog Park'
    ], 2),
    schools: generateAmenities('school', [
      'Elementary School', 'Public Library', 'Community College'
    ], 2),
    other: []
  }
}

/**
 * Generate mock transit options based on transit score
 */
function generateMockTransitOptions(transitScore: number): TransitOption[] {
  if (transitScore < 25) return []

  const options: TransitOption[] = []

  if (transitScore >= 25) {
    options.push({
      name: 'Bus Stop - Main St',
      type: 'bus',
      distance: 0.1,
      routes: ['Route 1', 'Route 5']
    })
  }

  if (transitScore >= 50) {
    options.push({
      name: 'Metro Station',
      type: 'subway',
      distance: 0.3,
      routes: ['Blue Line', 'Red Line']
    })
  }

  if (transitScore >= 70) {
    options.push({
      name: 'Light Rail Stop',
      type: 'light_rail',
      distance: 0.4,
      routes: ['Green Line']
    })
  }

  if (transitScore >= 90) {
    options.push({
      name: 'Train Station',
      type: 'rail',
      distance: 0.5,
      routes: ['Commuter Rail']
    })
  }

  return options
}

/**
 * Main function to fetch WalkScore data for an address
 * Optimized with caching, request cancellation, and faster geocoding
 */
export async function fetchWalkScore(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<WalkScoreData> {
  const cacheKey = getCacheKey(address, city, state, zip)
  const fullAddress = `${address}, ${city}, ${state} ${zip}`

  // Cancel any existing request for this address
  const existingController = activeRequests.get(cacheKey)
  if (existingController) {
    existingController.abort()
    activeRequests.delete(cacheKey)
  }

  // Create new abort controller for this request
  const controller = new AbortController()
  activeRequests.set(cacheKey, controller)

  try {
    // Check localStorage cache first (instant!) - but validate it has amenities
    const cachedData = getFromLocalStorage<WalkScoreData>(
      WALKSCORE_CACHE_KEY,
      cacheKey,
      WALKSCORE_CACHE_DURATION
    )
    if (cachedData) {
      // Validate cached data has actual amenities (not empty from failed previous attempts)
      const hasAmenities = cachedData.nearby_amenities &&
        Object.values(cachedData.nearby_amenities).some(arr => arr.length > 0)
      if (hasAmenities) {
        console.log('WalkScore: cache hit (instant)')
        activeRequests.delete(cacheKey)
        return cachedData
      } else {
        console.log('WalkScore: cache has empty amenities, re-fetching...')
      }
    }

    // Check memory cache - also validate amenities
    const memCached = memoryCache.get(`ws:${cacheKey}`)
    if (memCached && Date.now() - memCached.timestamp < WALKSCORE_CACHE_DURATION) {
      const hasAmenities = memCached.data.nearby_amenities &&
        Object.values(memCached.data.nearby_amenities).some((arr: any[]) => arr.length > 0)
      if (hasAmenities) {
        console.log('WalkScore: memory cache hit')
        activeRequests.delete(cacheKey)
        return memCached.data
      }
    }

    // Check if API is configured
    if (!isWalkScoreConfigured()) {
      console.log('WalkScore API not configured, using simulated data')
      activeRequests.delete(cacheKey)
      return generateSimulatedWalkScoreData(fullAddress)
    }

    // Geocode the address (uses cache internally)
    const coords = await geocodeAddress(address, city, state, zip, controller.signal)

    if (!coords) {
      console.warn('Could not geocode address, using simulated data')
      activeRequests.delete(cacheKey)
      return generateSimulatedWalkScoreData(fullAddress)
    }

    // Fetch WalkScore API and Google Places in parallel for speed
    const [apiResponse, placesData] = await Promise.all([
      fetchFromWalkScoreApi(address, city, state, zip, coords.lat, coords.lon, controller.signal),
      // Only fetch from Google Places if configured
      isGooglePlacesConfigured()
        ? fetchNearbyAmenities(coords.lat, coords.lon)
        : Promise.resolve(null)
    ])

    if (!apiResponse || apiResponse.status !== 1) {
      console.warn('WalkScore API returned no data, using simulated data')
      activeRequests.delete(cacheKey)
      return generateSimulatedWalkScoreData(fullAddress)
    }

    // Use real amenities from Google Places if available, otherwise use mock data
    let nearbyAmenities: CategorizedAmenities
    let transitOptions: TransitOption[]

    if (placesData && isGooglePlacesConfigured()) {
      console.log('Using real amenities from Google Places API')
      nearbyAmenities = placesData.amenities
      transitOptions = placesData.transit
    } else {
      console.log('Using mock amenities (Google Places API not configured)')
      nearbyAmenities = generateMockAmenities(apiResponse.walkscore || 50)
      transitOptions = generateMockTransitOptions(apiResponse.transit?.score || 50)
    }

    // Transform API response to our data structure
    const walkScoreData: WalkScoreData = {
      walk_score: {
        score: apiResponse.walkscore || 0,
        description: apiResponse.description || getWalkScoreDescription(apiResponse.walkscore || 0)
      },
      transit_score: apiResponse.transit?.score ? {
        score: apiResponse.transit.score,
        description: apiResponse.transit.description || getTransitScoreDescription(apiResponse.transit.score)
      } : undefined,
      bike_score: apiResponse.bike?.score ? {
        score: apiResponse.bike.score,
        description: apiResponse.bike.description || getBikeScoreDescription(apiResponse.bike.score)
      } : undefined,
      nearby_amenities: nearbyAmenities,
      transit_options: transitOptions,
      address_used: fullAddress,
      fetched_at: new Date().toISOString(),
      logo_url: apiResponse.logo_url || 'https://cdn.walk.sc/images/api-logo.png',
      more_info_url: apiResponse.more_info_link || `https://www.walkscore.com/score/${encodeURIComponent(fullAddress)}`,
      status: 'success'
    }

    // Cache the response in both localStorage and memory
    saveToLocalStorage(WALKSCORE_CACHE_KEY, cacheKey, walkScoreData)
    memoryCache.set(`ws:${cacheKey}`, { data: walkScoreData, timestamp: Date.now() })

    activeRequests.delete(cacheKey)
    return walkScoreData

  } catch (error) {
    activeRequests.delete(cacheKey)

    // If request was aborted, return a special response
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('WalkScore request was cancelled')
      return {
        walk_score: { score: 0, description: 'Request cancelled' },
        nearby_amenities: {
          dining: [], grocery: [], coffee: [], shopping: [],
          entertainment: [], fitness: [], parks: [], schools: [], other: []
        },
        transit_options: [],
        address_used: fullAddress,
        fetched_at: new Date().toISOString(),
        logo_url: 'https://cdn.walk.sc/images/api-logo.png',
        more_info_url: '',
        status: 'error',
        error_message: 'Request cancelled'
      }
    }

    console.error('Error fetching WalkScore:', error)
    return {
      walk_score: { score: 0, description: 'Unable to fetch' },
      nearby_amenities: {
        dining: [], grocery: [], coffee: [], shopping: [],
        entertainment: [], fitness: [], parks: [], schools: [], other: []
      },
      transit_options: [],
      address_used: fullAddress,
      fetched_at: new Date().toISOString(),
      logo_url: 'https://cdn.walk.sc/images/api-logo.png',
      more_info_url: '',
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate simulated WalkScore data for demo/development
 */
export function generateSimulatedWalkScoreData(address: string): WalkScoreData {
  let baseScore = 50 + Math.floor(Math.random() * 40)

  const urbanKeywords = ['downtown', 'main st', 'broadway', 'central', 'market']
  const addressLower = address.toLowerCase()
  if (urbanKeywords.some(keyword => addressLower.includes(keyword))) {
    baseScore = Math.min(baseScore + 20, 98)
  }

  const walkScore = baseScore
  const transitScore = Math.max(0, walkScore - 10 + Math.floor(Math.random() * 20))
  const bikeScore = Math.max(0, walkScore - 5 + Math.floor(Math.random() * 15))

  return {
    walk_score: {
      score: walkScore,
      description: getWalkScoreDescription(walkScore)
    },
    transit_score: {
      score: transitScore,
      description: getTransitScoreDescription(transitScore)
    },
    bike_score: {
      score: bikeScore,
      description: getBikeScoreDescription(bikeScore)
    },
    nearby_amenities: generateMockAmenities(walkScore),
    transit_options: generateMockTransitOptions(transitScore),
    address_used: address,
    fetched_at: new Date().toISOString(),
    logo_url: 'https://cdn.walk.sc/images/api-logo.png',
    more_info_url: `https://www.walkscore.com/score/${encodeURIComponent(address)}`,
    status: 'success'
  }
}

/**
 * Clear the WalkScore cache (both localStorage and memory)
 */
export function clearWalkScoreCache(): void {
  memoryCache.clear()
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GEOCODE_CACHE_KEY)
    localStorage.removeItem(WALKSCORE_CACHE_KEY)
  }
}

/**
 * Clear just the geocoding cache
 */
export function clearGeocodingCache(): void {
  // Clear memory cache entries starting with 'geo:'
  for (const key of memoryCache.keys()) {
    if (key.startsWith('geo:')) {
      memoryCache.delete(key)
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GEOCODE_CACHE_KEY)
  }
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getCacheStats(): {
  geocodeCacheSize: number
  walkscoreCacheSize: number
  memoryCacheSize: number
} {
  let geocodeCacheSize = 0
  let walkscoreCacheSize = 0

  if (typeof window !== 'undefined') {
    try {
      const geoCache = localStorage.getItem(GEOCODE_CACHE_KEY)
      if (geoCache) {
        geocodeCacheSize = Object.keys(JSON.parse(geoCache)).length
      }
      const wsCache = localStorage.getItem(WALKSCORE_CACHE_KEY)
      if (wsCache) {
        walkscoreCacheSize = Object.keys(JSON.parse(wsCache)).length
      }
    } catch {}
  }

  return {
    geocodeCacheSize,
    walkscoreCacheSize,
    memoryCacheSize: memoryCache.size
  }
}

/**
 * Validate if an address is complete enough for WalkScore lookup
 */
export function isAddressComplete(
  address: string | undefined,
  city: string | undefined,
  state: string | undefined,
  zip: string | undefined
): boolean {
  return !!(
    address && address.trim().length >= 5 &&
    city && city.trim().length >= 2 &&
    state && state.trim().length >= 2 &&
    zip && zip.trim().length >= 5
  )
}

/**
 * Cancel any pending WalkScore request for an address
 */
export function cancelWalkScoreRequest(
  address: string,
  city: string,
  state: string,
  zip: string
): void {
  const cacheKey = getCacheKey(address, city, state, zip)
  const controller = activeRequests.get(cacheKey)
  if (controller) {
    controller.abort()
    activeRequests.delete(cacheKey)
  }
}

/**
 * Prefetch WalkScore data for an address (non-blocking)
 * Useful for preloading data when user is likely to view it
 */
export function prefetchWalkScore(
  address: string,
  city: string,
  state: string,
  zip: string
): void {
  // Only prefetch if not already cached
  const cacheKey = getCacheKey(address, city, state, zip)
  const cached = getFromLocalStorage<WalkScoreData>(
    WALKSCORE_CACHE_KEY,
    cacheKey,
    WALKSCORE_CACHE_DURATION
  )

  if (!cached) {
    // Fire and forget - don't await
    fetchWalkScore(address, city, state, zip).catch(() => {
      // Silently ignore prefetch errors
    })
  }
}
