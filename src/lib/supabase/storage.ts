/**
 * Supabase Storage Utilities for HomeWiz
 * 
 * Handles file uploads, downloads, and management for building images and documents
 */

import { supabase, isSupabaseAvailable } from './client'
import { SupabaseError } from './client'

// Storage bucket names (must match what's created in Supabase dashboard)
export const STORAGE_BUCKETS = {
  BUILDING_IMAGES: 'building-images',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars'
} as const

// File upload configuration
export interface FileUploadOptions {
  bucket: keyof typeof STORAGE_BUCKETS
  path: string
  file: File
  metadata?: Record<string, any>
  upsert?: boolean
}

// File upload result
export interface FileUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
  data?: any
}

// Supported file types for different categories
export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
} as const

// Human-readable file type descriptions for user feedback
export const FILE_TYPE_DESCRIPTIONS = {
  IMAGES: 'JPEG, PNG, WebP, GIF, AVIF',
  VIDEOS: 'MP4, WebM, QuickTime, AVI',
  DOCUMENTS: 'PDF, Word documents'
} as const

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(options: FileUploadOptions): Promise<FileUploadResult> {
  if (!isSupabaseAvailable()) {
    return {
      success: false,
      error: 'Supabase storage is not available. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    }
  }

  try {
    const { bucket, path, file, metadata, upsert = false } = options
    const bucketName = STORAGE_BUCKETS[bucket]

    console.log(`📤 Starting upload to bucket: ${bucketName}, path: ${path}`)
    console.log(`📄 File details: ${file.name} (${file.type}, ${formatFileSize(file.size)})`)

    // Validate file type
    if (!isValidFileType(file, bucket)) {
      console.error(`❌ Invalid file type: ${file.type} for bucket ${bucket}`)
      return {
        success: false,
        error: `File type ${file.type} is not supported for ${bucket}`
      }
    }

    // Check file size (max 10MB for images, 500MB for videos, 5MB for documents)
    const maxSize = getMaxFileSize(bucket, file.type)
    if (file.size > maxSize) {
      console.error(`❌ File too large: ${formatFileSize(file.size)} > ${formatFileSize(maxSize)}`)
      return {
        success: false,
        error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
      }
    }

    console.log(`✅ File validation passed, uploading to Supabase...`)

    // Upload file
    const { data, error } = await supabase!.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert,
        metadata
      })

    if (error) {
      console.error('❌ Supabase storage upload error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    console.log(`✅ File uploaded successfully:`, data)

    // Get public URL
    const { data: { publicUrl } } = supabase!.storage
      .from(bucketName)
      .getPublicUrl(path)

    console.log(`🔗 Public URL generated: ${publicUrl}`)

    return {
      success: true,
      url: publicUrl,
      path: data.path,
      data
    }

  } catch (error: any) {
    console.error('File upload error:', error)
    return {
      success: false,
      error: error.message || 'An unknown error occurred during file upload'
    }
  }
}

/**
 * Upload multiple files (for building image galleries)
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: keyof typeof STORAGE_BUCKETS,
  basePath: string
): Promise<FileUploadResult[]> {
  const uploadPromises = files.map((file, index) => {
    const fileName = `${Date.now()}_${index}_${sanitizeFileName(file.name)}`
    const path = `${basePath}/${fileName}`
    
    return uploadFile({
      bucket,
      path,
      file,
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        index
      }
    })
  })

  return Promise.all(uploadPromises)
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAvailable()) {
    return {
      success: false,
      error: 'Supabase storage is not available'
    }
  }

  try {
    const bucketName = STORAGE_BUCKETS[bucket]
    const { error } = await supabase!.storage
      .from(bucketName)
      .remove([path])

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

/**
 * Get a signed URL for private files
 */
export async function getSignedUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string,
  expiresIn: number = 3600
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseAvailable()) {
    return {
      error: 'Supabase storage is not available'
    }
  }

  try {
    const bucketName = STORAGE_BUCKETS[bucket]
    const { data, error } = await supabase!.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return { error: error.message }
    }

    return { url: data.signedUrl }

  } catch (error: any) {
    return {
      error: error.message || 'An unknown error occurred while creating signed URL'
    }
  }
}

