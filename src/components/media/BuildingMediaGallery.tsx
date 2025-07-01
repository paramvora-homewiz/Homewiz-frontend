/**
 * Building Media Gallery Component
 * Displays categorized building images and videos with proper organization
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { 
  CategorizedBuildingMedia, 
  ImageMetadata, 
  VideoMetadata 
} from '@/lib/supabase/image-metadata'
import { 
  getBuildingMedia, 
  getFeaturedImage
} from '@/lib/supabase/media-service'

interface BuildingMediaGalleryProps {
  buildingId: string
  showCategories?: boolean
  showVideos?: boolean
  allowSetFeatured?: boolean
  maxImagesPerCategory?: number
}

export default function BuildingMediaGallery({
  buildingId,
  showCategories = true,
  showVideos = true,
  allowSetFeatured = false,
  maxImagesPerCategory = 10
}: BuildingMediaGalleryProps) {
  const [media, setMedia] = useState<CategorizedBuildingMedia | null>(null)
  const [featuredImage, setFeaturedImageState] = useState<ImageMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadBuildingMedia()
  }, [buildingId])

  const loadBuildingMedia = async () => {
    setLoading(true)
    try {
      const [mediaData, featured] = await Promise.all([
        getBuildingMedia(buildingId),
        getFeaturedImage(buildingId)
      ])
      
      setMedia(mediaData)
      setFeaturedImageState(featured)
    } catch (error) {
      console.error('Failed to load building media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetFeatured = async (imageId: string) => {
    if (!allowSetFeatured) return
    
    console.log('Set featured image:', imageId)
    // TODO: Implement setFeaturedImage for simplified system
    await loadBuildingMedia() // Refresh data
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'outside': return <Building className="w-4 h-4" />
      case 'common_areas': return <Users className="w-4 h-4" />
      case 'amenities': return <Dumbbell className="w-4 h-4" />
      case 'kitchen_bathrooms': return <Home className="w-4 h-4" />
      default: return null
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'outside': return 'Exterior'
      case 'common_areas': return 'Common Areas'
      case 'amenities': return 'Amenities'
      case 'kitchen_bathrooms': return 'Kitchen & Bathrooms'
      default: return category
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
    
    return media[selectedCategory as keyof CategorizedBuildingMedia] as ImageMetadata[] || []
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
      {featuredImage && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Featured Image</span>
          </div>
          <div className="relative max-w-md">
            <img
              src={featuredImage.public_url}
              alt={featuredImage.file_name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <Badge className="absolute top-2 right-2">
              {getCategoryLabel(featuredImage.category)}
            </Badge>
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
                {getCategoryIcon(category)}
                {getCategoryLabel(category)} ({count})
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
        {getFilteredImages().slice(0, maxImagesPerCategory).map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={image.public_url}
                alt={image.file_name}
                className={
                  viewMode === 'grid'
                    ? "w-full h-32 object-cover"
                    : "w-16 h-16 object-cover"
                }
              />
              
              {/* Category badge */}
              <Badge 
                variant="secondary"
                className="absolute top-2 left-2 text-xs"
              >
                {getCategoryLabel(image.category)}
              </Badge>
              
              {/* Featured star */}
              {featuredImage?.id === image.id && (
                <Star className="absolute top-2 right-2 w-4 h-4 text-yellow-500 fill-current" />
              )}
              
              {/* Set Featured button */}
              {allowSetFeatured && featuredImage?.id !== image.id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => handleSetFeatured(image.id)}
                >
                  <Star className="w-3 h-3" />
                </Button>
              )}
            </div>
            
            {viewMode === 'list' && (
              <div className="p-3">
                <p className="text-sm font-medium truncate">{image.file_name}</p>
                <p className="text-xs text-gray-500">
                  {(image.file_size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Videos Section */}
      {showVideos && media.videos.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Play className="w-4 h-4" />
            Videos ({media.videos.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {media.videos.map((video) => (
              <Card key={video.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded">
                    <Play className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{video.file_name}</p>
                    <p className="text-sm text-gray-500">
                      {(video.file_size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}