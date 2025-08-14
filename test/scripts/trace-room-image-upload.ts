import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function traceRoomImageUpload() {
  console.log('🔍 Tracing room image upload issue...\n')
  
  try {
    // 1. Check a room that successfully uploaded images to storage
    console.log('1. Checking room with images in storage...')
    const storageRoomId = 'RM_2ABIIMWE1DN'
    const storageBuildingId = 'BLD_1751317535295_ww2uz6ojx'
    
    console.log(`Storage shows images for:`)
    console.log(`  Building: ${storageBuildingId}`)
    console.log(`  Room: ${storageRoomId}`)
    
    // Check if this room exists in database
    const { data: dbRoom, error: dbError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_id', storageRoomId)
      .maybeSingle()
      
    console.log(`\nDatabase check for room ${storageRoomId}:`)
    console.log(`  Exists: ${!!dbRoom}`)
    
    // 2. Check if the building exists
    const { data: dbBuilding } = await supabase
      .from('buildings')
      .select('building_id, building_name')
      .eq('building_id', storageBuildingId)
      .maybeSingle()
      
    console.log(`\nDatabase check for building ${storageBuildingId}:`)
    console.log(`  Exists: ${!!dbBuilding}`)
    
    // 3. Find any recently created rooms
    console.log('\n2. Checking recently created rooms...')
    const { data: recentRooms } = await supabase
      .from('rooms')
      .select('room_id, room_number, building_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      
    if (recentRooms && recentRooms.length > 0) {
      console.log('Recent rooms:')
      recentRooms.forEach(room => {
        const createdDate = new Date(room.created_at)
        const age = Date.now() - createdDate.getTime()
        const ageMinutes = Math.floor(age / 1000 / 60)
        console.log(`  - ${room.room_id} (created ${ageMinutes} minutes ago)`)
      })
    }
    
    // 4. Analysis
    console.log('\n📊 ANALYSIS:')
    console.log('The problem is that the frontend is generating IDs that don\'t match the database.')
    console.log('\nWhen creating a room:')
    console.log('1. Frontend generates temporary IDs (BLD_xxx, RM_xxx)')
    console.log('2. Backend/Database generates actual IDs (BLDG_xxx_Rxxx)')
    console.log('3. Images are uploaded with frontend IDs before getting database IDs')
    console.log('4. Database record can\'t be updated because room doesn\'t exist yet')
    
    console.log('\n💡 SOLUTION:')
    console.log('The room creation flow needs to be:')
    console.log('1. Create room in database first (get real room_id)')
    console.log('2. Upload images using the database-generated room_id')
    console.log('3. Update room record with image URLs')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

traceRoomImageUpload()