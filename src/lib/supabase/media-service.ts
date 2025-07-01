/**
 * Building Media Service
 * Handles retrieval and management of categorized building images and videos
 * Uses URL path structure to determine categories - no database schema changes needed!
 */

import { supabaseClient } from './client'
import { 
  extractCategoryFromUrl, 
  groupImagesByCategory, 
  getImagesByCategory,
  getFeaturedImageUrl,
  isVideoUrl,
  MediaCategory 
} from './url-category-utils'

export interface SimplifiedBuildingMedia {
  outside: string[]
  common_areas: string[]
  amenities: string[]
  kitchen_bathrooms: string[]
  videos: string[]
  featured_image?: string
}

/**
 * Retrieve all categorized media for a building using URL-based categorization
 */
export async function getBuildingMedia(buildingId: string): Promise<SimplifiedBuildingMedia | null> {
  try {
    const { data: building, error } = await supabaseClient
      .getClient()
      .from('buildings')
      .select('*')
      .eq('building_id', buildingId)
      .single()

    if (error || !building) {
      console.error('Failed to fetch building media:', error)
      return null
    }

    // Work with the existing building_images array - use any type to handle schema flexibility
    const imageUrls = (building as any).building_images || []
    
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return {
        outside: [],
        common_areas: [],
        amenities: [],
        kitchen_bathrooms: [],
        videos: []
      }
    }

    // Group images by category using URL path analysis
    const grouped = groupImagesByCategory(imageUrls)
    
    return {
      outside: grouped.outside,
      common_areas: grouped.common_areas,
      amenities: grouped.amenities,
      kitchen_bathrooms: grouped.kitchen_bathrooms,
      videos: grouped.videos,
      featured_image: getFeaturedImageUrl(imageUrls) || undefined
    }
  } catch (error) {
    console.error('Error fetching building media:', error)
    return null
  }
}

/**
 * Get images for a specific category
 */
export async function getBuildingImagesByCategory(
  buildingId: string, 
  category: MediaCategory
): Promise<string[]> {
  const media = await getBuildingMedia(buildingId)
  if (!media) return []
  
  switch (category) {
    case 'outside': return media.outside
    case 'common_areas': return media.common_areas
    case 'amenities': return media.amenities
    case 'kitchen_bathrooms': return media.kitchen_bathrooms
    case 'videos': return media.videos
    default: return []
  }
}

/**
 * Get all videos for a building
 */
export async function getBuildingVideos(buildingId: string): Promise<string[]> {
  const media = await getBuildingMedia(buildingId)
  return media?.videos || []
}

/**
 * Get featured image for a building
 */
export async function getFeaturedImage(buildingId: string): Promise<string | null> {
  const media = await getBuildingMedia(buildingId)
  return media?.featured_image || null
}

/**
 * Delete an image from building
 */
export async function deleteImage(buildingId: string, imageUrl: string): Promise<boolean> {
  try {
    // Get current building images
    const { data: building, error: fetchError } = await supabaseClient
      .getClient()
      .from('buildings')
      .select('*')
      .eq('building_id', buildingId)
      .single()

    if (fetchError || !building) {
      console.error('Failed to fetch building for image deletion:', fetchError)
      return false
    }

    const currentImages = (building as any).building_images || []
    
    // Remove the image URL from the array
    const updatedImages = currentImages.filter((url: string) => url !== imageUrl)

    // Update the building record - use any type to handle schema flexibility
    const { error: updateError } = await supabaseClient
      .getClient()
      .from('buildings')
      .update({ building_images: updatedImages } as any)
      .eq('building_id', buildingId)

    if (updateError) {
      console.error('Failed to update building images:', updateError)
      return false
    }

    // Delete from storage (extract storage path from URL)
    try {
      const storagePath = imageUrl.split('/storage/v1/object/public/building-images/')[1]
      if (storagePath) {
        const { error: storageError } = await supabaseClient
          .getClient()
          .storage
          .from('building-images')
          .remove([storagePath])

        if (storageError) {
          console.error('Failed to delete from storage (but database updated):', storageError)
        }
      }
    } catch (storageError) {
      console.error('Failed to parse storage path for deletion:', storageError)
    }

    return true
  } catch (error) {
    console.error('Failed to delete image:', error)
    return false
  }
}