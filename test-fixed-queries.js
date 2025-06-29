#!/usr/bin/env node

/**
 * Test Fixed Supabase Queries
 * This script tests the queries that were failing before
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Fixed Supabase Queries...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQueries() {
  console.log('📋 Testing operators query (was failing before)...');
  try {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .order('operator_id', { ascending: false })
      .range(0, 49);

    if (error) {
      console.log('❌ Operators query failed:', error.message);
    } else {
      console.log(`✅ Operators query successful: Found ${data.length} operators`);
    }
  } catch (error) {
    console.log('❌ Operators query error:', error.message);
  }

  console.log('\n📋 Testing rooms query (was failing before)...');
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_id', { ascending: false })
      .range(0, 49);

    if (error) {
      console.log('❌ Rooms query failed:', error.message);
    } else {
      console.log(`✅ Rooms query successful: Found ${data.length} rooms`);
    }
  } catch (error) {
    console.log('❌ Rooms query error:', error.message);
  }

  console.log('\n📋 Testing buildings query (should still work)...');
  try {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 49);

    if (error) {
      console.log('❌ Buildings query failed:', error.message);
    } else {
      console.log(`✅ Buildings query successful: Found ${data.length} buildings`);
    }
  } catch (error) {
    console.log('❌ Buildings query error:', error.message);
  }
}

testQueries().then(() => {
  console.log('\n🎉 Query test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
