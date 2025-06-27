#!/usr/bin/env node

/**
 * Export Local Database Data Script
 *
 * This script exports all data from your local Supabase database
 * for migration to cloud Supabase in JSON, SQL, and CSV formats
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

// Get environment variables for LOCAL database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📦 Exporting Local Database Data...\n')

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

async function exportData() {
  try {
    const tables = ['operators', 'buildings', 'rooms', 'tenants', 'leads']
    const exportData = {}
    
    console.log('🔍 Exporting data from tables...\n')
    
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
    
    // Save to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const jsonFilename = `${exportsDir}/database-export-${timestamp}.json`
    
    fs.writeFileSync(jsonFilename, JSON.stringify(exportData, null, 2))
    console.log(`\n💾 Data exported to: ${jsonFilename}`)
    
    // Create SQL insert statements
    const sqlFilename = `${exportsDir}/database-export-${timestamp}.sql`
    let sqlContent = '-- HomeWiz Database Export\n'
    sqlContent += `-- Exported on: ${new Date().toISOString()}\n\n`
    
    // Add data in dependency order (operators first, then buildings, then rooms, etc.)
    const orderedTables = ['operators', 'buildings', 'rooms', 'tenants', 'leads']
    
    for (const table of orderedTables) {
      const tableData = exportData[table]
      if (tableData && tableData.length > 0) {
        sqlContent += `-- ${table.toUpperCase()} DATA\n`
        
        for (const record of tableData) {
          const columns = Object.keys(record)
          const values = columns.map(col => {
            const value = record[col]
            if (value === null) return 'NULL'
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
            if (typeof value === 'boolean') return value ? 'true' : 'false'
            if (value instanceof Date) return `'${value.toISOString()}'`
            return value
          })
          
          sqlContent += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`
        }
        sqlContent += '\n'
      }
    }
    
    fs.writeFileSync(sqlFilename, sqlContent)
    console.log(`💾 SQL export saved to: ${sqlFilename}`)

    // Create CSV exports (one file per table)
    console.log('\n📊 Creating CSV exports...')
    const csvFiles = []

    for (const table of orderedTables) {
      const tableData = exportData[table]
      if (tableData && tableData.length > 0) {
        const csvContent = arrayToCSV(tableData, table)
        const csvFilename = `${exportsDir}/${table}-export-${timestamp}.csv`
        fs.writeFileSync(csvFilename, csvContent)
        csvFiles.push(csvFilename)
        console.log(`💾 ${table} CSV saved to: ${csvFilename}`)
      }
    }

    // Create combined CSV file with all tables
    const combinedCsvFilename = `${exportsDir}/all-tables-export-${timestamp}.csv`
    let combinedCsv = '# HomeWiz Database Export - All Tables\n'
    combinedCsv += `# Exported on: ${new Date().toISOString()}\n\n`

    for (const table of orderedTables) {
      const tableData = exportData[table]
      if (tableData && tableData.length > 0) {
        combinedCsv += `# TABLE: ${table.toUpperCase()}\n`
        combinedCsv += arrayToCSV(tableData, table)
        combinedCsv += '\n'
      }
    }

    fs.writeFileSync(combinedCsvFilename, combinedCsv)
    console.log(`💾 Combined CSV saved to: ${combinedCsvFilename}`)

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
    console.log(`   JSON: ${jsonFilename}`)
    console.log(`   SQL: ${sqlFilename}`)
    console.log(`   Combined CSV: ${combinedCsvFilename}`)
    csvFiles.forEach(file => console.log(`   CSV: ${file}`))

    console.log('\n✅ Export completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Set up your cloud Supabase project')
    console.log('2. Run the database schema in cloud Supabase')
    console.log('3. Import this data to cloud Supabase (use JSON/SQL) or spreadsheet (use CSV)')

    return { jsonFilename, sqlFilename, combinedCsvFilename, csvFiles, exportData }
    
  } catch (error) {
    console.error('❌ Export failed:', error.message)
    throw error
  }
}

// Run the export
if (require.main === module) {
  exportData()
    .then(result => {
      console.log('\n🎉 Export process completed!')
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Export failed:', error.message)
      process.exit(1)
    })
}

module.exports = { exportData }
