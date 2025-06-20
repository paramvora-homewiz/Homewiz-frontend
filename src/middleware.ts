import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import appConfig from '@/lib/config'

// Define route matchers for different access levels
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/public(.*)',
  '/demo(.*)',
  '/simple(.*)',
  '/test(.*)',
  '/standalone(.*)'
])

const isProtectedRoute = createRouteMatcher([
  '/onboarding(.*)',
  '/dashboard(.*)',
  '/profile(.*)',
  '/admin(.*)',
  '/api/protected(.*)'
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)'
])

const isOperatorRoute = createRouteMatcher([
  '/operator(.*)',
  '/api/operator(.*)'
])

export default clerkMiddleware((auth, req) => {
  // Check if we're in demo mode
  if (appConfig.app.demoMode) {
    console.log('🎭 Demo mode enabled - bypassing authentication')
    return NextResponse.next()
  }

  const { userId, sessionClaims } = auth()
  const userRole = sessionClaims?.metadata?.role as string || 'submit'

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect all other routes - require authentication
  if (isProtectedRoute(req)) {
    auth().protect()
  }

  // Admin routes - require admin role
  if (isAdminRoute(req)) {
    auth().protect()

    if (userRole !== 'admin' && userRole !== 'edit') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Operator routes - require operator or higher role
  if (isOperatorRoute(req)) {
    auth().protect()

    if (!['admin', 'edit', 'operator'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (appConfig.isProduction) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
