/**
 * Enhanced Authentication Configuration for HomeWiz
 * 
 * This module provides comprehensive authentication configuration
 * with seamless Clerk integration and demo mode toggle.
 */

import { z } from 'zod'
import config from './config'

// Authentication Mode Types
export enum AuthMode {
  DEMO = 'demo',
  CLERK = 'clerk',
  CUSTOM = 'custom'
}

// Authentication Configuration Schema
export const AuthConfigSchema = z.object({
  mode: z.nativeEnum(AuthMode),
  clerk: z.object({
    publishableKey: z.string().optional(),
    secretKey: z.string().optional(),
    signInUrl: z.string().optional(),
    signUpUrl: z.string().optional(),
    afterSignInUrl: z.string().optional(),
    afterSignUpUrl: z.string().optional(),
    appearance: z.object({
      baseTheme: z.string().optional(),
      variables: z.record(z.string()).optional(),
      elements: z.record(z.string()).optional(),
    }).optional(),
  }),
  demo: z.object({
    enabled: z.boolean(),
    defaultUser: z.object({
      id: z.string(),
      email: z.string().email(),
      firstName: z.string(),
      lastName: z.string(),
      role: z.enum(['no_access', 'view', 'submit', 'edit']),
    }),
    showBanner: z.boolean(),
    bannerMessage: z.string(),
  }),
  security: z.object({
    sessionTimeout: z.number(),
    requireEmailVerification: z.boolean(),
    enableMFA: z.boolean(),
    passwordPolicy: z.object({
      minLength: z.number(),
      requireUppercase: z.boolean(),
      requireLowercase: z.boolean(),
      requireNumbers: z.boolean(),
      requireSpecialChars: z.boolean(),
    }),
  }),
})

export type AuthConfig = z.infer<typeof AuthConfigSchema>

// Default Authentication Configuration
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  mode: config.app.demoMode ? AuthMode.DEMO : AuthMode.CLERK,
  
  clerk: {
    publishableKey: config.auth.clerk.publishableKey,
    secretKey: config.auth.clerk.secretKey,
    signInUrl: config.auth.clerk.signInUrl,
    signUpUrl: config.auth.clerk.signUpUrl,
    afterSignInUrl: config.auth.clerk.afterSignInUrl,
    afterSignUpUrl: config.auth.clerk.afterSignUpUrl,
    appearance: {
      baseTheme: undefined,
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorInputBackground: '#f8fafc',
        colorInputText: '#1e293b',
        borderRadius: '0.5rem',
      },
      elements: {
        formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
        card: 'shadow-xl border-0',
        headerTitle: 'text-gray-900',
        headerSubtitle: 'text-gray-600',
      },
    },
  },
  
  demo: {
    enabled: config.app.demoMode,
    defaultUser: {
      id: 'demo-user-id',
      email: 'demo@homewiz.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'submit',
    },
    showBanner: true,
    bannerMessage: '🎭 Demo Mode - Authentication Disabled',
  },
  
  security: {
    sessionTimeout: config.auth.session.timeout,
    requireEmailVerification: true,
    enableMFA: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
  },
}

/**
 * Authentication Configuration Manager
 * Handles authentication mode switching and configuration management
 */
export class AuthConfigManager {
  private static instance: AuthConfigManager
  private currentConfig: AuthConfig
  private listeners: ((config: AuthConfig) => void)[] = []

  private constructor() {
    this.currentConfig = { ...DEFAULT_AUTH_CONFIG }
    this.validateConfig()
  }

  static getInstance(): AuthConfigManager {
    if (!AuthConfigManager.instance) {
      AuthConfigManager.instance = new AuthConfigManager()
    }
    return AuthConfigManager.instance
  }

  /**
   * Get current authentication configuration
   */
  getConfig(): AuthConfig {
    return { ...this.currentConfig }
  }

  /**
   * Update authentication configuration
   */
  updateConfig(updates: Partial<AuthConfig>): void {
    this.currentConfig = {
      ...this.currentConfig,
      ...updates,
    }
    
    this.validateConfig()
    this.notifyListeners()
  }

