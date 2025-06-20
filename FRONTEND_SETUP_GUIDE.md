# 🏠 HomeWiz Frontend Setup Guide

This guide will help you set up and run the HomeWiz frontend locally.

## 📋 Prerequisites

- Node.js v20.19.0+ (managed via NVM)
- npm v10.8.2+
- Git (for version control)

## 🚀 Quick Start

### 1. Switch to Compatible Node.js Version

```bash
# Load NVM and switch to Node.js v20.19.0
source ~/.nvm/nvm.sh
nvm use v20.19.0
```

### 2. Install Dependencies

```bash
cd homewiz-frontend
npm install
```

### 3. Configure Environment

The `.env` file is already configured for local development:

```bash
# Environment Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Demo Mode (Authentication disabled)
NEXT_PUBLIC_DEMO_MODE=true
```

### 4. Start the Development Server

```bash
# Using the provided script (recommended)
./start-dev.sh

# Or manually
source ~/.nvm/nvm.sh && nvm use v20.19.0 && npx next dev
```

### 5. Verify Setup

```bash
# Run the test suite
./test-frontend.sh
```

## 🌐 Access Points

Once running, you can access:

- **Main Application**: http://localhost:3000
- **Forms Dashboard**: http://localhost:3000/forms
- **Demo Page**: http://localhost:3000/demo
- **Onboarding**: http://localhost:3000/onboarding
- **Simple Forms**: http://localhost:3000/simple

## 🎯 Key Features

### Current Status
- ✅ **Next.js 15.3.3** with TypeScript
- ✅ **Tailwind CSS** for styling
- ✅ **Framer Motion** for animations
- ✅ **React Hook Form** for form handling
- ✅ **Zod** for validation
- ✅ **Lucide React** for icons
- ✅ **Demo Mode** enabled by default
- ✅ **Backend API integration** ready

### Available Pages
- **Landing Page** (`/`) - Marketing homepage with features
- **Forms Dashboard** (`/forms`) - Interactive form builder
- **Demo Application** (`/demo`) - Sample rental application
- **Onboarding Flow** (`/onboarding`) - User setup process
- **Simple Forms** (`/simple`) - Basic form examples

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | http://localhost:8000 |
| `NEXT_PUBLIC_DEMO_MODE` | Enable demo mode | true |
| `NEXT_PUBLIC_APP_NAME` | Application name | HomeWiz |
| `NODE_ENV` | Runtime environment | development |

### Key Features Enabled

- **Demo Mode**: Authentication bypassed for development
- **Auto-save**: Form data automatically saved
- **Smart Validation**: Real-time form validation
- **File Upload**: Drag & drop document upload
- **Real-time Collaboration**: Multi-user form editing

## 🧪 Testing

### Manual Testing

```bash
# Test all routes
./test-frontend.sh

# Test specific functionality
curl http://localhost:3000/
curl http://localhost:3000/forms
curl http://localhost:3000/demo
```

### Development Tools

- **Hot Reload**: Automatic page refresh on changes
- **TypeScript**: Full type checking
- **ESLint**: Code quality checks
- **Tailwind**: Utility-first CSS framework

## 🐛 Troubleshooting

### Common Issues

1. **Node.js Version Error**
   ```bash
   # Solution: Use NVM to switch versions
   source ~/.nvm/nvm.sh && nvm use v20.19.0
   ```

2. **Port Already in Use**
   ```bash
   # Solution: Use different port
   npx next dev -p 3001
   ```

3. **Clerk Authentication Errors**
   ```bash
   # Solution: Ensure demo mode is enabled
   NEXT_PUBLIC_DEMO_MODE=true
   ```

4. **Build Cache Issues**
   ```bash
   # Solution: Clear Next.js cache
   rm -rf .next && npx next dev
   ```

### Reset Development Environment

```bash
# Clean install
rm -rf node_modules package-lock.json .next
npm install
./start-dev.sh
```

## 🔄 Integration with Backend

The frontend is configured to work with the HomeWiz backend:

- **API Base URL**: http://localhost:8000
- **Health Check**: Automatic backend connectivity testing
- **Authentication**: Ready for Clerk integration (currently disabled)
- **Data Collection**: JSON-structured form data for backend

## 📚 Next Steps

1. **Explore the UI**: Visit http://localhost:3000
2. **Try Forms**: Test the form builder at `/forms`
3. **Backend Integration**: Ensure backend is running on port 8000
4. **Authentication**: Configure Clerk when ready for production
5. **Customization**: Modify components in `src/components/`

## 🤝 Development Workflow

1. **Start Backend**: Ensure HomeWiz backend is running
2. **Start Frontend**: Use `./start-dev.sh`
3. **Test Integration**: Run `./test-frontend.sh`
4. **Develop**: Make changes and see live updates
5. **Validate**: Check TypeScript and ESLint

---

**Status**: ✅ Ready for development
**Last Updated**: June 2025
**Node.js Version**: v20.19.0
**Next.js Version**: 15.3.3
