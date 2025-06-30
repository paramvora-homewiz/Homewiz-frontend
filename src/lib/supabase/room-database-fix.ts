/**
 * Fixed Room Database Operations
 * Handles the "JSON object requested, multiple (or no) rows returned" error
 */

import { supabase } from './client'

export interface RoomImageUpdateResult {
  success: boolean
  data?: any
  error?: string
  roomExists?: boolean
  imageUrls?: string[]
}

/**
 * Safely update room with image URLs, handling all edge cases
 */
export async function updateRoomWithImages(
  roomId: string,
  imageUrls: string[]
): Promise<RoomImageUpdateResult> {
  try {
    console.log(`🔍 Attempting to update room ${roomId} with ${imageUrls.length} image URLs`)

    // Step 1: Check if room exists first
    const { data: existingRoom, error: checkError } = await supabase!
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .eq('room_id', roomId)
      .maybeSingle() // Use maybeSingle instead of single to handle no results gracefully

    if (checkError) {
      console.error('❌ Error checking room existence:', checkError)
      return {
        success: false,
        error: `Error checking room: ${checkError.message}`,
        roomExists: false
      }
    }

    if (!existingRoom) {
      console.warn(`⚠️ Room ${roomId} does not exist in database`)
      return {
        success: false,
        error: `Room ${roomId} not found in database`,
        roomExists: false
      }
    }

    console.log('✅ Room exists:', existingRoom)

    // Step 2: Update the room with image URLs
    const imageUrlsJson = JSON.stringify(imageUrls)
    
    console.log(`💾 Updating room with image URLs:`, {
      roomId,
      currentImages: existingRoom.room_images,
      newImages: imageUrlsJson,
      imageUrls
    })

    const { data: updatedRoom, error: updateError } = await supabase!
      .from('rooms')
      .update({
        room_images: imageUrlsJson,
        last_modified: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating room:', updateError)
      return {
        success: false,
        error: `Error updating room: ${updateError.message}`,
        roomExists: true
      }
    }

    console.log('✅ Room updated successfully:', updatedRoom)

    return {
      success: true,
      data: updatedRoom,
      roomExists: true,
      imageUrls
    }

  } catch (error: any) {
    console.error('❌ Unexpected error in updateRoomWithImages:', error)
    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
      roomExists: false
    }
  }
}

/**
 * Get a real building ID for testing
 */
