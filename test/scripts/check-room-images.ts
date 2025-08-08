import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRoomImages() {
  console.log('🔍 Checking for room images in storage...\n')
  
  try {
    // List contents of buildings folder
    console.log('📂 Checking buildings/ folder...')
    const { data: buildingsList, error: buildingsError } = await supabase.storage
      .from('building-images')
      .list('buildings', { limit: 100 })
      
    if (buildingsError) {
      console.log('❌ Error listing buildings folder:', buildingsError.message)
      return
    }
    
    if (!buildingsList || buildingsList.length === 0) {
      console.log('⚠️ No items found in buildings/ folder')
      console.log('This suggests no building or room images have been uploaded yet.')
      return
    }
    
    console.log(`Found ${buildingsList.length} items in buildings/ folder`)
    
    // Look for folders (building IDs)
    const buildingFolders = buildingsList.filter(item => !item.name.includes('.'))
    console.log(`\n🏢 Found ${buildingFolders.length} building folders:`)
    
    for (const building of buildingFolders.slice(0, 5)) {
      console.log(`\n📁 Building: ${building.name}`)
      
      // Check for rooms folder in this building
      const { data: roomsList, error: roomsError } = await supabase.storage
        .from('building-images')
        .list(`buildings/${building.name}/rooms`, { limit: 10 })
        
      if (roomsError) {
        console.log(`  ⚠️ No rooms folder or error: ${roomsError.message}`)
        continue
      }
      
      if (roomsList && roomsList.length > 0) {
        console.log(`  Found ${roomsList.length} room folders`)
        
        // Check first room for images
        const roomFolders = roomsList.filter(item => !item.name.includes('.'))
        if (roomFolders.length > 0) {
          const firstRoom = roomFolders[0]
          
          const { data: imagesList, error: imagesError } = await supabase.storage
            .from('building-images')
            .list(`buildings/${building.name}/rooms/${firstRoom.name}/images`, { limit: 5 })
            
          if (!imagesError && imagesList && imagesList.length > 0) {
            console.log(`    📸 Room ${firstRoom.name} has ${imagesList.length} images:`)
            imagesList.forEach(img => {
              const url = supabase.storage
                .from('building-images')
                .getPublicUrl(`buildings/${building.name}/rooms/${firstRoom.name}/images/${img.name}`)
              console.log(`      - ${img.name}`)
              console.log(`        URL: ${url.data.publicUrl}`)
            })
          } else {
            console.log(`    ⚠️ Room ${firstRoom.name} has no images in images/ folder`)
          }
        }
      } else {
        console.log('  ⚠️ No rooms found for this building')
      }
    }
    
    // Also check if there are any direct images in buildings folder
    console.log('\n📸 Checking for direct building images...')
    const directImages = buildingsList.filter(item => item.name.includes('.'))
    if (directImages.length > 0) {
      console.log(`Found ${directImages.length} direct images in buildings/ folder:`)
      directImages.slice(0, 5).forEach(img => {
        console.log(`  - ${img.name}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkRoomImages()