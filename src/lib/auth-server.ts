import { auth } from '@clerk/nextjs/server'
import { UserRole } from '@/types'

export async function getCurrentUser() {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    return null
  }

  // Get user role from session claims or default to 'submit'
  const role = (sessionClaims?.metadata as any)?.role as UserRole || 'submit'
  
  return {
    id: userId,
    role,
    email: sessionClaims?.email as string,
    firstName: sessionClaims?.firstName as string,
    lastName: sessionClaims?.lastName as string,
  }
}

// Mock function to simulate role assignment - in production this would be handled by your backend
export function assignUserRole(userId: string, role: UserRole): Promise<void> {
  // This would typically make an API call to your backend to update the user's role
  // For now, we'll just log it
  console.log(`Assigning role ${role} to user ${userId}`)
  return Promise.resolve()
}
