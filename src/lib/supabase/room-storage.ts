/**
 * Fresh Room Image Upload Implementation
 * Based on 2024 Supabase best practices and common issue solutions
 */

import { supabase, isSupabaseAvailable } from './client'

export interface RoomImageUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
  fileName?: string
}

/**
 * Sanitize filename to prevent upload issues
 */
function sanitizeFileName(fileName: string): string {
  // Remove special characters and spaces, keep only alphanumeric, dots, and hyphens
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

/**
 * Generate unique filename to prevent conflicts
 */
function generateUniqueFileName(originalFile: File): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = originalFile.name.split('.').pop()?.toLowerCase() || 'jpg'
  const sanitizedName = sanitizeFileName(originalFile.name.split('.')[0])
  
  return `${timestamp}_${randomString}_${sanitizedName}.${fileExtension}`
}

/**
 * Validate image file
 */
function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 10MB`
    }
  }

  return { isValid: true }
}

/**
 * Upload a single room image with proper error handling
 */
async function uploadSingleRoomImage(
  buildingId: string,
  roomId: string,
  file: File
): Promise<RoomImageUploadResult> {
  try {
    console.log(`🔄 Starting upload for file: ${file.name} (${file.type}, ${(file.size / 1024).toFixed(2)}KB)`)

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      console.error(`❌ File validation failed: ${validation.error}`)
      return {
        success: false,
        error: validation.error,
        fileName: file.name
      }
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file)
    
    // Create the complete file path - this is crucial for Supabase
    const filePath = `buildings/${buildingId}/rooms/${roomId}/images/${uniqueFileName}`
    
    console.log(`📁 Upload path: ${filePath}`)
    console.log(`📋 File details:`, {
      name: file.name,
      type: file.type,
      size: file.size,
      uniqueName: uniqueFileName
    })

    // Upload to Supabase Storage with explicit options
    const { data, error } = await supabase!.storage
      .from('building-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Prevent conflicts by using unique names
        contentType: file.type, // Explicitly set content type
      })

    if (error) {
      console.error(`❌ Supabase upload error:`, error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
        fileName: file.name
      }
    }

    console.log(`✅ Upload successful:`, data)

    // Get the public URL
    const { data: { publicUrl } } = supabase!.storage
      .from('building-images')
      .getPublicUrl(filePath)

    console.log(`🔗 Public URL generated: ${publicUrl}`)

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      fileName: file.name
    }

  } catch (error: any) {
    console.error(`❌ Unexpected error uploading ${file.name}:`, error)
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
      fileName: file.name
    }
  }
}

/**
 * Upload multiple room images with individual error handling
 */
export async function uploadRoomImages(
  buildingId: string,
  roomId: string,
  files: File[]
): Promise<RoomImageUploadResult[]> {
  console.log(`🚀 uploadRoomImages started:`, {
    buildingId,
    roomId,
    filesCount: files.length,
    fileNames: files.map(f => f.name)
  })

  // Check Supabase availability
  if (!isSupabaseAvailable()) {
    console.error('❌ Supabase is not available')
    return files.map(file => ({
      success: false,
      error: 'Supabase storage is not available. Please check configuration.',
      fileName: file.name
    }))
  }

  // Validate inputs
  if (!buildingId || !roomId) {
    console.error('❌ Missing required parameters:', { buildingId, roomId })
    return files.map(file => ({
      success: false,
      error: 'Missing building ID or room ID',
      fileName: file.name
    }))
  }

  if (!files || files.length === 0) {
    console.warn('⚠️ No files provided for upload')
    return []
  }

  // Upload files sequentially to avoid overwhelming the server
  const results: RoomImageUploadResult[] = []
  
  for (const file of files) {
    const result = await uploadSingleRoomImage(buildingId, roomId, file)
    results.push(result)
    
    // Small delay between uploads to prevent rate limiting
    if (files.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  console.log(`📊 Upload summary: ${successCount} successful, ${failureCount} failed`)
  
  if (failureCount > 0) {
    console.warn('⚠️ Failed uploads:', results.filter(r => !r.success))
  }

  return results
}

/**
 * Delete a room image from storage
 */
export async function deleteRoomImage(filePath: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAvailable()) {
    return {
      success: false,
      error: 'Supabase storage is not available'
    }
  }

  try {
    const { error } = await supabase!.storage
      .from('building-images')
      .remove([filePath])

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unknown error occurred during file deletion'
    }
  }
}