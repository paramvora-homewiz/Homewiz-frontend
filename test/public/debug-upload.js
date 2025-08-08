// Debug script to test room image upload
// Run this in browser console when on the edit form

console.log('🔍 Debugging Room Image Upload...\n');

// Check if form data is available
const formInputs = document.querySelectorAll('input[type="file"]');
console.log('File inputs found:', formInputs.length);

// Check for room photos input
const roomPhotosInput = Array.from(formInputs).find(input => 
  input.name === 'room_photos' || input.id === 'room_photos' || input.accept?.includes('image')
);

if (roomPhotosInput) {
  console.log('Room photos input found:', {
    name: roomPhotosInput.name,
    id: roomPhotosInput.id,
    files: roomPhotosInput.files?.length || 0
  });
  
  if (roomPhotosInput.files?.length > 0) {
    console.log('Selected files:');
    Array.from(roomPhotosInput.files).forEach((file, idx) => {
      console.log(`  ${idx + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    });
  }
}

// Check if Supabase is available
if (window.supabase) {
  console.log('\n✅ Supabase client is available');
} else {
  console.log('\n❌ Supabase client not found in window');
}

// Look for React component data
const reactFiber = document.querySelector('[data-reactroot]')?._reactRootContainer?._internalRoot?.current;
if (reactFiber) {
  console.log('\n✅ React app detected');
}

console.log('\n📋 Next steps:');
console.log('1. Select image files in the room form');
console.log('2. Click Update/Save');
console.log('3. Watch the console for upload logs');
console.log('4. Look for these key messages:');
console.log('   - "📸 Uploading X room images..."');
console.log('   - "📤 Starting upload to bucket:"');
console.log('   - "✅ Successfully uploaded"');