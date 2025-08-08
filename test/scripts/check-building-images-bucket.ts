import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBuildingImagesBucket() {
  console.log('🔍 Checking building-images bucket...\n')
  
  try {
    // Check if building-images bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return
    }
    
    console.log('📦 Available storage buckets:')
    if (buckets.length === 0) {
      console.log('  ⚠️ No storage buckets found!')
      console.log('\n💡 To fix this issue:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to Storage section')
      console.log('3. Create a new bucket named "building-images"')
      console.log('4. Make sure it\'s set to PUBLIC if you want images to be accessible')
      return
    }
    
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`)
    })
    
    const buildingImagesBucket = buckets.find(b => b.name === 'building-images')
    if (!buildingImagesBucket) {
      console.log('\n⚠️ building-images bucket not found!')
      console.log('Available buckets:', buckets.map(b => b.name))
      return
    }
    
    console.log('\n✅ building-images bucket exists!')
    console.log(`Public access: ${buildingImagesBucket.public}`)
    
    // List files in building-images bucket
    console.log('\n📂 Checking building-images bucket contents...')
    
    const { data: files, error: filesError } = await supabase.storage
      .from('building-images')
      .list('', { limit: 10 })
      
    if (filesError) {
      console.error('❌ Error listing files:', filesError)
      return
    }
    
    console.log(`Found ${files.length} items in root of building-images bucket`)
    
    // Check for buildings folder
    const buildingFolders = files.filter(f => f.name === 'buildings' || f.name.startsWith('buildings'))
    if (buildingFolders.length > 0) {
      console.log('\n🏢 Found buildings folder!')
      
      // List contents of buildings folder
      const { data: buildingContents, error: buildingError } = await supabase.storage
        .from('building-images')
        .list('buildings', { limit: 5 })
        
      if (!buildingError && buildingContents) {
        console.log(`  📁 buildings/: ${buildingContents.length} items`)
        buildingContents.slice(0, 5).forEach(item => {
          console.log(`    - ${item.name}`)
        })
        
        // Check for a specific building folder
        if (buildingContents.length > 0) {
          const firstBuilding = buildingContents[0]
          if (!firstBuilding.name.includes('.')) { // It's a folder
            const { data: roomsFolder, error: roomsError } = await supabase.storage
              .from('building-images')
              .list(`buildings/${firstBuilding.name}/rooms`, { limit: 3 })
              
            if (!roomsError && roomsFolder) {
              console.log(`\n  📁 buildings/${firstBuilding.name}/rooms/: ${roomsFolder.length} items`)
              roomsFolder.forEach(room => {
                console.log(`    - ${room.name}`)
              })
            }
          }
        }
      }
    } else {
      console.log('\n⚠️ No buildings folder found in building-images bucket')
      console.log('Available items:', files.map(f => f.name))
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkBuildingImagesBucket()