'use client'

import { OnboardingForm } from '@/components/onboarding/OnboardingForm'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { FormDataProvider } from '@/components/forms/FormDataProvider'

export default function OnboardingPage() {
  return (
    <RoleGuard requiredRole="submit">
      <FormDataProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <OnboardingForm />
        </div>
      </FormDataProvider>
    </RoleGuard>
  )
}