async function getRealBuildingId(): Promise<{ success: boolean; buildingId?: string; error?: string }> {
  try {
    // First try to get an existing building
    const { data: buildings, error } = await supabase!
      .from('buildings')
      .select('building_id, building_name')
      .limit(1)

    if (error) {
      console.error('❌ Error getting buildings:', error)
      return { success: false, error: error.message }
    }

    if (buildings && buildings.length > 0) {
      console.log('✅ Found existing building:', buildings[0])
      return { success: true, buildingId: buildings[0].building_id }
    }

    // If no buildings exist, create one
    console.log('🏗️ No buildings found, creating test building...')
    
    const testBuildingData = {
      building_id: `BUILD_${Date.now()}`,
      building_name: `Test Building ${Date.now()}`,
      full_address: '123 Test Street, Test City, TC 12345',
      street: '123 Test Street',
      city: 'Test City',
      state: 'TC',
      zip: '12345',
      available: true
    }

    const { data: newBuilding, error: createError } = await supabase!
      .from('buildings')
      .insert(testBuildingData)
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating building:', createError)
      return { success: false, error: createError.message }
    }

    console.log('✅ Created new building:', newBuilding)
    return { success: true, buildingId: newBuilding.building_id }

  } catch (error: any) {
    console.error('❌ Unexpected error getting building ID:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create a test room for testing purposes with real building ID
 */
export async function createTestRoom(preferredBuildingId?: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    let buildingId = preferredBuildingId

    // If no building ID provided, get a real one
    if (!buildingId) {
      const buildingResult = await getRealBuildingId()
      if (!buildingResult.success) {
        return { success: false, error: `Failed to get building ID: ${buildingResult.error}` }
      }
      buildingId = buildingResult.buildingId!
    }

    // Generate a simple numeric room number to avoid the bigint error
    const roomNumber = Math.floor(100 + Math.random() * 900).toString() // Generates 3-digit number like "101", "245", etc.
    
    const testRoomData = {
      room_id: `TEST_ROOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      room_number: roomNumber, // Use simple numeric format
      building_id: buildingId,
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

    console.log('📝 Creating test room with real building ID:', testRoomData)

    const { data, error } = await supabase!
      .from('rooms')
      .insert(testRoomData)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating test room:', error)
      return {
        success: false,
        error: error.message
      }
    }

    console.log('✅ Test room created:', data)
    return {
      success: true,
      data
    }

  } catch (error: any) {
    console.error('❌ Unexpected error creating test room:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Comprehensive room and image flow test
 */
export async function testRoomImageFlow(
  preferredBuildingId?: string,
  imageFiles?: File[]
): Promise<{
  success: boolean
  roomId?: string
  imageUrls?: string[]
  error?: string
  buildingId?: string
  steps: Array<{ step: string; success: boolean; data?: any; error?: string }>
}> {
  const steps: Array<{ step: string; success: boolean; data?: any; error?: string }> = []

  try {
    // Step 1: Create room with real building ID
    steps.push({ step: 'Creating room', success: false })
    const roomResult = await createTestRoom(preferredBuildingId)
    
    if (!roomResult.success) {
      steps[0] = { step: 'Creating room', success: false, error: roomResult.error }
      return { success: false, error: roomResult.error, steps }
    }

    const createdRoom = roomResult.data
    steps[0] = { step: 'Creating room', success: true, data: { roomId: createdRoom.room_id, buildingId: createdRoom.building_id } }

    // Step 2: Upload images (only if provided)
    if (imageFiles && imageFiles.length > 0) {
      steps.push({ step: 'Uploading images', success: false })
      const { uploadRoomImages } = await import('./storage')
      
      const uploadResults = await uploadRoomImages(createdRoom.building_id, createdRoom.room_id, imageFiles)
      const successfulUploads = uploadResults.filter(r => r.success)
      
      if (successfulUploads.length === 0) {
        const errors = uploadResults.map(r => r.error).join(', ')
        steps[1] = { step: 'Uploading images', success: false, error: errors }
        return { success: false, error: `Upload failed: ${errors}`, roomId: createdRoom.room_id, buildingId: createdRoom.building_id, steps }
      }

      const imageUrls = successfulUploads.map(r => r.url).filter(Boolean)
      steps[1] = { step: 'Uploading images', success: true, data: { imageCount: imageUrls.length, imageUrls } }

      // Step 3: Update database with image URLs
      steps.push({ step: 'Updating database', success: false })
      const updateResult = await updateRoomWithImages(createdRoom.room_id, imageUrls)
      
      if (!updateResult.success) {
        steps[2] = { step: 'Updating database', success: false, error: updateResult.error }
        return { 
          success: false, 
          error: updateResult.error, 
          roomId: createdRoom.room_id, 
          buildingId: createdRoom.building_id,
          imageUrls,
          steps 
        }
      }

      steps[2] = { step: 'Updating database', success: true, data: updateResult.data }

      return {
        success: true,
        roomId: createdRoom.room_id,
        buildingId: createdRoom.building_id,
        imageUrls,
        steps
      }
    } else {
      // No images to upload, just test database update with mock URLs
      const mockImageUrls = ['https://example.com/test1.jpg', 'https://example.com/test2.jpg']
      
      steps.push({ step: 'Testing database update', success: false })
      const updateResult = await updateRoomWithImages(createdRoom.room_id, mockImageUrls)
      
      if (!updateResult.success) {
        steps[1] = { step: 'Testing database update', success: false, error: updateResult.error }
        return { 
          success: false, 
          error: updateResult.error, 
          roomId: createdRoom.room_id, 
          buildingId: createdRoom.building_id,
          steps 
        }
      }

      steps[1] = { step: 'Testing database update', success: true, data: updateResult.data }

      return {
        success: true,
        roomId: createdRoom.room_id,
        buildingId: createdRoom.building_id,
        imageUrls: mockImageUrls,
        steps
      }
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      steps
    }
  }
}