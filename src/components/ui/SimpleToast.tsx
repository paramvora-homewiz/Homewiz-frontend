'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setGlobalToastHandler } from '@/lib/error-handler';

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function SimpleToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }

    console.log('🎉 Toast notification added:', {
      type: toast.type,
      title: toast.title,
      message: toast.message,
      duration: toast.duration || 5000
    })

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  // Connect to global toast handler for error-handler.ts
  useEffect(() => {
    console.log('✅ Global toast handler connected to SimpleToastProvider')

    setGlobalToastHandler((toast) => {
      console.log('📢 Global toast handler called with:', toast)
      addToast({
        type: toast.type,
        title: toast.title,
        message: toast.message,
        duration: toast.duration
      })
    })

    // Cleanup on unmount
    return () => {
      console.log('🔌 Global toast handler disconnected')
      setGlobalToastHandler(() => {})
    }
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <SimpleToastContainer />
    </ToastContext.Provider>
  )
}

export function useSimpleToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useSimpleToast must be used within a SimpleToastProvider')
  }
  return context
}

function SimpleToastContainer() {
  const { toasts, removeToast } = useSimpleToast()

  if (toasts.length === 0) return null

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            relative flex items-start gap-3 p-4 pr-12 rounded-xl border-2 shadow-2xl backdrop-blur-md
            transform transition-all duration-300 ease-out
            animate-in slide-in-from-right-full fade-in
            ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-900'
                : toast.type === 'error'
                ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300 text-red-900'
                : toast.type === 'warning'
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 text-yellow-900'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-900'
            }
          `}
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              toast.type === 'success'
                ? 'bg-green-100 text-green-600'
                : toast.type === 'error'
                ? 'bg-red-100 text-red-600'
                : toast.type === 'warning'
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {getIcon(toast.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold mb-0.5 leading-tight">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => removeToast(toast.id)}
            className={`
              absolute top-3 right-3
              w-6 h-6 rounded-md flex items-center justify-center
              transition-all duration-200
              hover:scale-110 active:scale-95
              ${
                toast.type === 'success'
                  ? 'text-green-500 hover:bg-green-200'
                  : toast.type === 'error'
                  ? 'text-red-500 hover:bg-red-200'
                  : toast.type === 'warning'
                  ? 'text-yellow-500 hover:bg-yellow-200'
                  : 'text-blue-500 hover:bg-blue-200'
              }
            `}
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-xl overflow-hidden">
            <div
              className={`h-full ${
                toast.type === 'success'
                  ? 'bg-green-500'
                  : toast.type === 'error'
                  ? 'bg-red-500'
                  : toast.type === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{
                animation: `shrink ${toast.duration || 5000}ms linear forwards`,
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

// Convenience hooks
export function useSuccessToast() {
  const { addToast } = useSimpleToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }, [addToast])
}

export function useErrorToast() {
  const { addToast } = useSimpleToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useSimpleToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }, [addToast])
}

export function useInfoToast() {
  const { addToast } = useSimpleToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }, [addToast])
}