'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Camera, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase/client'

interface RoomImageUploadProps {
  roomId: string
  buildingId: string
  existingImages?: string[]
  onImagesChange: (imageUrls: string[]) => void
  maxImages?: number
  maxFileSize?: number // in MB
  className?: string
}

interface UploadProgress {
  [key: string]: number
}

export default function RoomImageUpload({
  roomId,
  buildingId,
  existingImages = [],
  onImagesChange,
  maxImages = 10,
  maxFileSize = 10,
  className = ''
}: RoomImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxFileSizeBytes = maxFileSize * 1024 * 1024

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG, WebP, and GIF files are allowed`
    }
    if (file.size > maxFileSizeBytes) {
      return `${file.name}: File size must be less than ${maxFileSize}MB`
    }
    return null
  }

  const generateFileName = (originalName: string): string => {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = originalName.split('.').pop()
    return `${timestamp}_${randomString}.${extension}`
  }

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const fileName = generateFileName(file.name)
    const filePath = `${buildingId}/rooms/${roomId}/images/${fileName}`

    try {
      const { data, error } = await supabaseClient
        .getClient()
        .storage
        .from('building-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get the public URL
      const { data: urlData } = supabaseClient
        .getClient()
        .storage
        .from('building-images')
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (error) {
      throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (!files.length) return

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      setErrors([`Cannot upload more than ${maxImages} images total`])
      return
    }

    // Validate files
    const validationErrors: string[] = []
    files.forEach(file => {
      const error = validateFile(file)
      if (error) validationErrors.push(error)
    })

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    setUploading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        try {
          const imageUrl = await uploadFileToSupabase(file)
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          return imageUrl
        } catch (error) {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[file.name]
            return newProgress
          })
          throw error
        }
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedUrls]
      
      setImages(newImages)
      onImagesChange(newImages)
      setUploadProgress({})
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Upload failed'])
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      // Extract the file path from the URL to delete from storage
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `${buildingId}/rooms/${roomId}/images/${fileName}`

      // Delete from Supabase storage
      const { error } = await supabaseClient
        .getClient()
        .storage
        .from('building-images')
        .remove([filePath])

      if (error) {
        console.warn('Failed to delete file from storage:', error.message)
      }

      // Remove from local state regardless of storage deletion result
      const newImages = images.filter((_, i) => i !== index)
      setImages(newImages)
      onImagesChange(newImages)
    } catch (error) {
      console.warn('Error removing image:', error)
      
      // Still remove from local state even if deletion failed
      const newImages = images.filter((_, i) => i !== index)
      setImages(newImages)
      onImagesChange(newImages)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Room Images</h3>
            <span className="text-sm text-gray-500">
              ({images.length}/{maxImages})
            </span>
          </div>
          
          {images.length < maxImages && (
            <Button
              onClick={openFileDialog}
              disabled={uploading}
              className="flex items-center space-x-2"
            >
              {uploading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>Add Images</span>
            </Button>
          )}
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-700">{error}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress */}
        <AnimatePresence>
          {Object.keys(uploadProgress).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate">{fileName}</span>
                    <span className="text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((imageUrl, index) => (
                <motion.div
                  key={`${imageUrl}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group aspect-square"
                >
                  <img
                    src={imageUrl}
                    alt={`Room image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-image.jpg' // fallback image
                    }}
                  />
                  
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveImage(imageUrl, index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  {/* Image number overlay */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No room images uploaded yet</p>
            <Button onClick={openFileDialog} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload First Image
            </Button>
          </div>
        )}

        {/* Upload Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Upload Guidelines:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Maximum {maxImages} images per room</li>
            <li>• File types: JPEG, PNG, WebP, GIF</li>
            <li>• Maximum file size: {maxFileSize}MB per image</li>
            <li>• Images will be automatically optimized</li>
          </ul>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </Card>
  )
}