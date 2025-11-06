'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
  onClick?: () => void
  title?: string
  description?: string
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0, 
  hover = true,
  onClick,
  title,
  description
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn("cursor-pointer", onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <Card className={cn(
        "transition-all duration-300 hover:shadow-lg border-0 shadow-md",
        "bg-gradient-to-br from-white to-gray-50",
        className
      )}>
        {title && (
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent className={title ? "pt-0" : "p-6"}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AnimatedFeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  className 
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -8, scale: 1.03 }}
      className={className}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
        <CardContent className="p-8 text-center">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6"
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function AnimatedStepCard({ 
  number, 
  title, 
  description, 
  delay = 0,
  isActive = false,
  isCompleted = false 
}: {
  number: string
  title: string
  description: string
  delay?: number
  isActive?: boolean
  isCompleted?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center w-20 h-20 rounded-full text-xl font-bold mb-4 transition-all duration-300",
          isCompleted 
            ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
            : isActive
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
            : "bg-gray-200 text-gray-600"
        )}
      >
        {isCompleted ? '✓' : number}
      </motion.div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
        className={cn(
          "text-lg font-semibold mb-2 transition-colors",
          isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-900"
        )}
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.3 }}
        className="text-gray-600 text-sm"
      >
        {description}
      </motion.p>
    </motion.div>
  )
}

export function PulsingCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
          "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}
