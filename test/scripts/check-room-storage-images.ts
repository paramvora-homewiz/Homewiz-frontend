import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRoomStorageImages() {
  console.log('🔍 Checking room images in storage...\n')
  
  const roomId = 'BLDG_1080_FOLSOM_R002'
  const buildingId = 'BLDG_1080_FOLSOM'
  const storagePath = `buildings/${buildingId}/rooms/${roomId}/images`
  
  try {
    // 1. List files in room's image folder
    console.log(`📂 Checking storage path: ${storagePath}`)
    
    const { data: files, error } = await supabase.storage
      .from('building-images')
      .list(storagePath)
      
    if (error) {
      console.error('❌ Error listing files:', error)
      return
    }
    
    console.log(`\nFound ${files?.length || 0} files in storage:`)
    
    if (files && files.length > 0) {
      files.forEach((file, idx) => {
        const fullUrl = supabase.storage
          .from('building-images')
          .getPublicUrl(`${storagePath}/${file.name}`)
          
        console.log(`\n${idx + 1}. ${file.name}`)
        console.log(`   Size: ${file.metadata?.size || 'unknown'}`)
        console.log(`   Last modified: ${file.updated_at || file.created_at || 'unknown'}`)
        console.log(`   URL: ${fullUrl.data.publicUrl}`)
      })
    } else {
      console.log('No files found in this path')
    }
    
    // 2. Get room data from database
    console.log('\n📊 Checking database record...')
    const { data: room } = await supabase
      .from('rooms')
      .select('room_images')
      .eq('room_id', roomId)
      .single()
      
    if (room?.room_images) {
      console.log('Database room_images:', room.room_images)
      
      try {
        const dbImages = JSON.parse(room.room_images)
        console.log(`Database has ${dbImages.length} image URLs`)
        
        // Compare with storage
        console.log('\n🔄 Comparing database vs storage:')
        console.log(`- Storage files: ${files?.length || 0}`)
        console.log(`- Database URLs: ${dbImages.length}`)
        
        if (files && files.length > dbImages.length) {
          console.log('⚠️ More files in storage than URLs in database!')
          console.log('Some uploads may not have been saved to the database.')
        } else if (files && files.length < dbImages.length) {
          console.log('⚠️ More URLs in database than files in storage!')
          console.log('Some files may have been deleted from storage.')
        } else {
          console.log('✅ Database and storage appear to be in sync')
        }
      } catch (e) {
        console.log('Could not parse room_images as JSON')
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkRoomStorageImages()