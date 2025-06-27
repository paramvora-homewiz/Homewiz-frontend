#!/usr/bin/env node

/**
 * Import CSV Data to Cloud Supabase Script
 * 
 * This script imports your CSV exported data to cloud Supabase
 * Usage: node import-csv-to-cloud.js [csv-directory]
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

console.log('☁️  Importing CSV Data to Cloud Supabase...\n')

// Get command line arguments
const args = process.argv.slice(2)
let csvDir = args[0] || './database-exports'

if (!fs.existsSync(csvDir)) {
  console.error(`❌ Directory not found: ${csvDir}`)
  process.exit(1)
}

// Get cloud Supabase credentials from environment
const cloudUrl = process.env.CLOUD_SUPABASE_URL
const cloudKey = process.env.CLOUD_SUPABASE_SERVICE_KEY

if (!cloudUrl || !cloudKey) {
  console.error('❌ Cloud Supabase credentials not found!')
  console.log('\nPlease set these environment variables:')
  console.log('export CLOUD_SUPABASE_URL="https://your-project.supabase.co"')
  console.log('export CLOUD_SUPABASE_SERVICE_KEY="your_service_role_key"')
  console.log('\nOr update this script with your credentials')
  process.exit(1)
}

// Create Supabase client for cloud database
const supabase = createClient(cloudUrl, cloudKey)

// Helper function to parse CSV
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))
  if (lines.length === 0) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    const values = parseCSVLine(line)
    if (values.length !== headers.length) {
      console.log(`⚠️  Skipping malformed line ${i + 1}: ${line}`)
      continue
    }
    
    const record = {}
    headers.forEach((header, index) => {
      let value = values[index]
      
      // Convert empty strings to null
      if (value === '') {
        value = null
      }
      // Convert boolean strings
      else if (value === 'true') {
        value = true
      } else if (value === 'false') {
        value = false
      }
      // Try to convert numbers
      else if (!isNaN(value) && !isNaN(parseFloat(value))) {
        value = parseFloat(value)
      }
      
      record[header] = value
    })
    
    data.push(record)
  }
  
  return data
}

// Helper function to parse a CSV line (handles quoted values)
function parseCSVLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add the last value
  values.push(current)
  
  return values
}

async function importCSVData() {
  try {
    // Find CSV files in the directory
    const files = fs.readdirSync(csvDir)
    const csvFiles = files.filter(file => file.endsWith('.csv') && !file.includes('homewiz-database'))
    
    if (csvFiles.length === 0) {
      console.error('❌ No individual CSV files found in directory')
      console.log('Expected files like: operators-*.csv, buildings-*.csv, etc.')
      process.exit(1)
    }
    
    console.log(`📁 Found ${csvFiles.length} CSV files to import`)
    
    // Import in dependency order
    const tableOrder = ['operators', 'buildings', 'rooms', 'tenants', 'leads']
    
    for (const tableName of tableOrder) {
      const csvFile = csvFiles.find(file => file.startsWith(tableName + '-'))
      
      if (!csvFile) {
        console.log(`⏭️  Skipping ${tableName} (no CSV file found)`)
        continue
      }
      
      const filePath = path.join(csvDir, csvFile)
      console.log(`\n📊 Importing ${tableName} from ${csvFile}...`)
      
      try {
        const csvContent = fs.readFileSync(filePath, 'utf8')
        const data = parseCSV(csvContent)
        
        if (data.length === 0) {
          console.log(`⏭️  No data to import for ${tableName}`)
          continue
        }
        
        console.log(`   📝 Parsed ${data.length} records`)
        
        // Import in batches
        const batchSize = 100
        let imported = 0
        
        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize)
          
          const { error } = await supabase
            .from(tableName)
            .insert(batch)
          
          if (error) {
            console.log(`   ❌ Error importing batch: ${error.message}`)
            // Continue with next batch
          } else {
            imported += batch.length
            console.log(`   ✅ Imported ${imported}/${data.length} records`)
          }
        }
        
        console.log(`✅ Completed ${tableName}: ${imported}/${data.length} records imported`)
        
      } catch (err) {
        console.log(`❌ Error processing ${tableName}:`, err.message)
      }
    }
    
    console.log('\n🔍 Verifying import...')
    
    // Verify import by checking record counts
    for (const tableName of tableOrder) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ Error checking ${tableName}:`, error.message)
        } else {
          console.log(`   ${tableName}: ${count} records in cloud database`)
        }
      } catch (err) {
        console.log(`❌ Error verifying ${tableName}:`, err.message)
      }
    }
    
    console.log('\n✅ CSV import process completed!')
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
  importCSVData()
    .then(() => {
      console.log('\n🎉 CSV import completed successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 CSV import failed:', error.message)
      process.exit(1)
    })
}

module.exports = { importCSVData, parseCSV }
