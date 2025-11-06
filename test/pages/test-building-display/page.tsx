'use client';

import React from 'react';
import RoomCards from '@/components/chat/RoomCards';

// Test data with building information
const testRoomsWithBuildings = [
  {
    room_id: 'test-1',
    room_number: '101',
    room_type: 'Standard',
    private_room_rent: 1200,
    status: 'Available',
    floor_number: 1,
    furnished: true,
    bathroom_included: true,
    buildings: {
      building_name: 'Sunset Tower',
      city: 'San Francisco',
      state: 'CA'
    }
  },
  {
    room_id: 'test-2',
    room_number: '202',
    room_type: 'Deluxe',
    private_room_rent: 1500,
    status: 'Available',
    floor_number: 2,
    furnished: true,
    bathroom_included: false,
    buildings: {
      building_name: 'Ocean View Apartments',
      city: 'San Francisco',
      state: 'CA'
    }
  },
  {
    room_id: 'test-3',
    room_number: '305',
    room_type: 'Premium',
    private_room_rent: 1800,
    status: 'Available',
    floor_number: 3,
    furnished: false,
    bathroom_included: true,
    buildings: null // Test case without building info
  }
];

export default function TestBuildingDisplayPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Building Name Display</h1>
      
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-semibold mb-2">Expected Behavior:</h2>
        <ul className="list-disc list-inside text-sm">
          <li>Room 101 should show "Sunset Tower" below the room number</li>
          <li>Room 202 should show "Ocean View Apartments" below the room number</li>
          <li>Room 305 should not show any building name (null test)</li>
        </ul>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Room Cards with Building Names:</h2>
        <RoomCards 
          rooms={testRoomsWithBuildings}
          showExploreLink={false}
          onRoomClick={(room) => {
            console.log('Clicked room:', room);
            alert(`Clicked on Room ${room.room_number} in ${room.buildings?.building_name || 'Unknown Building'}`);
          }}
        />
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Debug: Test Data Structure</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(testRoomsWithBuildings, null, 2)}
        </pre>
      </div>
    </div>
  );
}