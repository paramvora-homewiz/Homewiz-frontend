import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseImageLoadingIssue() {
  console.log('🔍 Diagnosing Room Image Loading Issues...\n')
  
  try {
    // Step 1: Get a room with images
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .not('room_images', 'is', null)
      .limit(5)
      
    if (error) {
      console.error('❌ Error fetching rooms:', error)
      return
    }
    
    if (!rooms || rooms.length === 0) {
      console.log('⚠️ No rooms found with images')
      return
    }
    
    console.log(`Found ${rooms.length} rooms with images. Analyzing...\n`)
    
    for (const room of rooms) {
      console.log(`\n📦 Room ${room.room_number} (${room.room_id})`)
      console.log('Building:', room.building_id)
      console.log('room_images field:', room.room_images)
      console.log('Type:', typeof room.room_images)
      
      // Parse the images
      let imageUrls: string[] = []
      try {
        if (typeof room.room_images === 'string') {
          if (room.room_images.startsWith('[')) {
            // JSON array
            imageUrls = JSON.parse(room.room_images)
            console.log('Parsed as JSON array:', imageUrls.length, 'images')
          } else if (room.room_images.startsWith('http')) {
            // Single URL
            imageUrls = [room.room_images]
            console.log('Single URL detected')
          } else {
            console.log('⚠️ Unknown format:', room.room_images.substring(0, 50) + '...')
          }
        }
      } catch (e) {
        console.log('❌ Failed to parse images:', e.message)
      }
      
      // Check each image URL
      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i]
        console.log(`\n  Image ${i + 1}: ${url}`)
        
        // Check URL format
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          console.log('  ⚠️ Invalid URL format - not starting with http/https')
          continue
        }
        
        // Check if it's a Supabase storage URL
        if (url.includes(supabaseUrl)) {
          console.log('  ✅ Supabase storage URL detected')
          
          // Extract bucket and path
          const urlParts = url.split('/storage/v1/object/public/')
          if (urlParts.length > 1) {
            const [bucket, ...pathParts] = urlParts[1].split('/')
            const path = pathParts.join('/')
            console.log(`  Bucket: ${bucket}`)
            console.log(`  Path: ${path}`)
            
            // Check if the file exists in storage
            const { data: files } = await supabase
              .storage
              .from(bucket)
              .list(path.split('/').slice(0, -1).join('/'), {
                limit: 100,
                search: path.split('/').pop()
              })
              
            if (files && files.length > 0) {
              console.log('  ✅ File exists in storage')
            } else {
              console.log('  ❌ File NOT found in storage')
            }
          }
        } else {
          console.log('  ℹ️ External URL')
        }
        
        // Test if URL is accessible (only for first image to avoid too many requests)
        if (i === 0) {
          try {
            console.log('  🔗 Testing URL accessibility...')
            const response = await fetch(url, { method: 'HEAD' })
            console.log(`  Response status: ${response.status}`)
            console.log(`  Content-Type: ${response.headers.get('content-type')}`)
            
            if (response.status === 200) {
              console.log('  ✅ URL is accessible')
            } else {
              console.log('  ❌ URL returned error status')
            }
          } catch (fetchError) {
            console.log('  ❌ Failed to fetch URL:', fetchError.message)
            if (fetchError.message.includes('CORS')) {
              console.log('  ℹ️ This might be a CORS issue')
            }
          }
        }
      }
    }
    
    // Check storage bucket configuration
    console.log('\n\n🪣 Checking Storage Bucket Configuration...')
    
    // List buckets
    const { data: buckets } = await supabase.storage.listBuckets()
    
    if (buckets) {
      console.log(`\nFound ${buckets.length} buckets:`)
      for (const bucket of buckets) {
        console.log(`- ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
      }
    }
    
    // Provide recommendations
    console.log('\n\n💡 Recommendations:')
    console.log('1. Ensure all image URLs are properly formatted (start with http/https)')
    console.log('2. For Supabase storage, ensure the bucket is set to PUBLIC')
    console.log('3. Check if images exist in storage and haven\'t been deleted')
    console.log('4. Verify CORS settings on Supabase dashboard if external URLs fail')
    console.log('5. Consider using signed URLs for private buckets')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

diagnoseImageLoadingIssue()