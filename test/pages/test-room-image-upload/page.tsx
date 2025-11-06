'use client'

import { useState } from 'react'
import { uploadRoomImages } from '@/lib/supabase/storage'
import { RoomFormIntegration } from '@/lib/supabase/form-integration'
import { supabase } from '@/lib/supabase/client'

export default function TestRoomImageUpload() {
  const [status, setStatus] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  const roomId = 'BLDG_1080_FOLSOM_R002'
  const buildingId = 'BLDG_1080_FOLSOM'
  
  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    addStatus(`Selected ${files.length} files`)
  }
  
  const testUpload = async () => {
    if (selectedFiles.length === 0) {
      addStatus('❌ No files selected')
      return
    }
    
    addStatus('🚀 Starting upload test...')
    
    try {
      // 1. Upload to storage
      addStatus(`📤 Uploading ${selectedFiles.length} files to storage...`)
      const uploadResults = await uploadRoomImages(buildingId, roomId, selectedFiles)
      
      const successful = uploadResults.filter(r => r.success)
      const failed = uploadResults.filter(r => !r.success)
      
      addStatus(`✅ Uploaded: ${successful.length}, ❌ Failed: ${failed.length}`)
      
      if (successful.length > 0) {
        // 2. Get current room images
        addStatus('📊 Fetching current room images...')
        const { data: room } = await supabase
          .from('rooms')
          .select('room_images')
          .eq('room_id', roomId)
          .single()
          
        let currentImages: string[] = []
        if (room?.room_images) {
          try {
            currentImages = JSON.parse(room.room_images)
          } catch {
            currentImages = [room.room_images]
          }
        }
        
        addStatus(`Current images: ${currentImages.length}`)
        
        // 3. Combine with new images
        const newUrls = successful.map(r => r.url).filter(Boolean) as string[]
        const allUrls = [...currentImages, ...newUrls]
        
        addStatus(`📝 Updating database with ${allUrls.length} total images...`)
        
        // 4. Update database
        const updateResult = await RoomFormIntegration.updateRoomImages(roomId, allUrls)
        
        if (updateResult.success) {
          addStatus(`✅ ${updateResult.message}`)
        } else {
          addStatus(`❌ Database update failed: ${updateResult.error}`)
        }
      }
      
      // Show upload details
      uploadResults.forEach((result, idx) => {
        if (result.success) {
          addStatus(`✅ File ${idx + 1}: ${result.url}`)
        } else {
          addStatus(`❌ File ${idx + 1}: ${result.error}`)
        }
      })
      
    } catch (error) {
      addStatus(`❌ Error: ${error}`)
    }
  }
  
  const clearStatus = () => setStatus([])
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Room Image Upload</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Testing upload for:</p>
          <p className="font-mono">Room ID: {roomId}</p>
          <p className="font-mono">Building ID: {buildingId}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">Selected files:</p>
              <ul className="text-sm">
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>• {file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={testUpload}
              disabled={selectedFiles.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Test Upload
            </button>
            
            <button
              onClick={clearStatus}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear Logs
            </button>
          </div>
        </div>
      </div>
      
      {status.length > 0 && (
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm">
          <h3 className="text-lg font-bold mb-2">Upload Status:</h3>
          {status.map((msg, idx) => (
            <div key={idx} className="py-1">{msg}</div>
          ))}
        </div>
      )}
    </div>
  )
}