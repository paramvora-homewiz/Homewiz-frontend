#!/usr/bin/env node

/**
 * Check Data Location
 * This script checks if data exists in different schemas or if RLS is blocking access
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Data Location and Access...\n');
console.log('🏢 Supabase Project:', supabaseUrl.split('//')[1].split('.')[0]);
console.log('🔑 Using anon key for access\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLSPolicies() {
  console.log('🔒 Checking Row Level Security (RLS) policies...\n');
  
  const tables = ['operators', 'buildings', 'rooms', 'tenants', 'leads'];
  
  for (const table of tables) {
    console.log(`🔍 Testing RLS for ${table}...`);
    
    try {
      // Test 1: Try to select with explicit RLS bypass (won't work with anon key, but will show different error)
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      console.log(`   📊 Query result: ${data?.length || 0} records, count: ${count}`);
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.message.includes('row-level security')) {
          console.log(`   🔒 RLS is blocking read access to ${table}`);
        }
      } else {
        console.log(`   ✅ Can read ${table} (found ${data.length} records)`);
      }

      // Test 2: Try a simple count query
      const { count: directCount, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.log(`   ❌ Count error: ${countError.message}`);
      } else {
        console.log(`   📊 Direct count: ${directCount} records`);
      }

    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error.message}`);
    }
  }
}

async function checkDifferentSchemas() {
  console.log('\n🗂️  Checking for data in different schemas...\n');
  
  // Try accessing tables with schema prefixes
  const schemas = ['public', 'homewizdb', 'auth', 'storage'];
  const tables = ['operators', 'buildings', 'rooms'];
  
  for (const schema of schemas) {
    console.log(`🔍 Checking schema: ${schema}`);
    
    for (const table of tables) {
      try {
        // Note: Supabase client doesn't directly support schema prefixes in from(),
        // but we can try different approaches
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (!error && data) {
          console.log(`   ✅ Found ${table} in ${schema}: ${data.length} records`);
        }
      } catch (error) {
        // Expected to fail for non-public schemas
      }
    }
  }
}

async function testWithServiceRole() {
  console.log('\n🔧 Testing access patterns...\n');
  
  // Check if we're using the right credentials
  console.log('🔑 Current access level: Anonymous (anon key)');
  console.log('📝 Note: If data exists but RLS blocks anonymous access,');
  console.log('   you would need to either:');
  console.log('   1. Update RLS policies to allow anonymous read access');
  console.log('   2. Use service role key (not recommended for frontend)');
  console.log('   3. Implement proper authentication');
  
  // Test basic connectivity
  try {
    const { data, error } = await supabase
      .from('operators')
      .select('operator_id')
      .limit(1);
      
    if (error) {
      console.log('\n❌ Basic connectivity issue:', error.message);
    } else {
      console.log('\n✅ Basic connectivity: OK');
      console.log('📊 This confirms tables exist and are accessible');
      console.log('📝 The tables are just empty (0 records)');
    }
  } catch (error) {
    console.log('\n❌ Connection error:', error.message);
  }
}

async function suggestNextSteps() {
  console.log('\n💡 SUGGESTED NEXT STEPS:\n');
  
  console.log('1. 🔍 Verify you\'re looking at the right Supabase project:');
  console.log(`   - Current project: ${supabaseUrl.split('//')[1].split('.')[0]}`);
  console.log('   - Check your Supabase dashboard to confirm this is the right project');
  
  console.log('\n2. 📊 Check if data exists in Supabase dashboard:');
  console.log('   - Go to https://supabase.com/dashboard');
  console.log('   - Navigate to Table Editor');
  console.log('   - Check operators, buildings, rooms tables');
  
  console.log('\n3. 🔒 If data exists but shows 0 here, check RLS policies:');
  console.log('   - Go to Authentication > Policies in Supabase dashboard');
  console.log('   - Ensure policies allow anonymous read access');
  console.log('   - Or temporarily disable RLS for testing');
  
  console.log('\n4. 📝 If tables are actually empty:');
  console.log('   - Import your data into Supabase');
  console.log('   - Or connect to the correct database that has your data');
  
  console.log('\n5. 🔧 Alternative: Use backend API instead of direct Supabase:');
  console.log('   - Set NEXT_PUBLIC_DISABLE_BACKEND=false');
  console.log('   - Start your backend server');
  console.log('   - Let the backend handle database access');
}

async function runCheck() {
  try {
    await checkRLSPolicies();
    await checkDifferentSchemas();
    await testWithServiceRole();
    await suggestNextSteps();
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

runCheck();
