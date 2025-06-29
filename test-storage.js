// Test Supabase Storage Access
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ushsurulbffbbqkyfynd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHN1cnVsYmZmYmJxa3lmeW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzE2MDMsImV4cCI6MjA2NTgwNzYwM30.ITybGpihJbJHppQIbq2O3CF6VSJwoH8-KsuA2hhsi4s'
)

async function testStorage() {
  console.log('🧪 Testing storage access...')
  
  // Test listing buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
  console.log('Buckets:', buckets, bucketsError)
  
  // Test creating a simple file
  const testFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' })
  
  const { data, error } = await supabase.storage
    .from('building-images')
    .upload('test/test.txt', testFile)
    
  console.log('Upload result:', data, error)
  
  // Test listing files
  const { data: files, error: listError } = await supabase.storage
    .from('building-images')
    .list('test')
    
  console.log('Files:', files, listError)
}

testStorage()