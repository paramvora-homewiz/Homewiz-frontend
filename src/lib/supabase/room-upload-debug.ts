/**
 * Comprehensive Room Image Upload Debugging Tool
 * This will help us identify exactly where the upload process fails
 */

import { supabase, isSupabaseAvailable } from './client'

export interface DebugInfo {
  step: string
  success: boolean
  data?: any
  error?: string
  timestamp: string
}

export interface RoomUploadDebugResult {
  success: boolean
  url?: string
  debugLogs: DebugInfo[]
  error?: string
}

/**
 * Debug a single file upload with extensive logging
 */
export async function debugRoomImageUpload(
  buildingId: string,
  roomId: string,
  file: File
): Promise<RoomUploadDebugResult> {
  const debugLogs: DebugInfo[] = []
  
  const addLog = (step: string, success: boolean, data?: any, error?: string) => {
    debugLogs.push({
      step,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    })
    console.log(`🐛 [${step}] ${success ? '✅' : '❌'}`, { data, error })
  }

  try {
    // Step 1: Validate inputs
    addLog('Input Validation', true, {
      buildingId,
      roomId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileConstructor: file.constructor.name,
      isFile: file instanceof File,
      hasName: !!file.name,
      hasType: !!file.type
    })

    // Step 2: Check Supabase availability
    const supabaseAvailable = isSupabaseAvailable()
    addLog('Supabase Availability', supabaseAvailable, { supabaseAvailable })
    
    if (!supabaseAvailable) {
      return {
        success: false,
        error: 'Supabase not available',
        debugLogs
      }
    }

    // Step 3: Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const isValidType = allowedTypes.includes(file.type)
    const isValidSize = file.size > 0 && file.size <= 10 * 1024 * 1024
    
    addLog('File Validation', isValidType && isValidSize, {
      isValidType,
      isValidSize,
      allowedTypes,
      actualType: file.type,
      actualSize: file.size
    })

    if (!isValidType || !isValidSize) {
      return {
        success: false,
        error: `Invalid file: type=${file.type}, size=${file.size}`,
        debugLogs
      }
    }

    // Step 4: Generate file path
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${timestamp}_${randomString}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `buildings/${buildingId}/rooms/${roomId}/images/${fileName}`
    
    addLog('Path Generation', true, {
      fileName,
      filePath,
      pathLength: filePath.length
    })

    // Step 5: Check bucket existence (attempt to list files)
    try {
      const { data: bucketData, error: bucketError } = await supabase!.storage
        .from('building-images')
        .list('', { limit: 1 })
      
      addLog('Bucket Access Test', !bucketError, { bucketData }, bucketError?.message)
      
      if (bucketError) {
        return {
          success: false,
          error: `Bucket access failed: ${bucketError.message}`,
          debugLogs
        }
      }
    } catch (bucketTestError: any) {
      addLog('Bucket Access Test', false, null, bucketTestError.message)
      return {
        success: false,
        error: `Bucket test failed: ${bucketTestError.message}`,
        debugLogs
      }
    }

    // Step 6: Create a test file to ensure File object is valid
    let testFile: File
    try {
      // Create a new File object from the original to ensure it's properly formatted
      const fileBuffer = await file.arrayBuffer()
      testFile = new File([fileBuffer], fileName, { type: file.type })
      
      addLog('File Object Recreation', true, {
        originalSize: file.size,
        newSize: testFile.size,
        sizesMatch: file.size === testFile.size,
        originalType: file.type,
        newType: testFile.type,
        typesMatch: file.type === testFile.type
      })
    } catch (fileError: any) {
      addLog('File Object Recreation', false, null, fileError.message)
      testFile = file // Fallback to original
    }

    // Step 7: Attempt upload with detailed error catching
    let uploadData, uploadError
    try {
      const uploadOptions = {
        cacheControl: '3600',
        upsert: false,
        contentType: testFile.type
      }
      
      addLog('Upload Attempt Starting', true, {
        bucket: 'building-images',
        path: filePath,
        fileName: testFile.name,
        fileType: testFile.type,
        fileSize: testFile.size,
        options: uploadOptions
      })

      const uploadResult = await supabase!.storage
        .from('building-images')
        .upload(filePath, testFile, uploadOptions)
      
      uploadData = uploadResult.data
      uploadError = uploadResult.error

      addLog('Upload Attempt Complete', !uploadError, uploadData, uploadError?.message)

    } catch (uploadException: any) {
      addLog('Upload Exception', false, null, uploadException.message)
      return {
        success: false,
        error: `Upload exception: ${uploadException.message}`,
        debugLogs
      }
    }

    if (uploadError) {
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
        debugLogs
      }
    }

    // Step 8: Generate public URL
    let publicUrl
    try {
      const { data: urlData } = supabase!.storage
        .from('building-images')
        .getPublicUrl(filePath)
      
      publicUrl = urlData.publicUrl
      
      addLog('Public URL Generation', true, {
        publicUrl,
        urlLength: publicUrl.length
      })
    } catch (urlError: any) {
      addLog('Public URL Generation', false, null, urlError.message)
      return {
        success: false,
        error: `URL generation failed: ${urlError.message}`,
        debugLogs
      }
    }

    // Step 9: Verify upload by attempting to get file info
    try {
      const { data: fileInfo, error: infoError } = await supabase!.storage
        .from('building-images')
        .list(`buildings/${buildingId}/rooms/${roomId}/images`, {
          search: fileName
        })
      
      addLog('Upload Verification', !infoError && fileInfo && fileInfo.length > 0, {
        fileInfo,
        found: fileInfo && fileInfo.length > 0
      }, infoError?.message)
    } catch (verifyError: any) {
      addLog('Upload Verification', false, null, verifyError.message)
    }

    return {
      success: true,
      url: publicUrl,
      debugLogs
    }

  } catch (error: any) {
    addLog('Critical Error', false, null, error.message)
    return {
      success: false,
      error: `Critical error: ${error.message}`,
      debugLogs
    }
  }
}

/**
 * Export debug logs to console in a readable format
 */
export function printDebugLogs(logs: DebugInfo[]) {
  console.log('\n🐛 ===== ROOM IMAGE UPLOAD DEBUG REPORT =====')
  logs.forEach((log, index) => {
    console.log(`${index + 1}. [${log.timestamp}] ${log.step}: ${log.success ? '✅' : '❌'}`)
    if (log.data) console.log('   Data:', log.data)
    if (log.error) console.log('   Error:', log.error)
  })
  console.log('🐛 ===== END DEBUG REPORT =====\n')
}