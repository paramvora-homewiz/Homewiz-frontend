# 🚫 CORS Issue Solution

## ❌ Current Problem
```
Access to fetch at 'http://localhost:8000/rooms/' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## 🎯 Root Cause
The backend server is running but doesn't have CORS (Cross-Origin Resource Sharing) configured to allow requests from the frontend origin `http://localhost:3000`.

## ✅ Backend Solution (Recommended)

### Add CORS to FastAPI Backend

In `/Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend/app/main.py`, add:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# ... rest of your existing code
```

### Quick Backend Fix (One-liner)
Add this right after `app = FastAPI()`:

```python
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
```

## 🔧 Frontend Workaround (Temporary)

### Option 1: Run Frontend on Different Port
```bash
npm run dev -- --port 8001
```
Then update `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Option 2: Use Proxy in Development
Add to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ]
  },
}

module.exports = nextConfig
```

## 🚀 Quick Start Commands

1. **Start Backend with CORS**:
   ```bash
   cd /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend
   # Add CORS middleware to app/main.py first
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend**:
   ```bash
   cd /Users/kaushatrivedi/Downloads/Homewiz-frontend-main
   npm run dev
   ```

## ✅ How to Verify Fix

1. Open browser developer tools (F12)
2. Go to Network tab  
3. Refresh the frontend page
4. Look for API calls to `localhost:8000`
5. Should see `200 OK` responses instead of CORS errors

## 🔍 Alternative Quick Test

Add this to any component to test direct API call:

```javascript
fetch('http://localhost:8000/')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.log('❌ CORS blocked:', err))
```