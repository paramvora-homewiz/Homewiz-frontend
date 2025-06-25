# 🏠 HomeWiz Frontend

A comprehensive rental property management system built with **Next.js 15** and **TypeScript**, featuring sophisticated form management, real-time data synchronization, and advanced file upload capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Features](#features)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

HomeWiz is a modern rental property management platform that streamlines the process of managing operators, buildings, rooms, tenants, and leads. The frontend provides an intuitive interface for property managers to handle all aspects of rental operations.

### Key Capabilities

- **Multi-step Form Management**: Comprehensive forms for operators, buildings, rooms, tenants, and leads
- **Real-time Validation**: Smart validation with backend integration
- **File Upload**: Drag & drop media upload with Supabase storage
- **Demo Mode**: Full functionality without authentication for development
- **Responsive Design**: Mobile-optimized interface with touch gestures
- **Data Export**: Export functionality for reports and analytics

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js**: v20.19.0+ (managed via NVM recommended)
- **npm**: v10.8.2+
- **Git**: For version control
- **Backend API**: HomeWiz backend running on port 8000 (optional for demo mode)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd homewiz-frontend
npm install
```

### 2. Environment Setup

The project is pre-configured for local development with demo mode enabled:

```bash
# .env.local (already configured)
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEMO_MODE=true
```

### 3. Start Development Server

```bash
# Using the provided script (recommended)
./start-dev.sh

# Or manually
npm run dev
```

### 4. Access the Application

- **Main Application**: http://localhost:3000
- **Forms Dashboard**: http://localhost:3000/forms
- **Demo Page**: http://localhost:3000/demo

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router pages
│   ├── forms/             # Form-specific pages
│   ├── demo/              # Demo application
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── forms/             # Form components
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   └── dashboard/         # Dashboard components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase integration
│   └── form-validation.ts # Form validation logic
├── services/              # API services
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## ✨ Features

### Current Implementation

- ✅ **Next.js 15** with React 19 and TypeScript
- ✅ **Tailwind CSS** with custom design system
- ✅ **Framer Motion** for smooth animations
- ✅ **React Hook Form** with Zod validation
- ✅ **Lucide React** icons
- ✅ **Demo Mode** enabled by default
- ✅ **Backend API integration** ready
- ✅ **File upload** with drag & drop support
- ✅ **Real-time form validation**
- ✅ **Auto-save** functionality
- ✅ **Mobile optimization**

### Form Management

- **Operator Management**: Staff and property manager forms with role-based permissions
- **Building Configuration**: Comprehensive building setup with amenities and policies
- **Room Management**: Individual rental unit configuration
- **Tenant Management**: Resident information and lease management
- **Lead Management**: Prospective tenant tracking and conversion

### Advanced Features

- **Smart Validation**: Real-time validation with backend uniqueness checking
- **Conditional Logic**: Dynamic form fields based on user input
- **Auto-save**: Automatic form data persistence
- **File Upload**: Media upload with Supabase storage integration
- **Data Export**: Export functionality for reports and analytics
- **Database Logging**: Comprehensive logging of all database operations

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Runtime environment | development | Yes |
| `NEXT_PUBLIC_APP_ENV` | Application environment | development | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | http://localhost:8000 | Yes |
| `NEXT_PUBLIC_DEMO_MODE` | Enable demo mode | true | No |
| `NEXT_PUBLIC_APP_NAME` | Application name | HomeWiz | No |

### Demo Mode

Demo mode is enabled by default and provides:
- **No Authentication Required**: Bypass Clerk authentication
- **Mock Data**: Pre-populated form data for testing
- **Full Functionality**: All features work without backend
- **Development Focus**: Optimized for frontend development

### Backend Integration

When `NEXT_PUBLIC_DEMO_MODE=false`:
- Requires HomeWiz backend running on configured API URL
- Enables real authentication via Clerk
- Connects to actual database
- Enables real-time data synchronization

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run tests with Vitest
npm run test:coverage   # Run tests with coverage
npm run test:ui         # Run tests with UI

# Build Options
npm run build:force     # Build without type checking
```

### Development Workflow

1. **Start Backend** (optional): Ensure HomeWiz backend is running on port 8000
2. **Start Frontend**: Use `./start-dev.sh` or `npm run dev`
3. **Develop**: Make changes and see live updates
4. **Validate**: Check TypeScript and ESLint
5. **Test**: Run test suite to verify functionality

### Code Organization

- **Components**: Organized by feature (forms, ui, auth, dashboard)
- **Hooks**: Custom hooks for reusable logic
- **Services**: API integration and external services
- **Types**: Centralized TypeScript definitions
- **Utils**: Pure utility functions

## 🧪 Testing

### Test Strategy

The project uses **Vitest** for testing with the following coverage:

- **Unit Tests**: Individual component and function testing
- **Integration Tests**: End-to-end workflow testing
- **API Tests**: Mock API response testing
- **Error Handling Tests**: Error scenario testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run with interactive UI
npm run test:ui

# Run specific test file
npm test -- forms/BuildingForm.test.ts
```

### Manual Testing

Test key functionality:

```bash
# Test all routes and functionality
curl http://localhost:3000/
curl http://localhost:3000/forms
curl http://localhost:3000/demo
```

## 🚀 Deployment

### Production Build

```bash
# Standard build
npm run build

# Force build (skip type checking)
npm run build:force

# Start production server
npm start
```

### Environment Setup

For production deployment:

1. **Set Environment Variables**:
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_DEMO_MODE=false
   NEXT_PUBLIC_API_URL=https://your-api-domain.com
   ```

2. **Configure Authentication**: Set up Clerk for production
3. **Database Setup**: Ensure backend API is accessible
4. **File Storage**: Configure Supabase for media uploads

### Deployment Platforms

- **Vercel**: Optimized for Next.js deployment
- **Netlify**: Static site deployment with serverless functions
- **Docker**: Use provided Dockerfile.production

## 🐛 Troubleshooting

### Common Issues

#### 1. Node.js Version Error
```bash
# Solution: Use NVM to switch versions
source ~/.nvm/nvm.sh && nvm use v20.19.0
```

#### 2. Port Already in Use
```bash
# Solution: Use different port
npx next dev -p 3001
```

#### 3. Build Cache Issues
```bash
# Solution: Clear Next.js cache
rm -rf .next && npm run dev
```

#### 4. TypeScript Errors
```bash
# Solution: Run type checking
npm run type-check

# Force build without type checking
npm run build:force
```

#### 5. API Connection Issues
- Verify backend is running on configured port
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is configured on backend
- Try demo mode: `NEXT_PUBLIC_DEMO_MODE=true`

### Reset Development Environment

```bash
# Complete reset
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Debug Mode

Enable additional logging:

```bash
# Set debug environment
DEBUG=* npm run dev

# Check configuration
node -e "console.log(require('./next.config.js'))"
```

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Install dependencies**: `npm install`
4. **Start development**: `npm run dev`
5. **Make changes** and test thoroughly
6. **Run tests**: `npm test`
7. **Check code quality**: `npm run lint && npm run type-check`
8. **Commit changes**: `git commit -m 'Add amazing feature'`
9. **Push to branch**: `git push origin feature/amazing-feature`
10. **Open Pull Request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

### Architecture Decisions

- **Next.js 15**: App Router for modern React patterns
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling approach
- **React Hook Form**: Performance-optimized form handling
- **Zod**: Runtime type validation
- **Supabase**: Backend-as-a-Service for storage

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form Guide](https://react-hook-form.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Testing Framework](https://vitest.dev/)

---

**Status**: ✅ Ready for development
**Last Updated**: December 2024
**Node.js Version**: v20.19.0
**Next.js Version**: 15.3.3
**License**: MIT
