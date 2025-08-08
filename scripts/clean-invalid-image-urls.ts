import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function cleanInvalidImageUrls() {
  console.log('🧹 Cleaning invalid image URLs from database...\n')
  
  try {
    // Find rooms with images.urbanests.com URLs
    const { data: rooms } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .like('room_images', '%images.urbanests.com%')
      .limit(100)
      
    if (!rooms || rooms.length === 0) {
      console.log('✅ No rooms found with images.urbanests.com URLs')
      return
    }
    
    console.log(`Found ${rooms.length} rooms with potentially invalid URLs\n`)
    
    let cleaned = 0
    let errors = 0
    
    for (const room of rooms) {
      console.log(`Processing room ${room.room_number} (${room.room_id})...`)
      
      let updatedImages: string | null = null
      
      // Parse and filter images
      if (typeof room.room_images === 'string') {
        if (room.room_images.startsWith('[')) {
          try {
            const images = JSON.parse(room.room_images)
            // Filter out images.urbanests.com URLs
            const validImages = images.filter((url: string) => 
              !url.includes('images.urbanests.com')
            )
            
            if (validImages.length > 0) {
              updatedImages = JSON.stringify(validImages)
              console.log(`  Keeping ${validImages.length} valid images`)
            } else {
              updatedImages = null
              console.log('  No valid images remaining, clearing field')
            }
          } catch (e) {
            console.log('  ❌ Failed to parse JSON')
            errors++
            continue
          }
        } else if (room.room_images.includes('images.urbanests.com')) {
          // Single URL that's invalid
          updatedImages = null
          console.log('  Clearing invalid single URL')
        }
      }
      
      // Update the room
      const { error } = await supabase
        .from('rooms')
        .update({ room_images: updatedImages })
        .eq('room_id', room.room_id)
        
      if (error) {
        console.log(`  ❌ Update failed: ${error.message}`)
        errors++
      } else {
        console.log('  ✅ Updated successfully')
        cleaned++
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`- Cleaned: ${cleaned} rooms`)
    console.log(`- Errors: ${errors} rooms`)
    console.log(`\n✅ Cleanup complete!`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Add confirmation prompt
console.log('⚠️  This will remove all images.urbanests.com URLs from your database.')
console.log('These appear to be test/placeholder URLs that don\'t resolve.\n')
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...')

setTimeout(() => {
  cleanInvalidImageUrls()
}, 5000)