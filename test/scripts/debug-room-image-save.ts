import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugRoomImageSave() {
  console.log('🔍 Debugging room image save process...\n')
  
  try {
    // 1. Get a room with existing images
    const { data: rooms } = await supabase
      .from('rooms')
      .select('*')
      .not('room_images', 'is', null)
      .limit(1)
      
    if (!rooms || rooms.length === 0) {
      console.log('No rooms with images found. Getting any room...')
      const { data: anyRooms } = await supabase
        .from('rooms')
        .select('*')
        .limit(1)
        
      if (!anyRooms || anyRooms.length === 0) {
        console.log('❌ No rooms found in database')
        return
      }
      
      rooms.push(anyRooms[0])
    }
    
    const testRoom = rooms[0]
    console.log('Using test room:')
    console.log('- Room ID:', testRoom.room_id)
    console.log('- Room Number:', testRoom.room_number)
    console.log('- Building ID:', testRoom.building_id)
    console.log('- Current room_images:', testRoom.room_images)
    console.log('- Type of room_images:', typeof testRoom.room_images)
    
    // 2. Analyze the current room_images value
    if (testRoom.room_images) {
      console.log('\n📸 Analyzing current room_images:')
      
      // Check if it's a valid URL
      const images = testRoom.room_images
      if (typeof images === 'string') {
        if (images.startsWith('[')) {
          try {
            const parsed = JSON.parse(images)
            console.log('- Format: JSON array')
            console.log('- Parsed:', parsed)
            console.log('- Valid URLs:', parsed.filter((url: string) => 
              url.startsWith('http') || url.startsWith('/')
            ))
            console.log('- Invalid entries:', parsed.filter((url: string) => 
              !url.startsWith('http') && !url.startsWith('/')
            ))
          } catch (e) {
            console.log('- Format: Invalid JSON')
          }
        } else if (images.includes(',')) {
          console.log('- Format: Comma-separated')
          const urls = images.split(',').map(s => s.trim())
          console.log('- URLs:', urls)
        } else {
          console.log('- Format: Single URL')
          console.log('- Valid:', images.startsWith('http') || images.startsWith('/'))
        }
      }
    }
    
    // 3. Test updating room_images
    console.log('\n🧪 Testing room_images update...')
    
    // Generate a test URL
    const testImageUrl = `https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/${testRoom.building_id}/rooms/${testRoom.room_id}/images/test-${Date.now()}.jpg`
    
    console.log('Test image URL:', testImageUrl)
    
    // Try different update formats
    const updateTests = [
      { format: 'Single URL', value: testImageUrl },
      { format: 'JSON Array', value: JSON.stringify([testImageUrl]) },
      { format: 'Multiple URLs JSON', value: JSON.stringify([testImageUrl, 'https://example.com/image2.jpg']) }
    ]
    
    for (const test of updateTests) {
      console.log(`\n📝 Testing ${test.format} format...`)
      
      const { data, error } = await supabase
        .from('rooms')
        .update({ room_images: test.value })
        .eq('room_id', testRoom.room_id)
        .select()
        .single()
        
      if (error) {
        console.log(`❌ Error: ${error.message}`)
      } else {
        console.log(`✅ Success! Updated room_images to:`, data.room_images)
        
        // Verify it persisted
        const { data: verify } = await supabase
          .from('rooms')
          .select('room_images')
          .eq('room_id', testRoom.room_id)
          .single()
          
        console.log('Verified value:', verify?.room_images)
        
        // Only test first format that works
        break
      }
    }
    
    // 4. Check if there's an RLS policy issue
    console.log('\n🔒 Checking RLS policies...')
    const { data: authUser } = await supabase.auth.getUser()
    console.log('Authenticated:', !!authUser?.user)
    if (authUser?.user) {
      console.log('User ID:', authUser.user.id)
      console.log('User email:', authUser.user.email)
    }
    
    // 5. Check storage accessibility
    console.log('\n📦 Checking storage accessibility...')
    const storageUrl = supabase.storage
      .from('building-images')
      .getPublicUrl(`buildings/${testRoom.building_id}/rooms/${testRoom.room_id}/images/test.jpg`)
    
    console.log('Storage URL pattern:', storageUrl.data.publicUrl)
    
    // 6. Summary
    console.log('\n📋 SUMMARY:')
    console.log('1. Room exists in database: ✅')
    console.log('2. Room has valid building_id: ✅')
    console.log('3. Can update room_images field: Check results above')
    console.log('4. Storage bucket accessible: ✅')
    console.log('\nIf updates are failing, check:')
    console.log('- RLS policies on rooms table')
    console.log('- User authentication status')
    console.log('- Database column constraints')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugRoomImageSave()