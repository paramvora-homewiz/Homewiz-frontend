import { parseBuildingImages } from '../src/lib/backend-sync'

// Test cases based on actual data
const testCases = [
  {
    name: 'JSON array with room2 URL',
    input: '["https://images.urbanests.com/bldg_1080_folsom/room2","https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/BLDG_1080_FOLSOM/rooms/BLDG_1080_FOLSOM_R002/images/1754352663996_0_2024-05-09.webp"]',
    expectedCount: 2
  },
  {
    name: 'Single room2 URL',
    input: 'room2',
    expectedCount: 0 // Should be filtered out as invalid
  },
  {
    name: 'Array with invalid entry',
    input: ['room2', 'https://example.com/valid.jpg'],
    expectedCount: 1 // Only valid URL should remain
  },
  {
    name: 'Valid single URL',
    input: 'https://images.urbanests.com/bldg_1080_folsom/room5',
    expectedCount: 1
  }
]

console.log('🧪 Testing parseBuildingImages function...\n')

testCases.forEach(test => {
  console.log(`Test: ${test.name}`)
  console.log(`Input: ${JSON.stringify(test.input)}`)
  
  const result = parseBuildingImages(test.input)
  
  console.log(`Result: ${JSON.stringify(result)}`)
  console.log(`Count: ${result.length} (expected: ${test.expectedCount})`)
  console.log(`Valid: ${result.length === test.expectedCount ? '✅' : '❌'}`)
  
  // Show details for each parsed URL
  if (result.length > 0) {
    console.log('Parsed URLs:')
    result.forEach((url, idx) => {
      console.log(`  [${idx}]: "${url}"`)
      
      // Check if this could cause the "room2" error
      if (url === 'room2' || url.endsWith('/room2')) {
        console.log(`    ⚠️ WARNING: This URL might be treated as relative!`)
      }
    })
  }
  
  console.log('')
})

// Test the exact scenario from the console logs
console.log('📝 Testing exact scenario from user logs:')
const roomData = {
  room_images: '["https://images.urbanests.com/bldg_1080_folsom/room2","https://ushsurulbffbbqkyfynd.supabase.co/storage/v1/object/public/building-images/buildings/BLDG_1080_FOLSOM/rooms/BLDG_1080_FOLSOM_R002/images/1754352663996_0_2024-05-09.webp"]'
}

console.log('Raw room_images:', roomData.room_images)
const parsed = parseBuildingImages(roomData.room_images)
console.log('Parsed images:', parsed)
console.log('\nDetailed analysis:')
parsed.forEach((url, idx) => {
  console.log(`Image ${idx + 1}:`)
  console.log(`  URL: "${url}"`)
  console.log(`  Length: ${url.length}`)
  console.log(`  Starts with http: ${url.startsWith('http')}`)
  console.log(`  Starts with /: ${url.startsWith('/')}`)
  console.log(`  Contains "room": ${url.includes('room')}`)
  
  // Extract the last part to see if it could be interpreted as "room2"
  const parts = url.split('/')
  const lastPart = parts[parts.length - 1]
  console.log(`  Last part: "${lastPart}"`)
  
  if (lastPart === 'room2') {
    console.log(`  ⚠️ ISSUE: Last part is exactly "room2" - might be treated as relative URL!`)
  }
})