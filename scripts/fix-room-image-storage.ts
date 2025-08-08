import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function analyzeRoomImageIssue() {
  console.log('🔍 Analyzing room image storage issue...\n')
  
  try {
    // 1. Check room ID patterns in database
    console.log('1. Checking room ID patterns in database...')
    const { data: sampleRooms } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id')
      .limit(5)
      
    console.log('Sample room IDs from database:')
    sampleRooms?.forEach(room => {
      console.log(`  - ${room.room_id} (Room ${room.room_number} in ${room.building_id})`)
    })
    
    // 2. Check storage structure
    console.log('\n2. Checking storage structure...')
    const { data: storageFiles } = await supabase.storage
      .from('building-images')
      .list('buildings', { limit: 100 })
      
    console.log(`Found ${storageFiles?.length || 0} items in buildings/ folder`)
    
    // Find folders with room images
    const foldersWithRooms: string[] = []
    if (storageFiles) {
      for (const item of storageFiles) {
        if (!item.name.includes('.')) { // It's a folder
          const { data: roomsCheck } = await supabase.storage
            .from('building-images')
            .list(`buildings/${item.name}/rooms`)
            
          if (roomsCheck && roomsCheck.length > 0) {
            foldersWithRooms.push(item.name)
          }
        }
      }
    }
    
    console.log(`\nBuildings with room folders: ${foldersWithRooms.length}`)
    foldersWithRooms.forEach(building => {
      console.log(`  - ${building}`)
    })
    
    // 3. Analyze the mismatch
    console.log('\n3. Analysis of the issue:')
    console.log('❌ PROBLEM IDENTIFIED:')
    console.log('  - Database room IDs use format: BLDG_[building]_R[number]')
    console.log('  - Storage is using format: RM_[random]')
    console.log('  - Building IDs in storage (BLD_[timestamp]_[random]) don\'t match database')
    
    console.log('\n💡 SOLUTION:')
    console.log('  The frontend needs to use the actual room_id and building_id from the database')
    console.log('  when uploading images, not generate new IDs.')
    
    // 4. Check if any rooms have working images
    console.log('\n4. Checking for rooms with working images...')
    const { data: roomsWithImages } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .not('room_images', 'is', null)
      .limit(3)
      
    if (roomsWithImages && roomsWithImages.length > 0) {
      console.log('Rooms with images in database:')
      roomsWithImages.forEach(room => {
        console.log(`  - ${room.room_id}: ${room.room_images}`)
      })
    } else {
      console.log('No rooms have images in the database')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

analyzeRoomImageIssue()