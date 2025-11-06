import { useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash'

interface AutoSaveOptions {
  delay?: number
  enabled?: boolean
  onSave?: (data: any) => Promise<void>
  onError?: (error: Error) => void
  storageKey?: string
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions = {}
) {
  const {
    delay = 2000,
    enabled = true,
    onSave,
    onError,
    storageKey
  } = options

  const lastSavedData = useRef<T | undefined>(undefined)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (dataToSave: T) => {
      if (!enabled) return

      try {
        // Save to localStorage if storageKey provided
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(dataToSave))
        }

        // Call custom save function if provided
        if (onSave) {
          await onSave(dataToSave)
        }

        lastSavedData.current = dataToSave
      } catch (error) {
        if (onError) {
          onError(error as Error)
        }
        console.error('Auto-save failed:', error)
      }
    }, delay),
    [delay, enabled, onSave, onError, storageKey]
  )

  // Auto-save when data changes
  useEffect(() => {
    if (!enabled) return

    // Check if data has actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedData.current)
    
    if (hasChanged && data) {
      debouncedSave(data)
    }

    return () => {
      debouncedSave.cancel()
    }
  }, [data, debouncedSave, enabled])

  // Load saved data from localStorage
  const loadSavedData = useCallback((): T | null => {
    if (!storageKey) return null

    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load saved data:', error)
      return null
    }
  }, [storageKey])

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
    lastSavedData.current = undefined
  }, [storageKey])

  // Force save immediately
  const forceSave = useCallback(async () => {
    debouncedSave.cancel()
    if (onSave && data) {
      try {
        await onSave(data)
        lastSavedData.current = data
      } catch (error) {
        if (onError) {
          onError(error as Error)
        }
        throw error
      }
    }
  }, [data, onSave, onError, debouncedSave])

  return {
    loadSavedData,
    clearSavedData,
    forceSave,
    isAutoSaveEnabled: enabled
  }
}

// Hook for form auto-save with validation
export function useFormAutoSave<T>(
  formData: T,
  formId: string,
  options: Omit<AutoSaveOptions, 'storageKey'> = {}
) {
  const storageKey = `form_autosave_${formId}`
  
  return useAutoSave(formData, {
    ...options,
    storageKey
  })
}
