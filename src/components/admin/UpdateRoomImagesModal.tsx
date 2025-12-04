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
import { Camera, X, Upload, Image, GripVertical } from 'lucide-react'
import type { Room } from '@/lib/supabase/types'
import { DraggableFileImageGrid, DraggableUrlImageGrid } from '@/components/ui/DraggableImageGrid'

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
  const [isDragging, setIsDragging] = useState(false)

  // Initialize existing images when modal opens
  useEffect(() => {
    if (open && room) {
      const images = parseBuildingImages(room.images)
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
    e.target.value = ''
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (isLoading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'))
      if (fileArray.length > 0) {
        setNewImages(prev => [...prev, ...fileArray])
      }
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
        newImageUrls = successfulUploads.map(result => result.url).filter((url): url is string => Boolean(url))
        
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
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Image className="w-5 h-5" />
                Current Images ({remainingImages.length} of {existingImages.length})
              </h3>
              <p className="text-sm text-gray-500 mb-3">Drag to reorder. Click X to mark for deletion.</p>
              <DraggableUrlImageGrid
                urls={existingImages}
                onReorder={(newUrls) => setExistingImages(newUrls)}
                onRemove={(url) => toggleDeleteExistingImage(url)}
                columns={4}
                imageHeight="h-32"
              />
              {deletedImages.length > 0 && (
                <p className="mt-2 text-sm text-red-600">
                  {deletedImages.length} image(s) marked for deletion
                </p>
              )}
            </div>
          )}

          {/* New Images to Upload */}
          {newImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                New Images to Upload ({newImages.length})
              </h3>
              <p className="text-sm text-gray-500 mb-3">Drag to reorder</p>
              <DraggableFileImageGrid
                files={newImages}
                onReorder={(reorderedFiles) => setNewImages(reorderedFiles)}
                onRemove={removeNewImage}
                columns={4}
                imageHeight="h-32"
              />
            </div>
          )}

          {/* Upload Area */}
          <Card
            className={`p-6 border-2 border-dashed transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Camera className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              {isDragging ? (
                <span className="text-blue-600 font-medium">Drop images here</span>
              ) : (
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    Click to upload more images
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
              )}
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