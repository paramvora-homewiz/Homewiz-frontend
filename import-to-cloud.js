#!/usr/bin/env node

/**
 * Import Data to Cloud Supabase Script
 * 
 * This script imports your exported data to cloud Supabase
 * Usage: node import-to-cloud.js [export-file.json]
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

console.log('☁️  Importing Data to Cloud Supabase...\n')

// Get command line arguments
const args = process.argv.slice(2)
let exportFile = args[0]

// If no file specified, find the most recent export
if (!exportFile) {
  const exportsDir = './database-exports'
  if (fs.existsSync(exportsDir)) {
    const files = fs.readdirSync(exportsDir)
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse()
    
    if (files.length > 0) {
      exportFile = path.join(exportsDir, files[0])
      console.log(`📁 Using most recent export: ${exportFile}`)
    }
  }
}

if (!exportFile || !fs.existsSync(exportFile)) {
  console.error('❌ Export file not found!')
  console.log('Usage: node import-to-cloud.js [export-file.json]')
  console.log('Or run export-local-data.js first to create an export file')
  process.exit(1)
}

// Get cloud Supabase credentials from environment or prompt
const cloudUrl = process.env.CLOUD_SUPABASE_URL
const cloudKey = process.env.CLOUD_SUPABASE_SERVICE_KEY

if (!cloudUrl || !cloudKey) {
  console.error('❌ Cloud Supabase credentials not found!')
  console.log('\nPlease set these environment variables:')
  console.log('CLOUD_SUPABASE_URL=https://your-project.supabase.co')
  console.log('CLOUD_SUPABASE_SERVICE_KEY=your_service_role_key')
  console.log('\nOr update this script with your credentials')
  process.exit(1)
}

// Create Supabase client for cloud database
const supabase = createClient(cloudUrl, cloudKey)

async function importData() {
  try {
    // Read export data
    console.log(`📖 Reading export file: ${exportFile}`)
    const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'))
    
    // Import in dependency order
    const orderedTables = ['operators', 'buildings', 'rooms', 'tenants', 'leads']
    
    console.log('\n🔄 Starting import process...\n')
    
    for (const table of orderedTables) {
      const tableData = exportData[table]
      
      if (!tableData || tableData.length === 0) {
        console.log(`⏭️  Skipping ${table} (no data)`)
        continue
      }
      
      console.log(`📊 Importing ${tableData.length} records to ${table}...`)
      
      try {
        // Import in batches to avoid timeout
        const batchSize = 100
        let imported = 0
        
        for (let i = 0; i < tableData.length; i += batchSize) {
          const batch = tableData.slice(i, i + batchSize)
          
          const { data, error } = await supabase
            .from(table)
            .insert(batch)
          
          if (error) {
            console.log(`❌ Error importing batch to ${table}:`, error.message)
            // Continue with next batch
          } else {
            imported += batch.length
            console.log(`   ✅ Imported ${imported}/${tableData.length} records`)
          }
        }
        
        console.log(`✅ Completed ${table}: ${imported}/${tableData.length} records imported`)
        
      } catch (err) {
        console.log(`❌ Error importing ${table}:`, err.message)
      }
    }
    
    console.log('\n🔍 Verifying import...')
    
    // Verify import by checking record counts
    for (const table of orderedTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ Error checking ${table}:`, error.message)
        } else {
          const originalCount = exportData[table]?.length || 0
          console.log(`   ${table}: ${count}/${originalCount} records`)
        }
      } catch (err) {
        console.log(`❌ Error verifying ${table}:`, err.message)
      }
    }
    
    console.log('\n✅ Import process completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Update your environment variables to use cloud Supabase')
    console.log('2. Test your application with the cloud database')
    console.log('3. Update production deployment settings')
    
  } catch (error) {
    console.error('❌ Import failed:', error.message)
    throw error
  }
}

// Run the import
if (require.main === module) {
  importData()
    .then(() => {
      console.log('\n🎉 Import completed successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Import failed:', error.message)
      process.exit(1)
    })
}

module.exports = { importData }
