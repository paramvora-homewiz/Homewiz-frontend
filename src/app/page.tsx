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
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #faf5ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '10px',
            border: '2px solid blue',
            marginBottom: '16px'
          }}>INLINE CSS Test - This should be red with blue border</div>
          <div className="test-css-loading mb-4">EXTERNAL CSS Test - This should be red with blue border</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Loading HomeWiz...</h1>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">TAILWIND Test - This should be styled</h1>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid #2563eb',
            borderTop: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    )
  }

  // Demo mode - show landing page directly
  if (config.app.demoMode) {
    return <LandingPage />
  }

  // Production mode with authentication - use our own auth context instead of Clerk components
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LandingPage />
  }

  // User is authenticated, redirect to onboarding
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Redirecting...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}
