import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugRoomImageUpdate() {
  console.log('🔍 Debugging room image update issue...\n')
  
  const roomId = 'RM_2ABIIMWE1DN'
  const buildingId = 'BLD_1751317535295_ww2uz6ojx'
  const imageUrl = 'https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/BLD_1751317535295_ww2uz6ojx/rooms/RM_2ABIIMWE1DN/images/1751322341169_0_minh-pham-7pcfuybp_p8-unsplash.jpg'
  
  try {
    // 1. Check if room exists
    console.log(`1. Checking if room ${roomId} exists...`)
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_id', roomId)
      .single()
      
    if (roomError) {
      console.error('❌ Error fetching room:', roomError)
      return
    }
    
    if (!room) {
      console.log('❌ Room not found!')
      return
    }
    
    console.log('✅ Room found:')
    console.log('  - room_number:', room.room_number)
    console.log('  - building_id:', room.building_id)
    console.log('  - current room_images:', room.room_images)
    
    // 2. Try to update the room_images field
    console.log('\n2. Attempting to update room_images field...')
    const { data: updateData, error: updateError } = await supabase
      .from('rooms')
      .update({ room_images: imageUrl })
      .eq('room_id', roomId)
      .select()
      .single()
      
    if (updateError) {
      console.error('❌ Error updating room:', updateError)
      console.log('\nPossible causes:')
      console.log('- RLS policies blocking the update')
      console.log('- Database permissions issue')
      console.log('- Column type mismatch')
    } else {
      console.log('✅ Update successful!')
      console.log('Updated room_images:', updateData.room_images)
    }
    
    // 3. Verify the update
    console.log('\n3. Verifying the update...')
    const { data: verifyRoom, error: verifyError } = await supabase
      .from('rooms')
      .select('room_images')
      .eq('room_id', roomId)
      .single()
      
    if (verifyRoom) {
      console.log('Current room_images value:', verifyRoom.room_images)
      if (verifyRoom.room_images === imageUrl) {
        console.log('✅ Update verified successfully!')
      } else {
        console.log('⚠️ Update did not persist!')
      }
    }
    
    // 4. Try updating with JSON array format
    console.log('\n4. Testing JSON array format...')
    const jsonArrayValue = JSON.stringify([imageUrl])
    const { error: jsonError } = await supabase
      .from('rooms')
      .update({ room_images: jsonArrayValue })
      .eq('room_id', roomId)
      
    if (jsonError) {
      console.error('❌ Error with JSON array format:', jsonError)
    } else {
      console.log('✅ JSON array format accepted')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugRoomImageUpdate()