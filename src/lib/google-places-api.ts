/**
 * Google Places API Integration
 *
 * Fetches real nearby amenities for a given location.
 * Uses server-side proxy at /api/places/nearby to avoid CORS issues.
 */

import { CategorizedAmenities, WalkScoreAmenity, TransitOption } from '@/types'

// Cache configuration - v2 invalidates old empty cache from before proxy was working
const PLACES_CACHE_KEY = 'homewiz_places_cache_v2'
const PLACES_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

// Search radius in meters (1 mile)
const SEARCH_RADIUS = 1609

// Place type mappings for categorization
const PLACE_TYPE_CATEGORIES: Record<string, keyof CategorizedAmenities> = {
  // Dining
  restaurant: 'dining',
  meal_delivery: 'dining',
  meal_takeaway: 'dining',
  bakery: 'dining',
  bar: 'dining',

  // Grocery
  supermarket: 'grocery',
  grocery_or_supermarket: 'grocery',
  convenience_store: 'grocery',

  // Coffee
  cafe: 'coffee',

  // Shopping
  shopping_mall: 'shopping',
  clothing_store: 'shopping',
  department_store: 'shopping',
  drugstore: 'shopping',
  pharmacy: 'shopping',

  // Entertainment
  movie_theater: 'entertainment',
  night_club: 'entertainment',
  bowling_alley: 'entertainment',
  amusement_park: 'entertainment',

  // Fitness
  gym: 'fitness',

  // Parks
  park: 'parks',

  // Schools
  school: 'schools',
  university: 'schools',
  library: 'schools',

  // Transit
  transit_station: 'other',
  subway_station: 'other',
  bus_station: 'other',
  train_station: 'other',
}

// Types for search
type PlaceCategory = 'dining' | 'grocery' | 'coffee' | 'shopping' | 'entertainment' | 'fitness' | 'parks' | 'schools' | 'transit'

const CATEGORY_SEARCH_TYPES: Record<PlaceCategory, string[]> = {
  dining: ['restaurant', 'meal_takeaway', 'bakery'],
  grocery: ['supermarket', 'grocery_or_supermarket'],
  coffee: ['cafe'],
  shopping: ['shopping_mall', 'clothing_store', 'drugstore', 'pharmacy'],
  entertainment: ['movie_theater', 'night_club', 'bowling_alley'],
  fitness: ['gym'],
  parks: ['park'],
  schools: ['school', 'library'],
  transit: ['transit_station', 'subway_station', 'bus_station'],
}

/**
 * Check if Google Places API is configured
 * Uses server-side proxy at /api/places/nearby to avoid CORS issues.
 */
export function isGooglePlacesConfigured(): boolean {
  return true
}

/**
 * Generate cache key for places lookup
 */
function getCacheKey(lat: number, lon: number): string {
  // Round to 3 decimal places (~100m precision) to improve cache hits
  return `${lat.toFixed(3)}-${lon.toFixed(3)}`
}

/**
 * Get from localStorage cache
 */
function getFromCache<T>(cacheKey: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(PLACES_CACHE_KEY)
    if (!stored) return null

    const cache = JSON.parse(stored) as Record<string, { data: T; timestamp: number }>
    const entry = cache[cacheKey]

    if (entry && Date.now() - entry.timestamp < PLACES_CACHE_DURATION) {
      return entry.data
    }

    return null
  } catch {
    return null
  }
}

/**
 * Save to localStorage cache
 */
function saveToCache<T>(cacheKey: string, data: T): void {
  if (typeof window === 'undefined') return

  try {
    const stored = localStorage.getItem(PLACES_CACHE_KEY)
    const cache = stored ? JSON.parse(stored) : {}

    // Limit cache size
    const keys = Object.keys(cache)
    if (keys.length > 50) {
      const sortedKeys = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp)
      sortedKeys.slice(0, 10).forEach(key => delete cache[key])
    }

    cache[cacheKey] = { data, timestamp: Date.now() }
    localStorage.setItem(PLACES_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore cache errors
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 100) / 100 // Round to 2 decimal places
}

/**
 * Fetch nearby places for a specific category using server-side proxy
 */
