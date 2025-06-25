'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LandingPage } from '@/components/landing/LandingPage'
import { useAuth } from '@/components/auth/AuthProvider'
import config from '@/lib/config'

export default function Home() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (config.app.demoMode) {
        // In demo mode, redirect directly to forms page
        router.push('/forms')
      } else if (user && !isLoading) {
        // In production mode, redirect authenticated users to forms
        router.push('/forms')
      }
    }
  }, [user, isLoading, router, mounted, config.app.demoMode])

  // Prevent hydration mismatch by showing consistent content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Demo mode - redirect to forms (handled in useEffect)
  if (config.app.demoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Redirecting to Forms Dashboard...</p>
        </div>
      </div>
    )
  }

  // Production mode with authentication - use our own auth context instead of Clerk components
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  // User is authenticated, redirect to forms
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
