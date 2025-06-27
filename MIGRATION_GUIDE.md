# HomeWiz Database Migration Guide
## From Local Supabase to Cloud Supabase

This guide will help you migrate your local Supabase database to a cloud Supabase instance.

## 📊 Current Status
- **Local Database**: 76 records across 5 tables
  - Operators: 6 records
  - Buildings: 23 records  
  - Rooms: 25 records
  - Tenants: 15 records
  - Leads: 7 records

## 🚀 Migration Steps

### Step 1: Create Cloud Supabase Project ✅

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Project name**: `homewiz-production`
   - **Database password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project creation (1-2 minutes)

### Step 2: Get Cloud Supabase Credentials

Once your project is ready:

1. Go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIs...` (public key)
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIs...` (secret key - keep safe!)

### Step 3: Set Up Cloud Database Schema

1. Go to your cloud Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `database-setup.sql`
4. Paste and run the SQL script
5. Verify tables were created in **Table Editor**

### Step 4: Export Local Data ✅

Your local data has been exported in multiple formats:

**JSON & SQL Export:**
- `./database-exports/database-export-2025-06-26T23-23-34-050Z.json`
- `./database-exports/database-export-2025-06-26T23-23-34-050Z.sql`

**CSV Export:**
- `./database-exports/homewiz-database-2025-06-26T23-39-39-488Z.csv` (combined)
- `./database-exports/operators-2025-06-26T23-39-39-488Z.csv`
- `./database-exports/buildings-2025-06-26T23-39-39-488Z.csv`
- `./database-exports/rooms-2025-06-26T23-39-39-488Z.csv`
- `./database-exports/tenants-2025-06-26T23-39-39-488Z.csv`
- `./database-exports/leads-2025-06-26T23-39-39-488Z.csv`

**To re-export data:**
```bash
# Export all formats (JSON, SQL, CSV)
node export-local-data.js

# Export only CSV files
node export-csv.js
```

### Step 5: Import Data to Cloud Database

#### Option A: Using JSON/SQL Import Script (Recommended)

1. Set environment variables:
```bash
export CLOUD_SUPABASE_URL="https://your-project-ref.supabase.co"
export CLOUD_SUPABASE_SERVICE_KEY="your_service_role_key_here"
```

2. Run the import script:
```bash
node import-to-cloud.js
```

#### Option B: Using CSV Import Script

1. Set environment variables (same as above)
2. Run the CSV import script:
```bash
node import-csv-to-cloud.js
```

#### Option C: Manual SQL Import

1. Go to cloud Supabase **SQL Editor**
2. Copy contents of `database-export-2025-06-26T23-23-34-050Z.sql`
3. Paste and run the SQL script

#### Option D: Manual CSV Import

1. Go to cloud Supabase **Table Editor**
2. For each table, click "Insert" → "Import data from CSV"
3. Upload the corresponding CSV file (e.g., `operators-*.csv` for operators table)

### Step 6: Update Environment Configuration

#### For Development (.env.local)

Update your `.env.local` file:

```bash
# Replace with your cloud Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Keep demo mode disabled
NEXT_PUBLIC_DEMO_MODE=false

# Optional: Keep local database URL for reference
# DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

#### For Production (Render)

Update your Render environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project-ref.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your_anon_key_here`

### Step 7: Test Cloud Database Connection

1. Test the connection:
```bash
node test-database.js
```

2. Start your application:
```bash
npm run dev
```

3. Test functionality at `http://localhost:3000/forms`

## 🔧 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify your Supabase URL and API keys
   - Check if your project is active in Supabase dashboard

2. **Import Errors**
   - Ensure database schema was created first
   - Check for any data conflicts or constraint violations

3. **RLS (Row Level Security) Issues**
   - The migration includes policies that allow all operations
   - You may want to restrict these later for security

### Rollback Plan

If you need to rollback to local database:

1. Update `.env.local` back to local settings:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

2. Start local Supabase:
```bash
supabase start
```

## 📋 Post-Migration Checklist

- [ ] Cloud Supabase project created
- [ ] Database schema deployed
- [ ] Data imported successfully
- [ ] Environment variables updated
- [ ] Application tested with cloud database
- [ ] Production deployment updated
- [ ] Local Supabase stopped (optional)

## 🔒 Security Considerations

After migration, consider:

1. **Row Level Security**: Review and tighten RLS policies
2. **API Keys**: Rotate keys if they were exposed
3. **Database Access**: Limit service role key usage
4. **Backup Strategy**: Set up regular backups in Supabase

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard logs
2. Review the migration scripts output
3. Test with a smaller dataset first
4. Contact Supabase support if needed
