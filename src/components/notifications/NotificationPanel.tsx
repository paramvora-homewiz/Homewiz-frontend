'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import { notificationService, Notification } from '../../services/notificationService'
import {
  Bell,
  BellRing,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Users,
  Building,
  Home,
  Target,
  UserCheck,
  Activity,
  Wrench
} from 'lucide-react'

interface NotificationPanelProps {
  className?: string
}

export default function NotificationPanel({ className = '' }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications)
    })

    // Load initial notifications
    setNotifications(notificationService.getNotifications())

    // Request browser notification permission
    notificationService.requestNotificationPermission()

    return unsubscribe
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false
    if (filter === 'priority' && notification.priority === 'low') return false
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operators': return <Users className="w-4 h-4" />
      case 'buildings': return <Building className="w-4 h-4" />
      case 'rooms': return <Home className="w-4 h-4" />
      case 'leads': return <Target className="w-4 h-4" />
      case 'tenants': return <UserCheck className="w-4 h-4" />
      case 'maintenance': return <Wrench className="w-4 h-4" />
      case 'system': return <Activity className="w-4 h-4" />
      default: return <Bell className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead()
  }

  const handleDelete = (id: string) => {
    notificationService.deleteNotification(id)
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      notificationService.clearAllNotifications()
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const categories = Array.from(new Set(notifications.map(n => n.category)))

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 z-50"
          >
            <EnhancedCard variant="premium" className="p-0 shadow-xl border">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                        <CheckCheck className="w-4 h-4 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 text-sm">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="priority">Priority</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>

                  {notifications.length > 0 && (
                    <Button onClick={handleClearAll} variant="ghost" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Priority Indicator */}
                            <div className={`w-1 h-full ${getPriorityColor(notification.priority)} rounded-full`}></div>

                            {/* Type Icon */}
                            <div className={`p-1 rounded-full ${getTypeColor(notification.type)}`}>
                              {getTypeIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </h4>
                                    <div className="flex items-center gap-1">
                                      {getCategoryIcon(notification.category)}
                                      <Badge variant="outline" className="text-xs">
                                        {notification.category}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Clock className="w-3 h-3" />
                                      {formatTimeAgo(notification.timestamp)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {notification.actionUrl && (
                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                          <ExternalLink className="w-3 h-3 mr-1" />
                                          {notification.actionLabel || 'View'}
                                        </Button>
                                      )}
                                      {!notification.read && (
                                        <Button
                                          onClick={() => handleMarkAsRead(notification.id)}
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2"
                                        >
                                          <Check className="w-3 h-3" />
                                        </Button>
                                      )}
                                      <Button
                                        onClick={() => handleDelete(notification.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-red-600 hover:text-red-700"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{filteredNotifications.length} of {notifications.length} notifications</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Settings className="w-3 h-3 mr-1" />
                      Settings
                    </Button>
                  </div>
                </div>
              )}
            </EnhancedCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
