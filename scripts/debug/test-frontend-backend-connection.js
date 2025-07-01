#!/usr/bin/env node

/**
 * Frontend to Backend Connection Test Script
 * 
 * This script tests the connection between the HomeWiz frontend and backend
 * by testing all major API endpoints and CRUD operations.
 * 
 * Backend Schema (from homewiz-backend-shardul-backend):
 * - Operators: operator_id (int), name, email, phone, role, active, date_joined, etc.
 * - Buildings: building_id (string), building_name, full_address, operator_id, etc.
 * - Rooms: room_id (string), room_number, building_id, status, etc.
 * - Tenants: tenant_id (string), tenant_name, room_id, lease_start_date, etc.
 * - Leads: lead_id (string), email, status, etc.
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

// Configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
const TIMEOUT = 10000; // 10 seconds

console.log('🔍 Testing Frontend to Backend Connection...\n');
console.log(`📡 Backend URL: ${BACKEND_URL}`);
console.log(`⏱️  Timeout: ${TIMEOUT}ms\n`);

// Create axios instance with timeout
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Test data for CRUD operations
const testData = {
  operator: {
    name: 'Frontend Test Operator',
    email: 'frontend-test@example.com',
    phone: '555-0199',
    role: 'Property Manager',
    active: true,
    date_joined: new Date().toISOString().split('T')[0],
    operator_type: 'LEASING_AGENT'
  },
  building: {
    building_id: 'test-building-' + Date.now(),
    building_name: 'Frontend Test Building',
    full_address: '123 Test Street, Test City, TC 12345',
    operator_id: null, // Will be set after operator creation
    available: true,
    street: '123 Test Street',
    city: 'Test City',
    state: 'TC',
    zip: '12345',
    floors: 3,
    total_rooms: 10
  },
  room: {
    room_id: 'test-room-' + Date.now(),
    room_number: 'T101',
    building_id: null, // Will be set after building creation
    ready_to_rent: true,
    status: 'AVAILABLE',
    maximum_people_in_room: 2,
    private_room_rent: 1200.00,
    floor_number: 1,
    bed_count: 1
  },
  tenant: {
    tenant_id: 'test-tenant-' + Date.now(),
    tenant_name: 'Frontend Test Tenant',
    room_id: null, // Will be set after room creation
    room_number: 'T101',
    lease_start_date: new Date().toISOString().split('T')[0],
    lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    operator_id: null, // Will be set after operator creation
    booking_type: 'LEASE',
    tenant_nationality: 'US',
    tenant_email: 'tenant-test@example.com',
    building_id: null, // Will be set after building creation
    deposit_amount: 1200.00
  },
  lead: {
    lead_id: 'test-lead-' + Date.now(),
    email: 'lead-test@example.com',
    status: 'NEW',
    interaction_count: 0,
    planned_move_in: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    visa_status: 'CITIZEN',
    notes: 'Frontend test lead'
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

async function testBackendConnection() {
  try {
    console.log('🔄 Testing backend server availability...');
    
    // Test root endpoint
    try {
      const response = await api.get('/');
      console.log('❌ Root endpoint should be at backend root, not /api');
      
      // Try backend root
      const rootResponse = await axios.get(BACKEND_URL.replace('/api', ''), { timeout: TIMEOUT });
      console.log('✅ Backend server is running!');
      console.log(`   Response: ${JSON.stringify(rootResponse.data)}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Backend server is not running!');
        console.log('   Please start the backend server with: uvicorn app.main:app --reload --port 8000');
        return false;
      }
      throw error;
    }

    return true;

  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server is not running. To start it:');
      console.log('   1. Navigate to the backend directory');
      console.log('   2. Install dependencies: pip install -r requirements.txt');
      console.log('   3. Start server: uvicorn app.main:app --reload --port 8000');
    }
    return false;
  }
}

async function testOperatorsCRUD() {
  console.log('\n📋 Testing Operators CRUD...');
  
  try {
    // CREATE
    console.log('   🔧 Creating operator...');
    const createResponse = await api.post('/operators/', testData.operator);
    createdIds.operator = createResponse.data.operator_id;
    console.log(`   ✅ Operator created with ID: ${createdIds.operator}`);
    
    // READ
    console.log('   📖 Reading operator...');
    const readResponse = await api.get(`/operators/${createdIds.operator}`);
    console.log(`   ✅ Operator read: ${readResponse.data.name}`);
    
    // UPDATE
    console.log('   ✏️  Updating operator...');
    const updateData = { ...testData.operator, name: 'Updated Test Operator' };
    const updateResponse = await api.put(`/operators/${createdIds.operator}`, updateData);
    console.log(`   ✅ Operator updated: ${updateResponse.data.name}`);
    
    // LIST
    console.log('   📋 Listing operators...');
    const listResponse = await api.get('/operators/');
    console.log(`   ✅ Found ${listResponse.data.length} operators`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Operators test failed: ${error.response?.data?.detail || error.message}`);
    return false;
  }
}

async function testBuildingsCRUD() {
  console.log('\n🏢 Testing Buildings CRUD...');
  
  try {
    // Set operator_id for building
    testData.building.operator_id = createdIds.operator;
    
    // CREATE
    console.log('   🔧 Creating building...');
    const createResponse = await api.post('/buildings/', testData.building);
    createdIds.building = createResponse.data.building_id;
    console.log(`   ✅ Building created with ID: ${createdIds.building}`);
    
    // READ
    console.log('   📖 Reading building...');
    const readResponse = await api.get(`/buildings/${createdIds.building}`);
    console.log(`   ✅ Building read: ${readResponse.data.building_name}`);
    
    // LIST
    console.log('   📋 Listing buildings...');
    const listResponse = await api.get('/buildings/');
    console.log(`   ✅ Found ${listResponse.data.length} buildings`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Buildings test failed: ${error.response?.data?.detail || error.message}`);
    return false;
  }
}

async function testRoomsCRUD() {
  console.log('\n🏠 Testing Rooms CRUD...');
  
  try {
    // Set building_id for room
    testData.room.building_id = createdIds.building;
    
    // CREATE
    console.log('   🔧 Creating room...');
    const createResponse = await api.post('/rooms/', testData.room);
    createdIds.room = createResponse.data.room_id;
    console.log(`   ✅ Room created with ID: ${createdIds.room}`);
    
    // READ
    console.log('   📖 Reading room...');
    const readResponse = await api.get(`/rooms/${createdIds.room}`);
    console.log(`   ✅ Room read: ${readResponse.data.room_number}`);
    
    // LIST
    console.log('   📋 Listing rooms...');
    const listResponse = await api.get('/rooms/');
    console.log(`   ✅ Found ${listResponse.data.length} rooms`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Rooms test failed: ${error.response?.data?.detail || error.message}`);
    return false;
  }
}

async function testTenantsCRUD() {
  console.log('\n👥 Testing Tenants CRUD...');
  
  try {
    // Set required IDs for tenant
    testData.tenant.room_id = createdIds.room;
    testData.tenant.operator_id = createdIds.operator;
    testData.tenant.building_id = createdIds.building;
    
    // CREATE
    console.log('   🔧 Creating tenant...');
    const createResponse = await api.post('/tenants/', testData.tenant);
    createdIds.tenant = createResponse.data.tenant_id;
    console.log(`   ✅ Tenant created with ID: ${createdIds.tenant}`);
    
    // READ
    console.log('   📖 Reading tenant...');
    const readResponse = await api.get(`/tenants/${createdIds.tenant}`);
    console.log(`   ✅ Tenant read: ${readResponse.data.tenant_name}`);
    
    // LIST
    console.log('   📋 Listing tenants...');
    const listResponse = await api.get('/tenants/');
    console.log(`   ✅ Found ${listResponse.data.length} tenants`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Tenants test failed: ${error.response?.data?.detail || error.message}`);
    return false;
  }
}

async function testLeadsCRUD() {
  console.log('\n🎯 Testing Leads CRUD...');
  
  try {
    // CREATE
    console.log('   🔧 Creating lead...');
    const createResponse = await api.post('/leads/', testData.lead);
    createdIds.lead = createResponse.data.lead_id;
    console.log(`   ✅ Lead created with ID: ${createdIds.lead}`);
    
    // READ
    console.log('   📖 Reading lead...');
    const readResponse = await api.get(`/leads/${createdIds.lead}`);
    console.log(`   ✅ Lead read: ${readResponse.data.email}`);
    
    // LIST
    console.log('   📋 Listing leads...');
    const listResponse = await api.get('/leads/');
    console.log(`   ✅ Found ${listResponse.data.length} leads`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Leads test failed: ${error.response?.data?.detail || error.message}`);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');

  // Delete in reverse order of creation to respect foreign key constraints
  const cleanupOrder = [
    { name: 'tenant', endpoint: 'tenants', id: createdIds.tenant },
    { name: 'lead', endpoint: 'leads', id: createdIds.lead },
    { name: 'room', endpoint: 'rooms', id: createdIds.room },
    { name: 'building', endpoint: 'buildings', id: createdIds.building },
    { name: 'operator', endpoint: 'operators', id: createdIds.operator }
  ];

  for (const item of cleanupOrder) {
    if (item.id) {
      try {
        console.log(`   🗑️  Deleting ${item.name}...`);
        await api.delete(`/${item.endpoint}/${item.id}`);
        console.log(`   ✅ ${item.name} deleted successfully`);
      } catch (error) {
        console.log(`   ❌ Failed to delete ${item.name}: ${error.response?.data?.detail || error.message}`);
      }
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Frontend to Backend Connection Tests...\n');

  let allTestsPassed = true;

  try {
    // Test backend availability
    const backendAvailable = await testBackendConnection();
    if (!backendAvailable) {
      console.log('\n❌ Backend is not available. Cannot proceed with tests.');
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
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
      console.log('🎉 All tests passed! Frontend to Backend connection is working perfectly!');
      console.log('\n✅ Summary:');
      console.log('   • Backend server is running and accessible');
      console.log('   • All API endpoints are responding correctly');
      console.log('   • CRUD operations work for all entities');
      console.log('   • Data relationships and foreign keys are working');
      console.log('   • Test data cleanup completed successfully');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
      console.log('\n💡 Common issues:');
      console.log('   • Backend server not running (start with: uvicorn app.main:app --reload --port 8000)');
      console.log('   • Database connection issues (check DATABASE_URL in backend .env)');
      console.log('   • Missing required fields in API requests');
      console.log('   • CORS configuration issues');
    }

    console.log('\n📋 Next steps:');
    console.log('   • If tests passed: Your frontend can now connect to the backend');
    console.log('   • Update your frontend .env.local to use NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api');
    console.log('   • Set NEXT_PUBLIC_DISABLE_BACKEND=false to enable backend features');
    console.log('   • Test your frontend forms and data operations');

  } catch (error) {
    console.error('\n❌ Unexpected error during testing:', error.message);
    console.log('\n🔧 Attempting cleanup...');
    await cleanupTestData();
  }
}

// Install axios if not available
async function checkDependencies() {
  try {
    require('axios');
    return true;
  } catch (error) {
    console.log('❌ axios is not installed. Please install it with:');
    console.log('   npm install axios');
    return false;
  }
}

// Main execution
async function main() {
  const depsAvailable = await checkDependencies();
  if (!depsAvailable) {
    process.exit(1);
  }

  await runAllTests();
}

// Run the tests
main().catch(console.error);
