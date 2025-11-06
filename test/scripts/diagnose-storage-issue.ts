import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('🔍 Diagnosing storage issue...\n')
console.log('Supabase URL:', supabaseUrl)
console.log('Has Anon Key:', !!supabaseKey)

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseStorage() {
  console.log('\n📦 Checking storage buckets...')
  
  try {
    // Try to list buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError)
      console.log('\nPossible causes:')
      console.log('1. Storage is not enabled in your Supabase project')
      console.log('2. RLS policies are blocking access')
      console.log('3. Invalid credentials')
    } else {
      console.log('✅ Successfully connected to storage')
      console.log('Available buckets:', buckets?.map(b => b.name) || 'None')
      
      if (!buckets || buckets.length === 0) {
        console.log('\n⚠️ No storage buckets found!')
        console.log('\n📋 Manual setup instructions:')
        console.log('1. Go to your Supabase dashboard: ' + supabaseUrl)
        console.log('2. Navigate to Storage section (left sidebar)')
        console.log('3. Click "New bucket"')
        console.log('4. Create a bucket named: building-images')
        console.log('5. Set "Public bucket" to ON')
        console.log('6. Click "Save"')
        console.log('\n💡 After creating the bucket, room images should start working!')
      }
    }
    
    // Try to access building-images bucket directly
    console.log('\n🏗️ Attempting to access building-images bucket...')
    const { data: files, error: filesError } = await supabase.storage
      .from('building-images')
      .list('', { limit: 1 })
      
    if (filesError) {
      console.log('❌ Cannot access building-images bucket:', filesError.message)
      if (filesError.message.includes('not found')) {
        console.log('➡️ The bucket does not exist. Please create it in Supabase dashboard.')
      }
    } else {
      console.log('✅ building-images bucket is accessible!')
    }
    
    // Check if we can get public URLs
    console.log('\n🔗 Testing public URL generation...')
    const { data: urlData } = supabase.storage
      .from('building-images')
      .getPublicUrl('test.jpg')
    
    console.log('Public URL pattern:', urlData.publicUrl)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

diagnoseStorage()