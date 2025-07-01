'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function DebugRoomNumber() {
  const [status, setStatus] = useState('')

  const checkExistingRooms = async () => {
    setStatus('🔍 Checking existing rooms and their number formats...\n')
    
    try {
      const { data: rooms, error } = await supabase!
        .from('rooms')
        .select('room_id, room_number, building_id')
        .limit(10)

      if (error) {
        setStatus(prev => prev + `❌ Error: ${error.message}\n`)
        return
      }

      if (rooms && rooms.length > 0) {
        setStatus(prev => prev + `✅ Found ${rooms.length} existing rooms:\n`)
        rooms.forEach((room, index) => {
          setStatus(prev => prev + `${index + 1}. Room Number: "${room.room_number}" | Building: ${room.building_id}\n`)
        })
        
        // Analyze the room number format
        const roomNumbers = rooms.map(r => r.room_number)
        const areNumeric = roomNumbers.every(num => !isNaN(Number(num)))
        const areStrings = roomNumbers.some(num => isNaN(Number(num)))
        
        setStatus(prev => prev + `\n📊 Analysis:\n`)
        setStatus(prev => prev + `All numeric: ${areNumeric}\n`)
        setStatus(prev => prev + `Some strings: ${areStrings}\n`)
        setStatus(prev => prev + `Sample formats: ${roomNumbers.slice(0, 3).join(', ')}\n`)
        
      } else {
        setStatus(prev => prev + '⚠️ No existing rooms found.\n')
      }
    } catch (error: any) {
      setStatus(prev => prev + `❌ Error: ${error.message}\n`)
    }
  }

  const testRoomCreation = async () => {
    setStatus(prev => prev + '\n🧪 Testing different room number formats...\n')
    
    const testFormats = [
      { format: 'Simple number', value: '101' },
      { format: 'Number as string', value: '202' },
      { format: 'Alphanumeric', value: 'A101' },
      { format: 'Timestamp number', value: Date.now().toString().slice(-4) },
    ]

    for (const test of testFormats) {
      try {
        setStatus(prev => prev + `\n🔬 Testing ${test.format}: "${test.value}"\n`)
        
        const testRoomData = {
          room_id: `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          room_number: test.value,
          building_id: 'BLD_1751317535295_ww2uz6ojx', // Use first building from your list
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

        const { data, error } = await supabase!
          .from('rooms')
          .insert(testRoomData)
          .select()
          .single()

        if (error) {
          setStatus(prev => prev + `❌ ${test.format} failed: ${error.message}\n`)
        } else {
          setStatus(prev => prev + `✅ ${test.format} succeeded! Room ID: ${data.room_id}\n`)
          
          // Clean up - delete the test room
          await supabase!.from('rooms').delete().eq('room_id', data.room_id)
          setStatus(prev => prev + `🗑️ Test room cleaned up\n`)
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error: any) {
        setStatus(prev => prev + `❌ ${test.format} error: ${error.message}\n`)
      }
    }
  }

  const testWithRealBuildingData = async () => {
    setStatus(prev => prev + '\n🏗️ Testing with exactly matching existing room format...\n')
    
    try {
      // First, see if we can find the pattern from existing data
      const { data: existingRoom, error: fetchError } = await supabase!
        .from('rooms')
        .select('room_number, building_id')
        .limit(1)
        .single()

      if (fetchError || !existingRoom) {
        setStatus(prev => prev + '⚠️ No existing rooms to copy format from\n')
        return
      }

      // Generate a similar room number
      let newRoomNumber: string
      if (!isNaN(Number(existingRoom.room_number))) {
        // If existing is numeric, increment it
        newRoomNumber = (Number(existingRoom.room_number) + 1).toString()
      } else {
        // If existing is alphanumeric, create similar format
        newRoomNumber = existingRoom.room_number.replace(/\d+/, (match) => (Number(match) + 1).toString())
      }

      setStatus(prev => prev + `📋 Copying format from: "${existingRoom.room_number}" → "${newRoomNumber}"\n`)

      const testRoomData = {
        room_id: `FINAL_TEST_${Date.now()}`,
        room_number: newRoomNumber,
        building_id: existingRoom.building_id, // Use same building as existing room
        private_room_rent: 1000,
        status: 'AVAILABLE',
        ready_to_rent: true
      }

      const { data, error } = await supabase!
        .from('rooms')
        .insert(testRoomData)
        .select()
        .single()

      if (error) {
        setStatus(prev => prev + `❌ Final test failed: ${error.message}\n`)
      } else {
        setStatus(prev => prev + `✅ FINAL TEST SUCCEEDED!\n`)
        setStatus(prev => prev + `Room created: ${data.room_id} | Number: ${data.room_number}\n`)
        setStatus(prev => prev + `Building: ${data.building_id}\n`)
        
        // Test image update on this room
        const testImageUrls = ['https://example.com/test1.jpg', 'https://example.com/test2.jpg']
        
        const { updateRoomWithImages } = await import('@/lib/supabase/room-database-fix')
        const updateResult = await updateRoomWithImages(data.room_id, testImageUrls)
        
        if (updateResult.success) {
          setStatus(prev => prev + `✅ IMAGE UPDATE ALSO SUCCEEDED!\n`)
          setStatus(prev => prev + `🎉 COMPLETE SUCCESS! Room creation + image update works!\n`)
        } else {
          setStatus(prev => prev + `❌ Image update failed: ${updateResult.error}\n`)
        }
      }

    } catch (error: any) {
      setStatus(prev => prev + `❌ Final test error: ${error.message}\n`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🔍 Room Number Format Debug</h1>
      <p className="text-gray-600 mb-6">
        Diagnose the exact room number format required by the database.
      </p>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={checkExistingRooms}
            className="bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600"
          >
            🔍 Check Existing Rooms
          </button>
          
          <button
            onClick={testRoomCreation}
            className="bg-orange-500 text-white py-3 px-4 rounded hover:bg-orange-600"
          >
            🧪 Test Room Formats
          </button>
          
          <button
            onClick={testWithRealBuildingData}
            className="bg-green-500 text-white py-3 px-4 rounded hover:bg-green-600"
          >
            🎯 Final Format Test
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium mb-2">Debug Results:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white p-3 rounded border max-h-96 overflow-y-auto">
            {status || 'Click a button to start debugging room number formats.'}
          </pre>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="font-medium text-red-800 mb-2">🚨 Current Issue:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Database rejects room_number: "TEST_1751321209494"</li>
            <li>• Error: "invalid input syntax for type bigint"</li>
            <li>• Need to find the correct room_number format</li>
            <li>• Database column might be expecting numeric values</li>
          </ul>
        </div>
      </div>
    </div>
  )
}