# HomeWiz Frontend Deployment Guide

## 🚀 Deploying to Vercel

### Prerequisites
1. GitHub repository with your frontend code
2. Vercel account (free tier works)
3. Backend already deployed at: `https://homewiz-backend-335786120771.us-west2.run.app`

### Step-by-Step Deployment

#### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Import Project to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the repository containing your frontend code

#### 3. Configure Build Settings
Vercel should auto-detect Next.js. Verify these settings:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (or leave blank)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

#### 4. Set Environment Variables in Vercel
In the "Environment Variables" section, add these variables:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://homewiz-backend-335786120771.us-west2.run.app
NEXT_PUBLIC_BACKEND_API_URL=https://homewiz-backend-335786120771.us-west2.run.app
NEXT_PUBLIC_BACKEND_WS_URL=wss://homewiz-backend-335786120771.us-west2.run.app/ws/chat

# Enable backend
NEXT_PUBLIC_DISABLE_BACKEND=false

# AI Configuration
NEXT_PUBLIC_ENABLE_AI_MOCK=false
NEXT_PUBLIC_USE_SUPABASE_AI=false
NEXT_PUBLIC_USE_BACKEND_AI=true

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ushsurulbffbbqkyfynd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHN1cnVsYmZmYmJxa3lmeW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzE2MDMsImV4cCI6MjA2NTgwNzYwM30.ITybGpihJbJHppQIbq2O3CF6VSJwoH8-KsuA2hhsi4s

# WebSocket Configuration
NEXT_PUBLIC_ENABLE_WEBSOCKET=false
NEXT_PUBLIC_ENABLE_STREAMING=false
NEXT_PUBLIC_ENABLE_RECONNECT=false

# Enable Supabase direct connection
NEXT_PUBLIC_ENABLE_SUPABASE_DIRECT=true

# Google Gemini API (if you have one)
# NEXT_PUBLIC_GEMINI_API_KEY=your_production_gemini_key

# Additional configs
NEXT_PUBLIC_APP_NAME=HomeWiz
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_LOG_LEVEL=info
```

#### 5. Deploy
Click "Deploy" and wait for the build to complete.

### 🔄 Environment Management

#### Local Development
For local development, use `.env.local`:
```bash
cp .env.development .env.local
```

This will use:
- Backend: `http://localhost:8080`
- Same Supabase instance

#### Production
The `.env.production` file is used as reference for Vercel environment variables.

#### Switching Environments
To switch between environments locally:

1. **For Development**:
   ```bash
   npm run dev  # Uses .env.local or .env.development
   ```

2. **For Production Testing Locally**:
   ```bash
   npm run build
   npm run start  # Uses .env.production
   ```

### ⚠️ Important Backend Requirements

The backend at `https://homewiz-backend-335786120771.us-west2.run.app` needs to:

1. **Enable CORS** for your Vercel domain:
   ```python
   # In your backend FastAPI app
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://your-app.vercel.app",
           "https://*.vercel.app",  # For preview deployments
           "http://localhost:3000"  # For local development
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **Update Room Search Function** to include building data:
   - The `unified_room_search_function` should JOIN with buildings table
   - Return building information with each room

### 🔍 Troubleshooting

#### CORS Issues
If you see CORS errors in the browser console:
- Backend needs to whitelist your Vercel domain
- Check if backend is accessible from browser

#### Environment Variables Not Working
- Ensure all variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after changing environment variables in Vercel

#### Backend Connection Issues
- Check if backend URL is accessible: `https://homewiz-backend-335786120771.us-west2.run.app`
- Verify backend logs for incoming requests
- Check browser Network tab for failed requests

### 📝 Post-Deployment Checklist

- [ ] Test chat functionality
- [ ] Verify room search shows building names
- [ ] Check image uploads work
- [ ] Test all forms (building, room, tenant, etc.)
- [ ] Verify Supabase connection
- [ ] Check error handling

### 🔐 Security Notes

1. Never commit `.env.local` to git
2. Keep sensitive keys (like Gemini API) in Vercel environment variables only
3. Use different Supabase projects for production if needed
4. Monitor usage and set up alerts

### 📱 Domain Setup (Optional)

To use a custom domain:
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS settings as instructed

### 🔄 Continuous Deployment

Every push to your main branch will trigger a new deployment automatically.
Preview deployments are created for pull requests.

## Need Help?

- Check Vercel logs in the dashboard
- Use browser developer tools to debug
- Check backend logs for API issues
- Ensure all environment variables are correctly set