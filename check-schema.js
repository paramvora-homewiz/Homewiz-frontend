#!/usr/bin/env node

/**
 * Check Supabase Schema for HomeWiz Frontend
 * This script checks the actual database schema
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase Schema...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  try {
    // Check operators table structure
    console.log('👥 Checking operators table structure...');
    const { data: operators, error: operatorsError } = await supabase
      .from('operators')
      .select('*')
      .limit(1);

    if (operatorsError) {
      console.log('❌ Operators error:', operatorsError.message);
    } else if (operators && operators.length > 0) {
      console.log('✅ Operators columns:', Object.keys(operators[0]));
    } else {
      console.log('⚠️ No operators data found');
    }

    // Check buildings table structure
    console.log('\n🏢 Checking buildings table structure...');
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')
      .limit(1);

    if (buildingsError) {
      console.log('❌ Buildings error:', buildingsError.message);
    } else if (buildings && buildings.length > 0) {
      console.log('✅ Buildings columns:', Object.keys(buildings[0]));
    } else {
      console.log('⚠️ No buildings data found');
    }

    // Check rooms table structure
    console.log('\n🏠 Checking rooms table structure...');
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(1);

    if (roomsError) {
      console.log('❌ Rooms error:', roomsError.message);
    } else if (rooms && rooms.length > 0) {
      console.log('✅ Rooms columns:', Object.keys(rooms[0]));
    } else {
      console.log('⚠️ No rooms data found');
    }

    // Check tenants table structure
    console.log('\n👤 Checking tenants table structure...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);

    if (tenantsError) {
      console.log('❌ Tenants error:', tenantsError.message);
    } else if (tenants && tenants.length > 0) {
      console.log('✅ Tenants columns:', Object.keys(tenants[0]));
    } else {
      console.log('⚠️ No tenants data found');
    }

    // Check leads table structure
    console.log('\n📋 Checking leads table structure...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    if (leadsError) {
      console.log('❌ Leads error:', leadsError.message);
    } else if (leads && leads.length > 0) {
      console.log('✅ Leads columns:', Object.keys(leads[0]));
    } else {
      console.log('⚠️ No leads data found');
    }

    console.log('\n🎉 Schema check completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the check
checkSchema();
