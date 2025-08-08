import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseImageUrls() {
  console.log('🔍 Testing Supabase storage image URLs...\n')
  
  const testUrls = [
    'https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/BLDG_1080_FOLSOM/rooms/BLDG_1080_FOLSOM_R004/images/test-1754361885607.jpg',
    'https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/BLDG_1080_FOLSOM/rooms/BLDG_1080_FOLSOM_R001/images/1754368203176_0_2024-05-09.webp'
  ]
  
  for (const url of testUrls) {
    console.log(`\nTesting: ${url}`)
    
    try {
      // Test with fetch
      const response = await fetch(url)
      console.log(`Status: ${response.status}`)
      console.log(`Content-Type: ${response.headers.get('content-type')}`)
      
      if (response.status === 200) {
        console.log('✅ Image is accessible!')
      } else {
        console.log('❌ Image returned error status')
        const text = await response.text()
        console.log('Response:', text.substring(0, 200))
      }
    } catch (error) {
      console.log('❌ Failed to fetch:', error.message)
    }
  }
  
  // Check if building-images bucket exists
  console.log('\n\n🪣 Checking building-images bucket...')
  try {
    const { data, error } = await supabase.storage
      .from('building-images')
      .list('', { limit: 1 })
      
    if (error) {
      console.log('❌ Error accessing building-images bucket:', error.message)
      console.log('\nThe bucket might not exist or might not be public.')
      console.log('\nTo fix this:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Navigate to Storage')
      console.log('3. Create a new bucket called "building-images"')
      console.log('4. Make sure to set it as PUBLIC')
    } else {
      console.log('✅ building-images bucket exists and is accessible')
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error)
  }
}

testSupabaseImageUrls()