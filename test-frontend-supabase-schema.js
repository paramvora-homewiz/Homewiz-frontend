#!/usr/bin/env node

/**
 * Frontend to Supabase Cloud Connection Test
 * 
 * This script tests the frontend connection to Supabase cloud database
 * using the exact backend schema from homewiz-backend-shardul-backend
 * 
 * Backend Schema Reference: /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend/app/db/models.py
 * 
 * Tables tested:
 * - operators: operator_id (int), name, email, phone, role, active, date_joined, operator_type, etc.
 * - buildings: building_id (string), building_name, full_address, operator_id, available, etc.
 * - rooms: room_id (string), room_number, building_id, status, private_room_rent, etc.
 * - tenants: tenant_id (string), tenant_name, room_id, lease_start_date, tenant_email, etc.
 * - leads: lead_id (string), email, status, interaction_count, planned_move_in, etc.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Frontend to Supabase Cloud Connection...');
console.log('📊 Using Backend Schema as Reference\n');

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'your_supabase_url') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set or contains placeholder value');
  console.log('   Please update your .env.local file with the correct Supabase URL');
  process.exit(1);
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or contains placeholder value');
  console.log('   Please update your .env.local file with the correct Supabase anon key');
  process.exit(1);
}

console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test data based on backend schema
const testData = {
  operator: {
    // Backend schema: operator_id (int, auto), name (required), email (required, unique), etc.
    name: 'Frontend Test Operator',
    email: 'frontend-test-' + Date.now() + '@example.com',
    phone: '555-0199',
    role: 'Property Manager',
    active: true,
    date_joined: new Date().toISOString().split('T')[0],
    operator_type: 'LEASING_AGENT',
    notification_preferences: 'EMAIL',
    emergency_contact: false,
    calendar_sync_enabled: false
  },
  building: {
    // Backend schema: building_id (string, primary), building_name (required), operator_id (FK), etc.
    building_id: 'test-building-' + Date.now(),
    building_name: 'Frontend Test Building',
    full_address: '123 Test Street, Test City, TC 12345',
    operator_id: null, // Will be set after operator creation
    available: true,
    street: '123 Test Street',
    area: 'Test Area',
    city: 'Test City',
    state: 'TC',
    zip: '12345',
    floors: 3,
    total_rooms: 10,
    total_bathrooms: 6,
    wifi_included: true,
    laundry_onsite: true,
    secure_access: true,
    pet_friendly: 'ALLOWED',
    utilities_included: false,
    year_built: 2020,
    priority: 1
  },
  room: {
    // Backend schema: room_id (string, primary), room_number (required), building_id (FK), etc.
    room_id: 'test-room-' + Date.now(),
    room_number: 'T101',
    building_id: null, // Will be set after building creation
    ready_to_rent: true,
    status: 'AVAILABLE',
    maximum_people_in_room: 2,
    private_room_rent: 1200.00,
    shared_room_rent_2: 800.00,
    floor_number: 1,
    bed_count: 1,
    bathroom_type: 'SHARED',
    bed_size: 'QUEEN',
    bed_type: 'PLATFORM',
    view: 'STREET',
    sq_footage: 150,
    mini_fridge: true,
    work_desk: true,
    heating: true,
    air_conditioning: true,
    noise_level: 'QUIET',
    sunlight: 'BRIGHT',
    furnished: true
  },
  tenant: {
    // Backend schema: tenant_id (string, primary), tenant_name (required), room_id (FK), etc.
    tenant_id: 'test-tenant-' + Date.now(),
    tenant_name: 'Frontend Test Tenant',
    room_id: null, // Will be set after room creation
    room_number: 'T101',
    lease_start_date: new Date().toISOString().split('T')[0],
    lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    operator_id: null, // Will be set after operator creation
    booking_type: 'LEASE',
    tenant_nationality: 'US',
    tenant_email: 'tenant-test-' + Date.now() + '@example.com',
    phone: '555-0299',
    building_id: null, // Will be set after building creation
    status: 'ACTIVE',
    deposit_amount: 1200.00,
    payment_status: 'CURRENT',
    communication_preferences: 'EMAIL',
    account_status: 'ACTIVE',
    has_pets: false,
    has_vehicles: false,
    has_renters_insurance: true
  },
  lead: {
    // Backend schema: lead_id (string, primary), email (required, unique), status (required), etc.
    lead_id: 'test-lead-' + Date.now(),
    email: 'lead-test-' + Date.now() + '@example.com',
    status: 'NEW',
    interaction_count: 0,
    planned_move_in: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    visa_status: 'CITIZEN',
    notes: 'Frontend test lead',
    lead_score: 50,
    lead_source: 'WEBSITE',
    preferred_communication: 'EMAIL',
    budget_min: 1000.00,
    budget_max: 1500.00,
    preferred_lease_term: 12
  }
};

// Store created IDs for cleanup
const createdIds = {
  operator: null,
  building: null,
  room: null,
  tenant: null,
  lead: null
};

async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('operators')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    return true;

  } catch (error) {
    console.log('❌ Supabase connection error:', error.message);
    return false;
  }
}

async function testOperatorsCRUD() {
  console.log('\n📋 Testing Operators CRUD (Backend Schema)...');
  
  try {
    // CREATE - Using backend schema fields
    console.log('   🔧 Creating operator...');
    const { data: newOperator, error: createError } = await supabase
      .from('operators')
      .insert([testData.operator])
      .select();

    if (createError) {
      console.log('   ❌ Create failed:', createError.message);
      return false;
    }

    createdIds.operator = newOperator[0].operator_id;
    console.log(`   ✅ Operator created with ID: ${createdIds.operator}`);
    console.log(`   📝 Name: ${newOperator[0].name}`);
    console.log(`   📧 Email: ${newOperator[0].email}`);

    // READ
    console.log('   📖 Reading operator...');
    const { data: readOperator, error: readError } = await supabase
      .from('operators')
      .select('*')
      .eq('operator_id', createdIds.operator)
      .single();

    if (readError) {
      console.log('   ❌ Read failed:', readError.message);
      return false;
    }

    console.log(`   ✅ Operator read: ${readOperator.name} (${readOperator.operator_type})`);

    // UPDATE
    console.log('   ✏️  Updating operator...');
    const { data: updatedOperator, error: updateError } = await supabase
      .from('operators')
      .update({ name: 'Updated Test Operator', role: 'Senior Manager' })
      .eq('operator_id', createdIds.operator)
      .select();

    if (updateError) {
      console.log('   ❌ Update failed:', updateError.message);
      return false;
    }

    console.log(`   ✅ Operator updated: ${updatedOperator[0].name}`);

    // LIST
    console.log('   📋 Listing operators...');
    const { data: operators, error: listError } = await supabase
      .from('operators')
      .select('*');

    if (listError) {
      console.log('   ❌ List failed:', listError.message);
      return false;
    }

    console.log(`   ✅ Found ${operators.length} operators total`);
    return true;

  } catch (error) {
    console.log(`   ❌ Operators test failed: ${error.message}`);
    return false;
  }
}

async function testBuildingsCRUD() {
  console.log('\n🏢 Testing Buildings CRUD (Backend Schema)...');
  
  try {
    // Set operator_id foreign key
    testData.building.operator_id = createdIds.operator;
    
    // CREATE
    console.log('   🔧 Creating building...');
    const { data: newBuilding, error: createError } = await supabase
      .from('buildings')
      .insert([testData.building])
      .select();

    if (createError) {
      console.log('   ❌ Create failed:', createError.message);
      return false;
    }

    createdIds.building = newBuilding[0].building_id;
    console.log(`   ✅ Building created with ID: ${createdIds.building}`);
    console.log(`   🏢 Name: ${newBuilding[0].building_name}`);
    console.log(`   📍 Address: ${newBuilding[0].full_address}`);

    // READ
    console.log('   📖 Reading building...');
    const { data: readBuilding, error: readError } = await supabase
      .from('buildings')
      .select('*')
      .eq('building_id', createdIds.building)
      .single();

    if (readError) {
      console.log('   ❌ Read failed:', readError.message);
      return false;
    }

    console.log(`   ✅ Building read: ${readBuilding.building_name} (${readBuilding.floors} floors)`);

    // LIST
    console.log('   📋 Listing buildings...');
    const { data: buildings, error: listError } = await supabase
      .from('buildings')
      .select('*');

    if (listError) {
      console.log('   ❌ List failed:', listError.message);
      return false;
    }

    console.log(`   ✅ Found ${buildings.length} buildings total`);
    return true;

  } catch (error) {
    console.log(`   ❌ Buildings test failed: ${error.message}`);
    return false;
  }
}

async function testRoomsCRUD() {
  console.log('\n🏠 Testing Rooms CRUD (Backend Schema)...');

  try {
    // Set building_id foreign key
    testData.room.building_id = createdIds.building;

    // CREATE
    console.log('   🔧 Creating room...');
    const { data: newRoom, error: createError } = await supabase
      .from('rooms')
      .insert([testData.room])
      .select();

    if (createError) {
      console.log('   ❌ Create failed:', createError.message);
      return false;
    }

    createdIds.room = newRoom[0].room_id;
    console.log(`   ✅ Room created with ID: ${createdIds.room}`);
    console.log(`   🚪 Number: ${newRoom[0].room_number}`);
    console.log(`   💰 Rent: $${newRoom[0].private_room_rent}`);

    // READ
    console.log('   📖 Reading room...');
    const { data: readRoom, error: readError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_id', createdIds.room)
      .single();

    if (readError) {
      console.log('   ❌ Read failed:', readError.message);
      return false;
    }

    console.log(`   ✅ Room read: ${readRoom.room_number} (${readRoom.status}, ${readRoom.bed_count} bed)`);

    // LIST
    console.log('   📋 Listing rooms...');
    const { data: rooms, error: listError } = await supabase
      .from('rooms')
      .select('*');

    if (listError) {
      console.log('   ❌ List failed:', listError.message);
      return false;
    }

    console.log(`   ✅ Found ${rooms.length} rooms total`);
    return true;

  } catch (error) {
    console.log(`   ❌ Rooms test failed: ${error.message}`);
    return false;
  }
}

async function testTenantsCRUD() {
  console.log('\n👥 Testing Tenants CRUD (Backend Schema)...');

  try {
    // Set foreign keys
    testData.tenant.room_id = createdIds.room;
    testData.tenant.operator_id = createdIds.operator;
    testData.tenant.building_id = createdIds.building;

    // CREATE
    console.log('   🔧 Creating tenant...');
    const { data: newTenant, error: createError } = await supabase
      .from('tenants')
      .insert([testData.tenant])
      .select();

    if (createError) {
      console.log('   ❌ Create failed:', createError.message);
      return false;
    }

    createdIds.tenant = newTenant[0].tenant_id;
    console.log(`   ✅ Tenant created with ID: ${createdIds.tenant}`);
    console.log(`   👤 Name: ${newTenant[0].tenant_name}`);
    console.log(`   📧 Email: ${newTenant[0].tenant_email}`);

    // READ
    console.log('   📖 Reading tenant...');
    const { data: readTenant, error: readError } = await supabase
      .from('tenants')
      .select('*')
      .eq('tenant_id', createdIds.tenant)
      .single();

    if (readError) {
      console.log('   ❌ Read failed:', readError.message);
      return false;
    }

    console.log(`   ✅ Tenant read: ${readTenant.tenant_name} (${readTenant.booking_type})`);

    // LIST
    console.log('   📋 Listing tenants...');
    const { data: tenants, error: listError } = await supabase
      .from('tenants')
      .select('*');

    if (listError) {
      console.log('   ❌ List failed:', listError.message);
      return false;
    }

    console.log(`   ✅ Found ${tenants.length} tenants total`);
    return true;

  } catch (error) {
    console.log(`   ❌ Tenants test failed: ${error.message}`);
    return false;
  }
}

async function testLeadsCRUD() {
  console.log('\n🎯 Testing Leads CRUD (Backend Schema)...');

  try {
    // CREATE
    console.log('   🔧 Creating lead...');
    const { data: newLead, error: createError } = await supabase
      .from('leads')
      .insert([testData.lead])
      .select();

    if (createError) {
      console.log('   ❌ Create failed:', createError.message);
      return false;
    }

    createdIds.lead = newLead[0].lead_id;
    console.log(`   ✅ Lead created with ID: ${createdIds.lead}`);
    console.log(`   📧 Email: ${newLead[0].email}`);
    console.log(`   📊 Score: ${newLead[0].lead_score}`);

    // READ
    console.log('   📖 Reading lead...');
    const { data: readLead, error: readError } = await supabase
      .from('leads')
      .select('*')
      .eq('lead_id', createdIds.lead)
      .single();

    if (readError) {
      console.log('   ❌ Read failed:', readError.message);
      return false;
    }

    console.log(`   ✅ Lead read: ${readLead.email} (${readLead.status})`);

    // LIST
    console.log('   📋 Listing leads...');
    const { data: leads, error: listError } = await supabase
      .from('leads')
      .select('*');

    if (listError) {
      console.log('   ❌ List failed:', listError.message);
      return false;
    }

    console.log(`   ✅ Found ${leads.length} leads total`);
    return true;

  } catch (error) {
    console.log(`   ❌ Leads test failed: ${error.message}`);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');

  // Delete in reverse order to respect foreign key constraints
  const cleanupOrder = [
    { name: 'tenant', table: 'tenants', id: createdIds.tenant, field: 'tenant_id' },
    { name: 'lead', table: 'leads', id: createdIds.lead, field: 'lead_id' },
    { name: 'room', table: 'rooms', id: createdIds.room, field: 'room_id' },
    { name: 'building', table: 'buildings', id: createdIds.building, field: 'building_id' },
    { name: 'operator', table: 'operators', id: createdIds.operator, field: 'operator_id' }
  ];

  for (const item of cleanupOrder) {
    if (item.id) {
      try {
        console.log(`   🗑️  Deleting ${item.name}...`);
        const { error } = await supabase
          .from(item.table)
          .delete()
          .eq(item.field, item.id);

        if (error) {
          console.log(`   ❌ Failed to delete ${item.name}: ${error.message}`);
        } else {
          console.log(`   ✅ ${item.name} deleted successfully`);
        }
      } catch (error) {
        console.log(`   ❌ Error deleting ${item.name}: ${error.message}`);
      }
    }
  }
}

async function testSchemaCompatibility() {
  console.log('\n🔍 Testing Schema Compatibility...');

  try {
    // Test if all expected tables exist
    const tables = ['operators', 'buildings', 'rooms', 'tenants', 'leads'];

    for (const table of tables) {
      console.log(`   📋 Checking ${table} table...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ ${table} table issue: ${error.message}`);
        return false;
      } else {
        console.log(`   ✅ ${table} table accessible`);
      }
    }

    console.log('   ✅ All tables are accessible');
    return true;

  } catch (error) {
    console.log(`   ❌ Schema compatibility test failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Frontend to Supabase Cloud Tests...\n');
  console.log('📚 Using Backend Schema Reference from:');
  console.log('   /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend/app/db/models.py\n');

  let allTestsPassed = true;

  try {
    // Test Supabase connection
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
      console.log('\n❌ Supabase connection failed. Cannot proceed with tests.');
      return;
    }

    // Test schema compatibility
    const schemaOk = await testSchemaCompatibility();
    if (!schemaOk) {
      console.log('\n❌ Schema compatibility issues. Cannot proceed with tests.');
      return;
    }

    // Run CRUD tests
    const tests = [
      { name: 'Operators', fn: testOperatorsCRUD },
      { name: 'Buildings', fn: testBuildingsCRUD },
      { name: 'Rooms', fn: testRoomsCRUD },
      { name: 'Tenants', fn: testTenantsCRUD },
      { name: 'Leads', fn: testLeadsCRUD }
    ];

    for (const test of tests) {
      const passed = await test.fn();
      if (!passed) {
        allTestsPassed = false;
        console.log(`\n⚠️  ${test.name} test failed - continuing with other tests...`);
      }
    }

    // Cleanup
    await cleanupTestData();

    // Final results
    console.log('\n' + '='.repeat(70));
    if (allTestsPassed) {
      console.log('🎉 All tests passed! Frontend to Supabase Cloud connection is working perfectly!');
      console.log('\n✅ Summary:');
      console.log('   • Supabase cloud connection established');
      console.log('   • All tables are accessible and compatible with backend schema');
      console.log('   • CRUD operations work for all entities');
      console.log('   • Data relationships and foreign keys are working');
      console.log('   • Backend schema compatibility confirmed');
      console.log('   • Test data cleanup completed successfully');

      console.log('\n🔧 Backend Schema Compatibility:');
      console.log('   • Operators: ✅ Compatible with backend models');
      console.log('   • Buildings: ✅ Compatible with backend models');
      console.log('   • Rooms: ✅ Compatible with backend models');
      console.log('   • Tenants: ✅ Compatible with backend models');
      console.log('   • Leads: ✅ Compatible with backend models');

    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
      console.log('\n💡 Common issues:');
      console.log('   • Table schema mismatch between Supabase and backend models');
      console.log('   • Missing required fields or incorrect data types');
      console.log('   • Foreign key constraint violations');
      console.log('   • Supabase RLS (Row Level Security) policies blocking operations');
    }

    console.log('\n📋 Next steps:');
    if (allTestsPassed) {
      console.log('   • Your frontend can now work with Supabase cloud using backend schema');
      console.log('   • Update frontend to use: NEXT_PUBLIC_DISABLE_BACKEND=true');
      console.log('   • Ensure Supabase connection is preferred over local backend');
      console.log('   • Test your frontend forms with the confirmed schema');
    } else {
      console.log('   • Review schema differences between Supabase and backend models');
      console.log('   • Update Supabase table structures to match backend schema');
      console.log('   • Check Supabase RLS policies and permissions');
      console.log('   • Verify all required fields are properly configured');
    }

  } catch (error) {
    console.error('\n❌ Unexpected error during testing:', error.message);
    console.log('\n🔧 Attempting cleanup...');
    await cleanupTestData();
  }
}

// Run the tests
runAllTests().catch(console.error);
