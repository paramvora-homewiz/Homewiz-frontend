'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Backend integrated chat interface with analytics debugging
const ChatInterface = dynamic(() => {
  return import('@/components/chat/BackendIntegratedChatInterface').then(mod => ({ default: mod.BackendIntegratedChatInterface }))
}, { ssr: false })

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              HomeWiz AI Chat
            </h1>
            <p className="text-lg text-gray-600">
              Your intelligent real estate assistant
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl">
            <ChatInterface className="h-[600px]" />
          </div>
        </div>
      </div>
    </div>
  )
}