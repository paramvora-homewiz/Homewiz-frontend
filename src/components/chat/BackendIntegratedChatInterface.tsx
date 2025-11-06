'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, Bot, User, AlertCircle, CheckCircle, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveMessageRenderer from './InteractiveMessageRenderer';
import SmartDataVisualizer from './SmartDataVisualizer';
import AnalyticsMessageDisplay from './AnalyticsMessageDisplay';
import LLMUsageIndicator from './LLMUsageIndicator';
import { MessageRenderer } from './MessageRenderer';
import { llmService, LLMIntegrationService } from '@/lib/llm-integration-service';
import { supabase } from '@/lib/supabase/client';
import { IntelligentSupabaseQueryService } from '@/lib/chat/intelligent-supabase-query-service';
import { formatBackendResponse, extractRelevantData } from '@/lib/clean-backend-response';
import backendConfig from '@/lib/config/backend';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  isStreaming?: boolean;
  metadata?: any;
  function_used?: string;
  llmMetrics?: {
    responseTime?: number;
    tokensUsed?: number;
    model?: string;
  };
}

export function BackendIntegratedChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('Checking backend...');
  const [sessionId] = useState(`session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef<string | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isLLMActive, setIsLLMActive] = useState(false);
  const [currentLLMModel, setCurrentLLMModel] = useState<string>('HomeWiz AI');

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend connection with exponential backoff
  const [connectionCheckInterval, setConnectionCheckInterval] = useState(30000); // Start with 30 seconds
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(() => {
      checkBackendConnection();
    }, connectionCheckInterval);
    
    return () => clearInterval(interval);
  }, [connectionCheckInterval]);

  const handleConnectionFailure = () => {
    setConnectionAttempts(prev => {
      const newAttempts = prev + 1;
      // Max backoff at 30 minutes
      const maxInterval = 1800000; // 30 minutes
      const baseInterval = 30000; // 30 seconds
      const newInterval = Math.min(baseInterval * Math.pow(2, newAttempts), maxInterval);
      setConnectionCheckInterval(newInterval);
      return newAttempts;
    });
  };

  const checkBackendConnection = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    
    if (!backendUrl || process.env.NEXT_PUBLIC_DISABLE_BACKEND === 'true') {
      setBackendStatus('Backend: Disabled');
      setBackendConnected(false);
      return false;
    }
    
    try {
      // Test with the web query endpoint
      const response = await fetch(backendConfig.http.queryWeb, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test connection' })
      });
      
      if (response.ok) {
        setBackendStatus('Backend: Connected ✅');
        setBackendConnected(true);
        // Reset to default interval on successful connection
        setConnectionCheckInterval(300000); // 5 minutes
        setConnectionAttempts(0);
        return true;
      } else {
        setBackendStatus('Backend: Unavailable');
        setBackendConnected(false);
        // Increase interval with exponential backoff
        handleConnectionFailure();
        return false;
      }
    } catch (error) {
      console.error('Backend connection error:', error);
      setBackendStatus('Backend: Connection failed');
      setBackendConnected(false);
      // Increase interval with exponential backoff
      handleConnectionFailure();
      return false;
    }
  };

  // Helper function to determine if we should use SmartDataVisualizer
  const shouldUseSmartVisualizer = (metadata: any): boolean => {
    // Use SmartDataVisualizer for:
    // 1. Raw API queries or complex data structures
    // 2. Analytics or financial reports
    // 3. Data that's not specifically room or building listings
    const functionCalled = metadata?.function_called || '';
    const hasComplexData = metadata?.result && typeof metadata.result === 'object' && !Array.isArray(metadata.result);
    const isAnalytics = metadata?.result?.insight_type || metadata?.insight_type;
    const isApiQuery = functionCalled.includes('api_query') || functionCalled.includes('raw_query');
    const hasNestedData = metadata?.result?.data && typeof metadata.result.data === 'object' && !isRoomOrBuildingData(metadata.result.data);
    
    // Check for financial/analytics data patterns
    const hasFinancialData = metadata?.result?.total_potential_revenue !== undefined ||
                            metadata?.result?.actual_revenue !== undefined ||
                            metadata?.result?.revenue_realization_rate !== undefined ||
                            metadata?.result?.realization_rate !== undefined ||
                            metadata?.result?.by_building !== undefined;
    
    const hasLeadData = metadata?.result?.total_leads !== undefined ||
                       metadata?.result?.conversion_rate !== undefined;
    
    // Always use SmartDataVisualizer for financial or lead data
    if (hasFinancialData || hasLeadData) return true;
    
    return isApiQuery || isAnalytics || (hasComplexData && hasNestedData);
  };
  
  // Helper function to check if data is room or building data
  const isRoomOrBuildingData = (data: any): boolean => {
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      return !!(firstItem.room_id || firstItem.room_number || firstItem.building_id || firstItem.building_name);
    }
    return false;
  };
  
  // Helper function to get appropriate title for SmartDataVisualizer
  const getDataVisualizerTitle = (metadata: any): string => {
    const functionCalled = metadata?.function_called || '';
    if (functionCalled.includes('api_query')) return 'API Query Results';
    if (functionCalled.includes('analytics')) return 'Analytics Report';
    if (metadata?.result?.insight_type === 'FINANCIAL') return 'Financial Report';
    if (metadata?.result?.insight_type) return `${metadata.result.insight_type} Analysis`;
    return 'Query Results';
  };

  const handleAction = useCallback(async (action: string, data: any) => {
    console.log('🎯 Action triggered:', action, data);
    
    let query = '';
    switch (action) {
      case 'schedule_tour':
        query = `I want to schedule a tour for ${data.buildingName || data.building}. What are the available times?`;
        break;
      case 'get_building_info':
        query = `Tell me more about ${data.buildingName || data.building}. Include amenities, location details, and any special features.`;
        break;
      case 'view_room':
        query = `Tell me more about room ${data.room_number} in ${data.building}. What are the details and amenities?`;
        break;
      case 'analytics_query':
        if (data.type === 'tenant_metrics' && data.scope === 'all_buildings') {
          query = 'Show me detailed tenant metrics for all buildings including occupancy rates, tenant satisfaction, and demographics';
        } else if (data.type === 'occupancy_analysis') {
          query = 'Show me current occupancy rate and room availability statistics';
        } else if (data.type === 'revenue_breakdown') {
          query = 'Give me a detailed revenue breakdown by building and room type';
        } else if (data.type === 'maintenance_stats') {
          query = 'Show maintenance statistics and trends across all properties';
        } else {
          query = `Provide analytics for ${data.type} with scope ${data.scope}`;
        }
        break;
      case 'room_search':
        query = data.query || 'Find available rooms with high ratings and amenities';
        break;
      case 'building_comparison':
        query = 'Compare building performance metrics including occupancy, revenue, and tenant satisfaction';
        break;
      default:
        query = `${action}: ${JSON.stringify(data)}`;
    }
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: query,
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Send the query
    await sendMessage(query);
  }, []);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageContent,
      role: 'user',
      created_at: new Date().toISOString()
    };

    // Don't add user message here if it's already added by handleAction
    if (!messages.some(m => m.content === messageContent && m.role === 'user')) {
      setMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);
    setError(null);
    setIsLLMActive(true);
    
    // Track request start time for metrics
    const requestStartTime = Date.now();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const useBackend = backendUrl && 
                      process.env.NEXT_PUBLIC_DISABLE_BACKEND !== 'true' &&
                      process.env.NEXT_PUBLIC_USE_BACKEND_AI === 'true';

    try {
      console.log('🔍 SendMessage Debug:', {
        messageContent,
        backendUrl,
        useBackend,
        backendConnected,
        disableBackend: process.env.NEXT_PUBLIC_DISABLE_BACKEND,
        useBackendAI: process.env.NEXT_PUBLIC_USE_BACKEND_AI,
        willUseBackend: useBackend && backendConnected
      });
      
      if (useBackend && backendConnected) {
        console.log('🚀 Using backend for query:', messageContent);
        
        const response = await fetch(backendConfig.http.queryWeb, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: messageContent
          })
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Backend response:', data);
        console.log('📊 Backend data structure:', {
          hasResult: !!data.result,
          hasData: !!data.data,
          hasResultData: !!data.result?.data,
          resultDataLength: data.result?.data?.length,
          functionCalled: data.function_called,
          success: data.success,
          // Additional debugging for room queries
          isRoomQuery: data.function_called?.includes('room') || messageContent.toLowerCase().includes('room'),
          dataIsArray: Array.isArray(data.data),
          resultDataIsArray: Array.isArray(data.result?.data),
          firstDataItem: data.data?.[0],
          firstResultDataItem: data.result?.data?.[0]
        });
        
        // Deep inspection of the response structure
        if (data.result?.data?.length > 0) {
          console.log('🔍 Deep inspection of first room:', {
            room: data.result.data[0],
            keys: Object.keys(data.result.data[0]),
            hasNestedBuilding: !!data.result.data[0].building,
            hasBuildingsNested: !!data.result.data[0].buildings,
            buildingValue: data.result.data[0].building,
            buildingsValue: data.result.data[0].buildings
          });
        }
        
        // Check if buildings are sent separately
        console.log('🏗️ Backend buildings data check:', {
          resultKeys: data.result ? Object.keys(data.result) : [],
          hasResultBuildings: !!data.result?.buildings,
          resultBuildings: data.result?.buildings,
          dataKeys: data ? Object.keys(data) : [],
          hasDataBuildings: !!data.buildings,
          dataBuildings: data.buildings
        });

        // Check if backend failed for any reason
        if (data.success === false || (data.result?.success === false)) {
          console.log('⚠️ Backend error detected - Full Response:', data);
          console.log('📝 Backend response content:', data.response || data.result?.response);
          console.log('💬 Backend message:', data.message || data.result?.message);
          console.log('❌ Backend error:', data.error || data.result?.error);

          // Use the backend's response if available, otherwise show error
          const errorContent = data.response || data.result?.response || data.message || data.result?.message ||
                             'I apologize, but I\'m experiencing high demand at the moment. The AI service is temporarily unavailable due to rate limiting. Please try again in a few moments, or contact support if the issue persists.';

          // Display the error message from backend
          const errorMessage: Message = {
            id: `asst-error-${Date.now()}`,
            content: errorContent,
            role: 'assistant',
            created_at: new Date().toISOString(),
            metadata: {
              error: false, // Set to false so it renders normally with markdown
              backend_response: true, // Flag to indicate this is from backend
              backend_error: data.error || data.result?.error || 'Backend service unavailable',
              ...data
            }
          };

          setMessages(prev => [...prev, errorMessage]);
        } else {
          // Calculate response time
          const responseTime = Date.now() - requestStartTime;
          
          // Check if we need LLM parsing for complex data
          let processedData = data.result || data;
          let usedLLMParsing = false;
          let llmParsingTime = 0;
          
          if (LLMIntegrationService.shouldUseLLM(processedData)) {
            console.log('🧠 Using LLM to parse complex data structure');
            const llmStartTime = Date.now();
            
            try {
              const llmResult = await llmService.parseComplexData(
                processedData,
                `User query: ${messageContent}`
              );
              
              if (llmResult.success && llmResult.formattedData) {
                processedData = {
                  ...processedData,
                  llm_formatted: llmResult.formattedData,
                  llm_insights: llmResult.insights,
                  llm_visualization: llmResult.visualization
                };
                usedLLMParsing = true;
                llmParsingTime = Date.now() - llmStartTime;
                console.log('✅ LLM parsing successful', llmResult);
              }
            } catch (llmError) {
              console.error('❌ LLM parsing failed, using original data', llmError);
            }
          }
          
          const assistantMessage: Message = {
            id: `asst-${Date.now()}`,
            content: data.result?.response || data.response || 'I found some results for you.',
            role: 'assistant',
            created_at: new Date().toISOString(),
            metadata: {
              result: processedData,
              backend_success: true,
              function_called: data.function_called,
              data: data.result?.data || data.data,
              // If this is a room search (has room data), ensure it's available in multiple places
              rooms: data.result?.data || data.data,
              stats: data.result?.stats || data.stats,
              used_llm_parsing: usedLLMParsing,
              ...data
            },
            function_used: data.function_called,
            llmMetrics: {
              responseTime,
              model: 'HomeWiz AI Backend',
              tokensUsed: data.tokens_used || data.result?.tokens_used,
              usedLLMParsing,
              llmParsingTime: usedLLMParsing ? llmParsingTime : undefined
            }
          };

          setMessages(prev => [...prev, assistantMessage]);
        }
        
      } else {
        // Fallback to Supabase direct query
        console.log('🔄 Using Supabase direct query fallback...', {
          reason: !useBackend ? 'useBackend is false' : 'backendConnected is false',
          useBackend,
          backendConnected
        });
        
        const fallbackResponse = await IntelligentSupabaseQueryService.processQuery(messageContent);
        
        console.log('🔍 Fallback Supabase response:', {
          hasResult: !!fallbackResponse.result,
          hasData: !!fallbackResponse.data,
          resultType: typeof fallbackResponse.result,
          dataType: typeof fallbackResponse.data,
          resultKeys: fallbackResponse.result ? Object.keys(fallbackResponse.result) : [],
          hasRooms: !!fallbackResponse.result?.rooms,
          roomsCount: fallbackResponse.result?.rooms?.length || 0
        });
        
        // Calculate response time
        const responseTime = Date.now() - requestStartTime;
        
        const fallbackMessage: Message = {
          id: `asst-supabase-${Date.now()}`,
          content: fallbackResponse.response,
          role: 'assistant',
          created_at: new Date().toISOString(),
          metadata: {
            ...fallbackResponse.metadata,
            result: fallbackResponse.result || fallbackResponse.data,
            supabase_direct: true
          },
          function_used: fallbackResponse.metadata?.intent?.entity || 'supabase_query',
          llmMetrics: {
            responseTime,
            model: 'Supabase Direct Query'
          }
        };

        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: `I'm having trouble connecting to the service. Please try again later.`,
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsLLMActive(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const messageToSend = inputValue;
    setInputValue('');
    await sendMessage(messageToSend);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Status Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-base font-semibold text-gray-800">
                HomeWiz AI Assistant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
              <span className={`text-sm font-medium ${backendConnected ? 'text-green-600' : 'text-amber-600'}`}>
                {backendStatus}
              </span>
            </div>
            <LLMUsageIndicator 
              isActive={isLLMActive}
              model={currentLLMModel}
            />
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Session: {sessionId.slice(-8)}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg max-w-md mx-auto">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to HomeWiz AI!</h3>
              <p className="text-sm text-gray-600 mb-4">
                I can help you find the perfect room or building based on your preferences.
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Search for rooms by features</p>
                <p>• Get building information</p>
                <p>• Schedule property tours</p>
              </div>
            </div>
          </div>
        )}
        
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div className={`flex ${
                // Allow full width for assistant messages with data (reports/analytics)
                message.role === 'assistant' && (message.metadata?.result || message.metadata?.data) 
                  ? 'max-w-full' 
                  : 'max-w-[80%]'
              } ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                
                <div className={`rounded-lg px-4 py-3 shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                    : 'bg-white/80 backdrop-blur-sm border border-gray-200/50'
                }`}>
                  {message.role === 'assistant' && (message.metadata?.result || message.metadata?.data || message.content?.includes('"insight_type"')) ? (
                    (() => {
                      // Find the user's query that triggered this response
                      const messageIndex = messages.findIndex(m => m.id === message.id);
                      const previousMessage = messageIndex > 0 ? messages[messageIndex - 1] : null;
                      const userQuery = previousMessage?.role === 'user' ? previousMessage.content : '';
                      
                      console.log('🔍 Finding user query:', { 
                        messageIndex, 
                        userQuery, 
                        messageId: message.id,
                        previousMessage,
                        previousRole: previousMessage?.role,
                        allMessages: messages.map(m => ({ id: m.id, role: m.role, content: m.content.substring(0, 50) }))
                      });
                      
                      return (
                        <AnalyticsMessageDisplay 
                          message={message}
                          className={message.role === 'user' ? 'text-white' : 'text-gray-800'}
                          userQuery={userQuery}
                        />
                      );
                    })()
                  ) : (
                    <MessageRenderer
                      content={message.content}
                      metadata={message.metadata}
                      role={message.role}
                    />
                  )}
                  
                  {message.isStreaming && (
                    <span className="inline-block animate-pulse ml-1">...</span>
                  )}
                  
                  {message.llmMetrics && message.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <LLMUsageIndicator
                        isActive={false}
                        model={message.llmMetrics.model}
                        responseTime={message.llmMetrics.responseTime}
                        tokensUsed={message.llmMetrics.tokensUsed}
                        usedLLMParsing={message.llmMetrics.usedLLMParsing}
                        llmParsingTime={message.llmMetrics.llmParsingTime}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mb-4"
          >
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about rooms, buildings, or property features..."
            className="flex-1 px-4 py-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Powered by {backendConnected ? 'HomeWiz AI Backend' : 'Supabase Direct Query'}
        </p>
      </form>
    </div>
  );
}
export default BackendIntegratedChatInterface;
