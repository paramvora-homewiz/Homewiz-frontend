/**
 * Image Metadata Management for Categorized Building Media
 */

export interface ImageMetadata {
  id: string
  building_id: string
  category: 'outside' | 'common_areas' | 'amenities' | 'kitchen_bathrooms'
  file_name: string
  storage_path: string
  public_url: string
  file_size: number
  mime_type: string
  width?: number
  height?: number
  upload_timestamp: string
  tags: string[]
  description?: string
  sort_order: number
}

export interface VideoMetadata {
  id: string
  building_id: string
  file_name: string
  storage_path: string
  public_url: string
  file_size: number
  duration?: number
  upload_timestamp: string
  tags: string[]
  description?: string
  sort_order: number
}

/**
 * Organized media structure for frontend consumption
 */
export interface CategorizedBuildingMedia {
  outside: ImageMetadata[]
  common_areas: ImageMetadata[]
  amenities: ImageMetadata[]
  kitchen_bathrooms: ImageMetadata[]
  videos: VideoMetadata[]
  featured_image?: ImageMetadata // First image or manually selected
}

/**
 * Storage path generator
 */
export function generateStoragePath(
  buildingId: string, 
  category: string, 
  fileName: string
): string {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `buildings/${buildingId}/${category}/${timestamp}_${sanitizedFileName}`
}

/**
 * Create image metadata object
 */
export function createImageMetadata(
  buildingId: string,
  category: 'outside' | 'common_areas' | 'amenities' | 'kitchen_bathrooms',
  file: File,
  storagePath: string,
  publicUrl: string,
  sortOrder: number = 0
): ImageMetadata {
  return {
    id: `img_${buildingId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    building_id: buildingId,
    category,
    file_name: file.name,
    storage_path: storagePath,
    public_url: publicUrl,
    file_size: file.size,
    mime_type: file.type,
    upload_timestamp: new Date().toISOString(),
    tags: [category, 'building_media'],
    sort_order: sortOrder
  }
}

/**
 * Create video metadata object
 */
export function createVideoMetadata(
  buildingId: string,
  file: File,
  storagePath: string,
  publicUrl: string,
  sortOrder: number = 0
): VideoMetadata {
  return {
    id: `vid_${buildingId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    building_id: buildingId,
    file_name: file.name,
    storage_path: storagePath,
    public_url: publicUrl,
    file_size: file.size,
    upload_timestamp: new Date().toISOString(),
    tags: ['video', 'building_media'],
    sort_order: sortOrder
  }
}

/**
 * Database storage format (for buildings table)
 */
export interface BuildingMediaColumns {
  // Legacy support
  building_images?: string[] // Array of URLs
  virtual_tour_url?: string
  
  // New structured approach
  media_metadata: {
    images: ImageMetadata[]
    videos: VideoMetadata[]
    featured_image_id?: string
    last_updated: string
  }
}