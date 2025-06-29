#!/usr/bin/env node

/**
 * Test Minimal Insert to Operators Table
 * This script tests the minimal required fields for the operators table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Minimal Insert to Operators Table...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMinimalInsert() {
  try {
    // Test 1: Try with just email (might be the only required field)
    console.log('🔧 Test 1: Trying with just email...');
    try {
      const { data, error } = await supabase
        .from('operators')
        .insert([{ email: 'test1@example.com' }])
        .select();

      if (error) {
        console.log('❌ Email-only insert failed:', error.message);
      } else {
        console.log('✅ Email-only insert successful!', data);
        // Clean up
        await supabase.from('operators').delete().eq('email', 'test1@example.com');
        return;
      }
    } catch (error) {
      console.log('❌ Email-only insert error:', error.message);
    }

    // Test 2: Try with email and first_name (based on error message)
    console.log('\n🔧 Test 2: Trying with email and first_name...');
    try {
      const { data, error } = await supabase
        .from('operators')
        .insert([{
          email: 'test2@example.com',
          first_name: 'Test'
        }])
        .select();

      if (error) {
        console.log('❌ Email+first_name insert failed:', error.message);
      } else {
        console.log('✅ Email+first_name insert successful!', data);
        console.log('   Available columns:', Object.keys(data[0]));
        // Clean up
        await supabase.from('operators').delete().eq('email', 'test2@example.com');
        return;
      }
    } catch (error) {
      console.log('❌ Email+first_name insert error:', error.message);
    }

    // Test 3: Try with email, first_name, last_name, and role
    console.log('\n🔧 Test 3: Trying with email, first_name, last_name, and role...');
    try {
      const { data, error } = await supabase
        .from('operators')
        .insert([{
          email: 'test3@example.com',
          first_name: 'Test',
          last_name: 'Operator',
          role: 'LEASING_AGENT'
        }])
        .select();

      if (error) {
        console.log('❌ Full insert failed:', error.message);
      } else {
        console.log('✅ Full insert successful!', data);
        console.log('   Available columns:', Object.keys(data[0]));
        // Clean up
        await supabase.from('operators').delete().eq('email', 'test3@example.com');
        console.log('✅ Test record cleaned up');
        return;
      }
    } catch (error) {
      console.log('❌ Full insert error:', error.message);
    }

    // Test 4: Try to get the actual table structure by using a SQL query
    console.log('\n🔧 Test 4: Trying to get table structure...');
    try {
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'operators' });

      if (error) {
        console.log('❌ Table structure query failed:', error.message);
      } else {
        console.log('✅ Table structure:', data);
      }
    } catch (error) {
      console.log('❌ Table structure query error:', error.message);
    }

    console.log('\n💡 Suggestion: The table might have different column names than expected.');
    console.log('   Please check your Supabase dashboard to see the exact column names.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testMinimalInsert();
