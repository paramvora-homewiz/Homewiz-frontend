import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyRoomImageFix() {
  console.log('🔍 Verifying room image fix...\n')
  
  try {
    // 1. Get a sample room with building info
    const { data: rooms } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .limit(5)
      
    if (!rooms || rooms.length === 0) {
      console.log('No rooms found')
      return
    }
    
    console.log('Sample rooms and their expected storage paths:')
    rooms.forEach(room => {
      console.log(`\nRoom: ${room.room_number} (${room.room_id})`)
      console.log(`Building ID: ${room.building_id}`)
      console.log(`Expected storage path: buildings/${room.building_id}/rooms/${room.room_id}/images/`)
      console.log(`Current room_images: ${room.room_images || 'None'}`)
    })
    
    // 2. Check if any images exist in the correct paths
    console.log('\n📸 Checking for existing images in correct paths...')
    for (const room of rooms.slice(0, 2)) {
      const { data: images, error } = await supabase.storage
        .from('building-images')
        .list(`buildings/${room.building_id}/rooms/${room.room_id}/images`)
        
      if (!error && images) {
        console.log(`\nRoom ${room.room_id}:`)
        if (images.length > 0) {
          console.log(`  ✅ Found ${images.length} images in correct path`)
          images.forEach(img => {
            const url = supabase.storage
              .from('building-images')
              .getPublicUrl(`buildings/${room.building_id}/rooms/${room.room_id}/images/${img.name}`)
            console.log(`    - ${img.name}`)
            console.log(`      URL: ${url.data.publicUrl}`)
          })
        } else {
          console.log('  ⚠️ No images found in storage')
        }
      }
    }
    
    console.log('\n✅ FIX SUMMARY:')
    console.log('The issue was that the frontend was using formData.building_id instead of')
    console.log('the actual building_id from the created/updated room record.')
    console.log('\nFixed by:')
    console.log('1. Using createdRoom.building_id for new rooms')
    console.log('2. Using initialData.building_id for room updates')
    console.log('3. UpdateRoomImagesModal already uses room.building_id correctly')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

verifyRoomImageFix()