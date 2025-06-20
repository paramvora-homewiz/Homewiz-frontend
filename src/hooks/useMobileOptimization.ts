import { useState, useEffect, useCallback, useRef } from 'react'

// Hook for detecting mobile devices and screen sizes
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenSize: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    orientation: 'portrait' as 'portrait' | 'landscape',
    touchSupported: false,
    userAgent: ''
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent

      // Detect device type based on screen width
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      // Determine screen size category
      let screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (isMobile) screenSize = 'mobile'
      else if (isTablet) screenSize = 'tablet'

      // Detect orientation
      const orientation = width > height ? 'landscape' : 'portrait'

      // Check for touch support
      const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        orientation,
        touchSupported,
        userAgent
      })
    }

    // Initial detection
    updateDeviceInfo()

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}

// Hook for touch gestures
interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onLongPress?: () => void
  threshold?: number
  longPressDelay?: number
}

export function useTouchGestures(options: TouchGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = options

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout>()

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }

    // Start long press timer
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress()
      }, longPressDelay)
    }
  }, [onLongPress, longPressDelay])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Check for tap (short press with minimal movement)
    if (distance < 10 && deltaTime < 300 && onTap) {
      onTap()
      return
    }

    // Check for swipe gestures
    if (distance > threshold) {
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI

      if (angle >= -45 && angle <= 45 && onSwipeRight) {
        onSwipeRight()
      } else if (angle >= 135 || angle <= -135 && onSwipeLeft) {
        onSwipeLeft()
      } else if (angle >= 45 && angle <= 135 && onSwipeDown) {
        onSwipeDown()
      } else if (angle >= -135 && angle <= -45 && onSwipeUp) {
        onSwipeUp()
      }
    }

    touchStartRef.current = null
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap])

  const handleTouchMove = useCallback(() => {
    // Clear long press timer on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }
  }, [])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove
  }
}

// Hook for mobile-optimized form behavior
export function useMobileFormOptimization() {
  const { isMobile, touchSupported } = useDeviceDetection()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    if (!isMobile) return

    const initialHeight = window.innerHeight
    setViewportHeight(initialHeight)

    const handleResize = () => {
      const currentHeight = window.innerHeight
      const heightDifference = initialHeight - currentHeight

      // Keyboard is likely open if height decreased significantly
      setIsKeyboardOpen(heightDifference > 150)
      setViewportHeight(currentHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  // Auto-scroll to focused input on mobile
  const scrollToInput = useCallback((element: HTMLElement) => {
    if (!isMobile) return

    setTimeout(() => {
      const rect = element.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const targetY = rect.top + scrollTop - 100 // 100px offset from top

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      })
    }, 300) // Delay to allow keyboard animation
  }, [isMobile])

  return {
    isMobile,
    touchSupported,
    isKeyboardOpen,
    viewportHeight,
    scrollToInput
  }
}

// Hook for mobile navigation patterns
export function useMobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const { isMobile } = useDeviceDetection()

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const switchTab = useCallback((index: number) => {
    setActiveTab(index)
    if (isMobile) {
      closeMenu()
    }
  }, [isMobile, closeMenu])

  // Close menu when clicking outside (for mobile)
  useEffect(() => {
    if (!isMobile || !isMenuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (!target.closest('.mobile-menu')) {
        closeMenu()
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobile, isMenuOpen, closeMenu])

  return {
    isMenuOpen,
    activeTab,
    toggleMenu,
    closeMenu,
    switchTab,
    isMobile
  }
}

// Hook for optimized touch targets
export function useTouchTargetOptimization() {
  const { isMobile, touchSupported } = useDeviceDetection()

  const getTouchTargetSize = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    if (!touchSupported) return {}

    const sizes = {
      small: { minWidth: '44px', minHeight: '44px' },
      medium: { minWidth: '48px', minHeight: '48px' },
      large: { minWidth: '56px', minHeight: '56px' }
    }

    return sizes[size]
  }, [touchSupported])

  const getTouchTargetSpacing = useCallback(() => {
    return touchSupported ? { margin: '8px' } : {}
  }, [touchSupported])

  return {
    isMobile,
    touchSupported,
    getTouchTargetSize,
    getTouchTargetSpacing
  }
}

// Hook for mobile-optimized animations
export function useMobileAnimations() {
  const { isMobile } = useDeviceDetection()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const getAnimationConfig = useCallback((type: 'fast' | 'normal' | 'slow' = 'normal') => {
    if (prefersReducedMotion) {
      return { duration: 0 }
    }

    const durations = {
      fast: isMobile ? 0.15 : 0.2,
      normal: isMobile ? 0.25 : 0.3,
      slow: isMobile ? 0.35 : 0.5
    }

    return { duration: durations[type] }
  }, [isMobile, prefersReducedMotion])

  return {
    isMobile,
    prefersReducedMotion,
    getAnimationConfig
  }
}
