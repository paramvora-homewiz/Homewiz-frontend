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

// Test if an image URL is valid
async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    // Skip external URLs that we know are invalid
    if (url.includes('urbanests.com')) {
      return false
    }
    
    // For Supabase URLs, check if they exist
    if (url.includes(supabaseUrl)) {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    }
    
    // Test other URLs
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok && response.headers.get('content-type')?.startsWith('image/')
  } catch (error) {
    return false
  }
}

// Parse images from various formats
function parseImages(images: any): string[] {
  if (!images) return []
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      // Try comma-separated
      return images.split(',').map(img => img.trim()).filter(Boolean)
    }
  }
  if (Array.isArray(images)) return images
  return []
}

async function fixInvalidRoomImages() {
  console.log('🔍 Fetching all rooms with images...')
  
  // Get all rooms with images
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('room_id, room_images')
    .not('room_images', 'is', null)
  
  if (error) {
    console.error('Error fetching rooms:', error)
    return
  }
  
  console.log(`Found ${rooms?.length || 0} rooms with images`)
  
  let fixedCount = 0
  let removedCount = 0
  
  for (const room of rooms || []) {
    const images = parseImages(room.room_images)
    if (images.length === 0) continue
    
    console.log(`\nChecking room ${room.room_id} (${images.length} images)...`)
    
    // Test each image
    const validImages: string[] = []
    for (const image of images) {
      const isValid = await isValidImageUrl(image)
      if (isValid) {
        validImages.push(image)
        console.log(`  ✅ Valid: ${image.substring(0, 50)}...`)
      } else {
        console.log(`  ❌ Invalid: ${image.substring(0, 50)}...`)
        removedCount++
      }
    }
    
    // Update room if we removed any images
    if (validImages.length !== images.length) {
      const newImages = validImages.length > 0 ? JSON.stringify(validImages) : null
      
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ room_images: newImages })
        .eq('room_id', room.room_id)
      
      if (updateError) {
        console.error(`Failed to update room ${room.room_id}:`, updateError)
      } else {
        console.log(`  📝 Updated room ${room.room_id}: ${images.length} -> ${validImages.length} images`)
        fixedCount++
      }
    }
  }
  
  console.log('\n✨ Cleanup complete!')
  console.log(`Fixed ${fixedCount} rooms`)
  console.log(`Removed ${removedCount} invalid images`)
  
  // Also check buildings
  console.log('\n🏢 Checking building images...')
  
  const { data: buildings, error: buildingError } = await supabase
    .from('buildings')
    .select('building_id, building_images')
    .not('building_images', 'is', null)
  
  if (!buildingError && buildings) {
    let buildingFixedCount = 0
    let buildingRemovedCount = 0
    
    for (const building of buildings) {
      const images = parseImages(building.building_images)
      if (images.length === 0) continue
      
      const validImages: string[] = []
      for (const image of images) {
        const isValid = await isValidImageUrl(image)
        if (isValid) {
          validImages.push(image)
        } else {
          buildingRemovedCount++
        }
      }
      
      if (validImages.length !== images.length) {
        const newImages = validImages.length > 0 ? JSON.stringify(validImages) : null
        
        const { error: updateError } = await supabase
          .from('buildings')
          .update({ building_images: newImages })
          .eq('building_id', building.building_id)
        
        if (!updateError) {
          buildingFixedCount++
        }
      }
    }
    
    console.log(`Fixed ${buildingFixedCount} buildings`)
    console.log(`Removed ${buildingRemovedCount} invalid building images`)
  }
}

// Run the fix
fixInvalidRoomImages().catch(console.error)