  /**
   * Switch authentication mode
   */
  switchMode(mode: AuthMode): void {
    this.updateConfig({ mode })
    
    // Update environment variable for consistency
    if (typeof window !== 'undefined') {
      localStorage.setItem('homewiz_auth_mode', mode)
    }
  }

  /**
   * Enable/disable demo mode
   */
  setDemoMode(enabled: boolean): void {
    const mode = enabled ? AuthMode.DEMO : AuthMode.CLERK
    this.switchMode(mode)
    
    this.updateConfig({
      demo: {
        ...this.currentConfig.demo,
        enabled,
      }
    })
  }

  /**
   * Check if authentication is required
   */
  isAuthRequired(): boolean {
    return this.currentConfig.mode !== AuthMode.DEMO
  }

  /**
   * Check if demo mode is active
   */
  isDemoMode(): boolean {
    return this.currentConfig.mode === AuthMode.DEMO
  }

  /**
   * Check if Clerk is configured properly
   */
  isClerkConfigured(): boolean {
    return !!(
      this.currentConfig.clerk.publishableKey &&
      this.currentConfig.clerk.publishableKey !== '' &&
      this.currentConfig.clerk.publishableKey !== 'your_clerk_publishable_key_here' &&
      this.currentConfig.clerk.secretKey &&
      this.currentConfig.clerk.secretKey !== '' &&
      this.currentConfig.clerk.secretKey !== 'your_clerk_secret_key_here'
    )
  }

  /**
   * Get Clerk configuration for provider
   */
  getClerkConfig() {
    if (!this.isClerkConfigured()) {
      throw new Error('Clerk is not properly configured')
    }

    return {
      publishableKey: this.currentConfig.clerk.publishableKey!,
      appearance: this.currentConfig.clerk.appearance,
    }
  }

  /**
   * Get demo user configuration
   */
  getDemoUser() {
    return this.currentConfig.demo.defaultUser
  }

  /**
   * Validate current configuration
   */
  private validateConfig(): void {
    try {
      AuthConfigSchema.parse(this.currentConfig)
    } catch (error) {
      console.error('Invalid authentication configuration:', error)
      // Reset to default on validation error
      this.currentConfig = { ...DEFAULT_AUTH_CONFIG }
    }
  }

  /**
   * Add configuration change listener
   */
  addListener(listener: (config: AuthConfig) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentConfig)
      } catch (error) {
        console.error('Error in auth config listener:', error)
      }
    })
  }

  /**
   * Initialize configuration from environment and storage
   */
  initialize(): void {
    // Check localStorage for saved auth mode
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('homewiz_auth_mode') as AuthMode
      if (savedMode && Object.values(AuthMode).includes(savedMode)) {
        this.switchMode(savedMode)
      }
    }

    // Override with environment variables if present
    if (config.app.demoMode) {
      this.setDemoMode(true)
    }
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    this.currentConfig = { ...DEFAULT_AUTH_CONFIG }
    this.validateConfig()
    this.notifyListeners()
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('homewiz_auth_mode')
    }
  }

  /**
   * Export configuration for debugging
   */
  exportConfig(): string {
    return JSON.stringify(this.currentConfig, null, 2)
  }

  /**
   * Import configuration from JSON
   */
  importConfig(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson)
      const validatedConfig = AuthConfigSchema.parse(importedConfig)
      this.currentConfig = validatedConfig
      this.notifyListeners()
    } catch (error) {
      throw new Error('Invalid configuration JSON')
    }
  }
}

// Export singleton instance
export const authConfigManager = AuthConfigManager.getInstance()

// Utility functions
export const getAuthConfig = () => authConfigManager.getConfig()
export const isDemoMode = () => authConfigManager.isDemoMode()
export const isAuthRequired = () => authConfigManager.isAuthRequired()
export const switchAuthMode = (mode: AuthMode) => authConfigManager.switchMode(mode)
export const setDemoMode = (enabled: boolean) => authConfigManager.setDemoMode(enabled)

// Initialize on module load
authConfigManager.initialize()

// Export types
// AuthConfig is already exported above
