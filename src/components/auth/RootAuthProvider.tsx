'use client'

import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { AuthProvider } from './AuthProvider'
import { authConfigManager } from '@/lib/auth-config'
import config from '@/lib/config'

interface RootAuthProviderProps {
  children: React.ReactNode
}

/**
 * Root Authentication Provider
 * 
 * This component handles the conditional wrapping with ClerkProvider
 * and ensures Clerk hooks are only used when properly configured.
 */
export function RootAuthProvider({ children }: RootAuthProviderProps) {
  // Check if we should use Clerk
  const isClerkConfigured = authConfigManager.isClerkConfigured()
  const shouldUseClerk = !config.app.demoMode && isClerkConfigured

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🔐 Auth Configuration:', {
      demoMode: config.app.demoMode,
      isClerkConfigured,
      shouldUseClerk,
      publishableKey: config.auth.clerk.publishableKey ? 'SET' : 'NOT_SET',
    })
  }

  if (shouldUseClerk) {
    // Wrap with ClerkProvider for production mode
    try {
      const clerkConfig = authConfigManager.getClerkConfig()

      return (
        <ClerkProvider
          publishableKey={clerkConfig.publishableKey}
          appearance={clerkConfig.appearance}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClerkProvider>
      )
    } catch (error) {
      console.warn('Clerk configuration error, falling back to demo mode:', error)
      // Fall through to demo mode
    }
  }

  // Use demo mode (no ClerkProvider wrapper)
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
