// Simple test to verify API connections
const API_BASE_URL = 'http://127.0.0.1:8000';

async function testApiEndpoints() {
  console.log('Testing API endpoints...\n');

  try {
    // Test operators endpoint
    console.log('1. Testing /api/operators');
    const operatorsResponse = await fetch(`${API_BASE_URL}/api/operators`);
    const operators = await operatorsResponse.json();
    console.log(`✅ Operators: Found ${operators.length} operators`);
    
    // Check operator types
    const buildingManagers = operators.filter(op => op.operator_type === 'BUILDING_MANAGER');
    const propertyManagers = operators.filter(op => op.operator_type === 'LEASING_AGENT' || op.operator_type === 'ADMIN');
    console.log(`   - Building Managers: ${buildingManagers.length}`);
    console.log(`   - Property Managers: ${propertyManagers.length}`);
    
    buildingManagers.forEach(manager => {
      console.log(`     • ${manager.name} (${manager.operator_type})`);
    });
    
    propertyManagers.forEach(manager => {
      console.log(`     • ${manager.name} (${manager.operator_type})`);
    });

    // Test buildings endpoint
    console.log('\n2. Testing /api/buildings');
    const buildingsResponse = await fetch(`${API_BASE_URL}/api/buildings`);
    const buildings = await buildingsResponse.json();
    console.log(`✅ Buildings: Found ${buildings.length} buildings`);
    
    buildings.forEach(building => {
      console.log(`   • ${building.building_name} (${building.total_rooms} rooms)`);
    });

    // Test rooms endpoint
    console.log('\n3. Testing /api/rooms');
    const roomsResponse = await fetch(`${API_BASE_URL}/api/rooms`);
    const rooms = await roomsResponse.json();
    console.log(`✅ Rooms: Found ${rooms.length} rooms`);
    
    // Group rooms by building
    const roomsByBuilding = {};
    rooms.forEach(room => {
      if (!roomsByBuilding[room.building_id]) {
        roomsByBuilding[room.building_id] = [];
      }
      roomsByBuilding[room.building_id].push(room);
    });
    
    Object.keys(roomsByBuilding).forEach(buildingId => {
      const buildingRooms = roomsByBuilding[buildingId];
      const availableRooms = buildingRooms.filter(room => room.status === 'AVAILABLE');
      console.log(`   • ${buildingId}: ${buildingRooms.length} total, ${availableRooms.length} available`);
    });

    console.log('\n🎉 All API endpoints are working correctly!');
    console.log('\nForm dropdowns should be populated with:');
    console.log(`- Building Manager dropdown: ${buildingManagers.length} options`);
    console.log(`- Property Manager dropdown: ${propertyManagers.length} options`);
    console.log(`- Building selection: ${buildings.length} buildings`);
    console.log(`- Room selection: ${rooms.length} rooms total`);

  } catch (error) {
    console.error('❌ Error testing API endpoints:', error);
  }
}

// Run the test
testApiEndpoints();
