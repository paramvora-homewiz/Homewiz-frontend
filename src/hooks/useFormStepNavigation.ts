'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface UseFormStepNavigationProps {
  totalSteps: number
  onStepChange?: (step: number) => void
}

export function useFormStepNavigation({ totalSteps, onStepChange }: UseFormStepNavigationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [currentStep, setCurrentStep] = useState(0)

  // Sync with URL params when they change
  useEffect(() => {
    const stepParam = searchParams.get('step')
    const urlStep = stepParam ? parseInt(stepParam, 10) : 0
    const validStep = Math.max(0, Math.min(urlStep, totalSteps - 1))
    
    if (validStep !== currentStep) {
      setCurrentStep(validStep)
      onStepChange?.(validStep)
    }
  }, [searchParams, totalSteps, currentStep, onStepChange])

  // Navigate to a specific step
  const goToStep = useCallback((step: number) => {
    const validStep = Math.max(0, Math.min(step, totalSteps - 1))
    if (validStep !== currentStep) {
      // Update URL with new step
      const params = new URLSearchParams(searchParams.toString())
      if (validStep === 0) {
        params.delete('step') // Remove step param for first step
      } else {
        params.set('step', validStep.toString())
      }
      
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
      router.push(newUrl)
    }
  }, [currentStep, totalSteps, router, searchParams])

  // Navigate to next step
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      goToStep(currentStep + 1)
    }
  }, [currentStep, totalSteps, goToStep])

  // Navigate to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  // Check if can navigate
  const canGoNext = currentStep < totalSteps - 1
  const canGoPrev = currentStep > 0

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoPrev
  }
}