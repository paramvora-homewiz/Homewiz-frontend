#!/usr/bin/env node

/**
 * Check Local Database Data Script
 * 
 * This script checks what data exists in your local Supabase database
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Checking Local Database Data...\n')

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  try {
    const tables = ['buildings', 'rooms', 'tenants', 'operators', 'leads']
    
    for (const table of tables) {
      console.log(`\n📊 Checking ${table} table:`)
      
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(5)
        
        if (error) {
          console.log(`❌ Error accessing ${table}:`, error.message)
        } else {
          console.log(`   Total records: ${count || 0}`)
          if (data && data.length > 0) {
            console.log(`   Sample data (first ${data.length} records):`)
            data.forEach((record, index) => {
              console.log(`   ${index + 1}. ${JSON.stringify(record, null, 2).substring(0, 200)}...`)
            })
          } else {
            console.log(`   No data found in ${table}`)
          }
        }
      } catch (err) {
        console.log(`❌ Error with ${table}:`, err.message)
      }
    }
    
    console.log('\n✅ Data check completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the check
checkData()
