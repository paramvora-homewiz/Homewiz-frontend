/**
 * Supabase Connection Test Script
 * Run this to verify your Supabase setup is working correctly
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...\n')

// Check environment variables
console.log('📋 Environment Check:')
console.log(`   Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
console.log(`   Supabase Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing environment variables!')
  console.log('Please check your .env.local file and make sure you have:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_project_url')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🔌 Testing Database Connection...')
    
    // Test 1: Check if we can connect to the database
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('count')
      .limit(1)
    
    if (buildingsError) {
      console.log('❌ Database connection failed:', buildingsError.message)
      return false
    }
    
    console.log('✅ Database connection successful!')
    
    // Test 2: Check tables exist
    console.log('\n📊 Checking Tables...')
    
    const tables = ['buildings', 'rooms', 'tenants', 'operators', 'leads']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`)
        } else {
          console.log(`✅ Table '${table}': OK`)
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`)
      }
    }
    
    // Test 3: Check sample data
    console.log('\n📈 Checking Sample Data...')
    
    const { data: operatorsData, error: operatorsError } = await supabase
      .from('operators')
      .select('*')
      .limit(5)
    
    if (operatorsError) {
      console.log('❌ Failed to fetch operators:', operatorsError.message)
    } else {
      console.log(`✅ Found ${operatorsData.length} operators`)
      if (operatorsData.length > 0) {
        console.log(`   Sample: ${operatorsData[0].name} (${operatorsData[0].operator_type})`)
      }
    }
    
    const { data: buildingsData, error: buildingsDataError } = await supabase
      .from('buildings')
      .select('*')
      .limit(5)
    
    if (buildingsDataError) {
      console.log('❌ Failed to fetch buildings:', buildingsDataError.message)
    } else {
      console.log(`✅ Found ${buildingsData.length} buildings`)
      if (buildingsData.length > 0) {
        console.log(`   Sample: ${buildingsData[0].building_name} in ${buildingsData[0].city}`)
      }
    }
    
    // Test 4: Test real-time (optional)
    console.log('\n🔄 Testing Real-time Subscriptions...')
    
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'buildings' }, 
        (payload) => {
          console.log('📡 Real-time event received:', payload.eventType)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscriptions working!')
          
          // Clean up
          setTimeout(() => {
            supabase.removeChannel(channel)
            console.log('\n🎉 All tests completed successfully!')
            console.log('\n🚀 Your Supabase integration is ready!')
            console.log('   You can now use the tenant form at: http://localhost:3000/forms')
            process.exit(0)
          }, 2000)
        } else if (status === 'CHANNEL_ERROR') {
          console.log('⚠️  Real-time subscriptions not working (this is optional)')
          console.log('\n🎉 Core functionality tests completed successfully!')
          console.log('\n🚀 Your Supabase integration is ready!')
          console.log('   You can now use the tenant form at: http://localhost:3000/forms')
          process.exit(0)
        }
      })
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message)
    console.log('\nTroubleshooting tips:')
    console.log('1. Check your Supabase project is running')
    console.log('2. Verify your environment variables are correct')
    console.log('3. Make sure you ran the database setup SQL script')
    console.log('4. Check the Supabase dashboard for any errors')
    process.exit(1)
  }
}

// Run the test
testConnection()
