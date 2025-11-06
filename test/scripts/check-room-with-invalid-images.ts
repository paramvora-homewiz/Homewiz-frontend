import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRoomWithInvalidImages() {
  console.log('🔍 Checking rooms with invalid image data...\n')
  
  try {
    // Get all rooms with images
    const { data: rooms } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .not('room_images', 'is', null)
      .limit(20)
      
    if (!rooms || rooms.length === 0) {
      console.log('No rooms with images found')
      return
    }
    
    console.log(`Found ${rooms.length} rooms with images\n`)
    
    // Check each room for invalid image data
    const roomsWithInvalidImages: any[] = []
    
    rooms.forEach(room => {
      const images = room.room_images
      let hasInvalid = false
      let parsedImages: string[] = []
      
      console.log(`Room ${room.room_number} (${room.room_id}):`)
      console.log(`  Raw value: ${JSON.stringify(images)}`)
      
      // Try to parse the images
      if (typeof images === 'string') {
        if (images.startsWith('[')) {
          try {
            parsedImages = JSON.parse(images)
            console.log(`  Parsed as JSON array: ${parsedImages.length} items`)
            
            // Check for invalid URLs
            parsedImages.forEach((img, idx) => {
              if (!img.startsWith('http') && !img.startsWith('/') && !img.startsWith('data:')) {
                console.log(`    ❌ Invalid URL at index ${idx}: "${img}"`)
                hasInvalid = true
              }
            })
          } catch (e) {
            console.log('  ❌ Invalid JSON')
            hasInvalid = true
          }
        } else if (!images.startsWith('http') && !images.startsWith('/')) {
          console.log(`  ❌ Invalid single URL: "${images}"`)
          hasInvalid = true
        } else {
          console.log('  ✅ Valid single URL')
        }
      }
      
      if (hasInvalid) {
        roomsWithInvalidImages.push({
          ...room,
          parsedImages
        })
      }
      
      console.log('')
    })
    
    if (roomsWithInvalidImages.length > 0) {
      console.log(`\n⚠️ Found ${roomsWithInvalidImages.length} rooms with invalid image data:`)
      
      roomsWithInvalidImages.forEach(room => {
        console.log(`\nRoom ${room.room_number} (${room.room_id}):`)
        console.log('Current value:', room.room_images)
        
        // Suggest a fix
        if (Array.isArray(room.parsedImages)) {
          const validImages = room.parsedImages.filter((img: string) => 
            img.startsWith('http') || img.startsWith('/') || img.startsWith('data:')
          )
          
          if (validImages.length > 0) {
            console.log('Suggested fix: Keep only valid URLs')
            console.log('Valid images:', validImages)
          } else {
            console.log('Suggested fix: Clear room_images (no valid URLs found)')
          }
        }
      })
      
      console.log('\n🔧 To fix these rooms:')
      console.log('1. Filter out invalid URLs when parsing images')
      console.log('2. Update the database with only valid URLs')
      console.log('3. Or clear the room_images field if no valid URLs remain')
    } else {
      console.log('✅ All rooms have valid image data')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkRoomWithInvalidImages()