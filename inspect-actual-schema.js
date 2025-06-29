#!/usr/bin/env node

/**
 * Inspect Actual Supabase Schema
 * This script tries to discover the actual column structure of your tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Inspecting Actual Supabase Schema...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectTableSchema() {
  console.log('📋 Attempting to discover actual table schemas...\n');
  
  // Try to get schema information from information_schema
  try {
    console.log('🔍 Querying information_schema for table structures...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['operators', 'buildings', 'rooms', 'tenants', 'leads']);

    if (tablesError) {
      console.log('❌ Cannot access information_schema:', tablesError.message);
    } else {
      console.log('✅ Found tables:', tables.map(t => t.table_name));
    }

    // Try to get column information
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .in('table_name', ['operators', 'buildings', 'rooms', 'tenants', 'leads'])
      .order('table_name')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Cannot access column information:', columnsError.message);
    } else {
      console.log('\n📊 Table Schemas:');
      let currentTable = '';
      columns.forEach(col => {
        if (col.table_name !== currentTable) {
          currentTable = col.table_name;
          console.log(`\n🏗️  ${currentTable} table:`);
        }
        console.log(`   - ${col.column_name} (${col.data_type}${col.is_nullable === 'YES' ? ', nullable' : ''})`);
      });
    }

  } catch (error) {
    console.log('❌ Schema inspection failed:', error.message);
  }
}

async function tryInsertTestData() {
  console.log('\n🧪 Attempting to insert test data to discover schema...\n');
  
  // Try different schema variations for operators
  const operatorVariations = [
    // Variation 1: first_name, last_name (current frontend expectation)
    {
      name: 'first_name/last_name schema',
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test-schema-1@example.com',
        role: 'LEASING_AGENT',
        status: 'active'
      }
    },
    // Variation 2: name field (single name)
    {
      name: 'single name schema',
      data: {
        name: 'Test User',
        email: 'test-schema-2@example.com',
        role: 'LEASING_AGENT',
        active: true
      }
    },
    // Variation 3: minimal schema
    {
      name: 'minimal schema',
      data: {
        email: 'test-schema-3@example.com'
      }
    }
  ];

  for (const variation of operatorVariations) {
    console.log(`🔍 Testing ${variation.name}...`);
    
    try {
      const { data, error } = await supabase
        .from('operators')
        .insert([variation.data])
        .select();

      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          const missingColumn = error.message.match(/column "([^"]+)"/)?.[1];
          console.log(`   📝 Missing column: ${missingColumn}`);
        }
      } else {
        console.log(`   ✅ Success! Schema works:`, data[0]);
        
        // Clean up test data
        if (data[0] && data[0].operator_id) {
          await supabase
            .from('operators')
            .delete()
            .eq('operator_id', data[0].operator_id);
          console.log(`   🧹 Cleaned up test record`);
        }
        break; // Found working schema
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function checkDatabaseConnection() {
  console.log('\n🔗 Checking database connection details...\n');
  
  // Extract database info from URL
  const url = new URL(supabaseUrl);
  console.log('🏢 Project:', url.hostname.split('.')[0]);
  console.log('🌐 Region:', url.hostname.includes('supabase.co') ? 'Supabase Cloud' : 'Self-hosted');
  
  // Test basic connectivity
  try {
    const { data, error } = await supabase
      .from('operators')
      .select('count(*)', { count: 'exact', head: true });
      
    if (error) {
      console.log('❌ Basic connectivity test failed:', error.message);
    } else {
      console.log('✅ Basic connectivity: OK');
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

async function runInspection() {
  try {
    await checkDatabaseConnection();
    await inspectTableSchema();
    await tryInsertTestData();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 SCHEMA INSPECTION SUMMARY:');
    console.log('This will help identify:');
    console.log('1. What columns actually exist in your tables');
    console.log('2. Whether you\'re connected to the right database');
    console.log('3. What schema the frontend should expect');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Inspection failed:', error);
  }
}

runInspection();