/**
 * List files in a directory
 */
export async function listFiles(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string = ''
): Promise<{ files?: any[]; error?: string }> {
  if (!isSupabaseAvailable()) {
    return {
      error: 'Supabase storage is not available'
    }
  }

  try {
    const bucketName = STORAGE_BUCKETS[bucket]
    const { data, error } = await supabase!.storage
      .from(bucketName)
      .list(path)

    if (error) {
      return { error: error.message }
    }

    return { files: data }

  } catch (error: any) {
    return {
      error: error.message || 'An unknown error occurred while listing files'
    }
  }
}

/**
 * Helper Functions
 */

function isValidFileType(file: File, bucket: keyof typeof STORAGE_BUCKETS): boolean {
  switch (bucket) {
    case 'BUILDING_IMAGES':
      return [...SUPPORTED_FILE_TYPES.IMAGES, ...SUPPORTED_FILE_TYPES.VIDEOS].includes(file.type)
    case 'DOCUMENTS':
      return SUPPORTED_FILE_TYPES.DOCUMENTS.includes(file.type)
    case 'AVATARS':
      return SUPPORTED_FILE_TYPES.IMAGES.includes(file.type)
    default:
      return false
  }
}

/**
 * Validate file type and return detailed error information
 */
export function validateFileType(file: File, bucket: keyof typeof STORAGE_BUCKETS): {
  isValid: boolean
  error?: string
  supportedTypes?: string
} {
  const isValidType = isValidFileType(file, bucket)

  if (!isValidType) {
    let supportedTypes: string
    switch (bucket) {
      case 'BUILDING_IMAGES':
        supportedTypes = `${FILE_TYPE_DESCRIPTIONS.IMAGES}, ${FILE_TYPE_DESCRIPTIONS.VIDEOS}`
        break
      case 'DOCUMENTS':
        supportedTypes = FILE_TYPE_DESCRIPTIONS.DOCUMENTS
        break
      case 'AVATARS':
        supportedTypes = FILE_TYPE_DESCRIPTIONS.IMAGES
      break
    default:
      supportedTypes = 'Unknown'
  }

    return {
      isValid: false,
      error: `File type "${file.type}" is not supported. Supported formats: ${supportedTypes}`,
      supportedTypes
    }
  }

  // Check file size if type is valid
  const maxSize = getMaxFileSize(bucket, file.type)
  if (file.size > maxSize) {
    const maxSizeFormatted = formatFileSize(maxSize)
    const fileSizeFormatted = formatFileSize(file.size)
    return {
      isValid: false,
      error: `File size (${fileSizeFormatted}) exceeds maximum allowed size (${maxSizeFormatted})`
    }
  }

  return { isValid: true }
}