async function fetchNearbyPlaces(
  lat: number,
  lon: number,
  types: string[],
  maxResults: number = 5
): Promise<WalkScoreAmenity[]> {
  const amenities: WalkScoreAmenity[] = []

  for (const type of types) {
    if (amenities.length >= maxResults) break

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        type: type,
        radius: SEARCH_RADIUS.toString()
      })

      const response = await fetch(`/api/places/nearby?${params.toString()}`)

      if (!response.ok) continue

      const data = await response.json()

      if (data.success && data.results) {
        for (const place of data.results) {
          if (amenities.length >= maxResults) break

          // Skip if we already have this place
          if (amenities.some(a => a.name === place.name)) continue

          if (place.lat && place.lng) {
            amenities.push({
              name: place.name,
              type: type,
              distance: calculateDistance(lat, lon, place.lat, place.lng)
            })
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch ${type} places:`, error)
    }
  }

  // Sort by distance
  return amenities.sort((a, b) => a.distance - b.distance)
}

/**
 * Fetch transit options using server-side proxy
 */
async function fetchTransitOptions(
  lat: number,
  lon: number
): Promise<TransitOption[]> {
  const transitOptions: TransitOption[] = []
  const transitTypes = ['transit_station', 'subway_station', 'bus_station', 'train_station']

  for (const type of transitTypes) {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        type: type,
        radius: SEARCH_RADIUS.toString()
      })

      const response = await fetch(`/api/places/nearby?${params.toString()}`)

      if (!response.ok) continue

      const data = await response.json()

      if (data.success && data.results) {
        for (const place of data.results.slice(0, 3)) {
          // Skip if we already have this station
          if (transitOptions.some(t => t.name === place.name)) continue

          if (place.lat && place.lng) {
            // Determine transit type
            let transitType: 'bus' | 'subway' | 'rail' | 'light_rail' | 'ferry' = 'bus'
            if (type === 'subway_station') transitType = 'subway'
            else if (type === 'train_station') transitType = 'rail'
            else if (type === 'transit_station') {
              // Check place types for more specific info
              if (place.types?.includes('subway_station')) transitType = 'subway'
              else if (place.types?.includes('train_station')) transitType = 'rail'
              else if (place.types?.includes('light_rail_station')) transitType = 'light_rail'
            }

            transitOptions.push({
              name: place.name,
              type: transitType,
              distance: calculateDistance(lat, lon, place.lat, place.lng),
              routes: [] // Google Places doesn't provide route info
            })
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch ${type} transit:`, error)
    }
  }

  // Sort by distance and limit
  return transitOptions
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
}

/**
 * Fetch all nearby amenities for a location
 */
export async function fetchNearbyAmenities(
  lat: number,
  lon: number
): Promise<{ amenities: CategorizedAmenities; transit: TransitOption[] }> {
  const cacheKey = getCacheKey(lat, lon)

  // Check cache first - but only use if it has actual data
  const cached = getFromCache<{ amenities: CategorizedAmenities; transit: TransitOption[] }>(cacheKey)
  if (cached) {
    // Validate cached data has actual amenities (not empty from failed previous attempts)
    const hasAmenities = Object.values(cached.amenities).some(arr => arr.length > 0)
    if (hasAmenities) {
      console.log('Google Places: cache hit')
      return cached
    } else {
      console.log('Google Places: cache has empty data, re-fetching...')
    }
  }

  // Check if API is configured
  if (!isGooglePlacesConfigured()) {
    console.log('Google Places API not configured')
    return {
      amenities: {
        dining: [], grocery: [], coffee: [], shopping: [],
        entertainment: [], fitness: [], parks: [], schools: [], other: []
      },
      transit: []
    }
  }

  console.log('Fetching real amenities from Google Places API...')

  // Fetch all categories in parallel for speed
  const [dining, grocery, coffee, shopping, entertainment, fitness, parks, schools, transit] = await Promise.all([
    fetchNearbyPlaces(lat, lon, CATEGORY_SEARCH_TYPES.dining, 5),
    fetchNearbyPlaces(lat, lon, CATEGORY_SEARCH_TYPES.grocery, 3),
    fetchNearbyPlaces(lat, lon, CATEGORY_SEARCH_TYPES.coffee, 4),
    fetchNearbyPlaces(lat, lon, CATEGORY_SEARCH_TYPES.shopping, 4),
    fetchNearbyPlaces(lat, lon, CATEGORY_SEARCH_TYPES.entertainment, 3),
    fetchNearbyPlaces(lat, lon, CATEGORY_SEARCH_TYPES.fitness, 3),
    fetchNearbyPlaces(lat, lon, CATEGORY_SEARCH_TYPES.parks, 3),
    fetchNearbyPlaces(lat, lon, CATEGORY_SEARCH_TYPES.schools, 3),
    fetchTransitOptions(lat, lon)
  ])

  const result = {
    amenities: {
      dining,
      grocery,
      coffee,
      shopping,
      entertainment,
      fitness,
      parks,
      schools,
      other: []
    },
    transit
  }

  // Only cache if we got actual data (don't cache empty results)
  const hasAmenities = Object.values(result.amenities).some(arr => arr.length > 0)
  if (hasAmenities) {
    saveToCache(cacheKey, result)
    console.log('Google Places: cached new data')
  } else {
    console.log('Google Places: no amenities found, not caching')
  }

  return result
}

/**
 * Clear the Google Places cache
 */
export function clearPlacesCache(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PLACES_CACHE_KEY)
  }
}
