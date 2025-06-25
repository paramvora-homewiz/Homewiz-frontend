'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }

  const buttonColors = {
    success: 'bg-green-100 hover:bg-green-200 text-green-700',
    error: 'bg-red-100 hover:bg-red-200 text-red-700',
    warning: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
    info: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
  }

  const Icon = icons[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "relative flex flex-col p-4 rounded-lg border shadow-lg backdrop-blur-sm",
        colors[toast.type]
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", iconColors[toast.type])} />
        </div>

        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">{toast.title}</h4>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90 whitespace-pre-line">{toast.message}</p>
          )}
        </div>

        <button
          onClick={onRemove}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {toast.action && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => {
              toast.action?.onClick()
              onRemove()
            }}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              buttonColors[toast.type]
            )}
          >
            {toast.action.label}
          </button>
        </div>
      )}
    </motion.div>
  )
}

// Convenience hooks
export function useSuccessToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }, [addToast])
}

export function useErrorToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }, [addToast])
}

export function useInfoToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }, [addToast])
}
