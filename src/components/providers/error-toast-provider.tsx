'use client'

import React, { useEffect } from 'react'
import { ToastProvider, useToast } from '@/components/ui/toast'
import { setGlobalToastHandler, ToastNotification } from '@/lib/error-handler'

interface ErrorToastProviderProps {
  children: React.ReactNode
}

function ToastHandlerSetup() {
  const { addToast } = useToast()

  useEffect(() => {
    // Set up the global toast handler for the error system
    const handleToast = (toast: ToastNotification) => {
      addToast({
        type: toast.type,
        title: toast.title,
        message: toast.message,
        duration: toast.duration,
        action: toast.action
      })
    }

    setGlobalToastHandler(handleToast)

    // Cleanup function
    return () => {
      setGlobalToastHandler(() => {})
    }
  }, [addToast])

  return null
}

export function ErrorToastProvider({ children }: ErrorToastProviderProps) {
  return (
    <ToastProvider>
      <ToastHandlerSetup />
      {children}
    </ToastProvider>
  )
}

export default ErrorToastProvider
