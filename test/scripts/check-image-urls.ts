import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkImageUrls() {
  console.log('🔍 Checking image URLs in database...\n')
  
  // Check rooms
  const { data: rooms, error: roomError } = await supabase
    .from('rooms')
    .select('room_id, room_images')
    .not('room_images', 'is', null)
    .limit(5)
  
  if (!roomError && rooms) {
    console.log('📸 Sample Room Images:')
    for (const room of rooms) {
      console.log(`\nRoom ${room.room_id}:`)
      console.log('Raw value:', room.room_images)
      
      // Try to parse
      try {
        let images: string[] = []
        if (typeof room.room_images === 'string') {
          try {
            images = JSON.parse(room.room_images)
          } catch {
            images = room.room_images.split(',').map(img => img.trim())
          }
        }
        
        images.forEach((img, idx) => {
          console.log(`  [${idx}]: ${img}`)
        })
      } catch (e) {
        console.log('  Failed to parse images')
      }
    }
  }
  
  // Check buildings
  const { data: buildings, error: buildingError } = await supabase
    .from('buildings')
    .select('building_id, building_images')
    .not('building_images', 'is', null)
    .limit(5)
  
  if (!buildingError && buildings) {
    console.log('\n\n🏢 Sample Building Images:')
    for (const building of buildings) {
      console.log(`\nBuilding ${building.building_id}:`)
      console.log('Raw value:', building.building_images)
      
      // Try to parse
      try {
        let images: string[] = []
        if (typeof building.building_images === 'string') {
          try {
            images = JSON.parse(building.building_images)
          } catch {
            images = building.building_images.split(',').map(img => img.trim())
          }
        }
        
        images.forEach((img, idx) => {
          console.log(`  [${idx}]: ${img}`)
        })
      } catch (e) {
        console.log('  Failed to parse images')
      }
    }
  }
  
  // Summary
  console.log('\n📊 Summary:')
  
  const { count: roomCount } = await supabase
    .from('rooms')
    .select('*', { count: 'exact', head: true })
    .not('room_images', 'is', null)
  
  const { count: buildingCount } = await supabase
    .from('buildings')
    .select('*', { count: 'exact', head: true })
    .not('building_images', 'is', null)
  
  console.log(`Total rooms with images: ${roomCount || 0}`)
  console.log(`Total buildings with images: ${buildingCount || 0}`)
}

checkImageUrls().catch(console.error)