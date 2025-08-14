'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Bot, Activity } from 'lucide-react';

interface LLMUsageIndicatorProps {
  isActive: boolean;
  model?: string;
  responseTime?: number;
  tokensUsed?: number;
  usedLLMParsing?: boolean;
  llmParsingTime?: number;
  className?: string;
}

export default function LLMUsageIndicator({ 
  isActive, 
  model = 'AI Assistant', 
  responseTime,
  tokensUsed,
  usedLLMParsing,
  llmParsingTime,
  className = '' 
}: LLMUsageIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isActive ? 1 : 0.6, 
        scale: 1 
      }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      } ${className}`}
    >
      <motion.div
        animate={isActive ? { rotate: 360 } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Brain className="w-3.5 h-3.5" />
      </motion.div>
      
      <span className="flex items-center space-x-1">
        <span>{model}</span>
        {isActive && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-purple-600"
          >
            <Activity className="w-3 h-3" />
          </motion.span>
        )}
      </span>
      
      {responseTime && !isActive && (
        <span className="text-gray-500 ml-1">
          • {responseTime}ms
        </span>
      )}
      
      {tokensUsed && !isActive && (
        <span className="text-gray-500 ml-1">
          • {tokensUsed} tokens
        </span>
      )}
      
      {usedLLMParsing && !isActive && (
        <span className="text-purple-600 ml-1 flex items-center">
          • <Zap className="w-3 h-3 mr-0.5" />
          LLM Enhanced
          {llmParsingTime && (
            <span className="text-gray-500 ml-0.5">({llmParsingTime}ms)</span>
          )}
        </span>
      )}
      
      {isActive && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="w-1.5 h-1.5 bg-purple-600 rounded-full"
        />
      )}
    </motion.div>
  );
}