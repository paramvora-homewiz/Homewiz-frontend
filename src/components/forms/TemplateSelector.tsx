'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import { useFormTemplates } from '@/hooks/useFormTemplates'
import { FormTemplate, RecentSubmission, TemplateSelectorProps } from '@/types'
import {
  LayoutTemplate,
  Clock,
  Search,
  Star,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Copy,
  Sparkles
} from 'lucide-react'

export default function TemplateSelector({
  formType,
  onTemplateSelect,
  onRecentSelect,
  className = ''
}: TemplateSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'templates' | 'recent'>('templates')
  
  const {
    templates,
    recentSubmissions,
    loading,
    error,
    useTemplate,
    getTemplatesByTag,
    searchTemplates
  } = useFormTemplates({ formType })

  // Filter templates based on search
  const filteredTemplates = searchQuery 
    ? searchTemplates(searchQuery)
    : templates

  // Get default templates
  const defaultTemplates = templates.filter(t => t.isDefault)
  const userTemplates = templates.filter(t => !t.isDefault)

  const handleTemplateSelect = async (template: FormTemplate) => {
    const updatedTemplate = await useTemplate(template.id)
    if (updatedTemplate) {
      onTemplateSelect(updatedTemplate)
    }
    setIsExpanded(false)
  }

  const handleRecentSelect = (submission: RecentSubmission) => {
    onRecentSelect(submission)
    setIsExpanded(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFormTypeIcon = () => {
    switch (formType) {
      case 'operator': return '👤'
      case 'building': return '🏢'
      case 'room': return '🏠'
      case 'tenant': return '👥'
      case 'lead': return '🎯'
      default: return '📋'
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-sm text-gray-600">Loading templates...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  const hasTemplates = templates.length > 0
  const hasRecentSubmissions = recentSubmissions.length > 0

  if (!hasTemplates && !hasRecentSubmissions) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="text-center">
          <LayoutTemplate className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No templates or recent submissions yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Save your first form as a template to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <EnhancedCard className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getFormTypeIcon()}</span>
                <Sparkles className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Quick Start</h3>
                <p className="text-sm text-gray-600">
                  Use templates or recent submissions
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 space-y-4"
              >
                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setSelectedTab('templates')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedTab === 'templates'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LayoutTemplate className="h-4 w-4" />
                    Templates ({templates.length})
                  </button>
                  <button
                    onClick={() => setSelectedTab('recent')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedTab === 'recent'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Recent ({recentSubmissions.length})
                  </button>
                </div>

                {/* Search */}
                {selectedTab === 'templates' && templates.length > 3 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}

                {/* Templates Tab */}
                {selectedTab === 'templates' && (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* Default Templates */}
                    {defaultTemplates.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Default Templates
                        </h4>
                        <div className="space-y-2">
                          {defaultTemplates.map((template) => (
                            <TemplateCard
                              key={template.id}
                              template={template}
                              onSelect={handleTemplateSelect}
                              isDefault
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* User Templates */}
                    {filteredTemplates.filter(t => !t.isDefault).length > 0 && (
                      <div>
                        {defaultTemplates.length > 0 && (
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 mt-4">
                            Your Templates
                          </h4>
                        )}
                        <div className="space-y-2">
                          {filteredTemplates
                            .filter(t => !t.isDefault)
                            .sort((a, b) => (b.lastUsed || b.createdAt).localeCompare(a.lastUsed || a.createdAt))
                            .map((template) => (
                              <TemplateCard
                                key={template.id}
                                template={template}
                                onSelect={handleTemplateSelect}
                              />
                            ))}
                        </div>
                      </div>
                    )}

                    {filteredTemplates.length === 0 && (
                      <div className="text-center py-8">
                        <LayoutTemplate className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          {searchQuery ? 'No templates match your search' : 'No templates saved yet'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Recent Submissions Tab */}
                {selectedTab === 'recent' && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentSubmissions.length > 0 ? (
                      recentSubmissions.map((submission) => (
                        <RecentSubmissionCard
                          key={submission.id}
                          submission={submission}
                          onSelect={handleRecentSelect}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No recent submissions</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </EnhancedCard>
    </div>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: FormTemplate
  onSelect: (template: FormTemplate) => void
  isDefault?: boolean
}

function TemplateCard({ template, onSelect, isDefault = false }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">{template.name}</h4>
            {isDefault && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
          {template.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{template.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Copy className="h-3 w-3" />
              Used {template.useCount} times
            </span>
            {template.lastUsed && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(template.lastUsed)}
              </span>
            )}
          </div>
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Recent Submission Card Component
interface RecentSubmissionCardProps {
  submission: RecentSubmission
  onSelect: (submission: RecentSubmission) => void
}

function RecentSubmissionCard({ submission, onSelect }: RecentSubmissionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onSelect(submission)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 line-clamp-2 mb-2">{submission.preview}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>Submitted {formatDate(submission.submittedAt)}</span>
          </div>
        </div>
        <Copy className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
      </div>
    </motion.div>
  )
}
