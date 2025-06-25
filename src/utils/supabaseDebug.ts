/**
 * Supabase Debug Utilities
 * 
 * Helpful utilities for debugging Supabase connection issues during development
 */

import { getSupabaseStatus } from '@/lib/supabase/client'

/**
 * Console utility to check Supabase status
 * Usage: import and call checkSupabaseStatus() in your component or console
 */
export function checkSupabaseStatus() {
  const status = getSupabaseStatus()
  
  console.group('🔍 Supabase Status Check')
  
  console.log('📊 Status Overview:')
  console.table({
    'Available': status.isAvailable ? '✅ Yes' : '❌ No',
    'Disabled': status.isDisabled ? '⚠️ Yes' : '✅ No',
    'Connection': status.connectionStatus,
    'Valid Key': status.hasValidKey ? '✅ Yes' : '❌ No',
    'Dummy Credentials': status.isDummyCredentials ? '⚠️ Yes' : '✅ No'
  })
  
  console.log('🔧 Configuration:')
  console.log(`  URL: ${status.url}`)
  console.log(`  Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}...`)
  
  if (status.isDummyCredentials) {
    console.log('')
    console.log('⚠️  You are using dummy Supabase credentials!')
    console.log('📝 To enable cloud storage, set up real Supabase credentials:')
    console.log('   1. Create a Supabase project at https://supabase.com')
    console.log('   2. Create a "building-images" storage bucket')
    console.log('   3. Update your .env.local file with real credentials:')
    console.log('      NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
    console.log('      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key')
  } else if (!status.isAvailable) {
    console.log('')
    console.log('❌ Supabase is not available')
    console.log('🔍 Possible issues:')
    console.log('   - Invalid credentials')
    console.log('   - Network connectivity issues')
    console.log('   - Supabase service unavailable')
    console.log('   - Check browser console for connection errors')
  } else {
    console.log('')
    console.log('✅ Supabase is working correctly!')
  }
  
  console.groupEnd()
  
  return status
}

/**
 * Test Supabase connection and log detailed results
 */
export async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...')
  
  try {
    const status = checkSupabaseStatus()
    
    if (!status.isAvailable) {
      console.log('❌ Connection test skipped - Supabase not available')
      return false
    }
    
    // Additional connection tests could go here
    console.log('✅ Basic connection test passed')
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

// Global debug utilities for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Make debug functions available globally in development
  (window as any).checkSupabaseStatus = checkSupabaseStatus
  (window as any).testSupabaseConnection = testSupabaseConnection
  
  console.log('🔧 Supabase debug utilities loaded')
  console.log('   Run checkSupabaseStatus() in console to check Supabase status')
  console.log('   Run testSupabaseConnection() in console to test connection')
}