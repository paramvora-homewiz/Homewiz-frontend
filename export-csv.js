#!/usr/bin/env node

/**
 * Export Local Database to CSV Script
 * 
 * This script exports all data from your local Supabase database to CSV format
 * Creates individual CSV files for each table plus a combined file
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

// Get environment variables for LOCAL database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📊 Exporting Local Database to CSV...\n')

// Create Supabase client for local database
const supabase = createClient(supabaseUrl, supabaseKey)

// Create exports directory
const exportsDir = './database-exports'
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir)
}

// Helper function to convert array of objects to CSV
function arrayToCSV(data, tableName) {
  if (!data || data.length === 0) {
    return `# No data in ${tableName} table\n`
  }
  
  // Get all unique columns from all records
  const allColumns = new Set()
  data.forEach(record => {
    Object.keys(record).forEach(key => allColumns.add(key))
  })
  const columns = Array.from(allColumns).sort()
  
  // Create CSV header
  let csv = columns.join(',') + '\n'
  
  // Add data rows
  data.forEach(record => {
    const row = columns.map(col => {
      let value = record[col]
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return ''
      }
      
      // Convert to string and escape quotes
      value = String(value)
      
      // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = '"' + value.replace(/"/g, '""') + '"'
      }
      
      return value
    })
    csv += row.join(',') + '\n'
  })
  
  return csv
}

async function exportToCSV() {
  try {
    const tables = ['operators', 'buildings', 'rooms', 'tenants', 'leads']
    const exportData = {}
    
    console.log('🔍 Exporting data from tables...\n')
    
    // Export data from each table
    for (const table of tables) {
      console.log(`📊 Exporting ${table}...`)
      
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
        
        if (error) {
          console.log(`❌ Error exporting ${table}:`, error.message)
          exportData[table] = []
        } else {
          exportData[table] = data || []
          console.log(`✅ Exported ${count || 0} records from ${table}`)
        }
      } catch (err) {
        console.log(`❌ Error with ${table}:`, err.message)
        exportData[table] = []
      }
    }
    
    // Create timestamp for filenames
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    console.log('\n📁 Creating CSV files...')
    
    // Create individual CSV files for each table
    const csvFiles = []
    for (const table of tables) {
      const tableData = exportData[table]
      if (tableData && tableData.length > 0) {
        const csvContent = arrayToCSV(tableData, table)
        const csvFilename = `${exportsDir}/${table}-${timestamp}.csv`
        fs.writeFileSync(csvFilename, csvContent)
        csvFiles.push(csvFilename)
        console.log(`💾 ${table}: ${csvFilename}`)
      } else {
        console.log(`⏭️  ${table}: No data to export`)
      }
    }
    
    // Create combined CSV file with all tables
    const combinedCsvFilename = `${exportsDir}/homewiz-database-${timestamp}.csv`
    let combinedCsv = '# HomeWiz Database Export\n'
    combinedCsv += `# Exported on: ${new Date().toISOString()}\n`
    combinedCsv += '# Format: Each table is separated by comments\n\n'
    
    for (const table of tables) {
      const tableData = exportData[table]
      if (tableData && tableData.length > 0) {
        combinedCsv += `# ========== ${table.toUpperCase()} TABLE ==========\n`
        combinedCsv += arrayToCSV(tableData, table)
        combinedCsv += '\n'
      }
    }
    
    fs.writeFileSync(combinedCsvFilename, combinedCsv)
    console.log(`💾 Combined file: ${combinedCsvFilename}`)
    
    // Summary
    console.log('\n📋 Export Summary:')
    let totalRecords = 0
    for (const table of tables) {
      const count = exportData[table].length
      totalRecords += count
      console.log(`   ${table}: ${count} records`)
    }
    console.log(`   Total: ${totalRecords} records`)
    
    console.log('\n📁 Files created:')
    console.log(`   📊 Combined CSV: ${combinedCsvFilename}`)
    csvFiles.forEach(file => {
      const tableName = file.split('/').pop().split('-')[0]
      console.log(`   📄 ${tableName}: ${file}`)
    })
    
    console.log('\n✅ CSV export completed successfully!')
    console.log('\n📋 Usage:')
    console.log('• Open individual CSV files in Excel/Google Sheets')
    console.log('• Use combined CSV for complete database backup')
    console.log('• Import CSV files into other databases or systems')
    
    return { combinedCsvFilename, csvFiles, exportData }
    
  } catch (error) {
    console.error('❌ Export failed:', error.message)
    throw error
  }
}

// Run the export
if (require.main === module) {
  exportToCSV()
    .then(() => {
      console.log('\n🎉 CSV export process completed!')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 CSV export failed:', error.message)
      process.exit(1)
    })
}

module.exports = { exportToCSV, arrayToCSV }
