'use client';

import React, { useState } from 'react';
import InteractiveMessageRenderer from '@/components/chat/InteractiveMessageRenderer';

// Test data that matches the expected structure
const testRoomData = {
  rooms: [
    {
      room_id: 'test-room-1',
      room_number: '101',
      room_type: 'Standard',
      private_room_rent: 1200,
      status: 'Available',
      floor_number: 1,
      furnished: true,
      bathroom_included: true,
      buildings: {
        building_name: 'Test Building A',
        city: 'San Francisco',
        state: 'CA'
      }
    },
    {
      room_id: 'test-room-2',
      room_number: '202',
      room_type: 'Deluxe',
      private_room_rent: 1500,
      status: 'Available',
      floor_number: 2,
      furnished: true,
      bathroom_included: false,
      buildings: {
        building_name: 'Test Building B',
        city: 'San Francisco',
        state: 'CA'
      }
    }
  ]
};

export default function TestRoomCardsPage() {
  const [testCase, setTestCase] = useState<string>('direct');

  const renderTestCase = () => {
    switch(testCase) {
      case 'direct':
        // Test with data passed directly
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Test Case 1: Direct Data</h3>
            <InteractiveMessageRenderer
              content="Here are some available rooms:"
              data={testRoomData}
              onAction={(action, data) => console.log('Action:', action, data)}
            />
          </div>
        );

      case 'metadata':
        // Test with data in metadata.result
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Test Case 2: Metadata Result</h3>
            <InteractiveMessageRenderer
              content="Here are some available rooms:"
              metadata={{ result: testRoomData }}
              onAction={(action, data) => console.log('Action:', action, data)}
            />
          </div>
        );

      case 'array':
        // Test with rooms as direct array
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Test Case 3: Direct Array</h3>
            <InteractiveMessageRenderer
              content="Here are some available rooms:"
              data={testRoomData.rooms}
              onAction={(action, data) => console.log('Action:', action, data)}
            />
          </div>
        );

      case 'backend':
        // Test with backend-style response
        return (
          <div>
            <h3 className="text-lg font-bold mb-4">Test Case 4: Backend Style</h3>
            <InteractiveMessageRenderer
              content="Here are some available rooms:"
              metadata={{
                result: {
                  data: testRoomData.rooms,
                  response: "Found 2 rooms"
                },
                backend_success: true
              }}
              onAction={(action, data) => console.log('Action:', action, data)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Room Cards Test Page</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Test Case:</label>
        <select 
          value={testCase} 
          onChange={(e) => setTestCase(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="direct">Direct Data</option>
          <option value="metadata">Metadata Result</option>
          <option value="array">Direct Array</option>
          <option value="backend">Backend Style</option>
        </select>
      </div>

      <div className="border rounded-lg p-6 bg-gray-50">
        {renderTestCase()}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <pre className="text-xs">
          {JSON.stringify({
            testCase,
            dataStructure: testCase === 'direct' ? 'data.rooms' :
                          testCase === 'metadata' ? 'metadata.result.rooms' :
                          testCase === 'array' ? 'data as array' :
                          'metadata.result.data as array'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}