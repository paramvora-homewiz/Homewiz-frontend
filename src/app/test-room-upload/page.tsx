'use client'

import { useState } from 'react'
import { debugRoomImageUpload, printDebugLogs } from '@/lib/supabase/room-upload-debug'
import { uploadRoomImages } from '@/lib/supabase/storage'
import { databaseService } from '@/lib/supabase/database'

export default function TestRoomUpload() {
  const [status, setStatus] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [debugMode, setDebugMode] = useState(true)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus(`File selected: ${e.target.files[0].name} (${(e.target.files[0].size / 1024).toFixed(2)}KB)`)
    }
  }

  const testDebugUpload = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    setStatus('🔍 Running comprehensive debug test...')

    try {
      // Test parameters
      const testBuildingId = 'test-building-123'
      const testRoomId = 'test-room-456'

      console.log('🚀 Starting debug upload test...')
      
      const debugResult = await debugRoomImageUpload(testBuildingId, testRoomId, file)
      
      // Print debug logs to console
      printDebugLogs(debugResult.debugLogs)
      
      if (debugResult.success) {
        setStatus(`✅ Debug Upload Successful!\nURL: ${debugResult.url}\n\nCheck console for detailed debug logs.`)
      } else {
        setStatus(`❌ Debug Upload Failed: ${debugResult.error}\n\nCheck console for detailed debug logs.`)
      }
    } catch (error: any) {
      setStatus(`❌ Debug Error: ${error.message}`)
      console.error('Debug test error:', error)
    }
  }

  const testNormalUpload = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    setStatus('🔄 Testing normal upload...')

    try {
      // Test parameters
      const testBuildingId = 'test-building-123'
      const testRoomId = 'test-room-456'

      // Test upload
      setStatus('Uploading to Supabase Storage...')
      const uploadResults = await uploadRoomImages(testBuildingId, testRoomId, [file])
      
      console.log('Upload results:', uploadResults)
      
      if (uploadResults[0]?.success) {
        setStatus(`✅ Upload successful! URL: ${uploadResults[0].url}`)
        
        // Test database update
        const updateResult = await databaseService.rooms.update(testRoomId, {
          room_images: JSON.stringify([uploadResults[0].url])
        })
        
        if (updateResult.success) {
          setStatus(prev => prev + '\n✅ Database update successful!')
        } else {
          setStatus(prev => prev + `\n❌ Database update failed: ${updateResult.error?.message}`)
        }
      } else {
        setStatus(`❌ Upload failed: ${uploadResults[0]?.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`)
      console.error('Test error:', error)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧪 Room Image Upload Testing Lab</h1>
      <p className="text-gray-600 mb-6">
        This tool will help us debug the room image upload issue by testing different approaches.
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testDebugUpload}
            disabled={!file}
            className="bg-purple-500 text-white py-3 px-4 rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            🔍 Debug Upload Test
          </button>
          
          <button
            onClick={testNormalUpload}
            disabled={!file}
            className="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            🔄 Normal Upload Test
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium mb-2">Test Results:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white p-3 rounded border max-h-96 overflow-y-auto">
            {status || 'No test run yet. Select a file and click a test button.'}
          </pre>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">💡 How to use:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Select an image file (JPEG, PNG, WebP, etc.)</li>
            <li>2. Click "Debug Upload Test" for detailed step-by-step analysis</li>
            <li>3. Check the browser console for comprehensive debug logs</li>
            <li>4. Use "Normal Upload Test" to test the regular upload process</li>
          </ul>
        </div>
      </div>
    </div>
  )
}