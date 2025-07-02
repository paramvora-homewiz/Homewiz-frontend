import React, { useState, useCallback } from 'react'
import { Upload, X, Image, Video, FileText, Eye, Trash2, Cloud, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MediaFile } from '@/types'
import {
  uploadBuildingImages,
  uploadBuildingVideo,
  isSupabaseAvailable,
  validateMultipleFiles,
  FILE_TYPE_DESCRIPTIONS
} from '@/lib/supabase/storage'
import { getSupabaseStatus } from '@/lib/supabase/client'

interface MediaUploadSectionProps {
  virtualTourUrl?: string
  uploadedFiles: MediaFile[]
  onVirtualTourUrlChange: (url: string) => void
  onFilesChange: (files: MediaFile[]) => void
  buildingId?: string // Required for Supabase uploads
  uploadImmediately?: boolean // Whether to upload to Supabase immediately or wait for form submission
  onValidationErrors?: (errors: Array<{ file: File; error: string }>) => void // Callback for validation errors
}

export function MediaUploadSection({
  virtualTourUrl = '',
  uploadedFiles,
  onVirtualTourUrlChange,
  onFilesChange,
  buildingId,
  uploadImmediately = false,
  onValidationErrors
}: MediaUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [fileValidationErrors, setFileValidationErrors] = useState<Array<{ file: File; error: string }>>([])
  const supabaseAvailable = isSupabaseAvailable()
  const supabaseStatus = getSupabaseStatus()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/')
  }

  const isVideoFile = (file: File): boolean => {
    return file.type.startsWith('video/')
  }

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    
    // Always clear previous errors when new files are selected
    setUploadErrors([])
    setFileValidationErrors([])
    
    if (!files || files.length === 0) {
      // User cancelled file selection, errors already cleared above
      return
    }

    setIsUploading(true)

    try {
      const fileArray = Array.from(files)

      // Validate all files first using the comprehensive validation
      const validation = validateMultipleFiles(fileArray, 'BUILDING_IMAGES')

      // Set validation errors for immediate user feedback
      setFileValidationErrors(validation.invalidFiles)

      // Notify parent component about validation errors
      if (onValidationErrors) {
        onValidationErrors(validation.invalidFiles)
      }

      // If there are validation errors, show them and don't proceed
      if (!validation.isValid) {
        const errorMessages = validation.invalidFiles.map(({ file, error }) =>
          `${file.name}: ${error}`
        )
        setUploadErrors(errorMessages)
        setIsUploading(false)
        
        // Reset the file input to allow immediate retry
        event.target.value = ''
        return
      }

      const newFiles: MediaFile[] = []
      const errors: string[] = []

      for (const file of validation.validFiles) {

        const preview = await createFilePreview(file)
        const category = isImageFile(file) ? 'building_image' : 'building_video'

        let supabaseUrl: string | undefined

        // Upload to Supabase if configured and enabled
        if (uploadImmediately && supabaseAvailable && buildingId) {
          try {
            console.log(`🔄 Uploading ${file.name} to Supabase...`)
            console.log(`📋 Supabase available: ${supabaseAvailable}, Building ID: ${buildingId}`)

            let uploadResult: any

            if (isImageFile(file)) {
              const results = await uploadBuildingImages(buildingId, [file])
              console.log(`📸 Upload results for ${file.name}:`, results)

              if (results && results.length > 0) {
                uploadResult = results[0]
              } else {
                throw new Error('No upload result returned from uploadBuildingImages')
              }
            } else {
              uploadResult = await uploadBuildingVideo(buildingId, file)
              console.log(`🎥 Upload result for ${file.name}:`, uploadResult)
            }

            if (uploadResult && uploadResult.success && uploadResult.url) {
              supabaseUrl = uploadResult.url
              console.log(`✅ Successfully uploaded ${file.name} to Supabase: ${supabaseUrl}`)
            } else {
              const errorMsg = uploadResult?.error || 'Unknown upload error'
              errors.push(`Failed to upload ${file.name} to Supabase: ${errorMsg}`)
              console.error(`❌ Supabase upload failed for ${file.name}:`, errorMsg)
              console.error(`❌ Full upload result:`, uploadResult)
              // Continue with local file handling even if Supabase upload fails
            }
          } catch (error: any) {
            errors.push(`Upload error for ${file.name}: ${error.message}`)
            console.error(`❌ Supabase upload error for ${file.name}:`, error)
            // Continue with local file handling even if Supabase upload fails
          }
        } else {
          console.log(`⚠️ Skipping Supabase upload for ${file.name}:`, {
            uploadImmediately,
            supabaseAvailable,
            buildingId
          })
        }

        const mediaFile: MediaFile = {
          id: Date.now() + Math.random().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          file,
          preview: supabaseUrl || preview, // Use Supabase URL if available, otherwise local preview
          category,
          url: supabaseUrl // Store the Supabase URL if uploaded
        }

        newFiles.push(mediaFile)
      }

      // Add new files to existing files
      const updatedFiles = [...uploadedFiles, ...newFiles]
      console.log(`📁 Added ${newFiles.length} files. Total files: ${updatedFiles.length}`)
      onFilesChange(updatedFiles)

      // Set errors if any occurred
      if (errors.length > 0) {
        setUploadErrors(errors)
      }

    } catch (error) {
      console.error('Error processing files:', error)
      setUploadErrors(['Error processing files. Please try again.'])
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }, [uploadedFiles, onFilesChange, uploadImmediately, supabaseAvailable, buildingId])

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId)
    onFilesChange(updatedFiles)
  }

  return (
    <div className="space-y-6" onKeyDown={(e) => {
      // Prevent any Enter key from submitting the form in this section
      if (e.key === 'Enter') {
        e.preventDefault()
      }
    }}>
      {/* Supabase Status Indicator */}
      <div className="p-4 rounded-lg border">
        {uploadImmediately && supabaseAvailable && buildingId ? (
          <div className="flex items-center gap-2 text-green-700">
            <Cloud className="w-4 h-4" />
            <span className="font-medium">Cloud Storage Ready</span>
            <span className="text-sm text-gray-600">- Files will be uploaded to Supabase immediately</span>
          </div>
        ) : supabaseAvailable ? (
          <div className="flex items-center gap-2 text-blue-700">
            <Cloud className="w-4 h-4" />
            <span className="font-medium">Cloud Storage Ready</span>
            <span className="text-sm text-gray-600">- Files will be uploaded when you create the building</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">
              {supabaseStatus.isDummyCredentials
                ? 'Cloud Storage Disabled (Demo Mode)'
                : 'Cloud Storage Unavailable'}
            </span>
            <span className="text-sm text-gray-600">
              {supabaseStatus.isDummyCredentials
                ? '- Using dummy credentials. Files stored locally for form submission.'
                : '- Check Supabase configuration. Files will be stored locally.'}
            </span>
          </div>
        )}
      </div>

      {/* File Validation Errors */}
      {fileValidationErrors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 mb-2">Invalid File Types</h3>
              <ul className="text-sm text-red-700 space-y-1 mb-3">
                {fileValidationErrors.map(({ file, error }, index) => (
                  <li key={index}>• <strong>{file.name}</strong>: {error}</li>
                ))}
              </ul>
              <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                <strong>Supported formats:</strong> {FILE_TYPE_DESCRIPTIONS.IMAGES}, {FILE_TYPE_DESCRIPTIONS.VIDEOS}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Upload Errors */}
      {uploadErrors.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 mb-2">Upload Issues</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {uploadErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Virtual Tour URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Virtual Tour URL
        </label>
        <Input
          type="url"
          value={virtualTourUrl}
          onChange={(e) => onVirtualTourUrlChange(e.target.value)}
          onKeyDown={(e) => {
            // Prevent Enter key from submitting the form
            if (e.key === 'Enter') {
              e.preventDefault()
            }
          }}
          placeholder="https://example.com/virtual-tour"
          icon={<Eye className="w-4 h-4" />}
        />
        <p className="text-xs text-gray-500 mt-1">
          Add a link to a virtual tour of the building
        </p>
      </div>

      {/* File Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Photos & Videos
        </h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <div className="mb-4">
            <div className="flex justify-center space-x-4 mb-4">
              <Image className="w-8 h-8 text-gray-400" />
              <Video className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="media-upload" className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500 font-medium">
                Click to upload photos and videos
              </span>
              <span className="text-gray-500"> or drag and drop</span>
            </label>
            <input
              id="media-upload"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </div>
          <p className="text-xs text-gray-500">
            Images: {FILE_TYPE_DESCRIPTIONS.IMAGES} up to 10MB each<br />
            Videos: {FILE_TYPE_DESCRIPTIONS.VIDEOS} up to 50MB each
          </p>
          {isUploading && (
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Uploaded Files Display */}
      {uploadedFiles.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Uploaded Media</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {file.category === 'building_image' ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={file.preview}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
                
                <div className="absolute top-2 right-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg">
                  <div className="flex items-center gap-2">
                    {file.category === 'building_image' ? (
                      <Image className="w-4 h-4" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    {file.url && (
                      <Cloud className="w-3 h-3 text-green-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-300">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* File Summary */}
      {uploadedFiles.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-blue-800">
            <FileText className="w-4 h-4" />
            <span className="font-medium">
              {uploadedFiles.filter(f => f.category === 'building_image').length} photos and{' '}
              {uploadedFiles.filter(f => f.category === 'building_video').length} videos
            </span>
          </div>
          <div className="text-sm text-blue-600 mt-1 space-y-1">
            {uploadImmediately && supabaseAvailable ? (
              <>
                <p className="flex items-center gap-2">
                  <Cloud className="w-3 h-3" />
                  {uploadedFiles.filter(f => f.url).length} of {uploadedFiles.length} files uploaded to cloud storage
                </p>
                {uploadedFiles.filter(f => !f.url).length > 0 && (
                  <p className="text-amber-600">
                    {uploadedFiles.filter(f => !f.url).length} files stored locally (upload failed)
                  </p>
                )}
              </>
            ) : (
              <p>Files will be saved to the database when you submit the form</p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
