#!/usr/bin/env node

/**
 * Discover Actual Column Names
 * This script tries different column combinations to find what actually exists
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Discovering Actual Column Names...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testColumnCombinations() {
  console.log('📋 Testing different column combinations for operators table...\n');
  
  // Common column name variations
  const columnSets = [
    // Set 1: Backend schema (from memory)
    ['operator_id', 'name', 'email', 'phone', 'role', 'active', 'date_joined'],
    
    // Set 2: Current frontend expectation
    ['operator_id', 'first_name', 'last_name', 'email', 'role', 'status'],
    
    // Set 3: Alternative naming
    ['id', 'name', 'email', 'phone', 'type', 'status'],
    
    // Set 4: Minimal common fields
    ['operator_id', 'email'],
    ['id', 'email'],
    ['operator_id'],
    ['id'],
    
    // Set 5: Try individual common columns
    ['name'],
    ['first_name'],
    ['last_name'],
    ['email'],
    ['phone'],
    ['role'],
    ['status'],
    ['active'],
    ['created_at'],
    ['updated_at'],
  ];

  for (let i = 0; i < columnSets.length; i++) {
    const columns = columnSets[i];
    const columnList = columns.join(', ');
    
    console.log(`🔍 Test ${i + 1}: Trying columns [${columnList}]`);
    
    try {
      const { data, error } = await supabase
        .from('operators')
        .select(columnList)
        .limit(1);

      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          const missingColumn = error.message.match(/column "([^"]+)"/)?.[1];
          console.log(`   📝 Missing column: ${missingColumn}`);
        }
      } else {
        console.log(`   ✅ SUCCESS! Found ${data.length} records with these columns`);
        if (data.length > 0) {
          console.log(`   📄 Sample data:`, data[0]);
          console.log(`   🎯 Working column set: [${columnList}]`);
          
          // If this worked, try to get more records
          const { data: moreData, error: moreError } = await supabase
            .from('operators')
            .select(columnList);
            
          if (!moreError) {
            console.log(`   📊 Total records with this schema: ${moreData.length}`);
          }
          
          return columns; // Return the working column set
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  return null;
}

async function testOtherTables() {
  console.log('\n📋 Testing other tables for data...\n');
  
  const tables = ['buildings', 'rooms', 'tenants', 'leads'];
  
  for (const table of tables) {
    console.log(`🔍 Testing ${table} table...`);
    
    try {
      // Try with wildcard first
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else {
        console.log(`   ✅ Found ${data.length} records`);
        if (data.length > 0) {
          console.log(`   📄 Sample record:`, data[0]);
          console.log(`   🔑 Available columns:`, Object.keys(data[0]));
          
          // Get total count
          const { data: allData } = await supabase.from(table).select('*');
          console.log(`   📊 Total records: ${allData?.length || 0}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function runDiscovery() {
  try {
    const workingColumns = await testColumnCombinations();
    await testOtherTables();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 DISCOVERY SUMMARY:');
    if (workingColumns) {
      console.log('✅ Found working schema for operators:', workingColumns);
    } else {
      console.log('❌ Could not find working schema for operators');
      console.log('   This suggests the table might be empty or have');
      console.log('   completely different column names than expected');
    }
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Discovery failed:', error);
  }
}

runDiscovery();
