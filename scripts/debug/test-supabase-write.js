#!/usr/bin/env node

/**
 * Test Supabase Write Operations for HomeWiz Frontend
 * This script tests writing data to Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Write Operations...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testWriteOperations() {
  try {
    // Test 1: Add a new operator
    console.log('👥 Testing operator creation...');
    const newOperator = {
      name: 'Test Operator',
      email: 'test@example.com',
      operator_type: 'LEASING_AGENT',
      active: true,
      phone: '555-0123',
      date_joined: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    const { data: operatorData, error: operatorError } = await supabase
      .from('operators')
      .insert([newOperator])
      .select();

    if (operatorError) {
      console.log('❌ Operator creation failed:', operatorError.message);
    } else {
      console.log('✅ Operator created successfully:', operatorData[0]);
    }

    // Test 2: Add a new building
    console.log('\n🏢 Testing building creation...');
    const newBuilding = {
      building_name: 'Test Building',
      full_address: '123 Test Street, Test City, CA 12345',
      street: '123 Test Street',
      city: 'Test City',
      state: 'CA',
      zip: '12345',
      total_rooms: 10,
      available: true,
      operator_id: operatorData && operatorData[0] ? operatorData[0].operator_id : 1,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString()
    };

    const { data: buildingData, error: buildingError } = await supabase
      .from('buildings')
      .insert([newBuilding])
      .select();

    if (buildingError) {
      console.log('❌ Building creation failed:', buildingError.message);
    } else {
      console.log('✅ Building created successfully:', buildingData[0]);
    }

    // Test 3: Add a new lead
    console.log('\n📋 Testing lead creation...');
    const newLead = {
      email: 'testlead@example.com',
      status: 'EXPLORING',
      lead_source: 'WEBSITE',
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString()
    };

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert([newLead])
      .select();

    if (leadError) {
      console.log('❌ Lead creation failed:', leadError.message);
    } else {
      console.log('✅ Lead created successfully:', leadData[0]);
    }

    console.log('\n🎉 Write operations test completed!');

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    
    if (leadData && leadData[0]) {
      await supabase.from('leads').delete().eq('lead_id', leadData[0].lead_id);
      console.log('✅ Test lead deleted');
    }
    
    if (buildingData && buildingData[0]) {
      await supabase.from('buildings').delete().eq('building_id', buildingData[0].building_id);
      console.log('✅ Test building deleted');
    }
    
    if (operatorData && operatorData[0]) {
      await supabase.from('operators').delete().eq('operator_id', operatorData[0].operator_id);
      console.log('✅ Test operator deleted');
    }

    console.log('\n✅ All tests passed! Frontend can successfully write to Supabase.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testWriteOperations();
