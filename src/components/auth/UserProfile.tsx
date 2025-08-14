'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Settings, LogOut, Edit2, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Note: Using regular HTML select instead of custom Select component
import { useAuth } from './AuthProvider'
import { useAuthSync } from '@/hooks/useAuthSync'
import { UserRole } from '@/types'
import { getRoleDisplayName, getRoleDescription, getAvailableRoles } from '@/lib/auth'
import config from '@/lib/config'

interface UserProfileProps {
  showRoleManagement?: boolean
  onClose?: () => void
}

export function UserProfile({ showRoleManagement = false, onClose }: UserProfileProps) {
  const { user, signOut, hasPermission } = useAuth()
  const { updateUserRole, isSyncing } = useAuthSync()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'submit')
  const [isUpdating, setIsUpdating] = useState(false)

  if (!user) {
    return null
  }

  const handleRoleUpdate = async () => {
    if (selectedRole === user.role) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    try {
      await updateUserRole(selectedRole)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update role:', error)
      // Reset to current role on error
      setSelectedRole(user.role)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  const canEditRoles = hasPermission('edit') || config.app.demoMode

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-md"
    >
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              User Profile
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* User Information */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">User ID</label>
              <p className="text-sm text-gray-500 font-mono">{user.id}</p>
            </div>
            
            {user.lastLogin && (
              <div>
                <label className="text-sm font-medium text-gray-600">Last Login</label>
                <p className="text-sm text-gray-700">
                  {new Date(user.lastLogin).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Role Management */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-blue-600" />
              <label className="text-sm font-medium text-gray-600">Access Role</label>
            </div>
            
            {!isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getRoleDisplayName(user.role)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {getRoleDescription(user.role)}
                    </p>
                  </div>
                  {(canEditRoles || showRoleManagement) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      disabled={isSyncing}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {getAvailableRoles().map((role) => (
                    <option key={role} value={role}>
                      {getRoleDisplayName(role)} - {getRoleDescription(role)}
                    </option>
                  ))}
                </select>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleRoleUpdate}
                    disabled={isUpdating || selectedRole === user.role}
                    className="flex-1"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                    ) : (
                      <Save className="w-3 h-3 mr-1" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedRole(user.role)
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Demo Mode Indicator */}
          {config.app.demoMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                🎭 Demo Mode Active - Changes are simulated
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="border-t pt-6 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/profile'}
            >
              <Settings className="w-4 h-4 mr-2" />
              Account Settings
            </Button>
            
            <Button
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default UserProfile
