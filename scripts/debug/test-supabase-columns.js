#!/usr/bin/env node

/**
 * Test Supabase Column Structure
 * This script tests what columns are available in each table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Table Columns...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTableColumns() {
  const tables = ['operators', 'buildings', 'rooms', 'tenants', 'leads'];
  
  for (const table of tables) {
    console.log(`\n📋 Testing ${table} table...`);
    
    try {
      // Try to get one record to see the structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Error querying ${table}:`, error.message);
        continue;
      }

      if (data && data.length > 0) {
        console.log(`✅ ${table} columns:`, Object.keys(data[0]));
      } else {
        console.log(`📝 ${table} table is empty, trying to get structure...`);
        
        // Try a different approach - select with limit 0 to get structure
        const { data: emptyData, error: emptyError } = await supabase
          .from(table)
          .select('*')
          .limit(0);
          
        if (emptyError) {
          console.log(`❌ Error getting ${table} structure:`, emptyError.message);
        } else {
          console.log(`✅ ${table} table exists but is empty`);
        }
      }
      
      // Test if created_at column exists by trying to order by it
      console.log(`🔍 Testing created_at column in ${table}...`);
      const { data: testData, error: testError } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (testError) {
        console.log(`❌ created_at column test failed for ${table}:`, testError.message);
        
        // Try other common timestamp columns
        const timestampColumns = ['updated_at', 'date_created', 'timestamp'];
        for (const col of timestampColumns) {
          console.log(`🔍 Testing ${col} column in ${table}...`);
          const { error: colError } = await supabase
            .from(table)
            .select('*')
            .order(col, { ascending: false })
            .limit(1);
            
          if (!colError) {
            console.log(`✅ ${col} column exists in ${table}`);
            break;
          } else {
            console.log(`❌ ${col} column not found in ${table}`);
          }
        }
      } else {
        console.log(`✅ created_at column exists in ${table}`);
      }
      
    } catch (error) {
      console.log(`❌ Unexpected error with ${table}:`, error.message);
    }
  }
}

testTableColumns().then(() => {
  console.log('\n🎉 Column structure test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
