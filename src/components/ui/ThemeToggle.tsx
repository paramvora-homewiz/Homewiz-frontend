'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor, Palette } from 'lucide-react'

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'switch'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({ 
  variant = 'button', 
  size = 'md', 
  showLabel = false,
  className = '' 
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return <Sun className={iconSizes[size]} />
      case 'dark':
        return <Moon className={iconSizes[size]} />
      case 'system':
        return <Monitor className={iconSizes[size]} />
      default:
        return <Sun className={iconSizes[size]} />
    }
  }

  const getThemeLabel = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
      default:
        return 'Light'
    }
  }

  if (variant === 'button') {
    return (
      <motion.button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]} 
          rounded-lg border-2 border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          text-gray-700 dark:text-gray-300
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-all duration-200
          flex items-center justify-center
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {getThemeIcon(theme)}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    )
  }

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </span>
        )}
        <div className="relative">
          <motion.button
            onClick={toggleTheme}
            className={`
              relative w-16 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600
              ${resolvedTheme === 'dark' 
                ? 'bg-gray-800' 
                : 'bg-gray-100'
              }
              transition-colors duration-200
            `}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`
                absolute top-0.5 w-6 h-6 rounded-full shadow-md
                flex items-center justify-center
                ${resolvedTheme === 'dark'
                  ? 'bg-gray-700 text-yellow-400'
                  : 'bg-white text-orange-500'
                }
              `}
              animate={{
                x: resolvedTheme === 'dark' ? 32 : 2
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={resolvedTheme}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  {resolvedTheme === 'dark' ? (
                    <Moon className="w-3 h-3" />
                  ) : (
                    <Sun className="w-3 h-3" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.button>
        </div>
      </div>
    )
  }

  if (variant === 'dropdown') {
    const [isOpen, setIsOpen] = React.useState(false)
    const themes = [
      { value: 'light', label: 'Light', icon: Sun },
      { value: 'dark', label: 'Dark', icon: Moon },
      { value: 'system', label: 'System', icon: Monitor }
    ]

    return (
      <div className={`relative ${className}`}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            ${sizeClasses[size]}
            rounded-lg border-2 border-gray-200 dark:border-gray-700
            bg-white dark:bg-gray-800
            text-gray-700 dark:text-gray-300
            hover:bg-gray-50 dark:hover:bg-gray-700
            transition-all duration-200
            flex items-center justify-center
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Palette className={iconSizes[size]} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown */}
              <motion.div
                className="absolute right-0 top-full mt-2 z-50 min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon
                  const isSelected = theme === themeOption.value
                  
                  return (
                    <motion.button
                      key={themeOption.value}
                      onClick={() => {
                        setTheme(themeOption.value as any)
                        setIsOpen(false)
                      }}
                      className={`
                        w-full px-4 py-3 text-left flex items-center gap-3
                        hover:bg-gray-50 dark:hover:bg-gray-700
                        transition-colors duration-150
                        ${isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                          : 'text-gray-700 dark:text-gray-300'
                        }
                      `}
                      whileHover={{ x: 2 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{themeOption.label}</span>
                      {isSelected && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.1 }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return null
}

// Compact theme indicator
export function ThemeIndicator({ className = '' }: { className?: string }) {
  const { theme, resolvedTheme } = useTheme()
  
  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        resolvedTheme === 'dark' ? 'bg-blue-500' : 'bg-yellow-500'
      }`} />
      <span>{getThemeLabel(theme)}</span>
    </div>
  )
}

function getThemeLabel(theme: string) {
  switch (theme) {
    case 'light':
      return 'Light'
    case 'dark':
      return 'Dark'
    case 'system':
      return 'Auto'
    default:
      return 'Light'
  }
}
