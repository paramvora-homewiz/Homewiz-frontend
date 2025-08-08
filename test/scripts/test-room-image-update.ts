import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRoomImageUpdate() {
  console.log('🧪 Testing room image update process...\n')
  
  const roomId = 'BLDG_1080_FOLSOM_R002'
  
  try {
    // 1. Get current room data
    const { data: room, error: fetchError } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, room_images')
      .eq('room_id', roomId)
      .single()
      
    if (fetchError || !room) {
      console.error('❌ Error fetching room:', fetchError)
      return
    }
    
    console.log('Current room state:')
    console.log('- Room ID:', room.room_id)
    console.log('- Current images:', room.room_images)
    console.log('- Type:', typeof room.room_images)
    
    // 2. Parse current images
    let currentImages: string[] = []
    if (room.room_images) {
      if (typeof room.room_images === 'string' && room.room_images.startsWith('[')) {
        try {
          currentImages = JSON.parse(room.room_images)
          console.log('- Parsed as array:', currentImages.length, 'images')
        } catch (e) {
          console.log('- Failed to parse as JSON')
        }
      } else if (typeof room.room_images === 'string') {
        currentImages = [room.room_images]
        console.log('- Single URL converted to array')
      }
    }
    
    // 3. Add a test image
    const newTestImage = `https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/${room.building_id}/rooms/${room.room_id}/images/test-${Date.now()}.jpg`
    const updatedImages = [...currentImages, newTestImage]
    
    console.log('\n📝 Testing image update:')
    console.log('- Adding test image')
    console.log('- New total:', updatedImages.length, 'images')
    
    // 4. Update room with new images array
    const updateValue = JSON.stringify(updatedImages)
    console.log('- Update value:', updateValue)
    
    const { data: updateData, error: updateError } = await supabase
      .from('rooms')
      .update({ room_images: updateValue })
      .eq('room_id', roomId)
      .select()
      .single()
      
    if (updateError) {
      console.error('❌ Update error:', updateError)
      return
    }
    
    console.log('\n✅ Update successful!')
    console.log('- Updated room_images:', updateData.room_images)
    
    // 5. Verify the update
    const { data: verifyData } = await supabase
      .from('rooms')
      .select('room_images')
      .eq('room_id', roomId)
      .single()
      
    console.log('\n🔍 Verification:')
    console.log('- Stored value:', verifyData?.room_images)
    
    if (verifyData?.room_images) {
      try {
        const verifiedImages = JSON.parse(verifyData.room_images)
        console.log('- Parsed images:', verifiedImages.length)
        console.log('- Images:', verifiedImages)
      } catch (e) {
        console.log('- Not a JSON array')
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testRoomImageUpdate()