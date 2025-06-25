import { useState, useEffect, useCallback, useRef } from 'react'

export interface CollaboratorInfo {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
  isOnline: boolean
  lastSeen?: Date
}

export interface FieldActivity {
  fieldName: string
  collaboratorId: string
  action: 'editing' | 'viewing' | 'left'
  timestamp: Date
}

export interface CollaborationState {
  collaborators: Record<string, CollaboratorInfo>
  fieldActivities: Record<string, FieldActivity[]>
  currentUserActivity: Record<string, 'editing' | 'viewing' | null>
}

interface UseRealTimeCollaborationOptions {
  formId: string
  currentUser: CollaboratorInfo
  onCollaboratorJoin?: (collaborator: CollaboratorInfo) => void
  onCollaboratorLeave?: (collaboratorId: string) => void
  onFieldActivity?: (activity: FieldActivity) => void
  debounceMs?: number
}

export function useRealTimeCollaboration(options: UseRealTimeCollaborationOptions) {
  const {
    formId,
    currentUser,
    onCollaboratorJoin,
    onCollaboratorLeave,
    onFieldActivity,
    debounceMs = 500
  } = options

  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    collaborators: { [currentUser.id]: currentUser },
    fieldActivities: {},
    currentUserActivity: {}
  })

  const activityTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Simulate WebSocket connection (in real implementation, this would be actual WebSocket)
  const wsRef = useRef<{
    send: (data: any) => void
    close: () => void
  } | null>(null)

  // Initialize collaboration connection
  useEffect(() => {
    // Simulate WebSocket connection
    const mockWs = {
      send: (data: any) => {
        // In real implementation, send to WebSocket server
        // Data would be sent to collaboration service
      },
      close: () => {
        // Cleanup connection
      }
    }

    wsRef.current = mockWs

    // Send join event
    mockWs.send({
      type: 'join',
      formId,
      collaborator: currentUser
    })

    // Simulate receiving collaboration events
    const simulateCollaborationEvents = () => {
      // This would be replaced with actual WebSocket message handling
      const mockCollaborators: CollaboratorInfo[] = [
        {
          id: 'user-2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          color: '#10B981',
          isOnline: true
        },
        {
          id: 'user-3',
          name: 'Mike Chen',
          email: 'mike@example.com',
          color: '#8B5CF6',
          isOnline: true
        }
      ]

      // Simulate collaborators joining
      setTimeout(() => {
        mockCollaborators.forEach(collaborator => {
          setCollaborationState(prev => ({
            ...prev,
            collaborators: {
              ...prev.collaborators,
              [collaborator.id]: collaborator
            }
          }))
          onCollaboratorJoin?.(collaborator)
        })
      }, 1000)

      // Simulate field activities
      setTimeout(() => {
        const activity: FieldActivity = {
          fieldName: 'tenant_name',
          collaboratorId: 'user-2',
          action: 'editing',
          timestamp: new Date()
        }
        handleFieldActivity(activity)
      }, 2000)
    }

    simulateCollaborationEvents()

    // Heartbeat to maintain connection
    heartbeatIntervalRef.current = setInterval(() => {
      mockWs.send({
        type: 'heartbeat',
        formId,
        collaboratorId: currentUser.id
      })
    }, 30000)

    return () => {
      // Send leave event
      mockWs.send({
        type: 'leave',
        formId,
        collaboratorId: currentUser.id
      })

      mockWs.close()
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }

      // Clear all activity timeouts
      Object.values(activityTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }, [formId, currentUser, onCollaboratorJoin])

  // Handle field activity
  const handleFieldActivity = useCallback((activity: FieldActivity) => {
    setCollaborationState(prev => {
      const fieldActivities = { ...prev.fieldActivities }
      
      if (!fieldActivities[activity.fieldName]) {
        fieldActivities[activity.fieldName] = []
      }

      // Remove existing activity for this collaborator on this field
      fieldActivities[activity.fieldName] = fieldActivities[activity.fieldName].filter(
        a => a.collaboratorId !== activity.collaboratorId
      )

      // Add new activity if not 'left'
      if (activity.action !== 'left') {
        fieldActivities[activity.fieldName].push(activity)
      }

      return {
        ...prev,
        fieldActivities
      }
    })

    onFieldActivity?.(activity)

    // Auto-remove activity after timeout
    const timeoutKey = `${activity.fieldName}-${activity.collaboratorId}`
    if (activityTimeoutRef.current[timeoutKey]) {
      clearTimeout(activityTimeoutRef.current[timeoutKey])
    }

    if (activity.action !== 'left') {
      activityTimeoutRef.current[timeoutKey] = setTimeout(() => {
        handleFieldActivity({
          ...activity,
          action: 'left',
          timestamp: new Date()
        })
      }, 10000) // Remove activity after 10 seconds of inactivity
    }
  }, [onFieldActivity])

  // Broadcast field focus
  const broadcastFieldFocus = useCallback((fieldName: string) => {
    const activity: FieldActivity = {
      fieldName,
      collaboratorId: currentUser.id,
      action: 'editing',
      timestamp: new Date()
    }

    wsRef.current?.send({
      type: 'field_activity',
      formId,
      activity
    })

    // Update local state
    setCollaborationState(prev => ({
      ...prev,
      currentUserActivity: {
        ...prev.currentUserActivity,
        [fieldName]: 'editing'
      }
    }))
  }, [formId, currentUser.id])

  // Broadcast field blur
  const broadcastFieldBlur = useCallback((fieldName: string) => {
    const activity: FieldActivity = {
      fieldName,
      collaboratorId: currentUser.id,
      action: 'left',
      timestamp: new Date()
    }

    wsRef.current?.send({
      type: 'field_activity',
      formId,
      activity
    })

    // Update local state
    setCollaborationState(prev => ({
      ...prev,
      currentUserActivity: {
        ...prev.currentUserActivity,
        [fieldName]: null
      }
    }))
  }, [formId, currentUser.id])

  // Get collaborators currently active on a field
  const getFieldCollaborators = useCallback((fieldName: string): CollaboratorInfo[] => {
    const activities = collaborationState.fieldActivities[fieldName] || []
    const activeCollaboratorIds = activities
      .filter(activity => activity.action === 'editing')
      .map(activity => activity.collaboratorId)
      .filter(id => id !== currentUser.id) // Exclude current user

    return activeCollaboratorIds
      .map(id => collaborationState.collaborators[id])
      .filter(Boolean)
  }, [collaborationState, currentUser.id])

  // Check if field is being edited by others
  const isFieldBeingEdited = useCallback((fieldName: string): boolean => {
    return getFieldCollaborators(fieldName).length > 0
  }, [getFieldCollaborators])

  // Get all online collaborators
  const getOnlineCollaborators = useCallback((): CollaboratorInfo[] => {
    return Object.values(collaborationState.collaborators)
      .filter(collaborator => collaborator.isOnline && collaborator.id !== currentUser.id)
  }, [collaborationState.collaborators, currentUser.id])

  // Get collaboration indicator for field
  const getFieldIndicator = useCallback((fieldName: string) => {
    const collaborators = getFieldCollaborators(fieldName)
    const isBeingEdited = collaborators.length > 0

    return {
      isBeingEdited,
      collaborators,
      count: collaborators.length,
      primaryCollaborator: collaborators[0] || null
    }
  }, [getFieldCollaborators])

  return {
    collaborationState,
    broadcastFieldFocus,
    broadcastFieldBlur,
    getFieldCollaborators,
    isFieldBeingEdited,
    getOnlineCollaborators,
    getFieldIndicator,
    currentUser
  }
}

// Collaboration indicator component props
export interface CollaborationIndicatorProps {
  fieldName: string
  collaborators: CollaboratorInfo[]
  className?: string
}

// Utility function to generate avatar colors
export function generateAvatarColor(userId: string): string {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
  ]
  
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}
