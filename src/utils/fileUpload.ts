/**
 * Unified File Upload Utilities for HomeWiz Frontend
 *
 * This module provides comprehensive utilities for handling file uploads, validation,
 * FormData preparation, and integration with storage services.
 * 
 * Features:
 * - File validation (size, type, format)
 * - FormData preparation for backend submission
 * - Storage service integration (Supabase)
 * - Base64 conversion for previews
 * - Progress tracking and error handling
 */

import { MediaFile } from '@/types'
import { uploadBuildingImages, uploadBuildingVideo, uploadRoomImages } from '@/lib/supabase/storage'

/**
 * Converts MediaFile objects to FormData for backend submission
 * Prepares files and metadata for upload to the backend where they will be stored as blobs
 *
 * @param buildingData - Building form data object
 * @param mediaFiles - Array of MediaFile objects to upload
 * @returns FormData object ready for backend submission
 *
 * @example
 * const formData = createFormDataWithFiles(buildingData, mediaFiles)
 * await fetch('/api/buildings', { method: 'POST', body: formData })
 */
export function createFormDataWithFiles(
  buildingData: any,
  mediaFiles: MediaFile[]
): FormData {
  const formData = new FormData()

  // Add all building data as JSON
  const buildingJson = { ...buildingData }
  delete buildingJson.media_files // Remove media_files from JSON data
  
  formData.append('building_data', JSON.stringify(buildingJson))

  // Add each file with appropriate field names
  mediaFiles.forEach((mediaFile, index) => {
    if (mediaFile.category === 'building_image') {
      formData.append(`building_images`, mediaFile.file)
    } else if (mediaFile.category === 'building_video') {
      formData.append(`building_videos`, mediaFile.file)
    }
    
    // Add metadata for each file
    formData.append(`file_metadata_${index}`, JSON.stringify({
      id: mediaFile.id,
      name: mediaFile.name,
      type: mediaFile.type,
      size: mediaFile.size,
      category: mediaFile.category
    }))
  })

  return formData
}

/**
 * Validates file types and sizes for media uploads
 * Ensures files meet requirements for images and videos
 *
 * @param file - File object to validate
 * @returns Validation result with isValid flag and optional error message
 *
 * @example
 * const result = validateMediaFile(file)
 * if (!result.isValid) {
 *   console.error(result.error)
 * }
 */
