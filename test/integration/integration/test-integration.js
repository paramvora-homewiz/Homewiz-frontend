#!/usr/bin/env node

// HomeWiz Frontend-Backend Integration Test
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

async function testBackendConnection() {
    console.log('🔍 Testing HomeWiz Backend Integration...\n');
    
    // Test 1: Backend Health Check
    console.log('1️⃣ Testing backend health check...');
    try {
        const response = await fetch(`${BACKEND_URL}/`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend is running:', data);
        } else {
            console.log('❌ Backend health check failed:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.log('❌ Cannot connect to backend:', error.message);
        console.log('💡 Make sure to start the backend server using: ./start-backend.sh');
        return false;
    }

    // Test 2: Query Endpoint
    console.log('\n2️⃣ Testing /query/ endpoint...');
    try {
        const queryResponse = await fetch(`${BACKEND_URL}/query/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'test connection'
            })
        });

        if (queryResponse.ok) {
            const queryData = await queryResponse.json();
            console.log('✅ Query endpoint working:', queryData);
        } else {
            const errorText = await queryResponse.text();
            console.log('❌ Query endpoint failed:', queryResponse.status, errorText);
        }
    } catch (error) {
        console.log('❌ Query endpoint error:', error.message);
    }

    // Test 3: Environment Variables
    console.log('\n3️⃣ Testing environment configuration...');
    const requiredEnvVars = [
        'NEXT_PUBLIC_BACKEND_API_URL',
        'NEXT_PUBLIC_USE_BACKEND_AI',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    requiredEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        if (value) {
            console.log(`✅ ${envVar}: ${envVar.includes('KEY') ? '***' : value}`);
        } else {
            console.log(`❌ ${envVar}: Not set`);
        }
    });

    return true;
}

// Test 4: Sample Chat Query
async function testChatQuery() {
    console.log('\n4️⃣ Testing sample chat query...');
    try {
        const response = await fetch(`${BACKEND_URL}/query/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'Find me a 2-bedroom apartment with WiFi'
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Sample query successful:');
            console.log('Response:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.log('❌ Sample query failed:', response.status, errorText);
        }
    } catch (error) {
        console.log('❌ Sample query error:', error.message);
    }
}

async function main() {
    const connectionOk = await testBackendConnection();
    
    if (connectionOk) {
        await testChatQuery();
        console.log('\n🎉 Integration test completed! You can now use the chat interface.');
    } else {
        console.log('\n❌ Integration test failed. Please fix the issues above.');
        console.log('\n🛠️  Quick fixes:');
        console.log('   1. Start the backend: chmod +x start-backend.sh && ./start-backend.sh');
        console.log('   2. Check .env.local configuration');
        console.log('   3. Ensure Supabase credentials are correct');
    }
}

main().catch(console.error);