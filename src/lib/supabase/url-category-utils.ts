/**
 * URL-Based Category Utilities
 * Extract category information from image/video file paths
 */

export type MediaCategory = 'outside' | 'common_areas' | 'amenities' | 'kitchen_bathrooms' | 'videos' | 'unknown'

/**
 * Extract category from Supabase storage URL
 * 
 * Example URLs:
 * - https://...supabase.co/storage/v1/object/public/building-images/buildings/BLD_123/outside/image.jpg
 * - https://...supabase.co/storage/v1/object/public/building-images/buildings/BLD_123/amenities/gym.jpg
 */
export function extractCategoryFromUrl(url: string): MediaCategory {
  try {
    // Handle both public URLs and storage paths
    const pathPart = url.includes('/storage/v1/object/public/building-images/') 
      ? url.split('/storage/v1/object/public/building-images/')[1]
      : url

    // Expected format: buildings/{building_id}/{category}/filename
    const pathSegments = pathPart.split('/')
    
    if (pathSegments.length >= 3 && pathSegments[0] === 'buildings') {
      const category = pathSegments[2] // The category folder name
      
      // Validate category
      const validCategories: MediaCategory[] = ['outside', 'common_areas', 'amenities', 'kitchen_bathrooms', 'videos']
      if (validCategories.includes(category as MediaCategory)) {
        return category as MediaCategory
      }
    }
    
    return 'unknown'
  } catch (error) {
    console.warn('Failed to extract category from URL:', url, error)
    return 'unknown'
  }
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: MediaCategory): string {
  switch (category) {
    case 'outside': return 'Exterior'
    case 'common_areas': return 'Common Areas'
    case 'amenities': return 'Amenities'
    case 'kitchen_bathrooms': return 'Kitchen & Bathrooms'
    case 'videos': return 'Videos'
    default: return 'Other'
  }
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: MediaCategory): string {
  switch (category) {
    case 'outside': return '🏢'
    case 'common_areas': return '👥'
    case 'amenities': return '🏋️'
    case 'kitchen_bathrooms': return '🏠'
    case 'videos': return '🎥'
    default: return '📷'
  }
}

/**
 * Group image URLs by category
 */
export function groupImagesByCategory(imageUrls: string[]): Record<MediaCategory, string[]> {
  const grouped: Record<MediaCategory, string[]> = {
    outside: [],
    common_areas: [],
    amenities: [],
    kitchen_bathrooms: [],
    videos: [],
    unknown: []
  }

  imageUrls.forEach(url => {
    const category = extractCategoryFromUrl(url)
    grouped[category].push(url)
  })

  return grouped
}

/**
 * Get images for a specific category
 */
export function getImagesByCategory(imageUrls: string[], category: MediaCategory): string[] {
  return imageUrls.filter(url => extractCategoryFromUrl(url) === category)
}

/**
 * Check if URL is a video
 */
export function isVideoUrl(url: string): boolean {
  const category = extractCategoryFromUrl(url)
  if (category === 'videos') return true
  
  // Fallback: check file extension
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv']
  return videoExtensions.some(ext => url.toLowerCase().includes(ext))
}

/**
 * Get featured image (first outside image, or first image if no outside images)
 */
export function getFeaturedImageUrl(imageUrls: string[]): string | null {
  if (imageUrls.length === 0) return null
  
  // Try to find an outside image first
  const outsideImages = getImagesByCategory(imageUrls, 'outside')
  if (outsideImages.length > 0) {
    return outsideImages[0]
  }
  
  // Fallback to first non-video image
  const nonVideoImages = imageUrls.filter(url => !isVideoUrl(url))
  return nonVideoImages.length > 0 ? nonVideoImages[0] : imageUrls[0]
}

/**
 * Get category summary for display
 */
export function getCategorySummary(imageUrls: string[]): {
  total: number
  byCategory: Record<MediaCategory, number>
  hasVideos: boolean
} {
  const grouped = groupImagesByCategory(imageUrls)
  
  return {
    total: imageUrls.length,
    byCategory: Object.entries(grouped).reduce((acc, [category, urls]) => {
      acc[category as MediaCategory] = urls.length
      return acc
    }, {} as Record<MediaCategory, number>),
    hasVideos: grouped.videos.length > 0
  }
}