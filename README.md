# 🏠 HomeWiz - AI-Powered Property Management Platform

> A comprehensive property management system with AI-powered chat interface, real-time analytics, and seamless room search capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [Available Commands](#available-commands)
- [API Documentation](#api-documentation)
- [Known Issues](#known-issues)
- [Contributing](#contributing)

## 🎯 Overview

HomeWiz is a modern property management platform that combines:
- **AI-powered chat interface** for natural language queries
- **Real-time property analytics** with visual dashboards
- **Smart room search** with advanced filtering
- **Comprehensive tenant management**
- **Financial reporting** with insights

## ✨ Key Features

### 🤖 AI Chat Interface
- Natural language processing for complex queries
- Context-aware responses
- Multiple backend integrations (FastAPI + Supabase)
- Real-time streaming support

### 🏘️ Property Management
- Room search with 15+ filter criteria
- Building management and analytics
- Tenant tracking and metrics
- Maintenance request handling

### 📊 Analytics & Reporting
- **Financial Reports**: Revenue breakdowns, projections, and insights
- **Occupancy Analytics**: Real-time occupancy rates and trends
- **Tenant Metrics**: Lease duration, satisfaction scores, retention rates
- **Performance Dashboards**: Visual KPIs and metrics

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Professional data visualizations
- Consistent design system

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13.5.11 (App Router)
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: Custom components + Radix UI
- **Animations**: Framer Motion 11.14.4
- **State Management**: React hooks + Context
- **Charts**: Recharts 2.15.0
- **Forms**: React Hook Form 7.54.2 + Zod validation

### Backend Integration
- **Primary**: FastAPI (Python) backend on port 8000
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **Real-time**: WebSocket support (configurable)

### Development Tools
- **Build**: Vite/Next.js
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint
- **Type Checking**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ (for backend)
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd homewiz-frontend-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your credentials (see [Environment Variables](#environment-variables))

4. **Start the backend** (in separate terminal)
   ```bash
   cd ../homewiz-backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

5. **Start the frontend**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
homewiz-frontend-main/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── api/               # API routes
│   │   ├── chat/              # Chat interface page
│   │   ├── explore/           # Property explorer
│   │   └── lead-analytics/    # Analytics pages
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── chat/             # Chat UI components
│   │   ├── forms/            # Form components
│   │   ├── landing/          # Landing page components
│   │   ├── property-explorer/ # Property browsing
│   │   └── ui/               # Shared UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   │   ├── agents/           # AI agent logic
│   │   ├── chat/             # Chat services
│   │   ├── supabase/         # Database client
│   │   └── utils/            # Helper functions
│   └── styles/               # Global styles
├── public/                   # Static assets
├── tests/                    # Test files
└── docs/                     # Documentation

```

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DISABLE_BACKEND=false

# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_USE_BACKEND_AI=true
NEXT_PUBLIC_USE_SUPABASE_AI=false

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend WebSocket (Optional)
NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:8000/ws/chat
NEXT_PUBLIC_ENABLE_WEBSOCKET=false
NEXT_PUBLIC_ENABLE_STREAMING=false

# Feature Flags
NEXT_PUBLIC_ENABLE_SUPABASE_DIRECT=true
NEXT_PUBLIC_ENABLE_AI_MOCK=false
```

## 💻 Development

### Running in Development Mode
```bash
# Frontend
npm run dev

# Backend (in separate terminal)
cd ../homewiz-backend
python -m uvicorn app.main:app --reload --port 8000
```

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Add loading states for async operations
- Use semantic HTML elements
- Follow accessibility guidelines

### Component Guidelines
- Keep components focused and single-purpose
- Use TypeScript interfaces for props
- Implement proper error handling
- Add loading and empty states
- Document complex logic with comments

## 🧪 Testing

### Test Structure
```
tests/
├── unit/           # Unit tests for utilities and hooks
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and mocks
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Examples

#### Query the AI Assistant
```
"Show me all available rooms under $1200"
"Find rooms with private bathroom and good sunlight"
"Show me financial report for last month"
"What's the current occupancy rate?"
"Show tenant metrics for all buildings"
```

## 📝 Available Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:ui     # Open Vitest UI

# Database
npm run db:generate # Generate Supabase types
npm run db:push     # Push migrations to Supabase
```

## 📚 API Documentation

### Chat API
- **POST** `/api/chat` - Send message to AI assistant
- **GET** `/api/chat/history` - Get chat history

### Analytics API
- **GET** `/api/analytics/financial` - Get financial metrics
- **GET** `/api/analytics/occupancy` - Get occupancy data
- **GET** `/api/analytics/tenants` - Get tenant metrics

### Property API
- **GET** `/api/rooms` - Search rooms
- **GET** `/api/buildings` - Get building list
- **GET** `/api/rooms/:id` - Get room details

## ⚠️ Known Issues

### TypeScript Warnings (Non-blocking)
1. **localStorage in SSR context** - Warning about localStorage being used during server-side rendering. Does not affect functionality.

2. **className prop on Fragment** - Minor warning in chat page about className on React Fragment. Quick fix available:
   ```tsx
   // In app/chat/page.tsx, wrap the Fragment in a div:
   <div className="flex-1 bg-gray-50">
     {/* content */}
   </div>
   ```

3. **Type definitions** - Some third-party libraries have incomplete TypeScript definitions. These are suppressed with `@ts-ignore` where necessary.

### Current Limitations
- Financial reports show aggregate data (building-specific filtering in progress)
- WebSocket streaming is experimental
- Some components are prepared for future features

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Write clean, readable code
- Add tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass before submitting

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ by the HomeWiz Team