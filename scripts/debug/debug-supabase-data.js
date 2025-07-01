#!/usr/bin/env node

/**
 * Debug Supabase Data Access
 * This script investigates why we're getting 0 records when there should be data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase Data Access...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Using anon key:', supabaseAnonKey ? 'Yes (configured)' : 'No');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugTableAccess() {
  const tables = ['operators', 'buildings', 'rooms', 'tenants', 'leads'];
  
  for (const tableName of tables) {
    console.log(`\n📋 Debugging ${tableName} table...`);
    
    try {
      // Test 1: Simple select without any filters
      console.log(`   🔍 Test 1: Simple select from ${tableName}`);
      const { data: simpleData, error: simpleError } = await supabase
        .from(tableName)
        .select('*');

      if (simpleError) {
        console.log(`   ❌ Simple select failed:`, simpleError.message);
        console.log(`   Error details:`, simpleError);
      } else {
        console.log(`   ✅ Simple select: Found ${simpleData.length} records`);
        if (simpleData.length > 0) {
          console.log(`   📄 Sample record:`, simpleData[0]);
        }
      }

      // Test 2: Count records
      console.log(`   🔍 Test 2: Count records in ${tableName}`);
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.log(`   ❌ Count failed:`, countError.message);
      } else {
        console.log(`   ✅ Total count: ${count} records`);
      }

      // Test 3: Check RLS policies
      console.log(`   🔍 Test 3: Testing RLS policies for ${tableName}`);
      const { data: rlsData, error: rlsError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (rlsError) {
        console.log(`   ❌ RLS test failed:`, rlsError.message);
        if (rlsError.message.includes('row-level security')) {
          console.log(`   🔒 RLS policies are blocking access to ${tableName}`);
        }
      } else {
        console.log(`   ✅ RLS test passed: Can access ${tableName}`);
      }

      // Test 4: Check specific columns that might be causing issues
      if (tableName === 'operators') {
        console.log(`   🔍 Test 4: Testing operators specific columns`);
        const { data: colData, error: colError } = await supabase
          .from('operators')
          .select('operator_id, first_name, last_name, email, role, status');

        if (colError) {
          console.log(`   ❌ Column test failed:`, colError.message);
        } else {
          console.log(`   ✅ Column test: Found ${colData.length} operators`);
        }
      }

    } catch (error) {
      console.log(`   ❌ Unexpected error with ${tableName}:`, error.message);
    }
  }
}

async function checkAuthAndPermissions() {
  console.log('\n🔐 Checking authentication and permissions...');
  
  try {
    // Check current user/session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ Auth error:', userError.message);
    } else if (user) {
      console.log('✅ Authenticated user:', user.email);
    } else {
      console.log('📝 No authenticated user (using anonymous access)');
    }

    // Test a simple query to see what permissions we have
    const { data, error } = await supabase
      .from('operators')
      .select('count(*)')
      .single();

    if (error) {
      console.log('❌ Permission test failed:', error.message);
      if (error.message.includes('permission denied')) {
        console.log('🔒 Permission denied - RLS policies may be blocking access');
      }
    } else {
      console.log('✅ Permission test passed');
    }

  } catch (error) {
    console.log('❌ Auth check failed:', error.message);
  }
}

async function runDebug() {
  try {
    await checkAuthAndPermissions();
    await debugTableAccess();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 DEBUGGING SUMMARY:');
    console.log('If you see 0 records but expect data:');
    console.log('1. Check if RLS (Row Level Security) is enabled on tables');
    console.log('2. Verify RLS policies allow anonymous access');
    console.log('3. Check if you need to authenticate first');
    console.log('4. Verify the correct database/schema is being used');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

runDebug();
