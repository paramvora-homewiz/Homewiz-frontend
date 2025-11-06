import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function testImageUpload() {
  console.log('🧪 Testing image upload to building-images bucket...\n')
  
  try {
    // Create a test file (1x1 transparent PNG)
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    const buffer = Buffer.from(base64, 'base64')
    const blob = new Blob([buffer], { type: 'image/png' })
    const testFile = new File([blob], 'test-image.png', { type: 'image/png' })
    
    const testPath = `test/test-${Date.now()}.png`
    
    console.log('📤 Uploading test image to:', testPath)
    console.log('File size:', testFile.size, 'bytes')
    
    // Try to upload
    const { data, error } = await supabase.storage
      .from('building-images')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: true
      })
      
    if (error) {
      console.error('❌ Upload failed:', error)
      
      if (error.message.includes('not found')) {
        console.log('\n⚠️ The building-images bucket does not exist!')
        console.log('Please create it in your Supabase dashboard.')
      } else if (error.message.includes('policy')) {
        console.log('\n⚠️ Storage policy issue detected!')
        console.log('The bucket might exist but uploads are blocked by RLS policies.')
      }
    } else {
      console.log('✅ Upload successful!')
      console.log('Upload data:', data)
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('building-images')
        .getPublicUrl(testPath)
        
      console.log('\n🔗 Public URL:', urlData.publicUrl)
      
      // Try to list the uploaded file
      console.log('\n📂 Verifying upload...')
      const { data: files, error: listError } = await supabase.storage
        .from('building-images')
        .list('test', { limit: 10 })
        
      if (listError) {
        console.log('⚠️ Cannot list files:', listError.message)
      } else {
        console.log('Files in test folder:', files?.map(f => f.name) || 'None')
      }
      
      // Clean up - delete test file
      console.log('\n🧹 Cleaning up test file...')
      const { error: deleteError } = await supabase.storage
        .from('building-images')
        .remove([testPath])
        
      if (deleteError) {
        console.log('⚠️ Could not delete test file:', deleteError.message)
      } else {
        console.log('✅ Test file deleted')
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testImageUpload()