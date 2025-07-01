#!/usr/bin/env node

/**
 * Helper Script to Get Supabase Credentials
 * This script helps you find and update your Supabase credentials
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Supabase Credentials Setup Helper\n');

console.log('📋 To get your Supabase credentials:');
console.log('');
console.log('1. 🌐 Go to your Supabase dashboard: https://supabase.com/dashboard');
console.log('2. 📁 Select your project (ushsurulbffbbqkyfynd)');
console.log('3. ⚙️  Click on "Settings" in the left sidebar');
console.log('4. 🔑 Click on "API" in the settings menu');
console.log('5. 📋 Copy the following:');
console.log('   - Project URL (should be: https://ushsurulbffbbqkyfynd.supabase.co)');
console.log('   - anon/public key (long JWT token starting with "eyJ...")');
console.log('');

// Check current .env.local file
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('📄 Current .env.local configuration:');
  console.log('');
  
  const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  
  if (urlMatch) {
    const url = urlMatch[1];
    console.log(`   URL: ${url}`);
    if (url === 'https://ushsurulbffbbqkyfynd.supabase.co') {
      console.log('   ✅ URL looks correct');
    } else if (url === 'your_actual_anon_key_here' || url.includes('placeholder')) {
      console.log('   ❌ URL needs to be updated');
    }
  }
  
  if (keyMatch) {
    const key = keyMatch[1];
    console.log(`   Key: ${key.substring(0, 20)}...`);
    if (key === 'your_actual_anon_key_here' || key.includes('placeholder')) {
      console.log('   ❌ Anon key needs to be updated');
    } else if (key.startsWith('eyJ')) {
      console.log('   ✅ Anon key format looks correct');
    }
  }
  
  console.log('');
}

console.log('🔄 After getting your credentials:');
console.log('');
console.log('1. 📝 Update your .env.local file:');
console.log('   Replace "your_actual_anon_key_here" with your real anon key');
console.log('');
console.log('2. 🧪 Test the connection:');
console.log('   npm run dev');
console.log('   node test-frontend-supabase.js');
console.log('');
console.log('3. 🌐 Open your app:');
console.log('   http://localhost:3000');
console.log('');

console.log('💡 Need help? Check the browser console for connection status messages.');
