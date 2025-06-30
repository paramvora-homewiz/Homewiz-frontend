'use client'

import { useState } from 'react'
import { databaseService } from '@/lib/supabase/database'

export default function TestBuildingCheck() {
  const [status, setStatus] = useState('')

  const checkExistingBuildings = async () => {
    setStatus('🔍 Checking existing buildings in database...\n')
    
    try {
      // List existing buildings
      const buildingsResult = await databaseService.buildings.list({ limit: 10 })
      
      if (buildingsResult.success) {
        setStatus(prev => prev + `✅ Found ${buildingsResult.data.length} buildings:\n`)
        
        buildingsResult.data.forEach((building, index) => {
          setStatus(prev => prev + `${index + 1}. ID: ${building.building_id} | Name: ${building.building_name}\n`)
        })
        
        if (buildingsResult.data.length === 0) {
          setStatus(prev => prev + '\n⚠️ No buildings found. We need to create one first.\n')
        } else {
          const firstBuilding = buildingsResult.data[0]
          setStatus(prev => prev + `\n💡 Use this building ID for testing: ${firstBuilding.building_id}\n`)
        }
      } else {
        setStatus(prev => prev + `❌ Failed to get buildings: ${buildingsResult.error?.message}\n`)
      }
    } catch (error: any) {
      setStatus(prev => prev + `❌ Error: ${error.message}\n`)
    }
  }

  const createTestBuilding = async () => {
    setStatus(prev => prev + '\n📝 Creating test building...\n')
    
    try {
      const testBuildingData = {
        building_id: `BUILD_${Date.now()}`,
        building_name: `Test Building ${Date.now()}`,
        full_address: '123 Test Street, Test City, TC 12345',
        street: '123 Test Street',
        city: 'Test City', 
        state: 'TC',
        zip: '12345',
        available: true,
        operator_id: null
      }

      console.log('Creating building with data:', testBuildingData)
      
      const result = await databaseService.buildings.create(testBuildingData)
      
      if (result.success) {
        setStatus(prev => prev + `✅ Building created successfully!\n`)
        setStatus(prev => prev + `Building ID: ${result.data.building_id}\n`)
        setStatus(prev => prev + `Building Name: ${result.data.building_name}\n`)
        console.log('Created building:', result.data)
      } else {
        setStatus(prev => prev + `❌ Building creation failed: ${result.error?.message}\n`)
        console.error('Building creation error:', result.error)
      }
    } catch (error: any) {
      setStatus(prev => prev + `❌ Error creating building: ${error.message}\n`)
      console.error('Building creation error:', error)
    }
  }

  const testRoomWithRealBuilding = async () => {
    setStatus(prev => prev + '\n🏠 Testing room creation with real building...\n')
    
    try {
      // First get buildings again
      const buildingsResult = await databaseService.buildings.list({ limit: 1 })
      
      if (!buildingsResult.success || buildingsResult.data.length === 0) {
        setStatus(prev => prev + '❌ No buildings available. Create one first.\n')
        return
      }
      
      const testBuilding = buildingsResult.data[0]
      setStatus(prev => prev + `📋 Using building: ${testBuilding.building_id} (${testBuilding.building_name})\n`)
      
      // Create room with real building ID
      const testRoomData = {
        room_id: `ROOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        room_number: `TEST_${Date.now()}`,
        building_id: testBuilding.building_id, // Use real building ID
        private_room_rent: 1000,
        status: 'AVAILABLE',
        ready_to_rent: true,
        floor_number: 1,
        bed_count: 1,
        maximum_people_in_room: 1,
        bathroom_type: 'Shared',
        bed_size: 'Twin',
        bed_type: 'Single',
        view: 'Street',
        sq_footage: 200,
        room_storage: 'Built-in Closet'
      }

      console.log('Creating room with data:', testRoomData)
      
      const roomResult = await databaseService.rooms.create(testRoomData)
      
      if (roomResult.success) {
        setStatus(prev => prev + `✅ Room created successfully!\n`)
        setStatus(prev => prev + `Room ID: ${roomResult.data.room_id}\n`)
        setStatus(prev => prev + `Room Number: ${roomResult.data.room_number}\n`)
        setStatus(prev => prev + `Building ID: ${roomResult.data.building_id}\n`)
        
        // Now test updating with images
        const testImageUrls = [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ]
        
        const { updateRoomWithImages } = await import('@/lib/supabase/room-database-fix')
        const updateResult = await updateRoomWithImages(roomResult.data.room_id, testImageUrls)
        
        if (updateResult.success) {
          setStatus(prev => prev + `✅ Room image update successful!\n`)
          setStatus(prev => prev + `🎉 COMPLETE SUCCESS - Room creation and image update works!\n`)
        } else {
          setStatus(prev => prev + `❌ Room image update failed: ${updateResult.error}\n`)
        }
        
      } else {
        setStatus(prev => prev + `❌ Room creation failed: ${roomResult.error?.message}\n`)
        console.error('Room creation error:', roomResult.error)
      }
    } catch (error: any) {
      setStatus(prev => prev + `❌ Error: ${error.message}\n`)
      console.error('Room test error:', error)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🏢 Building & Room Database Check</h1>
      <p className="text-gray-600 mb-6">
        This tool checks existing buildings and tests room creation with correct building IDs.
      </p>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={checkExistingBuildings}
            className="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600"
          >
            🔍 Check Buildings
          </button>
          
          <button
            onClick={createTestBuilding}
            className="bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600"
          >
            🏗️ Create Test Building
          </button>
          
          <button
            onClick={testRoomWithRealBuilding}
            className="bg-purple-500 text-white py-3 px-4 rounded hover:bg-purple-600"
          >
            🏠 Test Room Creation
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium mb-2">Database Check Results:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white p-3 rounded border max-h-96 overflow-y-auto">
            {status || 'Click a button to start checking the database.'}
          </pre>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">🎯 Issue Diagnosis:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Building ID must be a real ID from existing buildings</li>
            <li>• Database expects building_id to reference an actual building</li>
            <li>• String IDs like "test-building-123" don't exist in the database</li>
            <li>• Need to use actual building IDs from the buildings table</li>
          </ul>
        </div>
      </div>
    </div>
  )
}