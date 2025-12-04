'use client'

import React, { useState, useRef } from 'react'
import { X, GripVertical } from 'lucide-react'

interface DraggableImageGridProps {
  images: Array<{
    id: string
    src: string
    alt?: string
  }>
  onReorder: (newOrder: string[]) => void
  onRemove?: (id: string) => void
  columns?: number
  imageHeight?: string
  showRemoveButton?: boolean
  showDragHandle?: boolean
}

export default function DraggableImageGrid({
  images,
  onReorder,
  onRemove,
  columns = 4,
  imageHeight = 'h-32',
  showRemoveButton = true,
  showDragHandle = true,
}: DraggableImageGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragCounter = useRef(0)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)

    // Add a slight delay to allow the drag image to be set
    setTimeout(() => {
      const element = document.getElementById(`draggable-image-${id}`)
      if (element) {
        element.style.opacity = '0.5'
      }
    }, 0)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const element = document.getElementById(`draggable-image-${draggedId}`)
    if (element) {
      element.style.opacity = '1'
    }
    setDraggedId(null)
    setDragOverId(null)
    dragCounter.current = 0
  }

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    dragCounter.current++
    if (id !== draggedId) {
      setDragOverId(id)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverId(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    dragCounter.current = 0

    if (!draggedId || draggedId === targetId) {
      setDragOverId(null)
      return
    }

    const currentOrder = images.map(img => img.id)
    const draggedIndex = currentOrder.indexOf(draggedId)
    const targetIndex = currentOrder.indexOf(targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDragOverId(null)
      return
    }

    // Remove dragged item and insert at target position
    const newOrder = [...currentOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedId)

    onReorder(newOrder)
    setDragOverId(null)
  }

  if (images.length === 0) {
    return null
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-3 md:grid-cols-6',
  }

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || 'grid-cols-2 md:grid-cols-4'} gap-4`}>
      {images.map((image, index) => (
        <div
          key={image.id}
          id={`draggable-image-${image.id}`}
          draggable
          onDragStart={(e) => handleDragStart(e, image.id)}
          onDragEnd={handleDragEnd}
          onDragEnter={(e) => handleDragEnter(e, image.id)}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, image.id)}
          className={`relative group rounded-lg overflow-hidden cursor-move transition-all duration-200 ${
            dragOverId === image.id
              ? 'ring-2 ring-blue-500 ring-offset-2 scale-105'
              : ''
          } ${
            draggedId === image.id
              ? 'opacity-50'
              : ''
          }`}
        >
          <img
            src={image.src}
            alt={image.alt || `Image ${index + 1}`}
            className={`w-full ${imageHeight} object-cover`}
            draggable={false}
          />

          {/* Drag Handle Overlay */}
          {showDragHandle && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg px-2 py-1 flex items-center gap-1 text-xs text-gray-600">
                <GripVertical className="w-4 h-4" />
                <span>Drag to reorder</span>
              </div>
            </div>
          )}

          {/* Position Badge */}
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {index + 1}
          </div>

          {/* Remove Button */}
          {showRemoveButton && onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(image.id)
              }}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Drop Indicator */}
          {dragOverId === image.id && draggedId !== image.id && (
            <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg bg-blue-50/50 flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">Drop here</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Helper component for File-based images (converts File to URL)
interface DraggableFileImageGridProps {
  files: File[]
  onReorder: (files: File[]) => void
  onRemove?: (index: number) => void
  columns?: number
  imageHeight?: string
}

export function DraggableFileImageGrid({
  files,
  onReorder,
  onRemove,
  columns = 4,
  imageHeight = 'h-32',
}: DraggableFileImageGridProps) {
  // Create stable IDs for files based on name + size + lastModified
  const getFileId = (file: File, index: number) =>
    `${file.name}-${file.size}-${file.lastModified}-${index}`

  const images = files.map((file, index) => ({
    id: getFileId(file, index),
    src: URL.createObjectURL(file),
    alt: file.name,
    file,
    originalIndex: index,
  }))

  const handleReorder = (newOrder: string[]) => {
    const reorderedFiles = newOrder.map(id => {
      const image = images.find(img => img.id === id)
      return image?.file
    }).filter((f): f is File => f !== undefined)

    onReorder(reorderedFiles)
  }

  const handleRemove = (id: string) => {
    const image = images.find(img => img.id === id)
    if (image && onRemove) {
      const currentIndex = files.findIndex((f, i) => getFileId(f, i) === id)
      if (currentIndex !== -1) {
        onRemove(currentIndex)
      }
    }
  }

  return (
    <DraggableImageGrid
      images={images}
      onReorder={handleReorder}
      onRemove={onRemove ? handleRemove : undefined}
      columns={columns}
      imageHeight={imageHeight}
    />
  )
}

// Helper component for URL-based images
interface DraggableUrlImageGridProps {
  urls: string[]
  onReorder: (urls: string[]) => void
  onRemove?: (url: string) => void
  columns?: number
  imageHeight?: string
}

export function DraggableUrlImageGrid({
  urls,
  onReorder,
  onRemove,
  columns = 4,
  imageHeight = 'h-32',
}: DraggableUrlImageGridProps) {
  const images = urls.map((url, index) => ({
    id: url,
    src: url,
    alt: `Image ${index + 1}`,
  }))

  const handleReorder = (newOrder: string[]) => {
    onReorder(newOrder)
  }

  return (
    <DraggableImageGrid
      images={images}
      onReorder={handleReorder}
      onRemove={onRemove}
      columns={columns}
      imageHeight={imageHeight}
    />
  )
}
