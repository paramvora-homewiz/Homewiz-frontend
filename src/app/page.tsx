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
    // In production mode, redirect authenticated users to onboarding
    if (!config.app.demoMode && user && !isLoading && mounted) {
      router.push('/onboarding')
    }
  }, [user, isLoading, router, mounted])

  // Prevent hydration mismatch by showing consistent content until mounted
  if (!mounted) {
    return <LandingPage />
  }

  // Demo mode - show landing page directly
  if (config.app.demoMode) {
    return <LandingPage />
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

  // User is authenticated, redirect to onboarding
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
