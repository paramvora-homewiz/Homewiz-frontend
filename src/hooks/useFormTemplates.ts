'use client'

import { useState, useEffect, useCallback } from 'react'
import { FormTemplate, RecentSubmission, TemplateManagerState } from '@/types'

interface UseFormTemplatesOptions {
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  maxRecentSubmissions?: number
  maxTemplates?: number
}

interface UseFormTemplatesReturn extends TemplateManagerState {
  saveTemplate: (template: Omit<FormTemplate, 'id' | 'createdAt' | 'useCount'>) => Promise<void>
  deleteTemplate: (templateId: string) => Promise<void>
  updateTemplate: (templateId: string, updates: Partial<FormTemplate>) => Promise<void>
  useTemplate: (templateId: string) => Promise<FormTemplate | null>
  saveRecentSubmission: (data: any, preview: string) => Promise<void>
  getTemplatesByTag: (tag: string) => FormTemplate[]
  searchTemplates: (query: string) => FormTemplate[]
  clearRecentSubmissions: () => Promise<void>
  exportTemplates: () => string
  importTemplates: (jsonData: string) => Promise<void>
}

export function useFormTemplates({
  formType,
  maxRecentSubmissions = 5,
  maxTemplates = 50
}: UseFormTemplatesOptions): UseFormTemplatesReturn {
  const [state, setState] = useState<TemplateManagerState>({
    templates: [],
    recentSubmissions: [],
    loading: false,
    error: null
  })

  const TEMPLATES_KEY = `homewiz_templates_${formType}`
  const RECENT_KEY = `homewiz_recent_${formType}`

  // Load data from localStorage
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const templatesData = localStorage.getItem(TEMPLATES_KEY)
      const recentData = localStorage.getItem(RECENT_KEY)
      
      const templates: FormTemplate[] = templatesData ? JSON.parse(templatesData) : []
      const recentSubmissions: RecentSubmission[] = recentData ? JSON.parse(recentData) : []
      
      setState({
        templates,
        recentSubmissions,
        loading: false,
        error: null
      })
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load templates and recent submissions'
      }))
    }
  }, [TEMPLATES_KEY, RECENT_KEY])

  // Save templates to localStorage
  const saveTemplates = useCallback((templates: FormTemplate[]) => {
    try {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
    } catch (error) {
      console.error('Failed to save templates:', error)
    }
  }, [TEMPLATES_KEY])

  // Save recent submissions to localStorage
  const saveRecentSubmissions = useCallback((submissions: RecentSubmission[]) => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(submissions))
    } catch (error) {
      console.error('Failed to save recent submissions:', error)
    }
  }, [RECENT_KEY])

  // Generate unique ID
  const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Save a new template
  const saveTemplate = useCallback(async (templateData: Omit<FormTemplate, 'id' | 'createdAt' | 'useCount'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const newTemplate: FormTemplate = {
        ...templateData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        useCount: 0
      }
      
      const updatedTemplates = [...state.templates, newTemplate]
        .slice(-maxTemplates) // Keep only the most recent templates
      
      setState(prev => ({
        ...prev,
        templates: updatedTemplates,
        loading: false
      }))
      
      saveTemplates(updatedTemplates)
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to save template'
      }))
    }
  }, [state.templates, maxTemplates, saveTemplates])

  // Delete a template
  const deleteTemplate = useCallback(async (templateId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const updatedTemplates = state.templates.filter(t => t.id !== templateId)
      
      setState(prev => ({
        ...prev,
        templates: updatedTemplates,
        loading: false
      }))
      
      saveTemplates(updatedTemplates)
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to delete template'
      }))
    }
  }, [state.templates, saveTemplates])

  // Update a template
  const updateTemplate = useCallback(async (templateId: string, updates: Partial<FormTemplate>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const updatedTemplates = state.templates.map(template =>
        template.id === templateId
          ? { ...template, ...updates }
          : template
      )
      
      setState(prev => ({
        ...prev,
        templates: updatedTemplates,
        loading: false
      }))
      
      saveTemplates(updatedTemplates)
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update template'
      }))
    }
  }, [state.templates, saveTemplates])

  // Use a template (increment use count and update last used)
  const useTemplate = useCallback(async (templateId: string): Promise<FormTemplate | null> => {
    const template = state.templates.find(t => t.id === templateId)
    if (!template) return null
    
    const updatedTemplate = {
      ...template,
      useCount: template.useCount + 1,
      lastUsed: new Date().toISOString()
    }
    
    await updateTemplate(templateId, {
      useCount: updatedTemplate.useCount,
      lastUsed: updatedTemplate.lastUsed
    })
    
    return updatedTemplate
  }, [state.templates, updateTemplate])

  // Save a recent submission
  const saveRecentSubmission = useCallback(async (data: any, preview: string) => {
    try {
      const newSubmission: RecentSubmission = {
        id: generateId(),
        formType,
        data,
        submittedAt: new Date().toISOString(),
        preview
      }
      
      const updatedSubmissions = [newSubmission, ...state.recentSubmissions]
        .slice(0, maxRecentSubmissions) // Keep only the most recent submissions
      
      setState(prev => ({
        ...prev,
        recentSubmissions: updatedSubmissions
      }))
      
      saveRecentSubmissions(updatedSubmissions)
    } catch (error) {
      console.error('Failed to save recent submission:', error)
    }
  }, [formType, state.recentSubmissions, maxRecentSubmissions, saveRecentSubmissions])

  // Get templates by tag
  const getTemplatesByTag = useCallback((tag: string): FormTemplate[] => {
    return state.templates.filter(template => 
      template.tags?.includes(tag)
    )
  }, [state.templates])

  // Search templates
  const searchTemplates = useCallback((query: string): FormTemplate[] => {
    const lowercaseQuery = query.toLowerCase()
    return state.templates.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description?.toLowerCase().includes(lowercaseQuery) ||
      template.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }, [state.templates])

  // Clear recent submissions
  const clearRecentSubmissions = useCallback(async () => {
    setState(prev => ({
      ...prev,
      recentSubmissions: []
    }))
    
    saveRecentSubmissions([])
  }, [saveRecentSubmissions])

  // Export templates as JSON
  const exportTemplates = useCallback((): string => {
    return JSON.stringify({
      formType,
      templates: state.templates,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }, [formType, state.templates])

  // Import templates from JSON
  const importTemplates = useCallback(async (jsonData: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const importData = JSON.parse(jsonData)
      
      if (importData.formType !== formType) {
        throw new Error(`Template form type mismatch. Expected ${formType}, got ${importData.formType}`)
      }
      
      const importedTemplates: FormTemplate[] = importData.templates || []
      const updatedTemplates = [...state.templates, ...importedTemplates]
        .slice(-maxTemplates)
      
      setState(prev => ({
        ...prev,
        templates: updatedTemplates,
        loading: false
      }))
      
      saveTemplates(updatedTemplates)
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to import templates. Please check the file format.'
      }))
    }
  }, [formType, state.templates, maxTemplates, saveTemplates])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    ...state,
    saveTemplate,
    deleteTemplate,
    updateTemplate,
    useTemplate,
    saveRecentSubmission,
    getTemplatesByTag,
    searchTemplates,
    clearRecentSubmissions,
    exportTemplates,
    importTemplates
  }
}
