/**
 * Google Places API Integration (Client-side)
 *
 * Uses Google Maps JavaScript SDK to avoid CORS issues.
 * The SDK is loaded dynamically when needed.
 *
 * Requires NEXT_PUBLIC_GOOGLE_PLACES_API_KEY environment variable
 * with HTTP referer restrictions for localhost:3000.
 */

// ============================================
// TYPES
// ============================================

export interface AddressSuggestion {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

export interface AddressComponents {
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
  formattedAddress: string
  lat: number
  lng: number
}

export interface NeighborhoodInfo {
  neighborhood: string
  sublocality: string
  locality: string
  administrativeArea: string
  postalCode: string
  nearbyAreas: string[]
}

// ============================================
// SDK STATE
// ============================================

let sdkLoaded = false
let sdkLoading = false
let loadPromise: Promise<void> | null = null
let autocompleteService: google.maps.places.AutocompleteService | null = null
let placesService: google.maps.places.PlacesService | null = null

// ============================================
// CACHE
// ============================================

const autocompleteCache = new Map<string, { data: AddressSuggestion[]; timestamp: number }>()
const detailsCache = new Map<string, { data: AddressComponents; timestamp: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// ============================================
// API KEY
// ============================================

function getApiKey(): string | null {
  return process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || null
}

export function isGoogleApiConfigured(): boolean {
  return !!getApiKey()
}

// ============================================
// SDK LOADER
// ============================================

async function loadGoogleMapsSDK(): Promise<void> {
  if (sdkLoaded) return
  if (loadPromise) return loadPromise

  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('Google API key not configured')
  }

  sdkLoading = true

  loadPromise = new Promise((resolve, reject) => {
    // Check if already loaded by another script
    if (typeof google !== 'undefined' && google.maps?.places) {
      sdkLoaded = true
      sdkLoading = false
      initializeServices()
      resolve()
      return
    }

    // Create unique callback name
    const callbackName = `initGoogleMaps_${Date.now()}`

    ;(window as any)[callbackName] = () => {
      sdkLoaded = true
      sdkLoading = false
      initializeServices()
      delete (window as any)[callbackName]
      resolve()
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps?.places) {
          clearInterval(checkLoaded)
          sdkLoaded = true
          sdkLoading = false
          initializeServices()
          delete (window as any)[callbackName]
          resolve()
        }
      }, 100)

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded)
        if (!sdkLoaded) {
          reject(new Error('Timeout loading Google Maps SDK'))
        }
      }, 10000)
      return
    }

    // Load the script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = () => {
      sdkLoading = false
      delete (window as any)[callbackName]
      reject(new Error('Failed to load Google Maps SDK'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}

function initializeServices(): void {
  if (typeof google === 'undefined' || !google.maps?.places) return

  autocompleteService = new google.maps.places.AutocompleteService()

  // PlacesService requires a DOM element
  const dummyDiv = document.createElement('div')
  placesService = new google.maps.places.PlacesService(dummyDiv)
}

async function ensureSDKLoaded(): Promise<boolean> {
  if (typeof window === 'undefined') return false // SSR check

  try {
    await loadGoogleMapsSDK()
    return true
  } catch (error) {
    console.error('[Google Places] Failed to load SDK:', error)
    return false
  }
}

// ============================================
// AUTOCOMPLETE
// ============================================

export async function searchAddresses(
  query: string,
  options?: {
    types?: string[]
    componentRestrictions?: { country: string }
  }
): Promise<AddressSuggestion[]> {
  if (!query || query.trim().length < 3) {
    return []
  }

  const normalizedQuery = query.trim()
  const cacheKey = `${normalizedQuery}:${options?.componentRestrictions?.country || 'us'}`

  // Check cache
  const cached = autocompleteCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  // Ensure SDK is loaded
  const loaded = await ensureSDKLoaded()
  if (!loaded || !autocompleteService) {
    console.error('[Google Places] SDK not available')
    return []
  }

  return new Promise((resolve) => {
    const request: google.maps.places.AutocompletionRequest = {
      input: normalizedQuery,
      types: options?.types || ['address'],
      componentRestrictions: options?.componentRestrictions || { country: 'us' }
    }

    autocompleteService!.getPlacePredictions(request, (predictions, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
        if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.warn('[Google Places] Autocomplete status:', status)
        }
        resolve([])
        return
      }

      const suggestions: AddressSuggestion[] = predictions.map((p) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text || '',
        secondaryText: p.structured_formatting?.secondary_text || ''
      }))

      // Cache results
      autocompleteCache.set(cacheKey, { data: suggestions, timestamp: Date.now() })

      resolve(suggestions)
    })
  })
}

// ============================================
// PLACE DETAILS
// ============================================

export async function getPlaceDetails(placeId: string): Promise<AddressComponents | null> {
  if (!placeId) return null

  // Check cache
  const cached = detailsCache.get(placeId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  // Ensure SDK is loaded
  const loaded = await ensureSDKLoaded()
  if (!loaded || !placesService) {
    console.error('[Google Places] SDK not available')
    return null
  }

  return new Promise((resolve) => {
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: ['address_components', 'formatted_address', 'geometry']
    }

    placesService!.getDetails(request, (place, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
        console.error('[Google Places] Details status:', status)
        resolve(null)
        return
      }

      const result = parseAddressComponents(place)

      // Cache results
      detailsCache.set(placeId, { data: result, timestamp: Date.now() })

      resolve(result)
    })
  })
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function parseAddressComponents(place: google.maps.places.PlaceResult): AddressComponents {
  const components = place.address_components || []

  const result: AddressComponents = {
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
    formattedAddress: place.formatted_address || '',
    lat: place.geometry?.location?.lat() || 0,
    lng: place.geometry?.location?.lng() || 0
  }

  for (const component of components) {
    const types = component.types || []

    if (types.includes('street_number')) {
      result.streetNumber = component.long_name
    }
    if (types.includes('route')) {
      result.streetName = component.long_name
    }
    if (types.includes('locality')) {
      result.city = component.long_name
    }
    if (types.includes('administrative_area_level_1')) {
      result.state = component.long_name
      result.stateCode = component.short_name
    }
    if (types.includes('postal_code')) {
      result.zipCode = component.long_name
    }
    if (types.includes('country')) {
      result.country = component.long_name
      result.countryCode = component.short_name
    }
    if (types.includes('neighborhood')) {
      result.neighborhood = component.long_name
    }
    if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
      result.sublocality = component.long_name
    }
  }

  // Combine street number and name
  result.fullStreetAddress = [result.streetNumber, result.streetName]
    .filter(Boolean)
    .join(' ')

  return result
}

// ============================================
// NEIGHBORHOOD INFO
// ============================================

export async function getNeighborhoodInfo(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<NeighborhoodInfo | null> {
  const fullAddress = `${address}, ${city}, ${state} ${zip}`

  // Search for the address first
  const suggestions = await searchAddresses(fullAddress)
  if (suggestions.length === 0) return null

  // Get details
  const details = await getPlaceDetails(suggestions[0].placeId)
  if (!details) return null

  return {
    neighborhood: details.neighborhood || details.sublocality || '',
    sublocality: details.sublocality || '',
    locality: details.city || '',
    administrativeArea: details.state || '',
    postalCode: details.zipCode || '',
    nearbyAreas: []
  }
}

// ============================================
// CACHE MANAGEMENT
// ============================================

export function clearGeocodingCaches(): void {
  autocompleteCache.clear()
  detailsCache.clear()
}
