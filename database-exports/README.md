# HomeWiz Database Export Files

This directory contains exported data from your local Supabase database in multiple formats.

## 📊 Export Summary
- **Total Records**: 76
- **Tables**: 5 (operators, buildings, rooms, tenants, leads)
- **Export Date**: 2025-06-26

## 📁 File Types

### JSON Export
- `database-export-*.json` - Complete database export in JSON format
- Best for: Programmatic import, backup, data analysis

### SQL Export  
- `database-export-*.sql` - SQL INSERT statements
- Best for: Direct database import, SQL-based systems

### CSV Export

#### Individual Table Files
- `operators-*.csv` - 6 operator records
- `buildings-*.csv` - 23 building records  
- `rooms-*.csv` - 25 room records
- `tenants-*.csv` - 15 tenant records
- `leads-*.csv` - 7 lead records

#### Combined File
- `homewiz-database-*.csv` - All tables in one file
- Best for: Complete backup, spreadsheet analysis

## 🔧 Usage

### Import to Cloud Supabase
```bash
# Using JSON/SQL (recommended)
node ../import-to-cloud.js

# Using CSV
node ../import-csv-to-cloud.js
```

### Open in Spreadsheet Applications
- **Excel**: Open any `.csv` file directly
- **Google Sheets**: Import → Upload → Select CSV file
- **Numbers**: File → Import → Select CSV file

### Import to Other Databases
- **PostgreSQL**: Use `\copy` command with CSV files
- **MySQL**: Use `LOAD DATA INFILE` with CSV files
- **SQLite**: Use `.import` command with CSV files

## 📋 Table Descriptions

### operators
Property managers, leasing agents, and maintenance staff
- Key fields: operator_id, name, email, role, active

### buildings  
Property buildings and their details
- Key fields: building_id, building_name, address, total_units

### rooms
Individual rental units within buildings
- Key fields: room_id, building_id, room_number, status, rent

### tenants
Current and past tenants
- Key fields: tenant_id, room_id, lease_start_date, lease_end_date

### leads
Prospective tenants and their status
- Key fields: lead_id, email, status, rooms_interested

## 🔒 Data Privacy
These files contain sensitive information including:
- Personal contact information
- Financial data (rent amounts)
- Tenant details

**Keep these files secure and delete when no longer needed.**

## 🆘 Troubleshooting

### CSV Import Issues
- Ensure proper encoding (UTF-8)
- Check for special characters in data
- Verify column headers match database schema

### Large File Handling
- Individual CSV files are small and manageable
- Combined CSV file may be large for some applications
- Use individual table files for better performance

### Data Validation
- All exports include the same data
- Use JSON export for most accurate data types
- CSV exports convert all values to strings