export function validateMediaFile(file: File): { isValid: boolean; error?: string } {
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: 'File must be an image or video'
    }
  }

  // Check file size limits
  const maxImageSize = 10 * 1024 * 1024 // 10MB
  const maxVideoSize = 50 * 1024 * 1024 // 50MB
  const maxSize = isImage ? maxImageSize : maxVideoSize

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds limit. Max size: ${isImage ? '10MB' : '50MB'}`
    }
  }

  return { isValid: true }
}

/**
 * Convert file to base64 for preview or storage
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ===== ENHANCED UPLOAD FUNCTIONALITY (from imageUploadService.ts) =====

export interface UploadResult {
  success: boolean
  imageUrls: string[]
  videoUrl?: string
  error?: string
}

/**
 * Upload building media files to storage and return URLs
 * Consolidated from imageUploadService.ts for unified file handling
 * 
 * @param mediaFiles Array of MediaFile objects to upload
 * @returns Promise resolving to upload results with URLs
 */
export async function uploadBuildingMedia(mediaFiles: MediaFile[]): Promise<UploadResult> {
  try {
    console.log(`🚀 Starting upload of ${mediaFiles.length} media files...`)
    
    const imageFiles = mediaFiles.filter(file => file.type.startsWith('image/'))
    const videoFiles = mediaFiles.filter(file => file.type.startsWith('video/'))
    
    const uploadPromises: Promise<string | null>[] = []
    
    // Upload images using Supabase storage
    if (imageFiles.length > 0) {
      console.log(`📸 Uploading ${imageFiles.length} images...`)
      const imageUploadPromise = uploadBuildingImages(imageFiles.map(f => f.file))
      uploadPromises.push(imageUploadPromise.then(urls => urls?.join(',') || null))
    }
    
    // Upload videos (single video supported)
    if (videoFiles.length > 0) {
      console.log(`🎥 Uploading ${videoFiles.length} videos...`)
      const videoUploadPromise = uploadBuildingVideo(videoFiles[0].file)
      uploadPromises.push(videoUploadPromise)
    }
    
    const results = await Promise.all(uploadPromises)
    
    // Parse results
    let imageUrls: string[] = []
    let videoUrl: string | undefined
    
    if (imageFiles.length > 0 && results[0]) {
      imageUrls = results[0].split(',').filter(url => url.length > 0)
    }
    
    if (videoFiles.length > 0 && results[imageFiles.length > 0 ? 1 : 0]) {
      videoUrl = results[imageFiles.length > 0 ? 1 : 0] || undefined
    }
    
    console.log(`✅ Upload complete: ${imageUrls.length} images, ${videoUrl ? 1 : 0} videos`)
    
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
 * Upload room photos to storage and return URLs
 * 
 * @param roomPhotos Array of File objects representing room photos
 * @returns Promise resolving to array of upload URLs
 */
export async function uploadRoomMedia(roomPhotos: File[]): Promise<string[]> {
  try {
    console.log(`🏠 Uploading ${roomPhotos.length} room photos...`)
    const urls = await uploadRoomImages(roomPhotos)
    console.log(`✅ Room photos uploaded: ${urls?.length || 0} URLs`)
    return urls || []
  } catch (error) {
    console.error('❌ Room photo upload failed:', error)
    return []
  }
}

/**
 * Enhanced file validation with support for multiple categories
 * 
 * @param file File to validate
 * @param category Optional category for specific validation rules
 * @returns Validation result with detailed error information
 */
export function validateFile(
  file: File, 
  category?: 'image' | 'video' | 'document'
): { isValid: boolean; error?: string; warnings?: string[] } {
  const warnings: string[] = []
  
  // Determine category if not provided
  if (!category) {
    if (file.type.startsWith('image/')) category = 'image'
    else if (file.type.startsWith('video/')) category = 'video'
    else category = 'document'
  }
  
  // Category-specific validation
  switch (category) {
    case 'image':
      if (!file.type.startsWith('image/')) {
        return { isValid: false, error: 'File must be an image' }
      }
      
      const maxImageSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxImageSize) {
        return { isValid: false, error: 'Image size exceeds 10MB limit' }
      }
      
      // Warning for large images
      if (file.size > 5 * 1024 * 1024) {
        warnings.push('Large image file may take longer to upload')
      }
      break
      
    case 'video':
      if (!file.type.startsWith('video/')) {
        return { isValid: false, error: 'File must be a video' }
      }
      
      const maxVideoSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxVideoSize) {
        return { isValid: false, error: 'Video size exceeds 50MB limit' }
      }
      
      // Warning for large videos
      if (file.size > 25 * 1024 * 1024) {
        warnings.push('Large video file may take significantly longer to upload')
      }
      break
      
    case 'document':
      const allowedTypes = ['application/pdf', 'text/plain', 'application/msword']
      if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Document must be PDF, TXT, or DOC format' }
      }
      
      const maxDocSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxDocSize) {
        return { isValid: false, error: 'Document size exceeds 5MB limit' }
      }
      break
  }
  
  return { isValid: true, warnings: warnings.length > 0 ? warnings : undefined }
}

/**
 * Utility for batch file validation
 * 
 * @param files Array of files to validate
 * @param category Optional category for all files
 * @returns Object with validation results and summary
 */
export function validateFiles(
  files: File[], 
  category?: 'image' | 'video' | 'document'
): {
  isValid: boolean
  validFiles: File[]
  invalidFiles: { file: File; error: string }[]
  warnings: string[]
} {
  const validFiles: File[] = []
  const invalidFiles: { file: File; error: string }[] = []
  const allWarnings: string[] = []
  
  files.forEach(file => {
    const result = validateFile(file, category)
    if (result.isValid) {
      validFiles.push(file)
      if (result.warnings) {
        allWarnings.push(...result.warnings)
      }
    } else {
      invalidFiles.push({ file, error: result.error || 'Validation failed' })
    }
  })
  
  return {
    isValid: invalidFiles.length === 0,
    validFiles,
    invalidFiles,
    warnings: allWarnings
  }
}

/**
 * Example usage for backend submission:
 * 
 * const handleSubmit = async (buildingData: BuildingFormData) => {
 *   const formData = createFormDataWithFiles(buildingData, buildingData.media_files || [])
 *   
 *   const response = await fetch('/api/buildings', {
 *     method: 'POST',
 *     body: formData, // Don't set Content-Type header, let browser set it with boundary
 *   })
 *   
 *   if (response.ok) {
 *     const result = await response.json()
 *     console.log('Building created with media files:', result)
 *   }
 * }
 */
