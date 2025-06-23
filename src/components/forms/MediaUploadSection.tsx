import React, { useState, useCallback } from 'react'
import { Upload, X, Image, Video, FileText, Eye, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MediaFile } from '@/types'

interface MediaUploadSectionProps {
  virtualTourUrl?: string
  uploadedFiles: MediaFile[]
  onVirtualTourUrlChange: (url: string) => void
  onFilesChange: (files: MediaFile[]) => void
}

export function MediaUploadSection({
  virtualTourUrl = '',
  uploadedFiles,
  onVirtualTourUrlChange,
  onFilesChange
}: MediaUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false)

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
    if (!files) return

    setIsUploading(true)

    try {
      const newFiles: MediaFile[] = []

      for (const file of Array.from(files)) {
        // Validate file type
        if (!isImageFile(file) && !isVideoFile(file)) {
          alert(`File ${file.name} is not a supported image or video format`)
          continue
        }

        // Validate file size (max 50MB for videos, 10MB for images)
        const maxSize = isVideoFile(file) ? 50 * 1024 * 1024 : 10 * 1024 * 1024
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Max size: ${isVideoFile(file) ? '50MB' : '10MB'}`)
          continue
        }

        const preview = await createFilePreview(file)
        const category = isImageFile(file) ? 'building_image' : 'building_video'

        const mediaFile: MediaFile = {
          id: Date.now() + Math.random().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          file,
          preview,
          category
        }

        newFiles.push(mediaFile)
      }

      // Add new files to existing files
      onFilesChange([...uploadedFiles, ...newFiles])

    } catch (error) {
      console.error('Error processing files:', error)
      alert('Error processing files. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }, [uploadedFiles, onFilesChange])

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId)
    onFilesChange(updatedFiles)
  }

  return (
    <div className="space-y-6">
      {/* Virtual Tour URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Virtual Tour URL
        </label>
        <Input
          type="url"
          value={virtualTourUrl}
          onChange={(e) => onVirtualTourUrlChange(e.target.value)}
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
            Images: JPG, PNG, GIF up to 10MB each<br />
            Videos: MP4, MOV, AVI up to 50MB each
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
                    <span className="text-sm truncate">{file.name}</span>
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
              {uploadedFiles.filter(f => f.category === 'building_video').length} videos ready for upload
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Files will be saved to the database when you submit the form
          </p>
        </Card>
      )}
    </div>
  )
}
