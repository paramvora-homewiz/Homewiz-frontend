'use client'

import { useState } from 'react'
import { uploadRoomImages } from '@/lib/supabase/storage'
import { databaseService } from '@/lib/supabase/database'
import { transformRoomDataForBackend } from '@/lib/backend-sync'

export default function TestCompleteFlow() {
  const [status, setStatus] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus(`File selected: ${e.target.files[0].name}`)
    }
  }

  const testCompleteRoomFlow = async () => {
    if (!file) {
      setStatus('Please select a file')
      return
    }

    setStatus('🚀 Testing complete room creation + image upload flow...\n')
    
    try {
      // Import the comprehensive test function
      const { testRoomImageFlow } = await import('@/lib/supabase/room-database-fix')
      
      console.log('🚀 Starting comprehensive room image flow test...')
      
      const result = await testRoomImageFlow(undefined, [file])
      
      console.log('📊 Complete flow result:', result)
      
      // Display step-by-step results
      result.steps.forEach((step, index) => {
        const status = step.success ? '✅' : '❌'
        setStatus(prev => prev + `${status} Step ${index + 1}: ${step.step}\n`)
        
        if (step.data) {
          setStatus(prev => prev + `   Data: ${JSON.stringify(step.data)}\n`)
        }
        
        if (step.error) {
          setStatus(prev => prev + `   Error: ${step.error}\n`)
        }
      })
      
      if (result.success) {
        setStatus(prev => prev + `\n🎉 COMPLETE SUCCESS!\n`)
        setStatus(prev => prev + `Room ID: ${result.roomId}\n`)
        setStatus(prev => prev + `Images: ${result.imageUrls?.length || 0} uploaded\n`)
        if (result.imageUrls) {
          setStatus(prev => prev + `URLs: ${result.imageUrls.join('\n')}\n`)
        }
      } else {
        setStatus(prev => prev + `\n❌ Flow failed: ${result.error}\n`)
        if (result.roomId) {
          setStatus(prev => prev + `Room ID: ${result.roomId}\n`)
        }
      }

    } catch (error: any) {
      console.error('❌ Complete flow error:', error)
      setStatus(prev => prev + `❌ Critical Error: ${error.message}\n`)
    }
  }

  const testDatabaseUpdateOnly = async () => {
    setStatus('🔧 Testing database update with existing room...\n')
    
    try {
      // Import the improved database functions
      const { createTestRoom, updateRoomWithImages } = await import('@/lib/supabase/room-database-fix')
      
      console.log('📝 Creating test room for update...')
      const createResult = await createTestRoom()
      
      if (!createResult.success) {
        setStatus(prev => prev + `❌ Test room creation failed: ${createResult.error}\n`)
        return
      }

      const testRoom = createResult.data
      console.log('✅ Test room created:', testRoom)
      setStatus(prev => prev + `✅ Test room created: ${testRoom.room_id}\n`)

      // Now try to update it with improved method
      const testImageUrls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ]

      console.log('💾 Attempting improved update...')
      setStatus(prev => prev + `💾 Testing improved update method...\n`)
      
      const updateResult = await updateRoomWithImages(testRoom.room_id, testImageUrls)

      if (updateResult.success) {
        setStatus(prev => prev + `✅ Database update successful!\n`)
        setStatus(prev => prev + `📋 Updated room data: ${JSON.stringify(updateResult.data, null, 2)}\n`)
        console.log('✅ Update successful:', updateResult)
      } else {
        setStatus(prev => prev + `❌ Database update failed: ${updateResult.error}\n`)
        setStatus(prev => prev + `🔍 Room exists: ${updateResult.roomExists}\n`)
        console.error('❌ Update failed:', updateResult)
      }

    } catch (error: any) {
      console.error('Database update test error:', error)
      setStatus(prev => prev + `❌ Critical Error: ${error.message}\n`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🔧 Complete Room Flow Test</h1>
      <p className="text-gray-600 mb-6">
        This tests the complete flow: Room Creation → Image Upload → Database Update
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
            onClick={testCompleteRoomFlow}
            disabled={!file}
            className="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            🚀 Test Complete Room Flow
          </button>
          
          <button
            onClick={testDatabaseUpdateOnly}
            className="bg-purple-500 text-white py-3 px-4 rounded hover:bg-purple-600"
          >
            🔧 Test Database Update Only
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium mb-2">Test Results:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white p-3 rounded border max-h-96 overflow-y-auto">
            {status || 'No tests run yet. Select a file and run a test.'}
          </pre>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">🎯 What This Tests:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ **Storage Upload**: Already confirmed working</li>
            <li>🔧 **Room Creation**: Tests database room creation</li>
            <li>🔗 **Database Update**: Tests updating room with image URLs</li>
            <li>🔍 **Error Debugging**: Identifies exactly where failures occur</li>
          </ul>
        </div>
      </div>
    </div>
  )
}