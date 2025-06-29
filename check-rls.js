#!/usr/bin/env node

/**
 * Check RLS (Row Level Security) Status
 * This script checks if RLS is blocking access to your data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔒 Checking RLS (Row Level Security) Status...\n');
console.log(`🌐 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Using anon key: ${supabaseAnonKey?.substring(0, 20)}...`);
console.log('');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLSStatus() {
  const tables = ['rooms', 'buildings', 'operators', 'tenants', 'leads'];
  
  for (const tableName of tables) {
    console.log(`🔍 Checking ${tableName} table...`);
    
    try {
      // Try to query the table information schema to check RLS status
      const { data: rlsData, error: rlsError } = await supabase
        .from('pg_tables')
        .select('*')
        .eq('tablename', tableName);
      
      if (rlsError) {
        console.log(`   ❌ Cannot check RLS status: ${rlsError.message}`);
      } else {
        console.log(`   📊 Table info query successful`);
      }
      
      // Try a simple count query
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`   ❌ Count query failed: ${countError.message}`);
        console.log(`   🔍 Error code: ${countError.code}`);
        console.log(`   🔍 Error details: ${countError.details}`);
        console.log(`   🔍 Error hint: ${countError.hint}`);
        
        if (countError.code === 'PGRST116' || countError.message.includes('policy')) {
          console.log(`   🔒 RLS is likely blocking access to ${tableName}`);
        }
      } else {
        console.log(`   ✅ Count query successful: ${count} records`);
        
        if (count > 0) {
          // Try to get one record
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`   ❌ Data query failed: ${error.message}`);
            if (error.code === 'PGRST116' || error.message.includes('policy')) {
              console.log(`   🔒 RLS is blocking data access to ${tableName}`);
            }
          } else {
            console.log(`   ✅ Data query successful: ${data.length} records returned`);
            if (data.length > 0) {
              console.log(`   📄 Columns: ${Object.keys(data[0]).join(', ')}`);
            }
          }
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error.message}`);
    }
    
    console.log('');
  }
}

async function testDirectConnection() {
  console.log('🧪 Testing direct Supabase connection...\n');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`❌ Auth session error: ${error.message}`);
    } else {
      console.log(`✅ Auth session check successful`);
      console.log(`👤 Current user: ${data.session?.user?.email || 'Anonymous'}`);
    }
    
    // Test a simple query that should always work
    const { data: versionData, error: versionError } = await supabase
      .rpc('version');
    
    if (versionError) {
      console.log(`❌ Version query failed: ${versionError.message}`);
    } else {
      console.log(`✅ Database connection successful`);
    }
    
  } catch (error) {
    console.log(`❌ Connection test failed: ${error.message}`);
  }
  
  console.log('');
}

async function suggestSolutions() {
  console.log('💡 SOLUTIONS TO TRY:\n');
  
  console.log('1. 🔒 DISABLE RLS (Row Level Security):');
  console.log('   Go to Supabase Dashboard → Authentication → Policies');
  console.log('   For each table (rooms, buildings, etc.):');
  console.log('   - Click on the table');
  console.log('   - Toggle "Enable RLS" to OFF');
  console.log('   - Or create policies to allow SELECT for anon users');
  console.log('');
  
  console.log('2. 📊 CHECK DATABASE:');
  console.log('   Make sure you\'re looking at the correct database');
  console.log('   Your screenshot shows "homewizdb" - verify this matches your Supabase project');
  console.log('');
  
  console.log('3. 🔑 CHECK PERMISSIONS:');
  console.log('   Go to Supabase Dashboard → Settings → API');
  console.log('   Verify the anon key has the correct permissions');
  console.log('');
  
  console.log('4. 🧪 TEST IN SUPABASE SQL EDITOR:');
  console.log('   Go to Supabase Dashboard → SQL Editor');
  console.log('   Run: SELECT * FROM rooms LIMIT 5;');
  console.log('   This will show if the data exists and is accessible');
  console.log('');
}

async function runCheck() {
  await testDirectConnection();
  await checkRLSStatus();
  await suggestSolutions();
  
  console.log('='.repeat(60));
  console.log('🎯 RLS CHECK COMPLETE!');
  console.log('='.repeat(60));
}

runCheck();
