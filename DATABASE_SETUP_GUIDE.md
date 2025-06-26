# HomeWiz Database Setup Guide

## 🎯 Quick Setup (Cloud Supabase - Recommended)

### Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your account
3. **Click "New Project"**
4. **Fill in project details:**
   - Name: `homewiz-database`
   - Database Password: (choose a strong password)
   - Region: Choose closest to your users
5. **Wait for project creation** (2-3 minutes)

### Step 2: Get Your Credentials

1. **Go to Project Settings** → **API**
2. **Copy these values:**
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Update Environment Variables

**Replace the values in `.env.local`:**

```bash
# Update these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Disable demo mode to use real database
NEXT_PUBLIC_DEMO_MODE=false
```

### Step 4: Create Database Schema

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Copy the contents of `database-setup.sql`**
3. **Paste and run the SQL script**
4. **Verify tables were created** in the Table Editor

### Step 5: Test Connection

```bash
npm run dev
```

You should see:
- ✅ "Supabase connection established successfully"
- ✅ No demo mode banner
- ✅ Real data operations working

## 🔧 Alternative: Local Supabase (Advanced)

If you prefer to run Supabase locally:

### Prerequisites
- Docker Desktop installed
- Supabase CLI installed

### Setup Steps

1. **Install Supabase CLI:**
```bash
npm install -g supabase
```

2. **Initialize Supabase:**
```bash
supabase init
```

3. **Start local Supabase:**
```bash
supabase start
```

4. **Use local credentials in `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## 🚀 For Production Deployment (Render)

**Update these environment variables in Render:**

```bash
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_DISABLE_BACKEND=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🧪 Testing Your Database Connection

### 1. Check Console Logs
Look for these messages:
```
✅ Supabase connection established successfully
🔧 HomeWiz Frontend Configuration Loaded
Environment: development
Demo Mode: false
```

### 2. Test Forms
- Go to `/forms/building`
- Fill out and submit the form
- Check Supabase dashboard → Table Editor → buildings
- Your data should appear there

### 3. Test Data Loading
- Forms should load existing data from database
- Real-time updates should work
- No "demo data" messages

## 🔍 Troubleshooting

### "Invalid API URL" Error
- Check your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Ensure it starts with `https://` for cloud Supabase

### "Invalid API Key" Error
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure there are no extra spaces or line breaks

### "Connection Failed" Error
- Check your internet connection
- Verify Supabase project is active
- Try regenerating API keys in Supabase dashboard

### Tables Not Found
- Run the `database-setup.sql` script in Supabase SQL Editor
- Check Table Editor to verify tables exist
- Ensure RLS policies are created

## 📊 Database Schema Overview

Your database includes these tables:
- **buildings**: Property information
- **rooms**: Individual room details
- **tenants**: Current residents
- **operators**: Staff/managers
- **leads**: Potential tenants

All tables have:
- UUID primary keys
- Created/updated timestamps
- Proper relationships and indexes
- Row Level Security enabled

## 🎉 Success Indicators

When everything is working:
- ✅ No 502 errors
- ✅ Forms save to real database
- ✅ Data persists between sessions
- ✅ Real-time updates work
- ✅ No demo mode messages
