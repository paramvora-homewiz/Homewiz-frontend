import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRoomUpdateWithAuth() {
  console.log('🔍 Testing room update with authentication context...\n')
  
  try {
    // 1. Check current auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Auth error:', authError.message)
    }
    
    console.log('Current auth status:')
    console.log('- Authenticated:', !!user)
    if (user) {
      console.log('- User ID:', user.id)
      console.log('- Email:', user.email)
    }
    
    // 2. Get a test room
    const { data: rooms, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .limit(1)
      
    if (roomError) {
      console.log('❌ Error fetching rooms:', roomError)
      console.log('This might be due to RLS policies requiring authentication')
      return
    }
    
    if (!rooms || rooms.length === 0) {
      console.log('❌ No rooms found')
      return
    }
    
    const testRoom = rooms[0]
    console.log('\nTest room:')
    console.log('- ID:', testRoom.room_id)
    console.log('- Building:', testRoom.building_id)
    console.log('- Current images:', testRoom.room_images)
    
    // 3. Try to update the room
    const testUrl = 'https://example.com/test-image.jpg'
    console.log('\n📝 Attempting to update room_images...')
    
    const { data: updateData, error: updateError } = await supabase
      .from('rooms')
      .update({ room_images: testUrl })
      .eq('room_id', testRoom.room_id)
      .select()
      
    if (updateError) {
      console.log('❌ Update error:', updateError)
      console.log('\nPossible causes:')
      console.log('1. RLS policy requires authentication')
      console.log('2. User lacks permission to update rooms')
      console.log('3. Database constraints')
    } else {
      console.log('✅ Update successful!')
      console.log('Updated data:', updateData)
    }
    
    // 4. Check RLS policies
    console.log('\n🔒 Checking table accessibility...')
    
    // Try a simple select
    const { error: selectError } = await supabase
      .from('rooms')
      .select('room_id')
      .limit(1)
      
    console.log('Can SELECT from rooms:', !selectError)
    
    // Try to get count (tests if we can read)
    const { count, error: countError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      
    console.log('Can COUNT rooms:', !countError)
    if (!countError) {
      console.log('Total rooms visible:', count)
    }
    
    console.log('\n💡 RECOMMENDATIONS:')
    if (!user) {
      console.log('1. Frontend needs to be authenticated to update rooms')
      console.log('2. Check if AuthProvider is properly configured')
      console.log('3. Ensure user is logged in before attempting updates')
    } else {
      console.log('1. Check RLS policies on rooms table')
      console.log('2. Verify user has update permissions')
      console.log('3. Check if there are any database triggers blocking updates')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testRoomUpdateWithAuth()