function getMaxFileSize(bucket: keyof typeof STORAGE_BUCKETS, fileType?: string): number {
  switch (bucket) {
    case 'BUILDING_IMAGES':
      // Different limits for images vs videos
      if (fileType && fileType.startsWith('video/')) {
        return 500 * 1024 * 1024 // 500MB for videos
      }
      return 10 * 1024 * 1024 // 10MB for images
    case 'DOCUMENTS':
      return 5 * 1024 * 1024 // 5MB for documents
    case 'AVATARS':
      return 2 * 1024 * 1024 // 2MB for avatars
    default:
      return 5 * 1024 * 1024 // 5MB default
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function sanitizeFileName(fileName: string): string {
  // Remove special characters and spaces, keep only alphanumeric, dots, and hyphens
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

/**
 * Validate multiple files before upload
 */
export function validateMultipleFiles(
  files: File[],
  bucket: keyof typeof STORAGE_BUCKETS
): {
  isValid: boolean
  errors: Array<{ file: File; error: string }>
  validFiles: File[]
  invalidFiles: Array<{ file: File; error: string }>
} {
  const errors: Array<{ file: File; error: string }> = []
  const validFiles: File[] = []
  const invalidFiles: Array<{ file: File; error: string }> = []

  files.forEach(file => {
    const validation = validateFileType(file, bucket)
    if (validation.isValid) {
      validFiles.push(file)
    } else {
      const error = { file, error: validation.error || 'Invalid file type' }
      errors.push(error)
      invalidFiles.push(error)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    validFiles,
    invalidFiles
  }
}

/**
 * Building-specific upload utilities
 */

export async function uploadBuildingImages(
  buildingId: string,
  files: File[]
): Promise<FileUploadResult[]> {
  // Validate files before upload
  const validation = validateMultipleFiles(files, 'BUILDING_IMAGES')

  if (!validation.isValid) {
    // Return error results for invalid files
    const results: FileUploadResult[] = []

    // Add error results for invalid files
    validation.invalidFiles.forEach(({ file, error }) => {
      results.push({
        success: false,
        error: error
      })
    })

    // Upload valid files if any
    if (validation.validFiles.length > 0) {
      const validResults = await uploadMultipleFiles(validation.validFiles, 'BUILDING_IMAGES', `buildings/${buildingId}`)
      results.push(...validResults)
    }

    return results
  }

  return uploadMultipleFiles(files, 'BUILDING_IMAGES', `buildings/${buildingId}`)
}

export async function uploadBuildingVideo(
  buildingId: string,
  file: File
): Promise<FileUploadResult> {
  const fileName = `${Date.now()}_${sanitizeFileName(file.name)}`
  const path = `buildings/${buildingId}/videos/${fileName}`

  return uploadFile({
    bucket: 'BUILDING_IMAGES', // Videos go in the same bucket as images
    path,
    file,
    metadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      type: 'video'
    }
  })
}

/**
 * Room-specific upload utilities
 */

export async function uploadRoomImages(
  buildingId: string,
  roomId: string,
  files: File[]
): Promise<FileUploadResult[]> {
  // Validate files before upload
  const validation = validateMultipleFiles(files, 'BUILDING_IMAGES')

  if (!validation.isValid) {
    // Return error results for invalid files
    const results: FileUploadResult[] = []

    // Add error results for invalid files
    validation.invalidFiles.forEach(({ file, error }) => {
      results.push({
        success: false,
        error: error
      })
    })

    // Upload valid files if any
    if (validation.validFiles.length > 0) {
      const validResults = await uploadMultipleFiles(validation.validFiles, 'BUILDING_IMAGES', `buildings/${buildingId}/rooms/${roomId}/images`)
      results.push(...validResults)
    }

    return results
  }

  return uploadMultipleFiles(files, 'BUILDING_IMAGES', `buildings/${buildingId}/rooms/${roomId}/images`)
}

export async function uploadRoomVideo(
  buildingId: string,
  roomId: string,
  file: File
): Promise<FileUploadResult> {
  const fileName = `${Date.now()}_${sanitizeFileName(file.name)}`
  const path = `buildings/${buildingId}/rooms/${roomId}/videos/${fileName}`

  return uploadFile({
    bucket: 'BUILDING_IMAGES', // Videos go in the same bucket as images
    path,
    file,
    metadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      type: 'video',
      buildingId,
      roomId
    }
  })
}

export async function uploadTenantDocument(
  tenantId: string,
  file: File,
  documentType: string
): Promise<FileUploadResult> {
  const fileName = `${documentType}_${Date.now()}_${sanitizeFileName(file.name)}`
  const path = `tenants/${tenantId}/documents/${fileName}`
  
  return uploadFile({
    bucket: 'DOCUMENTS',
    path,
    file,
    metadata: {
      originalName: file.name,
      documentType,
      uploadedAt: new Date().toISOString(),
      tenantId
    }
  })
}

/**
 * Export isSupabaseAvailable for use in components
 */
export { isSupabaseAvailable } from './client'

/**
 * Create file upload FormData with proper file handling
 */
export function createFormDataWithFiles(data: any, files: File[], fieldName: string = 'files'): FormData {
  const formData = new FormData()
  
  // Add regular form fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value))
    }
  })
  
  // Add files
  files.forEach((file, index) => {
    formData.append(`${fieldName}[${index}]`, file)
  })
  
  return formData
}