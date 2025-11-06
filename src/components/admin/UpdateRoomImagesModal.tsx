'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card } from '@/components/ui/card'
import { parseBuildingImages } from '@/lib/backend-sync'
import { uploadRoomImages } from '@/lib/supabase/storage'
import { RoomFormIntegration } from '@/lib/supabase/form-integration'
import { showSuccessMessage, showWarningMessage, showInfoMessage } from '@/lib/error-handler'
import { Camera, X, Upload, Image } from 'lucide-react'
import type { Room } from '@/lib/supabase/types'

interface UpdateRoomImagesModalProps {
  room: Room | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function UpdateRoomImagesModal({
  room,
  open,
  onOpenChange,
  onSuccess
}: UpdateRoomImagesModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [deletedImages, setDeletedImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])

  // Initialize existing images when modal opens
  useEffect(() => {
    if (open && room) {
      const images = parseBuildingImages(room.room_images)
      setExistingImages(images)
      setDeletedImages([])
      setNewImages([])
    }
  }, [open, room])

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setNewImages(prev => [...prev, ...fileArray])
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const toggleDeleteExistingImage = (imageUrl: string) => {
    if (deletedImages.includes(imageUrl)) {
      setDeletedImages(prev => prev.filter(img => img !== imageUrl))
    } else {
      setDeletedImages(prev => [...prev, imageUrl])
    }
  }

  const handleSubmit = async () => {
    if (!room) return

    setIsLoading(true)
    try {
      // Upload new images if any
      let newImageUrls: string[] = []
      
      if (newImages.length > 0 && room.building_id) {
        console.log(`📸 Uploading ${newImages.length} new room images...`)
        const uploadResults = await uploadRoomImages(room.building_id, room.room_id, newImages)
        const successfulUploads = uploadResults.filter(result => result.success)
        newImageUrls = successfulUploads.map(result => result.url).filter(Boolean)
        
        if (successfulUploads.length < newImages.length) {
          const failedCount = newImages.length - successfulUploads.length
          showInfoMessage(`${successfulUploads.length} images uploaded successfully, ${failedCount} failed.`)
        }
      }
      
      // Combine existing (non-deleted) images with new uploads
      const remainingExistingImages = existingImages.filter(img => !deletedImages.includes(img))
      const allImageUrls = [...remainingExistingImages, ...newImageUrls]
      
      // Update room with new image list
      const updateResult = await RoomFormIntegration.updateRoomImages(
        room.room_id,
        allImageUrls.length > 0 ? allImageUrls : null
      )
      
      if (updateResult.success) {
        showSuccessMessage(updateResult.message || 'Room images updated successfully!')
        onOpenChange(false)
        onSuccess?.()
      } else {
        showWarningMessage(updateResult.error || 'Failed to update room images')
      }
    } catch (error) {
      console.error('Error updating room images:', error)
      showWarningMessage('Failed to update room images. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  if (!room) return null

  const remainingImages = existingImages.filter(img => !deletedImages.includes(img))
  const totalImages = remainingImages.length + newImages.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="!w-[90vw] max-w-5xl !max-h-[85vh] !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 flex flex-col"
        onClose={handleClose}
      >
        <DialogHeader className="flex-shrink-0 pb-4 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
              <Camera className="w-5 h-5 text-purple-700" />
            </div>
            Update Room Images
          </DialogTitle>
          <DialogDescription>
            Manage images for {room.room_number} - {room.building_id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Current Images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Image className="w-5 h-5" />
                Current Images ({remainingImages.length} of {existingImages.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((imageUrl, index) => {
                  const isDeleted = deletedImages.includes(imageUrl)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative group ${isDeleted ? 'opacity-50' : ''}`}
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Room photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Show a broken image icon instead of placeholder
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              `
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDeleteExistingImage(imageUrl)}
                        className={`absolute top-2 right-2 w-8 h-8 ${
                          isDeleted 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        } text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100`}
                      >
                        {isDeleted ? '↺' : <X className="w-4 h-4" />}
                      </button>
                      {isDeleted && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <span className="text-red-700 font-medium bg-white px-2 py-1 rounded">
                            Will be deleted
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* New Images to Upload */}
          {newImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                New Images to Upload ({newImages.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {newImages.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 rounded-b-lg">
                      <p className="text-xs truncate">{file.name}</p>
                      <p className="text-xs text-gray-300">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  Click to upload more images
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelection}
                className="hidden"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600">
              Total images after update: {totalImages}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || (deletedImages.length === 0 && newImages.length === 0)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {isLoading ? 'Updating...' : 'Update Images'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}