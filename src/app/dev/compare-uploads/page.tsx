'use client'

import { useState } from 'react'
import { uploadBuildingImages } from '@/lib/supabase/storage'
import { uploadRoomImages } from '@/lib/supabase/storage'
import { debugRoomImageUpload } from '@/lib/supabase/room-upload-debug'
import { MediaFile } from '@/types'

export default function CompareUploads() {
  const [status, setStatus] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus(`File selected: ${e.target.files[0].name}`)
    }
  }

  const testBuildingUpload = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    setStatus('🏢 Testing Building Upload (same as working building images)...')
    console.log('\n🏢 ===== BUILDING UPLOAD TEST =====')

    try {
      // Create MediaFile object like BuildingForm does
      const mediaFile: MediaFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        file: file, // This is the key difference!
        preview: URL.createObjectURL(file),
        category: 'building_image',
        url: undefined
      }

      console.log('🔍 MediaFile object created:', {
        id: mediaFile.id,
        name: mediaFile.name,
        type: mediaFile.type,
        size: mediaFile.size,
        hasFile: !!mediaFile.file,
        fileConstructor: mediaFile.file.constructor.name,
        isFileInstanceOfFile: mediaFile.file instanceof File
      })

      // Test upload like BuildingForm does
      const testBuildingId = 'test-building-123'
      
      // Use the same method as BuildingForm: extract .file from MediaFile
      const uploadResults = await uploadBuildingImages(testBuildingId, [mediaFile.file])
      
      console.log('🏢 Building upload results:', uploadResults)
      
      if (uploadResults[0]?.success) {
        setStatus(prev => prev + `\n✅ Building Upload Successful!\nURL: ${uploadResults[0].url}`)
      } else {
        setStatus(prev => prev + `\n❌ Building Upload Failed: ${uploadResults[0]?.error}`)
      }
    } catch (error: any) {
      setStatus(prev => prev + `\n❌ Building Upload Error: ${error.message}`)
      console.error('Building upload error:', error)
    }
  }

  const testRoomUpload = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    setStatus(prev => prev + '\n\n🏠 Testing Room Upload (current method)...')
    console.log('\n🏠 ===== ROOM UPLOAD TEST =====')

    try {
      const testBuildingId = 'test-building-123'
      const testRoomId = 'test-room-456'

      console.log('🔍 Direct File object for room upload:', {
        name: file.name,
        type: file.type,
        size: file.size,
        constructor: file.constructor.name,
        isFileInstanceOfFile: file instanceof File,
        lastModified: file.lastModified
      })

      // Test upload with raw File object like RoomForm does
      const uploadResults = await uploadRoomImages(testBuildingId, testRoomId, [file])
      
      console.log('🏠 Room upload results:', uploadResults)
      
      if (uploadResults[0]?.success) {
        setStatus(prev => prev + `\n✅ Room Upload Successful!\nURL: ${uploadResults[0].url}`)
      } else {
        setStatus(prev => prev + `\n❌ Room Upload Failed: ${uploadResults[0]?.error}`)
      }
    } catch (error: any) {
      setStatus(prev => prev + `\n❌ Room Upload Error: ${error.message}`)
      console.error('Room upload error:', error)
    }
  }

  const testRoomUploadLikeBuildingUpload = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    setStatus(prev => prev + '\n\n🔬 Testing Room Upload using Building Upload Method...')
    console.log('\n🔬 ===== ROOM UPLOAD WITH BUILDING METHOD =====')

    try {
      const testBuildingId = 'test-building-123'
      
      console.log('🔍 Using building upload method for room images...')

      // Use building upload method but with room-like path
      const uploadResults = await uploadBuildingImages(testBuildingId, [file])
      
      console.log('🔬 Room-via-building upload results:', uploadResults)
      
      if (uploadResults[0]?.success) {
        setStatus(prev => prev + `\n✅ Room-via-Building Upload Successful!\nURL: ${uploadResults[0].url}`)
      } else {
        setStatus(prev => prev + `\n❌ Room-via-Building Upload Failed: ${uploadResults[0]?.error}`)
      }
    } catch (error: any) {
      setStatus(prev => prev + `\n❌ Room-via-Building Upload Error: ${error.message}`)
      console.error('Room-via-building upload error:', error)
    }
  }

  const runAllTests = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    setStatus('🚀 Running all comparison tests...\n')
    
    await testBuildingUpload()
    await testRoomUpload()
    await testRoomUploadLikeBuildingUpload()
    
    setStatus(prev => prev + '\n\n🎯 All tests completed! Check console for detailed logs.')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🔬 Upload Methods Comparison Lab</h1>
      <p className="text-gray-600 mb-6">
        This tool compares how building uploads (working) vs room uploads (broken) handle the same file.
      </p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select an image file</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={testBuildingUpload}
            disabled={!file}
            className="bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            🏢 Test Building Upload
          </button>
          
          <button
            onClick={testRoomUpload}
            disabled={!file}
            className="bg-red-500 text-white py-3 px-4 rounded hover:bg-red-600 disabled:bg-gray-300"
          >
            🏠 Test Room Upload
          </button>
          
          <button
            onClick={testRoomUploadLikeBuildingUpload}
            disabled={!file}
            className="bg-purple-500 text-white py-3 px-4 rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            🔬 Room via Building Method
          </button>
          
          <button
            onClick={runAllTests}
            disabled={!file}
            className="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            🚀 Run All Tests
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium mb-2">Comparison Results:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white p-3 rounded border max-h-96 overflow-y-auto">
            {status || 'No tests run yet. Select a file and click a test button.'}
          </pre>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-2">🏢 Building Upload (Working)</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Uses MediaUploadSection component</li>
              <li>• Creates MediaFile objects with .file property</li>
              <li>• Extracts File with mediaFile.file</li>
              <li>• Uses uploadBuildingImages function</li>
            </ul>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-medium text-red-800 mb-2">🏠 Room Upload (Broken)</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Uses simple file input</li>
              <li>• Stores raw File objects directly</li>
              <li>• Passes File objects directly</li>
              <li>• Uses uploadRoomImages function</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}