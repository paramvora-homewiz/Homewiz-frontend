/**
 * Image Upload Service for Building Photos
 * Handles uploading images to storage and returning URLs for backend submission
 */

import { uploadBuildingImages, uploadBuildingVideo } from '@/lib/supabase/storage'
import { MediaFile } from '@/types'

export interface UploadResult {
  success: boolean
  imageUrls: string[]
  videoUrl?: string
  error?: string
}

/**
 * Upload media files and return URLs for backend submission
 * This should be called before submitting building data to the API
 */
export async function uploadBuildingMedia(mediaFiles: MediaFile[]): Promise<UploadResult> {
  try {
    console.log(`🚀 Starting upload of ${mediaFiles.length} media files...`)
    
    const imageFiles = mediaFiles.filter(file => file.type.startsWith('image/'))
    const videoFiles = mediaFiles.filter(file => file.type.startsWith('video/'))
    
    const uploadPromises: Promise<string | null>[] = []
    
    // Upload images
    if (imageFiles.length > 0) {
      console.log(`📸 Uploading ${imageFiles.length} images...`)
      const imageUploadPromise = uploadBuildingImages(imageFiles.map(f => f.file))
      uploadPromises.push(imageUploadPromise.then(urls => urls.join(',')))
    }
    
    // Upload videos
    if (videoFiles.length > 0) {
      console.log(`🎥 Uploading ${videoFiles.length} videos...`)
      const videoUploadPromise = uploadBuildingVideo(videoFiles[0].file) // Assuming single video
      uploadPromises.push(videoUploadPromise)
    }
    
    const results = await Promise.all(uploadPromises)
    
    // Parse results
    let imageUrls: string[] = []
    let videoUrl: string | undefined
    
    if (imageFiles.length > 0 && results[0]) {
      imageUrls = results[0].split(',').filter(url => url.length > 0)
    }
    
    if (videoFiles.length > 0 && results.length > 1 && results[1]) {
      videoUrl = results[1]
    }
    
    console.log(`✅ Upload complete! Images: ${imageUrls.length}, Video: ${videoUrl ? 'Yes' : 'No'}`)
    
    return {
      success: true,
      imageUrls,
      videoUrl
    }
    
  } catch (error) {
    console.error('❌ Media upload failed:', error)
    
    return {
      success: false,
      imageUrls: [],
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Fallback for demo mode - generates placeholder URLs
 */
export function generatePlaceholderUrls(mediaFiles: MediaFile[]): UploadResult {
  const imageFiles = mediaFiles.filter(file => file.type.startsWith('image/'))
  const videoFiles = mediaFiles.filter(file => file.type.startsWith('video/'))
  
  return {
    success: true,
    imageUrls: imageFiles.map((_, index) => `https://placeholder.demo/building-image-${index + 1}.jpg`),
    videoUrl: videoFiles.length > 0 ? 'https://placeholder.demo/building-video.mp4' : undefined
  }
}