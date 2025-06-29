#!/usr/bin/env node

/**
 * Check Supabase Data Script for HomeWiz Frontend
 * This script checks what data is currently in the Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase Data...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  try {
    // Check operators
    console.log('👥 Checking operators...');
    const { data: operators, error: operatorsError } = await supabase
      .from('operators')
      .select('*')
      .limit(5);

    if (operatorsError) {
      console.log('❌ Operators error:', operatorsError.message);
    } else {
      console.log(`✅ Found ${operators.length} operators`);
      operators.forEach(op => {
        console.log(`   - ${op.name} (${op.operator_type || 'N/A'})`);
      });
    }

    // Check buildings
    console.log('\n🏢 Checking buildings...');
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')
      .limit(5);

    if (buildingsError) {
      console.log('❌ Buildings error:', buildingsError.message);
    } else {
      console.log(`✅ Found ${buildings.length} buildings`);
      buildings.forEach(bldg => {
        console.log(`   - ${bldg.building_name} (${bldg.total_units || 0} units)`);
      });
    }

    // Check rooms
    console.log('\n🏠 Checking rooms...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(5);

    if (roomsError) {
      console.log('❌ Rooms error:', roomsError.message);
    } else {
      console.log(`✅ Found ${rooms.length} rooms`);
      rooms.forEach(room => {
        console.log(`   - Room ${room.room_number} (${room.status || 'N/A'})`);
      });
    }

    // Check tenants
    console.log('\n👤 Checking tenants...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (tenantsError) {
      console.log('❌ Tenants error:', tenantsError.message);
    } else {
      console.log(`✅ Found ${tenants.length} tenants`);
      tenants.forEach(tenant => {
        console.log(`   - ${tenant.first_name} ${tenant.last_name}`);
      });
    }

    // Check leads
    console.log('\n📋 Checking leads...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(5);

    if (leadsError) {
      console.log('❌ Leads error:', leadsError.message);
    } else {
      console.log(`✅ Found ${leads.length} leads`);
      leads.forEach(lead => {
        console.log(`   - ${lead.first_name} ${lead.last_name} (${lead.status || 'N/A'})`);
      });
    }

    console.log('\n🎉 Data check completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the check
checkData();
