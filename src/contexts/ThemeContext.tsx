'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'homewiz-theme'
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

  // Get system preference
  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // Resolve theme based on current setting
  const resolveTheme = (currentTheme: Theme): ResolvedTheme => {
    if (currentTheme === 'system') {
      return getSystemTheme()
    }
    return currentTheme
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(storageKey) as Theme
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme)
      }
    }
  }, [storageKey])

  // Update resolved theme when theme changes or system preference changes
  useEffect(() => {
    const newResolvedTheme = resolveTheme(theme)
    setResolvedTheme(newResolvedTheme)

    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(newResolvedTheme)
      
      // Update meta theme-color
      let metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (!metaThemeColor) {
        // Create the meta tag if it doesn't exist
        metaThemeColor = document.createElement('meta')
        metaThemeColor.setAttribute('name', 'theme-color')
        document.head.appendChild(metaThemeColor)
      }

      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          'content',
          newResolvedTheme === 'dark' ? '#1f2937' : '#ffffff'
        )
      }
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const newResolvedTheme = getSystemTheme()
        setResolvedTheme(newResolvedTheme)
        
        // Apply theme to document
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(newResolvedTheme)

        // Update meta theme-color
        let metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (!metaThemeColor) {
          // Create the meta tag if it doesn't exist
          metaThemeColor = document.createElement('meta')
          metaThemeColor.setAttribute('name', 'theme-color')
          document.head.appendChild(metaThemeColor)
        }

        if (metaThemeColor) {
          metaThemeColor.setAttribute(
            'content',
            newResolvedTheme === 'dark' ? '#1f2937' : '#ffffff'
          )
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme)
    }
  }

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme-aware component wrapper
interface ThemeAwareProps {
  children: React.ReactNode
  lightClass?: string
  darkClass?: string
  className?: string
}

export function ThemeAware({ children, lightClass = '', darkClass = '', className = '' }: ThemeAwareProps) {
  const { resolvedTheme } = useTheme()
  
  const themeClass = resolvedTheme === 'dark' ? darkClass : lightClass
  const combinedClass = `${className} ${themeClass}`.trim()
  
  return (
    <div className={combinedClass}>
      {children}
    </div>
  )
}

// Hook for theme-aware styles
export function useThemeStyles() {
  const { resolvedTheme } = useTheme()
  
  return {
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    bg: resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white',
    text: resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900',
    border: resolvedTheme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    card: resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white',
    hover: resolvedTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    input: resolvedTheme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
    button: {
      primary: resolvedTheme === 'dark' 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: resolvedTheme === 'dark'
        ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
        : 'bg-white hover:bg-gray-50 text-gray-900 border-gray-300'
    }
  }
}

// Theme transition component
export function ThemeTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="transition-colors duration-300 ease-in-out">
      {children}
    </div>
  )
}
