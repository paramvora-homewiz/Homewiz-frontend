/**
 * Test script to verify video upload functionality to Supabase
 */

import { uploadBuildingVideo, isSupabaseAvailable } from '@/lib/supabase/storage'

async function testVideoUpload() {
  console.log('🎥 Testing Video Upload to Supabase...\n')

  // Check if Supabase is available
  if (!isSupabaseAvailable()) {
    console.error('❌ Supabase is not available. Check your environment variables:')
    console.log('   - NEXT_PUBLIC_SUPABASE_URL')
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return
  }

  console.log('✅ Supabase client is available')

  // Test video file types and sizes
  const testCases = [
    {
      name: 'Small MP4 Video',
      type: 'video/mp4',
      size: 5 * 1024 * 1024, // 5MB
      shouldPass: true
    },
    {
      name: 'Large MP4 Video',
      type: 'video/mp4', 
      size: 60 * 1024 * 1024, // 60MB (should fail)
      shouldPass: false
    },
    {
      name: 'WebM Video',
      type: 'video/webm',
      size: 10 * 1024 * 1024, // 10MB
      shouldPass: true
    },
    {
      name: 'Unsupported Video Type',
      type: 'video/avi',
      size: 5 * 1024 * 1024, // 5MB
      shouldPass: false
    }
  ]

  const buildingId = `TEST_BUILDING_${Date.now()}`

  for (const testCase of testCases) {
    console.log(`\n📹 Testing: ${testCase.name}`)
    console.log(`   Type: ${testCase.type}`)
    console.log(`   Size: ${(testCase.size / (1024 * 1024)).toFixed(1)}MB`)
    console.log(`   Expected: ${testCase.shouldPass ? 'PASS' : 'FAIL'}`)

    try {
      // Create a mock file for testing
      const mockFileContent = new Uint8Array(testCase.size).fill(0)
      const mockFile = new File([mockFileContent], `test-video.${testCase.type.split('/')[1]}`, {
        type: testCase.type
      })

      const result = await uploadBuildingVideo(buildingId, mockFile)

      if (testCase.shouldPass) {
        if (result.success) {
          console.log(`   ✅ PASS: Upload successful`)
          console.log(`   📁 URL: ${result.url}`)
          console.log(`   📂 Path: ${result.path}`)
        } else {
          console.log(`   ❌ FAIL: Expected success but got error: ${result.error}`)
        }
      } else {
        if (!result.success) {
          console.log(`   ✅ PASS: Upload correctly rejected: ${result.error}`)
        } else {
          console.log(`   ❌ FAIL: Expected failure but upload succeeded`)
        }
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error}`)
    }
  }

  console.log('\n🎬 Video Upload Test Complete!')
}

// Test video metadata creation
async function testVideoMetadata() {
  console.log('\n📋 Testing Video Metadata Creation...')

  try {
    const { createVideoMetadata } = await import('@/lib/supabase/image-metadata')
    
    const mockFile = new File(['test'], 'test-video.mp4', { type: 'video/mp4' })
    const buildingId = 'TEST_BUILDING'
    const storagePath = 'buildings/TEST_BUILDING/videos/test-video.mp4'
    const url = 'https://example.com/test-video.mp4'
    const sortOrder = 0

    const metadata = createVideoMetadata(buildingId, mockFile, storagePath, url, sortOrder)
    
    console.log('✅ Video metadata created successfully:')
    console.log(JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.log(`❌ Video metadata creation failed: ${error}`)
  }
}

// Test storage path generation
async function testStoragePathGeneration() {
  console.log('\n📁 Testing Storage Path Generation...')

  try {
    const { generateStoragePath } = await import('@/lib/supabase/image-metadata')
    
    const buildingId = 'TEST_BUILDING_123'
    const category = 'videos'
    const fileName = 'my-building-tour.mp4'

    const storagePath = generateStoragePath(buildingId, category, fileName)
    
    console.log('✅ Storage path generated successfully:')
    console.log(`   Building ID: ${buildingId}`)
    console.log(`   Category: ${category}`)
    console.log(`   File Name: ${fileName}`)
    console.log(`   Storage Path: ${storagePath}`)
    
    // Verify path structure
    const expectedPattern = /^building-image\/TEST_BUILDING_123\/videos\//
    if (expectedPattern.test(storagePath)) {
      console.log('✅ Path structure is correct')
    } else {
      console.log('❌ Path structure is incorrect')
    }
  } catch (error) {
    console.log(`❌ Storage path generation failed: ${error}`)
  }
}

// Run all tests
export async function runVideoUploadTests() {
  await testVideoUpload()
  await testVideoMetadata()
  await testStoragePathGeneration()
}

// Allow running from command line
if (typeof window === 'undefined') {
  runVideoUploadTests().catch(console.error)
}
