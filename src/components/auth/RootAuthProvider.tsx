'use client'

import React from 'react'
import { AuthProvider } from './AuthProvider'
import config from '../../lib/config'

interface RootAuthProviderProps {
  children: React.ReactNode
}

/**
 * Root Authentication Provider
 *
 * Simplified for demo mode - no Clerk authentication
 */
export function RootAuthProvider({ children }: RootAuthProviderProps) {
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('🎭 Demo Mode - No authentication required')
  }

  // Always use demo mode (no ClerkProvider wrapper)
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
