'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTheme, ThemeTransition } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import AnalyticsDashboard from './AnalyticsDashboard'
import {
  Users,
  Building,
  Home,
  Target,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Palette,
  Zap,
  TrendingUp,
  Activity,
  Shield,
  Smartphone
} from 'lucide-react'
import '@/styles/design-system.css'

interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  status: 'completed' | 'in-progress' | 'planned'
  features: string[]
}

function FeatureCard({ title, description, icon, status, features }: FeatureCardProps) {
  const { resolvedTheme } = useTheme()
  
  const statusColors = {
    completed: 'from-green-500 to-emerald-500',
    'in-progress': 'from-blue-500 to-cyan-500',
    planned: 'from-gray-400 to-gray-500'
  }

  const statusLabels = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    planned: 'Planned'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <EnhancedCard variant="premium" className="p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${statusColors[status]}`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === 'completed' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : status === 'in-progress'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
          }`}>
            {statusLabels[status]}
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                status === 'completed' ? 'bg-green-500' : 
                status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
              }`} />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>
      </EnhancedCard>
    </motion.div>
  )
}

export default function ThemeAwareFormsDashboard() {
  const { theme, resolvedTheme } = useTheme()

  const features = [
    {
      title: 'Enhanced Form Components',
      description: 'Premium visual design with advanced input components, auto-complete, and real-time validation.',
      icon: <Zap className="w-6 h-6" />,
      status: 'completed' as const,
      features: [
        'Enhanced Cards with gradient variants',
        'Smart Input with auto-complete',
        'Advanced Select with search',
        'Quick Selection Buttons',
        'Status Badges with animations',
        'Progress Indicators'
      ]
    },
    {
      title: 'Advanced Form Features',
      description: 'Auto-save, smart validation, conditional logic, and real-time collaboration indicators.',
      icon: <Settings className="w-6 h-6" />,
      status: 'completed' as const,
      features: [
        'Auto-save with localStorage',
        'Smart validation with dependencies',
        'Conditional field logic',
        'Real-time collaboration',
        'Field activity tracking',
        'Advanced form wrapper'
      ]
    },
    {
      title: 'Interactive Analytics Dashboard',
      description: 'Comprehensive data visualization with charts, metrics, and real-time activity feeds.',
      icon: <BarChart3 className="w-6 h-6" />,
      status: 'completed' as const,
      features: [
        'Real-time metrics cards',
        'Interactive line charts',
        'Pie charts for distributions',
        'Bar charts for comparisons',
        'Area charts for trends',
        'Live activity feed'
      ]
    },
    {
      title: 'Dark Mode & Theme System',
      description: 'Comprehensive dark mode with theme switching and consistent color schemes.',
      icon: <Palette className="w-6 h-6" />,
      status: 'completed' as const,
      features: [
        'Theme context provider',
        'Multiple theme toggle variants',
        'System preference detection',
        'Smooth theme transitions',
        'Dark mode CSS variables',
        'Theme-aware components'
      ]
    },
    {
      title: 'Mobile-First Responsive Design',
      description: 'Touch-friendly interactions, swipe gestures, and mobile-optimized UX patterns.',
      icon: <Smartphone className="w-6 h-6" />,
      status: 'in-progress' as const,
      features: [
        'Touch-friendly form controls',
        'Swipe gesture support',
        'Mobile navigation patterns',
        'Responsive grid layouts',
        'Optimized touch targets',
        'Mobile-specific animations'
      ]
    },
    {
      title: 'Security & Accessibility',
      description: 'Enhanced security features and comprehensive accessibility compliance.',
      icon: <Shield className="w-6 h-6" />,
      status: 'planned' as const,
      features: [
        'WCAG 2.1 AA compliance',
        'Keyboard navigation',
        'Screen reader support',
        'High contrast mode',
        'Focus management',
        'Security best practices'
      ]
    }
  ]

  return (
    <ThemeTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 transition-all duration-500">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header with Theme Toggle */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-2">
                HomeWiz Platform
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Premium Rental Management with Advanced Features
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Current theme: <span className="font-semibold capitalize">{theme}</span>
              </div>
              <ThemeToggle variant="dropdown" size="lg" />
            </div>
          </motion.div>

          {/* Theme Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <EnhancedCard variant="gradient" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    {resolvedTheme === 'dark' ? (
                      <Moon className="w-8 h-8 text-white" />
                    ) : (
                      <Sun className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {resolvedTheme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                    </h2>
                    <p className="text-white/80">
                      Experience the platform in {resolvedTheme} theme with smooth transitions
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white/80 text-sm">Theme System</div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-white/80 text-sm">Complete</div>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>

          {/* Analytics Dashboard Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Integrated Analytics Dashboard
                </h2>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The analytics dashboard is fully integrated with the theme system and provides 
                  comprehensive insights into your rental platform performance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">12+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Chart Types</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">Real-time</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Data Updates</div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">Live</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Activity Feed</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>
        </div>
      </div>
    </ThemeTransition>
  )
}
