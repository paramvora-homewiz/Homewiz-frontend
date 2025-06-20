'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { useMobileFormOptimization, useTouchGestures, useDeviceDetection, useTouchTargetOptimization } from '@/hooks/useMobileOptimization'
import { ChevronLeft, ChevronRight, ChevronDown, Menu, X, Check, Search, Filter } from 'lucide-react'

// Mobile-optimized input component
interface MobileInputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: string
  error?: string
  icon?: React.ReactNode
  autoFocus?: boolean
  className?: string
}

export function MobileInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  icon,
  autoFocus = false,
  className = ''
}: MobileInputProps) {
  const { scrollToInput, isMobile } = useMobileFormOptimization()
  const { getTouchTargetSize } = useTouchTargetOptimization()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = () => {
    if (isMobile && inputRef.current) {
      scrollToInput(inputRef.current)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={getTouchTargetSize('large')}
          className={`
            w-full px-4 py-4 ${icon ? 'pl-12' : ''} 
            border-2 rounded-xl transition-all duration-200
            text-lg bg-white dark:bg-gray-800
            border-gray-200 dark:border-gray-600
            focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50
            text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
            ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
            ${isMobile ? 'text-16px' : ''} // Prevents zoom on iOS
          `}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// Mobile-optimized button component
interface MobileButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  className?: string
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = ''
}: MobileButtonProps) {
  const { getTouchTargetSize } = useTouchTargetOptimization()

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg',
    secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600',
    outline: 'bg-transparent text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400'
  }

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      style={getTouchTargetSize('large')}
      className={`
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-95 touch-manipulation
        ${className}
      `}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}

// Mobile swipeable card component
interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: { icon: React.ReactNode; color: string; label: string }
  rightAction?: { icon: React.ReactNode; color: string; label: string }
  className?: string
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = ''
}: SwipeableCardProps) {
  const [dragX, setDragX] = useState(0)
  const [isRevealed, setIsRevealed] = useState(false)

  const handleDrag = (event: any, info: PanInfo) => {
    setDragX(info.offset.x)
    setIsRevealed(Math.abs(info.offset.x) > 50)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    
    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight()
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft()
    }
    
    setDragX(0)
    setIsRevealed(false)
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Left action */}
      {leftAction && (
        <div className={`absolute inset-y-0 left-0 w-20 flex items-center justify-center ${leftAction.color}`}>
          {leftAction.icon}
        </div>
      )}

      {/* Right action */}
      {rightAction && (
        <div className={`absolute inset-y-0 right-0 w-20 flex items-center justify-center ${rightAction.color}`}>
          {rightAction.icon}
        </div>
      )}

      {/* Main card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ x: dragX }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm relative z-10"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Mobile bottom sheet component
interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  height?: 'auto' | 'half' | 'full'
}

export function BottomSheet({ isOpen, onClose, title, children, height = 'auto' }: BottomSheetProps) {
  const { isMobile } = useDeviceDetection()

  const heightClasses = {
    auto: 'max-h-[80vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]'
  }

  if (!isMobile) {
    // Render as modal on desktop
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 w-full max-w-md mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {title && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="p-4 max-h-96 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Bottom sheet */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-xl z-50 ${heightClasses[height]}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(event, info) => {
              if (info.offset.y > 100) {
                onClose()
              }
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-4 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="px-4 pb-4 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Mobile-optimized form wrapper
interface MobileFormWrapperProps {
  children: React.ReactNode
  title?: string
  onBack?: () => void
  actions?: React.ReactNode
  className?: string
}

export function MobileFormWrapper({ children, title, onBack, actions, className = '' }: MobileFormWrapperProps) {
  const { isMobile, isKeyboardOpen } = useMobileFormOptimization()

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Mobile header */}
      {isMobile && (
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {title && (
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {title}
                </h1>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}

      {/* Form content */}
      <div className={`${isMobile ? 'px-4 py-6' : 'p-6'} ${isKeyboardOpen ? 'pb-20' : ''}`}>
        {children}
      </div>
    </div>
  )
}

// Mobile pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)
  const { isMobile } = useDeviceDetection()

  const handleDrag = (event: any, info: PanInfo) => {
    if (window.scrollY > 0) return // Only allow pull-to-refresh at top

    const distance = Math.max(0, info.offset.y)
    setPullDistance(distance)
    setCanRefresh(distance > threshold)
  }

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    setPullDistance(0)
    setCanRefresh(false)
  }

  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.3}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={{ y: isRefreshing ? 60 : 0 }}
      className="relative"
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-blue-50 dark:bg-blue-900/20"
            style={{ transform: `translateY(-100%)` }}
          >
            {isRefreshing ? (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Refreshing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <motion.div
                  animate={{ rotate: canRefresh ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
                <span className="text-sm font-medium">
                  {canRefresh ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </motion.div>
  )
}

// Mobile tab navigation
interface MobileTabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function MobileTabs({ tabs, activeTab, onChange, className = '' }: MobileTabsProps) {
  const { getTouchTargetSize } = useTouchTargetOptimization()

  return (
    <div className={`flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={getTouchTargetSize('medium')}
          className={`
            flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
            transition-all duration-200 font-medium text-sm
            ${activeTab === tab.id
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
