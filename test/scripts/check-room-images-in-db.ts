import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRoomImagesInDB() {
  console.log('🔍 Checking room images in database...\n')
  
  try {
    // Get rooms with images
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .not('room_images', 'is', null)
      .limit(10)
      
    if (error) {
      console.error('❌ Error fetching rooms:', error)
      return
    }
    
    if (!rooms || rooms.length === 0) {
      console.log('⚠️ No rooms found with room_images data')
      
      // Check total room count
      const { count } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true })
        
      console.log(`Total rooms in database: ${count}`)
      
      // Check a specific room that should have images
      console.log('\n🔍 Checking specific room RM_2ABIIMWE1DN...')
      const { data: specificRoom, error: specificError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_id', 'RM_2ABIIMWE1DN')
        .single()
        
      if (specificRoom) {
        console.log('Room found:')
        console.log('- room_id:', specificRoom.room_id)
        console.log('- room_number:', specificRoom.room_number)
        console.log('- building_id:', specificRoom.building_id)
        console.log('- room_images:', specificRoom.room_images)
        console.log('- room_images type:', typeof specificRoom.room_images)
        
        if (!specificRoom.room_images) {
          console.log('\n⚠️ This room has images in storage but room_images field is null!')
          console.log('This indicates the database is not being updated after image upload.')
        }
      } else if (specificError) {
        console.log('Error finding room:', specificError)
      } else {
        console.log('Room RM_2ABIIMWE1DN not found')
      }
      
      return
    }
    
    console.log(`Found ${rooms.length} rooms with images:\n`)
    
    rooms.forEach((room, index) => {
      console.log(`${index + 1}. Room ${room.room_number} (${room.room_id})`)
      console.log(`   Building: ${room.building_id}`)
      console.log(`   room_images field:`, room.room_images)
      console.log(`   Type: ${typeof room.room_images}`)
      
      // Try to parse the images
      try {
        if (typeof room.room_images === 'string') {
          if (room.room_images.startsWith('[')) {
            const parsed = JSON.parse(room.room_images)
            console.log(`   Parsed as array: ${parsed.length} images`)
          } else if (room.room_images.startsWith('http')) {
            console.log(`   Single URL: ${room.room_images}`)
          } else {
            console.log(`   Unknown format`)
          }
        }
      } catch (e) {
        console.log(`   Failed to parse:`, e.message)
      }
      
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkRoomImagesInDB()