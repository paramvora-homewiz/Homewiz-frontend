import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { uploadRoomImages } from '../src/lib/supabase/storage'
import { RoomFormIntegration } from '../src/lib/supabase/form-integration'

dotenv.config({ path: '.env.local' })

console.log('ENV check:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFullRoomImageFlow() {
  console.log('🧪 Testing full room image upload flow...\n')
  
  const roomId = 'BLDG_1080_FOLSOM_R002'
  const buildingId = 'BLDG_1080_FOLSOM'
  
  try {
    // 1. Get current room state
    console.log('1️⃣ Getting current room state...')
    const { data: room } = await supabase
      .from('rooms')
      .select('room_images')
      .eq('room_id', roomId)
      .single()
      
    console.log('Current room_images:', room?.room_images)
    
    // 2. Create a test file
    console.log('\n2️⃣ Creating test image file...')
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const blob = await fetch(testImageData).then(r => r.blob())
    const testFile = new File([blob], `test-${Date.now()}.png`, { type: 'image/png' })
    console.log('Created test file:', testFile.name, testFile.size, 'bytes')
    
    // 3. Upload to storage
    console.log('\n3️⃣ Uploading to storage...')
    const uploadResults = await uploadRoomImages(buildingId, roomId, [testFile])
    console.log('Upload results:', uploadResults)
    
    if (uploadResults[0]?.success) {
      console.log('✅ Upload successful!')
      console.log('URL:', uploadResults[0].url)
      
      // 4. Update database
      console.log('\n4️⃣ Updating database...')
      
      // Parse existing images
      let existingImages: string[] = []
      if (room?.room_images) {
        try {
          existingImages = JSON.parse(room.room_images)
        } catch {
          if (typeof room.room_images === 'string') {
            existingImages = [room.room_images]
          }
        }
      }
      
      // Add new image
      const allImages = [...existingImages, uploadResults[0].url]
      console.log(`Updating with ${allImages.length} total images`)
      
      const updateResult = await RoomFormIntegration.updateRoomImages(roomId, allImages)
      console.log('Update result:', updateResult)
      
      // 5. Verify
      console.log('\n5️⃣ Verifying update...')
      const { data: updatedRoom } = await supabase
        .from('rooms')
        .select('room_images')
        .eq('room_id', roomId)
        .single()
        
      console.log('Updated room_images:', updatedRoom?.room_images)
      
      if (updatedRoom?.room_images) {
        try {
          const finalImages = JSON.parse(updatedRoom.room_images)
          console.log(`✅ Success! Room now has ${finalImages.length} images`)
        } catch {
          console.log('Room images not in JSON format')
        }
      }
      
    } else {
      console.log('❌ Upload failed:', uploadResults[0]?.error)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testFullRoomImageFlow()