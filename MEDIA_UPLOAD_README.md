# Photo and Video Upload Feature

This document explains the new photo and video upload functionality added to the HomeWiz building form.

## Overview

The building form now supports uploading photos and videos directly from the frontend. Files are processed and prepared for backend storage as blobs in the database.

## Features

- **Drag & Drop Upload**: Users can drag and drop files or click to select
- **File Type Validation**: Supports images (JPG, PNG, GIF) and videos (MP4, MOV, AVI)
- **File Size Limits**: 
  - Images: 10MB maximum
  - Videos: 50MB maximum
- **Preview**: Real-time preview of uploaded images and videos
- **File Management**: Remove individual files before submission
- **Virtual Tour URL**: Support for external virtual tour links

## Components

### MediaUploadSection

Located at: `src/components/forms/MediaUploadSection.tsx`

**Props:**
- `virtualTourUrl`: Current virtual tour URL
- `uploadedFiles`: Array of MediaFile objects
- `onVirtualTourUrlChange`: Callback for virtual tour URL changes
- `onFilesChange`: Callback for file list changes

### MediaFile Type

```typescript
interface MediaFile {
  id: string
  name: string
  type: string
  size: number
  file: File
  preview: string
  category: 'building_image' | 'building_video'
}
```

## Usage in BuildingForm

The MediaUploadSection is integrated into the "Images & Tours" step of the building form:

```tsx
case 'media':
  return (
    <MediaUploadSection
      virtualTourUrl={formData.virtual_tour_url}
      uploadedFiles={mediaFiles}
      onVirtualTourUrlChange={(url) => handleInputChange('virtual_tour_url', url)}
      onFilesChange={setMediaFiles}
    />
  )
```

## Backend Integration

### Form Data Preparation

Use the `createFormDataWithFiles` utility to prepare data for backend submission:

```typescript
import { createFormDataWithFiles } from '@/utils/fileUpload'

const handleSubmit = async (buildingData: BuildingFormData) => {
  // Convert to FormData with files
  const formData = createFormDataWithFiles(buildingData, buildingData.media_files || [])
  
  // Send to backend
  const response = await fetch('/api/buildings', {
    method: 'POST',
    body: formData, // Browser will set correct Content-Type with boundary
  })
  
  if (response.ok) {
    const result = await response.json()
    console.log('Building created with media files:', result)
  }
}
```

### Backend Expected Format

The FormData will contain:
- `building_data`: JSON string with all building information (excluding media_files)
- `building_images`: File objects for images
- `building_videos`: File objects for videos
- `file_metadata_${index}`: JSON metadata for each file

### Example Backend Handler (Node.js/Express with multer)

```javascript
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

app.post('/api/buildings', upload.any(), async (req, res) => {
  try {
    // Parse building data
    const buildingData = JSON.parse(req.body.building_data)
    
    // Process uploaded files
    const imageFiles = req.files.filter(file => file.fieldname === 'building_images')
    const videoFiles = req.files.filter(file => file.fieldname === 'building_videos')
    
    // Store files as blobs in database
    const imageBlobs = imageFiles.map(file => ({
      data: file.buffer,
      contentType: file.mimetype,
      filename: file.originalname
    }))
    
    const videoBlobs = videoFiles.map(file => ({
      data: file.buffer,
      contentType: file.mimetype,
      filename: file.originalname
    }))
    
    // Save to database
    const building = await createBuilding({
      ...buildingData,
      images: imageBlobs,
      videos: videoBlobs
    })
    
    res.json({ success: true, building })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

## File Validation

The system includes client-side validation:

```typescript
import { validateMediaFile } from '@/utils/fileUpload'

const validation = validateMediaFile(file)
if (!validation.isValid) {
  alert(validation.error)
  return
}
```

## File Preview

Files are automatically converted to data URLs for preview:

```typescript
const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}
```

## Security Considerations

1. **File Type Validation**: Only allow specific image and video types
2. **File Size Limits**: Enforce maximum file sizes to prevent abuse
3. **Server-side Validation**: Always validate files on the backend
4. **Virus Scanning**: Consider adding virus scanning for uploaded files
5. **Storage Limits**: Implement storage quotas per building/user

## Performance Considerations

1. **Large Files**: Videos can be large; consider compression or streaming
2. **Preview Generation**: Generate thumbnails for videos on the backend
3. **Progressive Upload**: Consider implementing chunked uploads for large files
4. **CDN Storage**: For production, consider storing files in a CDN

## Troubleshooting

### Common Issues

1. **File Too Large**: Check file size limits and adjust if needed
2. **Unsupported Format**: Verify file type validation rules
3. **Upload Fails**: Check network connectivity and backend endpoint
4. **Preview Not Showing**: Ensure file is properly converted to data URL

### Debug Information

The component logs file processing information to the console. Check browser developer tools for detailed error messages.

## Future Enhancements

1. **Image Compression**: Automatically compress images before upload
2. **Video Thumbnails**: Generate video thumbnails for preview
3. **Bulk Upload**: Support for uploading multiple files at once
4. **Progress Indicators**: Show upload progress for large files
5. **Cloud Storage**: Integration with AWS S3, Google Cloud Storage, etc.
