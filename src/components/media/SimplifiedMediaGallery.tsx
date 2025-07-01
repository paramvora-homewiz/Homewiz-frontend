/**
 * Simplified Building Media Gallery
 * Uses URL path structure to categorize images - no complex metadata needed!
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building, 
  Users, 
  Dumbbell, 
  Home, 
  Play, 
  Star,
  Grid,
  List,
  Trash2
} from 'lucide-react'
import { 
  getBuildingMedia, 
  deleteImage, 
  SimplifiedBuildingMedia 
} from '@/lib/supabase/media-service'
import { 
  getCategoryDisplayName, 
  getCategoryIcon,
  MediaCategory 
} from '@/lib/supabase/url-category-utils'

interface SimplifiedMediaGalleryProps {
  buildingId: string
  showCategories?: boolean
  showVideos?: boolean
  allowDelete?: boolean
  maxImagesPerCategory?: number
}

export default function SimplifiedMediaGallery({
  buildingId,
  showCategories = true,
  showVideos = true,
  allowDelete = false,
  maxImagesPerCategory = 10
}: SimplifiedMediaGalleryProps) {
  const [media, setMedia] = useState<SimplifiedBuildingMedia | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadBuildingMedia()
  }, [buildingId])

  const loadBuildingMedia = async () => {
    setLoading(true)
    try {
      const mediaData = await getBuildingMedia(buildingId)
      setMedia(mediaData)
    } catch (error) {
      console.error('Failed to load building media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageUrl: string) => {
    if (!allowDelete || deleting) return
    
    setDeleting(imageUrl)
    try {
      const success = await deleteImage(buildingId, imageUrl)
      if (success) {
        await loadBuildingMedia() // Refresh data
      } else {
        console.error('Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    } finally {
      setDeleting(null)
    }
  }

  const getCategoryIconComponent = (category: string) => {
    switch (category) {
      case 'outside': return <Building className="w-4 h-4" />
      case 'common_areas': return <Users className="w-4 h-4" />
      case 'amenities': return <Dumbbell className="w-4 h-4" />
      case 'kitchen_bathrooms': return <Home className="w-4 h-4" />
      case 'videos': return <Play className="w-4 h-4" />
      default: return null
    }
  }

  const getFilteredImages = () => {
    if (!media) return []
    
    if (selectedCategory === 'all') {
      return [
        ...media.outside,
        ...media.common_areas,
        ...media.amenities,
        ...media.kitchen_bathrooms
      ]
    }
    
    return media[selectedCategory as keyof SimplifiedBuildingMedia] as string[] || []
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (!media) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No media found for this building</p>
      </Card>
    )
  }

  const totalImages = media.outside.length + media.common_areas.length + 
                     media.amenities.length + media.kitchen_bathrooms.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Building Media</h3>
          <p className="text-sm text-gray-600">
            {totalImages} images, {media.videos.length} videos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Featured Image */}
      {media.featured_image && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Featured Image</span>
          </div>
          <div className="relative max-w-md">
            <img
              src={media.featured_image}
              alt="Featured building image"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        </Card>
      )}

      {/* Category Filter */}
      {showCategories && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All ({totalImages})
          </Button>
          
          {Object.entries({
            outside: media.outside.length,
            common_areas: media.common_areas.length,
            amenities: media.amenities.length,
            kitchen_bathrooms: media.kitchen_bathrooms.length
          }).map(([category, count]) => (
            count > 0 && (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="flex items-center gap-1"
              >
                {getCategoryIconComponent(category)}
                {getCategoryDisplayName(category as MediaCategory)} ({count})
              </Button>
            )
          ))}
        </div>
      )}

      {/* Images Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          : "space-y-3"
      }>
        {getFilteredImages().slice(0, maxImagesPerCategory).map((imageUrl, index) => {
          const fileName = imageUrl.split('/').pop() || 'Image'
          const isDeleting = deleting === imageUrl
          
          return (
            <Card key={imageUrl} className="overflow-hidden">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={fileName}
                  className={`${
                    viewMode === 'grid'
                      ? "w-full h-32 object-cover"
                      : "w-16 h-16 object-cover"
                  } ${isDeleting ? 'opacity-50' : ''}`}
                />
                
                {/* Delete button */}
                {allowDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(imageUrl)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
                
                {isDeleting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-sm">Deleting...</div>
                  </div>
                )}
              </div>
              
              {viewMode === 'list' && (
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{fileName}</p>
                  <p className="text-xs text-gray-500">
                    Category: {getCategoryDisplayName(selectedCategory as MediaCategory)}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Videos Section */}
      {showVideos && media.videos.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Play className="w-4 h-4" />
            Videos ({media.videos.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.videos.map((videoUrl) => {
              const fileName = videoUrl.split('/').pop() || 'Video'
              
              return (
                <Card key={videoUrl} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <Play className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fileName}</p>
                      <p className="text-sm text-gray-500">Video file</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      {allowDelete && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteImage(videoUrl)}
                          disabled={deleting === videoUrl}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-50">
          <h4 className="font-medium mb-2">Debug: URL Analysis</h4>
          <div className="text-xs space-y-1">
            {getFilteredImages().slice(0, 2).map((url) => (
              <div key={url} className="truncate">
                <strong>URL:</strong> {url}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}