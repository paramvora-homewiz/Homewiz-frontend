import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env.local')
  console.log('This script requires the service role key to create storage buckets.')
  console.log('\nTo fix this manually:')
  console.log('1. Go to your Supabase dashboard')
  console.log('2. Navigate to Storage section')
  console.log('3. Create a new bucket named "building-images"')
  console.log('4. Set it to PUBLIC for image accessibility')
  console.log('5. Set allowed MIME types to: image/*, video/*')
  console.log('6. Set max file size to 500MB (for videos)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStorageBuckets() {
  console.log('🚀 Setting up storage buckets...\n')
  
  try {
    // Check existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }
    
    console.log('📦 Existing buckets:', existingBuckets?.map(b => b.name) || [])
    
    // Create building-images bucket if it doesn't exist
    const buildingImagesBucket = existingBuckets?.find(b => b.name === 'building-images')
    
    if (!buildingImagesBucket) {
      console.log('\n📸 Creating building-images bucket...')
      
      const { data, error } = await supabase.storage.createBucket('building-images', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/webp',
          'image/gif',
          'image/avif',
          'video/mp4',
          'video/webm',
          'video/quicktime',
          'video/x-msvideo'
        ],
        fileSizeLimit: 524288000 // 500MB
      })
      
      if (error) {
        console.error('❌ Error creating building-images bucket:', error)
      } else {
        console.log('✅ building-images bucket created successfully!')
        console.log('   - Public access: enabled')
        console.log('   - Allowed types: images and videos')
        console.log('   - Max file size: 500MB')
      }
    } else {
      console.log('✅ building-images bucket already exists')
    }
    
    // Create documents bucket if it doesn't exist
    const documentsBucket = existingBuckets?.find(b => b.name === 'documents')
    
    if (!documentsBucket) {
      console.log('\n📄 Creating documents bucket...')
      
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: false, // Private for documents
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (error) {
        console.error('❌ Error creating documents bucket:', error)
      } else {
        console.log('✅ documents bucket created successfully!')
        console.log('   - Public access: disabled (private)')
        console.log('   - Allowed types: PDF, Word documents')
        console.log('   - Max file size: 5MB')
      }
    } else {
      console.log('✅ documents bucket already exists')
    }
    
    // Create avatars bucket if it doesn't exist
    const avatarsBucket = existingBuckets?.find(b => b.name === 'avatars')
    
    if (!avatarsBucket) {
      console.log('\n👤 Creating avatars bucket...')
      
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif'
        ],
        fileSizeLimit: 2097152 // 2MB
      })
      
      if (error) {
        console.error('❌ Error creating avatars bucket:', error)
      } else {
        console.log('✅ avatars bucket created successfully!')
        console.log('   - Public access: enabled')
        console.log('   - Allowed types: images only')
        console.log('   - Max file size: 2MB')
      }
    } else {
      console.log('✅ avatars bucket already exists')
    }
    
    console.log('\n🎉 Storage setup complete!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

setupStorageBuckets()