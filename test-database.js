#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests your Supabase database connection
 * Run with: node test-database.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🧪 Testing Supabase Database Connection...\n')

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
  process.exit(1)
}

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local')
  process.exit(1)
}

console.log(`📍 Supabase URL: ${supabaseUrl}`)
console.log(`🔑 API Key: ${supabaseKey.substring(0, 20)}...\n`)

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing basic connection...')
    
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('buildings')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Basic connection successful')
    
    // Test 2: Check if tables exist
    console.log('\n🏗️  Checking database tables...')
    
    const tables = ['buildings', 'rooms', 'tenants', 'operators', 'leads']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table '${table}' not found or accessible`)
        } else {
          console.log(`✅ Table '${table}' exists and accessible`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}' error: ${err.message}`)
      }
    }
    
    // Test 3: Try to insert and delete a test record
    console.log('\n📝 Testing write operations...')
    
    try {
      const testBuilding = {
        building_name: 'Test Building - DELETE ME',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        total_units: 1,
        building_type: 'Test'
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('buildings')
        .insert(testBuilding)
        .select()
        .single()
      
      if (insertError) {
        console.log('❌ Insert test failed:', insertError.message)
      } else {
        console.log('✅ Insert test successful')
        
        // Clean up - delete the test record
        const { error: deleteError } = await supabase
          .from('buildings')
          .delete()
          .eq('building_id', insertData.building_id)
        
        if (deleteError) {
          console.log('⚠️  Warning: Could not delete test record:', deleteError.message)
        } else {
          console.log('✅ Delete test successful')
        }
      }
    } catch (err) {
      console.log('❌ Write operation test failed:', err.message)
    }
    
    console.log('\n🎉 Database connection test completed!')
    console.log('\n📋 Next steps:')
    console.log('1. If all tests passed, your database is ready!')
    console.log('2. Run "npm run dev" to start your application')
    console.log('3. Test forms at http://localhost:3000/forms/building')
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ All tests completed successfully!')
    } else {
      console.log('\n❌ Some tests failed. Check your configuration.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n💥 Test script failed:', error.message)
    process.exit(1)
  })
