import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSupabaseStorageImages() {
  console.log('🔍 Looking for rooms with Supabase storage images...\n')
  console.log('Supabase URL:', supabaseUrl)
  
  try {
    // Get all rooms with images
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .not('room_images', 'is', null)
      .limit(50)
      
    if (error) {
      console.error('❌ Error fetching rooms:', error)
      return
    }
    
    if (!rooms || rooms.length === 0) {
      console.log('⚠️ No rooms found with images')
      return
    }
    
    console.log(`Found ${rooms.length} rooms with images. Analyzing...\n`)
    
    let supabaseImageCount = 0
    let externalImageCount = 0
    let invalidImageCount = 0
    
    for (const room of rooms) {
      let imageUrls: string[] = []
      
      // Parse images
      try {
        if (typeof room.room_images === 'string') {
          if (room.room_images.startsWith('[')) {
            imageUrls = JSON.parse(room.room_images)
          } else if (room.room_images.startsWith('http')) {
            imageUrls = [room.room_images]
          }
        }
      } catch (e) {
        invalidImageCount++
        continue
      }
      
      for (const url of imageUrls) {
        if (url.includes(supabaseUrl)) {
          supabaseImageCount++
          console.log(`✅ Supabase image found in Room ${room.room_number}: ${url}`)
        } else if (url.startsWith('http')) {
          externalImageCount++
        } else {
          invalidImageCount++
        }
      }
    }
    
    console.log('\n📊 Summary:')
    console.log(`- Supabase storage images: ${supabaseImageCount}`)
    console.log(`- External URLs: ${externalImageCount}`)
    console.log(`- Invalid formats: ${invalidImageCount}`)
    
    // Check storage buckets
    console.log('\n🪣 Checking storage buckets...')
    const { data: buckets } = await supabase.storage.listBuckets()
    
    if (buckets && buckets.length > 0) {
      console.log(`Found ${buckets.length} buckets:`)
      for (const bucket of buckets) {
        console.log(`- ${bucket.name} (${bucket.public ? 'PUBLIC' : 'PRIVATE'})`)
        
        // List some files in each bucket
        const { data: files } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 5 })
          
        if (files && files.length > 0) {
          console.log(`  Contains ${files.length} files (showing first 5)`)
        }
      }
    } else {
      console.log('⚠️ No storage buckets found. You need to create a bucket for images.')
    }
    
    // Provide solution
    console.log('\n\n💡 Solution:')
    console.log('The issue is that room images are using external URLs that are not accessible.')
    console.log('\nTo fix this:')
    console.log('1. Create a public storage bucket in Supabase (e.g., "room-images")')
    console.log('2. Upload room images to Supabase storage instead of using external URLs')
    console.log('3. Update the image upload logic to use Supabase storage')
    console.log('4. Update existing room records to use valid image URLs')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

checkSupabaseStorageImages()