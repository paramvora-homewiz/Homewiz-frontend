#!/usr/bin/env node

/**
 * Discover Real Supabase Schema
 * This script will try to get one record from each table to see the actual column structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Discovering Real Supabase Schema...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function discoverTableSchema(tableName) {
  console.log(`📋 Discovering ${tableName} table schema...`);

  try {
    // First, try to get table info from information_schema
    console.log(`   🔍 Checking table structure...`);

    // Get one record to see the actual structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    console.log(`   📊 Query result:`, { data, error });

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   🔍 Error details:`, error);

      // Try to check if table exists by querying with no filters
      console.log(`   🔄 Trying alternative query...`);
      const { data: altData, error: altError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      console.log(`   📊 Alternative query:`, { count: altData, error: altError });

      return null;
    }

    // Get total count first
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    console.log(`   📊 Total records: ${count} (error: ${countError?.message || 'none'})`);

    if (data && data.length > 0) {
      const record = data[0];
      const columns = Object.keys(record);

      console.log(`   ✅ Found ${data.length} record(s)`);
      console.log(`   📄 Columns: ${columns.join(', ')}`);
      console.log(`   🔍 Sample data:`, record);

      return {
        tableName,
        columns,
        sampleData: record,
        totalRecords: count || 0
      };
    } else {
      console.log(`   📝 Table exists but query returned no data`);
      console.log(`   📊 Count shows: ${count} records`);

      if (count && count > 0) {
        console.log(`   ⚠️  RLS might be blocking access to ${count} records`);
      }

      return {
        tableName,
        columns: [],
        sampleData: null,
        totalRecords: count || 0
      };
    }
  } catch (error) {
    console.log(`   ❌ Catch error: ${error.message}`);
    console.log(`   🔍 Full error:`, error);
    return null;
  }
}

async function generateTypeScriptTypes(schemas) {
  console.log('\n🔧 Generating TypeScript types based on actual data...\n');
  
  for (const schema of schemas) {
    if (!schema || !schema.sampleData) continue;
    
    console.log(`// ${schema.tableName} table (${schema.totalRecords} records)`);
    console.log(`${schema.tableName}: {`);
    console.log(`  Row: {`);
    
    for (const [key, value] of Object.entries(schema.sampleData)) {
      let type = 'unknown';
      if (value === null) {
        type = 'string | null';
      } else if (typeof value === 'string') {
        type = 'string';
      } else if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (Array.isArray(value)) {
        type = 'Json | null';
      } else if (typeof value === 'object') {
        type = 'Json | null';
      }
      
      console.log(`    ${key}: ${type}`);
    }
    
    console.log(`  }`);
    console.log(`},\n`);
  }
}

async function testQueries(schemas) {
  console.log('\n🧪 Testing queries with actual schema...\n');
  
  for (const schema of schemas) {
    if (!schema || schema.totalRecords === 0) continue;
    
    console.log(`🔍 Testing ${schema.tableName} queries...`);
    
    try {
      // Test basic select
      const { data, error } = await supabase
        .from(schema.tableName)
        .select('*')
        .limit(5);

      if (error) {
        console.log(`   ❌ Query failed: ${error.message}`);
      } else {
        console.log(`   ✅ Query successful: Found ${data.length} records`);
        
        // Test with specific columns
        const firstFewColumns = schema.columns.slice(0, 3);
        const { data: limitedData, error: limitedError } = await supabase
          .from(schema.tableName)
          .select(firstFewColumns.join(', '))
          .limit(3);
          
        if (!limitedError) {
          console.log(`   ✅ Column-specific query works: ${firstFewColumns.join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Query error: ${error.message}`);
    }
  }
}

async function testSpecificColumns() {
  console.log('\n🎯 Testing specific columns from screenshot...\n');

  // Based on the user's screenshot, try these specific columns
  const roomColumns = ['room_id', 'active_tenants', 'additional_features', 'air_conditioning'];

  console.log('📋 Testing rooms table with screenshot columns...');
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(roomColumns.join(', '))
      .limit(5);

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   🔍 Full error:`, error);
    } else {
      console.log(`   ✅ Success! Found ${data.length} records`);
      console.log(`   📄 Data:`, data);

      if (data.length > 0) {
        console.log(`   📊 Actual columns:`, Object.keys(data[0]));
      }
    }
  } catch (error) {
    console.log(`   ❌ Catch error: ${error.message}`);
  }

  // Try to get all columns with a wildcard
  console.log('\n📋 Testing rooms table with wildcard...');
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
    } else {
      console.log(`   ✅ Wildcard query successful`);
      if (data && data.length > 0) {
        console.log(`   📊 All columns:`, Object.keys(data[0]));
        console.log(`   🔍 Sample record:`, data[0]);
      }
    }
  } catch (error) {
    console.log(`   ❌ Catch error: ${error.message}`);
  }
}

async function runDiscovery() {
  try {
    const tables = ['operators', 'buildings', 'rooms', 'tenants', 'leads'];
    const schemas = [];

    for (const table of tables) {
      const schema = await discoverTableSchema(table);
      if (schema) {
        schemas.push(schema);
      }
      console.log(''); // Add spacing
    }

    // Test specific columns from screenshot
    await testSpecificColumns();

    await generateTypeScriptTypes(schemas);
    await testQueries(schemas);

    console.log('\n' + '='.repeat(60));
    console.log('🎯 DISCOVERY COMPLETE!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update src/lib/supabase/types.ts with the generated types');
    console.log('2. Update FormDataProvider.tsx to use correct column names');
    console.log('3. Test the frontend with the corrected schema');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Discovery failed:', error);
  }
}

runDiscovery();
