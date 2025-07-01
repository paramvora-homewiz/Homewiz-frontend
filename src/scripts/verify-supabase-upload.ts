/**
 * Script to verify Supabase upload functionality
 * Run with: npx tsx src/scripts/verify-supabase-upload.ts
 */

import { supabaseClient } from '@/lib/supabase/client'
import { isSupabaseAvailable } from '@/lib/supabase/storage'

async function verifySupabaseUpload() {
  console.log('🔍 Verifying Supabase configuration...\n')

  // Check if Supabase is available
  const isAvailable = isSupabaseAvailable()
  console.log(`✅ Supabase Available: ${isAvailable}`)

  if (!isAvailable) {
    console.error('❌ Supabase is not properly configured')
    return
  }

  try {
    // Test database connection
    console.log('\n📊 Testing database connection...')
    const { data: buildings, error: dbError } = await supabaseClient
      .getClient()
      .from('buildings')
      .select('building_id, building_name')
      .limit(1)

    if (dbError) {
      console.error('❌ Database connection failed:', dbError)
    } else {
      console.log('✅ Database connection successful')
      console.log(`   Found ${buildings?.length || 0} buildings`)
    }

    // Check storage buckets
    console.log('\n📦 Checking storage buckets...')
    const { data: buckets, error: bucketError } = await supabaseClient
      .getClient()
      .storage
      .listBuckets()

    if (bucketError) {
      console.error('❌ Storage bucket check failed:', bucketError)
    } else {
      console.log('✅ Storage buckets accessible')
      const buildingImagesBucket = buckets?.find(b => b.name === 'building-images')
      if (buildingImagesBucket) {
        console.log('   ✅ building-images bucket exists')
      } else {
        console.log('   ⚠️  building-images bucket not found')
      }
    }

    // Test a simple file upload
    console.log('\n📤 Testing file upload...')
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const testPath = `test/verify-${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabaseClient
      .getClient()
      .storage
      .from('building-images')
      .upload(testPath, testFile)

    if (uploadError) {
      console.error('❌ File upload test failed:', uploadError)
    } else {
      console.log('✅ File upload successful')
      console.log(`   Path: ${uploadData.path}`)

      // Clean up test file
      await supabaseClient
        .getClient()
        .storage
        .from('building-images')
        .remove([testPath])
    }

    console.log('\n✅ All checks completed!')

  } catch (error) {
    console.error('\n❌ Verification failed with error:', error)
  }
}

// Run the verification
verifySupabaseUpload()