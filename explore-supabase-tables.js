#!/usr/bin/env node

/**
 * Explore Supabase Database Tables
 * This script explores what tables are available in your Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Exploring Supabase Database Tables...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function exploreTables() {
  try {
    console.log('📊 Checking available tables...\n');

    // Try to query information_schema to see available tables
    console.log('🔍 Attempting to query information_schema...');
    try {
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_names'); // This might not work, but let's try

      if (tablesError) {
        console.log('❌ RPC call failed:', tablesError.message);
      } else {
        console.log('✅ Available tables:', tables);
      }
    } catch (error) {
      console.log('❌ RPC approach failed:', error.message);
    }

    // Try common table names that might exist
    const commonTables = ['operators', 'buildings', 'rooms', 'tenants', 'leads'];
    
    console.log('\n🔍 Testing common table names...');
    for (const tableName of commonTables) {
      try {
        console.log(`   Testing table: ${tableName}`);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          console.log(`   ✅ ${tableName}: Table exists! Found ${data ? data.length : 0} records`);
          if (data && data.length > 0) {
            console.log(`      Sample columns: ${Object.keys(data[0]).join(', ')}`);
          }

          // For operators table, let's try to get column information by attempting an insert with minimal data
          if (tableName === 'operators') {
            console.log(`      🔍 Testing operators table structure...`);
            try {
              // Try a minimal insert to see what columns are required/available
              const { data: insertTest, error: insertError } = await supabase
                .from('operators')
                .insert([{ name: 'Test', email: 'test@test.com' }])
                .select();

              if (insertError) {
                console.log(`      ❌ Insert test failed: ${insertError.message}`);
                console.log(`      💡 This tells us about required columns or constraints`);
              } else {
                console.log(`      ✅ Insert test successful! Columns in result:`, Object.keys(insertTest[0]));
                // Clean up the test record
                await supabase.from('operators').delete().eq('email', 'test@test.com');
                console.log(`      🧹 Test record cleaned up`);
              }
            } catch (error) {
              console.log(`      ❌ Insert test error: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ ${tableName}: ${error.message}`);
      }
    }

    // Try to get schema information using a direct SQL query
    console.log('\n🔍 Attempting to get schema information...');
    try {
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_type', 'BASE TABLE');

      if (schemaError) {
        console.log('❌ Schema query failed:', schemaError.message);
      } else {
        console.log('✅ Schema information:', schemaInfo);
      }
    } catch (error) {
      console.log('❌ Schema query failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the exploration
exploreTables();
