/**
 * File Upload Utilities for HomeWiz Frontend
 *
 * This module provides utilities for handling file uploads, validation,
 * and FormData preparation for backend submission.
 */

import { MediaFile } from '@/types'

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
