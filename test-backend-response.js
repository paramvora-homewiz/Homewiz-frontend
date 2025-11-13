// Test script to check backend response format
const backendUrl = 'https://homewiz-backend-335786120771.us-west2.run.app/query/web';

async function testBackendResponse() {
  try {
    console.log('🔍 Testing backend endpoint:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Show me available rooms'
      })
    });

    if (!response.ok) {
      console.error('❌ Backend returned error:', response.status, response.statusText);
      return;
    }

    const data = await response.json();

    console.log('\n📦 Full Backend Response:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n🔍 Response Structure Analysis:');
    console.log('- Has data.response:', !!data.response);
    console.log('- Has data.result:', !!data.result);
    console.log('- Has data.result.response:', !!data.result?.response);
    console.log('- Has data.result.data:', !!data.result?.data);

    console.log('\n📝 Content that would be displayed:');
    const content = data.result?.response || data.response || 'I found some results for you.';
    console.log(content);

    if (data.result?.data) {
      console.log('\n📊 Data array length:', data.result.data.length);
      if (data.result.data.length > 0) {
        console.log('📌 First item:', JSON.stringify(data.result.data[0], null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBackendResponse();
