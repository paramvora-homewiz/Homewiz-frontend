'use client'

import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { RoleGuard } from '@/components/auth/RoleGuard'

export default function OnboardingPage() {
  return (
    <RoleGuard requiredRole="submit">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <OnboardingForm />
      </div>
    </RoleGuard>
  )
}
