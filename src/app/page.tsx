'use client'

import { useEffect, useState } from 'react'
import { LandingPage } from '@/components/landing/LandingPage'
import { useAuth } from '@/components/auth/AuthProvider'
import config from '@/lib/config'

export default function Home() {
  const { isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by showing consistent content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Always show the landing page with overview and forms button
  return <LandingPage />
}
