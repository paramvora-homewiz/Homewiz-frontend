import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStorage() {
  console.log('🔍 Checking Supabase storage configuration...\n')
  
  try {
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      return
    }
    
    console.log('📦 Available storage buckets:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`)
    })
    
    // Check for room-images bucket specifically
    const roomImagesBucket = buckets.find(b => b.name === 'room-images')
    if (!roomImagesBucket) {
      console.log('⚠️ room-images bucket not found!')
      
      // List what buckets we do have
      console.log('Available buckets:', buckets.map(b => b.name))
      return
    }
    
    console.log('\n🏠 Checking room-images bucket contents...')
    
    // List files in room-images bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('room-images')
      .list('', { limit: 100 })
      
    if (filesError) {
      console.error('❌ Error listing files:', filesError)
      return
    }
    
    console.log(`Found ${files.length} items in room-images bucket:`)
    files.forEach(file => {
      console.log(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`)
    })
    
    // Check building folders
    const buildingFolders = files.filter(f => !f.name.includes('.'))
    if (buildingFolders.length > 0) {
      console.log('\n🏢 Checking building folders...')
      for (const folder of buildingFolders.slice(0, 3)) {
        const { data: folderFiles, error: folderError } = await supabase.storage
          .from('room-images')
          .list(folder.name, { limit: 10 })
          
        if (!folderError && folderFiles) {
          console.log(`  📁 ${folder.name}: ${folderFiles.length} files`)
          folderFiles.forEach(file => {
            console.log(`    - ${file.name}`)
          })
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkStorage()