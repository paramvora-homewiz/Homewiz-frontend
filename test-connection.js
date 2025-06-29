#!/usr/bin/env node

/**
 * Test Supabase Connection Script for HomeWiz Frontend
 * This script tests the connection to your Supabase database
 * and verifies that all required tables exist.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_url' || supabaseUrl.includes('your-project-ref')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set or contains placeholder value');
  console.log('   Current value:', supabaseUrl);
  console.log('   Please update your .env.local file with the correct Supabase URL');
  process.exit(1);
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_anon_key_here') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or contains placeholder value');
  console.log('   Please update your .env.local file with the correct Supabase anon key');
  process.exit(1);
}

console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔄 Testing basic connection...');
    
    // Test basic connection by trying to query a system table
    const { data, error } = await supabase
      .from('buildings')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation "public.buildings" does not exist')) {
        console.log('\n💡 The database tables haven\'t been created yet.');
        console.log('   Please run the database setup script or create tables manually.');
      }
      
      return false;
    }

    console.log('✅ Basic connection successful!');
    console.log(`📊 Buildings table exists`);

    // Test all required tables
    const tables = ['buildings', 'rooms', 'tenants', 'operators', 'leads'];
    console.log('\n🔍 Checking all required tables...');

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': OK`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }

    console.log('\n🎉 Supabase connection test completed!');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Your Supabase database is ready to use!');
      process.exit(0);
    } else {
      console.log('\n❌ Please fix the issues above and try again.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
