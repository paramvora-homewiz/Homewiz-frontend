'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
  title: string
  content: string | React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HelpTooltip({
  title,
  content,
  position = 'right',
  size = 'md',
  className
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Ensure we're on client side for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate tooltip position based on button position
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const tooltipWidth = size === 'sm' ? 224 : size === 'lg' ? 320 : 288
    const tooltipHeight = 150 // approximate
    const gap = 12

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = buttonRect.top - tooltipHeight - gap + window.scrollY
        left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2 + window.scrollX
        break
      case 'bottom':
        top = buttonRect.bottom + gap + window.scrollY
        left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2 + window.scrollX
        break
      case 'left':
        top = buttonRect.top + buttonRect.height / 2 - tooltipHeight / 2 + window.scrollY
        left = buttonRect.left - tooltipWidth - gap + window.scrollX
        break
      case 'right':
      default:
        top = buttonRect.top + buttonRect.height / 2 + window.scrollY
        left = buttonRect.right + gap + window.scrollX
        break
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth
    if (left + tooltipWidth > viewportWidth - 20) {
      left = viewportWidth - tooltipWidth - 20
    }
    if (left < 20) {
      left = 20
    }

    setTooltipPosition({ top, left })
  }, [position, size])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen, updatePosition])

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        tooltipRef.current && !tooltipRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }, 0)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsOpen(!isOpen)
  }

  const sizeWidths = {
    sm: 224,
    md: 288,
    lg: 320
  }

  const tooltipContent = (
    <div
      ref={tooltipRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        zIndex: 99999,
        width: sizeWidths[size],
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'visible',
        transform: position === 'right' ? 'translateY(-50%)' : 'none',
        animation: 'tooltipFadeIn 0.15s ease-out',
      }}
    >
      {/* Arrow for right position */}
      {position === 'right' && (
        <div
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRight: 'none',
            borderTop: 'none',
            transform: 'rotate(45deg)',
            top: '50%',
            left: '-7px',
            marginTop: '-6px',
          }}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px 16px 12px 16px',
          backgroundColor: '#ffffff',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#dbeafe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Info style={{ width: '18px', height: '18px', color: '#2563eb' }} />
        </div>
        <h4
          style={{
            fontWeight: 600,
            fontSize: '15px',
            color: '#111827',
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(false)
          }}
          style={{
            marginLeft: 'auto',
            padding: '4px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
            e.currentTarget.style.color = '#6b7280'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#9ca3af'
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Divider */}
      <div style={{ margin: '0 16px', borderTop: '1px solid #f3f4f6' }} />

      {/* Content */}
      <div
        style={{
          padding: '12px 16px 16px 16px',
          backgroundColor: '#ffffff',
          borderRadius: '0 0 12px 12px',
        }}
      >
        <div
          style={{
            fontSize: '13px',
            color: '#4b5563',
            lineHeight: 1.7,
          }}
        >
          {content}
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: ${position === 'right' ? 'translateY(-50%) translateX(-8px)' : 'translateY(-8px)'};
          }
          to {
            opacity: 1;
            transform: ${position === 'right' ? 'translateY(-50%) translateX(0)' : 'translateY(0)'};
          }
        }
      `}</style>
    </div>
  )

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200",
          "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
          isOpen && "text-blue-600 bg-blue-50",
          className
        )}
        aria-label={`Help: ${title}`}
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Render tooltip in portal to escape any parent styling issues */}
      {mounted && isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998,
              backgroundColor: 'transparent',
            }}
          />
          {tooltipContent}
        </>,
        document.body
      )}
    </div>
  )
}

// Predefined help content for common form fields
export const helpContent = {
  income: {
    title: "Annual Income",
    content: (
      <div className="space-y-2">
        <p>Enter your gross annual income before taxes.</p>
        <p><strong>Include:</strong></p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li>Salary or wages</li>
          <li>Bonuses and commissions</li>
          <li>Investment income</li>
          <li>Other regular income</li>
        </ul>
      </div>
    )
  },
  budget: {
    title: "Budget Range",
    content: (
      <div className="space-y-2">
        <p>Set your comfortable monthly rent range.</p>
        <p className="text-xs"><strong>Tip:</strong> Most landlords prefer tenants whose rent is no more than 30% of their gross monthly income.</p>
      </div>
    )
  },
  documents: {
    title: "Required Documents",
    content: (
      <div className="space-y-2">
        <p>Upload clear, readable copies of:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li><strong>ID:</strong> Driver's license, passport, or state ID</li>
          <li><strong>Income:</strong> Recent pay stubs, employment letter, or tax returns</li>
          <li><strong>References:</strong> Letters from previous landlords or employers</li>
        </ul>
      </div>
    )
  },
  visa: {
    title: "Visa Status",
    content: (
      <div className="space-y-2">
        <p>This helps us understand your legal status for renting.</p>
        <p className="text-xs">Don't worry - we work with tenants of all visa types and citizenship statuses.</p>
      </div>
    )
  },
  leadSource: {
    title: "How did you find us?",
    content: (
      <div className="space-y-2">
        <p>This helps us understand which marketing channels are most effective.</p>
        <p className="text-xs">Your answer helps us improve our services and reach more people like you.</p>
      </div>
    )
  }
}
